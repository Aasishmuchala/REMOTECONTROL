import Decimal from 'decimal.js'
import { eq, and, desc } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { orders, trades } from '@/db/schema'
import { lockBalance, unlockBalance, debitLocked, creditWallet, getWallet } from '@/lib/wallet'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any

export type Order = {
  id: string
  userId: string
  pairId: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  price: string | null
  quantity: string
  filledQuantity: string
  status: 'open' | 'partial' | 'filled' | 'cancelled'
  createdAt: string
}

export type OrderBook = {
  bids: Order[]   // buy orders, best (highest) price first
  asks: Order[]   // sell orders, best (lowest) price first
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requirePositive(value: string, label: string) {
  if (new Decimal(value).lte(0)) throw new Error(`${label} must be positive`)
}

async function fetchOrder(db: Db, orderId: string): Promise<Order | null> {
  const rows = await db.select().from(orders).where(eq(orders.id, orderId))
  return (rows[0] as Order) ?? null
}

async function updateOrderFill(
  db: Db,
  orderId: string,
  additionalFill: string,
  totalQty: string,
): Promise<Order> {
  const order = await fetchOrder(db, orderId)
  if (!order) throw new Error(`Order ${orderId} not found`)

  const newFilled = new Decimal(order.filledQuantity).plus(additionalFill).toFixed()
  const remaining = new Decimal(totalQty).minus(newFilled)
  const newStatus: Order['status'] = remaining.lte(0) ? 'filled' : 'partial'

  await db
    .update(orders)
    .set({ filledQuantity: newFilled, status: newStatus })
    .where(eq(orders.id, orderId))

  return (await fetchOrder(db, orderId))!
}

/**
 * Record a trade and settle balances for both parties.
 * - Buyer pays price × qty (debit from locked)
 * - Seller receives price × qty (credit available), loses qty (debit from locked)
 * Simplified: both sides already have the correct amounts locked.
 */
async function settleTrade(
  db: Db,
  buyOrderId: string,
  sellOrderId: string,
  pairId: string,
  price: string,
  qty: string,
  buyerId: string,
  sellerId: string,
): Promise<void> {
  const cost = new Decimal(price).mul(qty).toFixed()

  // Debit buyer's locked USDC (cost of the trade)
  await debitLocked(db, buyerId, cost, buyOrderId)

  // Debit seller's locked "qty" (asset units sold)
  await debitLocked(db, sellerId, qty, sellOrderId)

  // Credit seller with proceeds
  await creditWallet(db, sellerId, cost, `trade fill order ${buyOrderId}`)

  // Credit buyer with asset units received (using quote-asset credits as proxy)
  await creditWallet(db, buyerId, qty, `trade fill order ${sellOrderId}`)

  await db.insert(trades).values({
    id: uuid(),
    buyOrderId,
    sellOrderId,
    pairId,
    price,
    quantity: qty,
  })
}

// ─── Core matching logic ──────────────────────────────────────────────────────

/**
 * After a new order is inserted, attempt to match it against the opposite side.
 * Uses price-time priority (orders already sorted by price then createdAt).
 */
async function matchOrder(db: Db, newOrder: Order): Promise<Order> {
  const oppositeSide = newOrder.side === 'buy' ? 'sell' : 'buy'
  const openOpposite = await getOpenOrders(db, newOrder.pairId, oppositeSide)

  let remaining = new Decimal(newOrder.quantity).minus(newOrder.filledQuantity)
  let current = newOrder

  for (const counterOrder of openOpposite) {
    if (remaining.lte(0)) break

    // Price check: buy must be >= ask, sell must be <= bid
    if (newOrder.type === 'limit' && newOrder.price != null) {
      const newPrice = new Decimal(newOrder.price)
      const counterPrice = new Decimal(counterOrder.price!)
      if (newOrder.side === 'buy' && newPrice.lt(counterPrice)) break
      if (newOrder.side === 'sell' && newPrice.gt(counterPrice)) break
    }

    const counterRemaining = new Decimal(counterOrder.quantity).minus(counterOrder.filledQuantity)
    const fillQty = Decimal.min(remaining, counterRemaining).toFixed()
    const fillPrice = counterOrder.price! // trade at maker (resting) price

    const [buyOrderId, sellOrderId, buyerId, sellerId] =
      newOrder.side === 'buy'
        ? [current.id, counterOrder.id, current.userId, counterOrder.userId]
        : [counterOrder.id, current.id, counterOrder.userId, current.userId]

    // Refund excess lock if buy price > fill price
    if (newOrder.side === 'buy' && newOrder.price != null) {
      const excess = new Decimal(newOrder.price).minus(fillPrice).mul(fillQty)
      if (excess.gt(0)) {
        await unlockBalance(db, buyerId, excess.toFixed())
      }
    }

    await settleTrade(db, buyOrderId, sellOrderId, newOrder.pairId, fillPrice, fillQty, buyerId, sellerId)
    await updateOrderFill(db, counterOrder.id, fillQty, counterOrder.quantity)
    current = await updateOrderFill(db, current.id, fillQty, current.quantity)

    remaining = remaining.minus(fillQty)
  }

  return current
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function placeLimitOrder(
  db: Db,
  userId: string,
  pairId: string,
  side: 'buy' | 'sell',
  price: string,
  quantity: string,
): Promise<Order> {
  requirePositive(price, 'Price')
  requirePositive(quantity, 'Quantity')

  // Lock the required balance before inserting
  if (side === 'buy') {
    const cost = new Decimal(price).mul(quantity).toFixed()
    const w = await getWallet(db, userId)
    if (!w || new Decimal(w.availableBalance).lt(cost))
      throw new Error(`Insufficient available balance for buy order`)
    await lockBalance(db, userId, cost)
  } else {
    // Sell: lock the asset quantity
    const w = await getWallet(db, userId)
    if (!w || new Decimal(w.availableBalance).lt(new Decimal(quantity)))
      throw new Error(`Insufficient available balance for sell order`)
    await lockBalance(db, userId, quantity)
  }

  const id = uuid()
  await db.insert(orders).values({
    id,
    userId,
    pairId,
    side,
    type: 'limit',
    price,
    quantity,
    filledQuantity: '0',
    status: 'open',
  })

  const order = (await fetchOrder(db, id))!
  return matchOrder(db, order)
}

export async function placeMarketOrder(
  db: Db,
  userId: string,
  pairId: string,
  side: 'buy' | 'sell',
  quantity: string,
): Promise<Order> {
  requirePositive(quantity, 'Quantity')

  // Verify liquidity exists before locking anything
  const oppSide = side === 'buy' ? 'sell' : 'buy'
  const available = await getOpenOrders(db, pairId, oppSide)
  if (available.length === 0)
    throw new Error(`Insufficient liquidity: no ${oppSide} orders on the book`)

  // For market buy: lock worst-case cost (best ask × qty) as temporary hold
  if (side === 'buy') {
    const bestAsk = available[0].price!
    const cost = new Decimal(bestAsk).mul(quantity).toFixed()
    const w = await getWallet(db, userId)
    if (!w || new Decimal(w.availableBalance).lt(cost))
      throw new Error(`Insufficient available balance for market buy`)
    await lockBalance(db, userId, cost)
  } else {
    const w = await getWallet(db, userId)
    if (!w || new Decimal(w.availableBalance).lt(new Decimal(quantity)))
      throw new Error(`Insufficient available balance for market sell`)
    await lockBalance(db, userId, quantity)
  }

  const id = uuid()
  await db.insert(orders).values({
    id,
    userId,
    pairId,
    side,
    type: 'market',
    price: null,
    quantity,
    filledQuantity: '0',
    status: 'open',
  })

  const order = (await fetchOrder(db, id))!
  return matchOrder(db, order)
}

export async function cancelOrder(db: Db, userId: string, orderId: string): Promise<void> {
  const order = await fetchOrder(db, orderId)
  if (!order || order.userId !== userId)
    throw new Error(`Order not found or unauthorized`)
  if (order.status === 'filled')
    throw new Error(`Cannot cancel a filled order`)
  if (order.status === 'cancelled')
    throw new Error(`Order already cancelled`)

  // Refund locked balance
  const remainingQty = new Decimal(order.quantity).minus(order.filledQuantity)
  if (remainingQty.gt(0)) {
    if (order.side === 'buy') {
      const refundCost = new Decimal(order.price!).mul(remainingQty).toFixed()
      await unlockBalance(db, userId, refundCost)
    } else {
      await unlockBalance(db, userId, remainingQty.toFixed())
    }
  }

  await db
    .update(orders)
    .set({ status: 'cancelled' })
    .where(eq(orders.id, orderId))
}

export async function getOrderBook(db: Db, pairId: string): Promise<OrderBook> {
  const allOpen = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.pairId, pairId),
        // status IN ('open','partial') — Drizzle doesn't have inArray on union here, use two fetches
      ),
    )

  const active = (allOpen as Order[]).filter(
    (o) => o.status === 'open' || o.status === 'partial',
  )

  const bids = active
    .filter((o) => o.side === 'buy')
    .sort((a, b) => new Decimal(b.price!).minus(a.price!).toNumber())

  const asks = active
    .filter((o) => o.side === 'sell')
    .sort((a, b) => new Decimal(a.price!).minus(b.price!).toNumber())

  return { bids, asks }
}

