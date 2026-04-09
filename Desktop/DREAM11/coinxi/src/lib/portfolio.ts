import Decimal from 'decimal.js'
import type { TradeRecord } from '@/lib/wallet'

export type Position = {
  asset: string
  pairId: string
  quantity: string
  avgCostBasis: string
  currentPrice: string
  estimatedValue: string
  unrealizedPnl: string
  realizedPnl: string
}

/**
 * Computes per-asset positions from a list of trade fill records.
 *
 * - Sorts trades chronologically (ASC) so weighted average cost basis is correct
 *   even when `getTradeHistory` returns newest-first (DESC) order.
 * - Uses decimal.js for all monetary arithmetic — no native JS operators on money values.
 * - Returns positions with quantity > 0 OR realizedPnl !== 0 (omits zero-everything pairs).
 */
export function computePositions(
  trades: TradeRecord[],
  prices: Record<string, string>,
): Position[] {
  if (trades.length === 0) return []

  // Sort chronologically (ASC) — getTradeHistory returns DESC, so this normalises input order
  const sorted = [...trades].sort((a, b) =>
    a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0,
  )

  // Group by pairId
  const byPair = new Map<string, TradeRecord[]>()
  for (const trade of sorted) {
    const bucket = byPair.get(trade.pairId) ?? []
    bucket.push(trade)
    byPair.set(trade.pairId, bucket)
  }

  const positions: Position[] = []

  for (const [pairId, pairTrades] of byPair) {
    let runningQty = new Decimal('0')
    let runningCost = new Decimal('0')
    let avgCostBasis = new Decimal('0')
    let realizedPnl = new Decimal('0')

    for (const t of pairTrades) {
      const price = new Decimal(t.price)
      const qty = new Decimal(t.quantity)

      if (t.side === 'buy') {
        runningCost = runningCost.plus(price.mul(qty))
        runningQty = runningQty.plus(qty)
        avgCostBasis = runningQty.gt(0) ? runningCost.div(runningQty) : new Decimal('0')
      } else {
        // sell
        realizedPnl = realizedPnl.plus(price.minus(avgCostBasis).mul(qty))
        runningQty = runningQty.minus(qty)
        // Adjust running cost to reflect remaining quantity at same avg cost
        runningCost = avgCostBasis.mul(runningQty)
      }
    }

    // Skip positions with zero quantity AND zero realized P&L (never traded meaningfully)
    if (runningQty.isZero() && realizedPnl.isZero()) continue

    const asset = pairId.split('-')[0]
    const currentPrice = prices[pairId] ?? '0'
    const currentPriceD = new Decimal(currentPrice)

    const estimatedValue = currentPriceD.mul(runningQty).toFixed(8)
    // Use rounded avgCostBasis (8dp) for unrealizedPnl to maintain precision consistency
    const avgCostBasisRounded = new Decimal(avgCostBasis.toFixed(8))
    const unrealizedPnl = currentPriceD.minus(avgCostBasisRounded).mul(runningQty).toFixed(8)

    positions.push({
      asset,
      pairId,
      quantity: runningQty.toFixed(8),
      avgCostBasis: avgCostBasis.toFixed(8),
      currentPrice,
      estimatedValue,
      unrealizedPnl,
      realizedPnl: realizedPnl.toFixed(8),
    })
  }

  return positions
}
