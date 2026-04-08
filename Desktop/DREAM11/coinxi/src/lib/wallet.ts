import Decimal from 'decimal.js'
import { eq } from 'drizzle-orm'
import { v4 as uuid } from 'uuid'
import { wallets, walletTransactions, orders, trades } from '@/db/schema'

// Structural interface — works with any Drizzle SQLite DB instance
// (production BetterSQLite3Database or in-memory test DB)
export interface ExchangeDb {
  select: () => ReturnType<ReturnType<typeof import('drizzle-orm/better-sqlite3').drizzle>['select']>
  insert: (table: unknown) => { values: (v: unknown) => Promise<unknown> }
  update: (table: unknown) => { set: (v: unknown) => { where: (c: unknown) => Promise<unknown> } }
}

// Looser Db type via `any` to keep the implementation concise while the
// formal interface is declared above for documentation purposes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any

export type Wallet = {
  id: string
  userId: string
  totalBalance: string
  availableBalance: string
  lockedBalance: string
  createdAt: string
}

export type WalletTransaction = {
  id: string
  userId: string
  amount: string
  type: 'deposit' | 'withdrawal' | 'lock' | 'unlock' | 'debit' | 'refund'
  orderId: string | null
  description: string | null
  balanceBefore: string
  balanceAfter: string
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function requirePositive(amount: string, label = 'Amount') {
  const d = new Decimal(amount)
  if (d.lte(0)) throw new Error(`${label} must be positive, got ${amount}`)
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function createWallet(db: Db, userId: string): Promise<Wallet> {
  const id = uuid()
  await db.insert(wallets).values({ id, userId })
  const w = await getWallet(db, userId)
  return w!
}

export async function getWallet(db: Db, userId: string): Promise<Wallet | null> {
  const rows = await db.select().from(wallets).where(eq(wallets.userId, userId))
  return (rows[0] as Wallet) ?? null
}

export async function creditWallet(
  db: Db,
  userId: string,
  amount: string,
  description: string,
): Promise<WalletTransaction> {
  requirePositive(amount)
  const w = await getWallet(db, userId)
  if (!w) throw new Error(`Wallet not found for user ${userId}`)

  const prev = new Decimal(w.availableBalance)
  const newAvailable = prev.plus(amount).toFixed()
  const newTotal = new Decimal(w.totalBalance).plus(amount).toFixed()

  await db
    .update(wallets)
    .set({ availableBalance: newAvailable, totalBalance: newTotal })
    .where(eq(wallets.userId, userId))

  return recordTransaction(db, {
    userId,
    amount,
    type: 'deposit',
    description,
    balanceBefore: w.availableBalance,
    balanceAfter: newAvailable,
  })
}

export async function lockBalance(db: Db, userId: string, amount: string): Promise<void> {
  requirePositive(amount)
  const w = await getWallet(db, userId)
  if (!w) throw new Error(`Wallet not found for user ${userId}`)

  const available = new Decimal(w.availableBalance)
  const tolock = new Decimal(amount)
  if (tolock.gt(available))
    throw new Error(`Insufficient available balance: need ${amount}, have ${w.availableBalance}`)

  const newAvailable = available.minus(tolock).toFixed()
  const newLocked = new Decimal(w.lockedBalance).plus(tolock).toFixed()

  await db
    .update(wallets)
    .set({ availableBalance: newAvailable, lockedBalance: newLocked })
    .where(eq(wallets.userId, userId))

  await recordTransaction(db, {
    userId,
    amount,
    type: 'lock',
    balanceBefore: w.availableBalance,
    balanceAfter: newAvailable,
  })
}

export async function unlockBalance(db: Db, userId: string, amount: string): Promise<void> {
  requirePositive(amount)
  const w = await getWallet(db, userId)
  if (!w) throw new Error(`Wallet not found for user ${userId}`)

  const locked = new Decimal(w.lockedBalance)
  const tounlock = new Decimal(amount)
  if (tounlock.gt(locked))
    throw new Error(`Insufficient locked balance: need ${amount}, have ${w.lockedBalance}`)

  const newLocked = locked.minus(tounlock).toFixed()
  const newAvailable = new Decimal(w.availableBalance).plus(tounlock).toFixed()

  await db
    .update(wallets)
    .set({ lockedBalance: newLocked, availableBalance: newAvailable })
    .where(eq(wallets.userId, userId))

  await recordTransaction(db, {
    userId,
    amount,
    type: 'unlock',
    balanceBefore: w.lockedBalance,
    balanceAfter: newLocked,
  })
}

export async function debitLocked(
  db: Db,
  userId: string,
  amount: string,
  orderId: string,
): Promise<void> {
  requirePositive(amount)
  const w = await getWallet(db, userId)
  if (!w) throw new Error(`Wallet not found for user ${userId}`)

  const locked = new Decimal(w.lockedBalance)
  const todebit = new Decimal(amount)
  if (todebit.gt(locked))
    throw new Error(`Insufficient locked balance: need ${amount}, have ${w.lockedBalance}`)

  const newLocked = locked.minus(todebit).toFixed()
  const newTotal = new Decimal(w.totalBalance).minus(todebit).toFixed()

  await db
    .update(wallets)
    .set({ lockedBalance: newLocked, totalBalance: newTotal })
    .where(eq(wallets.userId, userId))

  await recordTransaction(db, {
    userId,
    amount,
    type: 'debit',
    orderId,
    balanceBefore: w.lockedBalance,
    balanceAfter: newLocked,
  })
}

export async function getWalletHistory(db: Db, userId: string): Promise<WalletTransaction[]> {
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
  return rows as WalletTransaction[]
}

export type TradeRecord = {
  id: string
  pairId: string
  side: 'buy' | 'sell'
  price: string
  quantity: string
  createdAt: string
}

export async function getTradeHistory(
  db: Db,
  userId: string,
  page = 1,
  limit = 50,
): Promise<{ trades: TradeRecord[]; total: number; page: number; totalPages: number }> {
  // Step 1: get all order IDs belonging to this user
  const userOrders = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.userId, userId))
  const userOrderIds = new Set((userOrders as Array<{ id: string }>).map((o) => o.id))

  if (userOrderIds.size === 0) {
    return { trades: [], total: 0, page, totalPages: 0 }
  }

  // Step 2: fetch all trades and filter to ones where user is buyer or seller
  const allTrades = await db.select().from(trades)
  const userTrades = (
    allTrades as Array<{
      id: string; buyOrderId: string; sellOrderId: string
      pairId: string; price: string; quantity: string; createdAt: string
    }>
  ).filter((t) => userOrderIds.has(t.buyOrderId) || userOrderIds.has(t.sellOrderId))

  // Sort newest first
  userTrades.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))

  const total = userTrades.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginated = userTrades.slice(offset, offset + limit)

  const result: TradeRecord[] = paginated.map((t) => ({
    id: t.id,
    pairId: t.pairId,
    // Derive side: if the buyOrderId belongs to this user, they were the buyer
    side: userOrderIds.has(t.buyOrderId) ? 'buy' : 'sell',
    price: t.price,
    quantity: t.quantity,
    createdAt: t.createdAt,
  }))

  return { trades: result, total, page, totalPages }
}

// ─── Internal ─────────────────────────────────────────────────────────────────

async function recordTransaction(
  db: Db,
  data: {
    userId: string
    amount: string
    type: WalletTransaction['type']
    orderId?: string
    description?: string
    balanceBefore: string
    balanceAfter: string
  },
): Promise<WalletTransaction> {
  const id = uuid()
  await db.insert(walletTransactions).values({
    id,
    userId: data.userId,
    amount: data.amount,
    type: data.type,
    orderId: data.orderId ?? null,
    description: data.description ?? null,
    balanceBefore: data.balanceBefore,
    balanceAfter: data.balanceAfter,
  })
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.id, id))
  return rows[0] as WalletTransaction
}
