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

export function computePositions(
  trades: TradeRecord[],
  prices: Record<string, string>,
): Position[] {
  throw new Error('Not implemented')
}