export async function getOpenOrders(
  db: Db,
  pairId: string,
  side: 'buy' | 'sell',
): Promise<Order[]> {
  const book = await getOrderBook(db, pairId)
  return side === 'buy' ? book.bids : book.asks
}

export async function getRecentTrades(
  db: Db,
  pairId: string,
  limit = 50,
): Promise<{
  id: string
  pairId: string
  price: string
  quantity: string
  side: 'buy' | 'sell'
  createdAt: string
}[]> {
  // Query trades for this pair, most recent first
  const rows = await db
    .select()
    .from(trades)
    .where(eq(trades.pairId, pairId))
    .orderBy(desc(trades.createdAt))
    .limit(limit)

  // Determine side by looking up the buy order — if the buy order was placed
  // after the sell order, the taker was the buyer (side='buy'), else 'sell'
  const result = []
  for (const row of rows) {
    // Look up both orders to determine taker side
    const buyOrder = await fetchOrder(db, row.buyOrderId)
    const sellOrder = await fetchOrder(db, row.sellOrderId)

    // Taker = the order placed later (higher createdAt)
    let side: 'buy' | 'sell' = 'buy'
    if (buyOrder && sellOrder) {
      side = buyOrder.createdAt >= sellOrder.createdAt ? 'buy' : 'sell'
    }

    result.push({
      id: row.id,
      pairId: row.pairId,
      price: row.price,
      quantity: row.quantity,
      side,
      createdAt: row.createdAt,
    })
  }

  return result
}
