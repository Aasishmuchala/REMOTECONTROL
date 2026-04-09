import { describe, it, expect } from 'vitest'
import { computePositions, type Position } from '@/lib/portfolio'
import type { TradeRecord } from '@/lib/wallet'

// Helper to build a TradeRecord with a specific timestamp
function makeTrade(
  id: string,
  pairId: string,
  side: 'buy' | 'sell',
  price: string,
  quantity: string,
  createdAt: string,
): TradeRecord {
  return { id, pairId, side, price, quantity, createdAt }
}

describe('computePositions', () => {
  // Test 1: Single buy fill — basic position with quantity, avgCostBasis, estimatedValue, unrealizedPnl
  it('returns correct position for a single buy fill', () => {
    const trades: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '1', '2024-01-01T10:00:00Z'),
    ]
    const prices: Record<string, string> = { 'BTC-USDC': '55000' }

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(1)
    const pos = positions[0]
    expect(pos.asset).toBe('BTC')
    expect(pos.pairId).toBe('BTC-USDC')
    expect(pos.quantity).toBe('1.00000000')
    expect(pos.avgCostBasis).toBe('50000.00000000')
    expect(pos.currentPrice).toBe('55000')
    expect(pos.estimatedValue).toBe('55000.00000000')
    expect(pos.unrealizedPnl).toBe('5000.00000000')
    expect(pos.realizedPnl).toBe('0.00000000')
  })

  // Test 2: Multiple buy fills — weighted average cost basis
  it('computes weighted average cost basis across multiple buy fills', () => {
    const trades: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '1', '2024-01-01T10:00:00Z'),
      makeTrade('t2', 'BTC-USDC', 'buy', '60000', '2', '2024-01-01T11:00:00Z'),
    ]
    const prices: Record<string, string> = { 'BTC-USDC': '55000' }

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(1)
    const pos = positions[0]
    // (50000*1 + 60000*2) / 3 = 170000 / 3 = 56666.66666666...
    expect(pos.quantity).toBe('3.00000000')
    expect(pos.avgCostBasis).toBe('56666.66666667')
    expect(pos.unrealizedPnl).toBe('-5000.00000001')
  })

  // Test 3: Buy then sell — realized P&L computed, remaining quantity reduced
  it('computes realized P&L from a sell and reduces quantity', () => {
    const trades: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '2', '2024-01-01T10:00:00Z'),
      makeTrade('t2', 'BTC-USDC', 'sell', '55000', '1', '2024-01-01T11:00:00Z'),
    ]
    const prices: Record<string, string> = { 'BTC-USDC': '55000' }

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(1)
    const pos = positions[0]
    // After selling 1 BTC at 55000, avgCostBasis=50000
    // realizedPnl = (55000 - 50000) * 1 = 5000
    // remaining qty = 1
    expect(pos.quantity).toBe('1.00000000')
    expect(pos.avgCostBasis).toBe('50000.00000000')
    expect(pos.realizedPnl).toBe('5000.00000000')
    expect(pos.unrealizedPnl).toBe('5000.00000000')
  })

  // Test 4: Multiple pairs — returns two Position objects
  it('returns separate positions for multiple traded pairs', () => {
    const trades: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '1', '2024-01-01T10:00:00Z'),
      makeTrade('t2', 'ETH-USDC', 'buy', '3000', '5', '2024-01-01T10:00:00Z'),
    ]
    const prices: Record<string, string> = {
      'BTC-USDC': '55000',
      'ETH-USDC': '3500',
    }

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(2)
    const btcPos = positions.find((p) => p.pairId === 'BTC-USDC')!
    const ethPos = positions.find((p) => p.pairId === 'ETH-USDC')!

    expect(btcPos.asset).toBe('BTC')
    expect(btcPos.quantity).toBe('1.00000000')
    expect(ethPos.asset).toBe('ETH')
    expect(ethPos.quantity).toBe('5.00000000')
  })

  // Test 5: Zero buy history (seed crypto / sells only) — avgCostBasis = '0'
  it('handles zero buy history with zero cost basis and full sell proceeds as realized P&L', () => {
    const trades: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'sell', '50000', '1', '2024-01-01T10:00:00Z'),
    ]
    const prices: Record<string, string> = { 'BTC-USDC': '55000' }

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(1)
    const pos = positions[0]
    expect(pos.avgCostBasis).toBe('0.00000000')
    // realizedPnl = (50000 - 0) * 1 = 50000
    expect(pos.realizedPnl).toBe('50000.00000000')
  })

  // Test 6: Trades passed in DESC order — function sorts internally, same result as ASC
  it('produces same result regardless of input sort order (DESC vs ASC)', () => {
    const tradesAsc: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '2', '2024-01-01T10:00:00Z'),
      makeTrade('t2', 'BTC-USDC', 'sell', '55000', '1', '2024-01-01T11:00:00Z'),
    ]
    const tradesDesc: TradeRecord[] = [
      makeTrade('t2', 'BTC-USDC', 'sell', '55000', '1', '2024-01-01T11:00:00Z'),
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '2', '2024-01-01T10:00:00Z'),
    ]
    const prices: Record<string, string> = { 'BTC-USDC': '55000' }

    const posAsc = computePositions(tradesAsc, prices)
    const posDesc = computePositions(tradesDesc, prices)

    expect(posAsc).toHaveLength(1)
    expect(posDesc).toHaveLength(1)
    expect(posAsc[0].quantity).toBe(posDesc[0].quantity)
    expect(posAsc[0].avgCostBasis).toBe(posDesc[0].avgCostBasis)
    expect(posAsc[0].realizedPnl).toBe(posDesc[0].realizedPnl)
    expect(posAsc[0].unrealizedPnl).toBe(posDesc[0].unrealizedPnl)
  })

  // Test 7: Empty trades array — returns empty positions array
  it('returns empty array for empty trades input', () => {
    const trades: TradeRecord[] = []
    const prices: Record<string, string> = {}

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(0)
    expect(positions).toEqual([])
  })

  // Test 8: All sold (quantity = 0 but has realizedPnl) — position still returned
  it('includes positions with zero quantity when realized P&L exists', () => {
    const trades: TradeRecord[] = [
      makeTrade('t1', 'BTC-USDC', 'buy', '50000', '1', '2024-01-01T10:00:00Z'),
      makeTrade('t2', 'BTC-USDC', 'sell', '55000', '1', '2024-01-01T11:00:00Z'),
    ]
    const prices: Record<string, string> = { 'BTC-USDC': '55000' }

    const positions = computePositions(trades, prices)

    expect(positions).toHaveLength(1)
    const pos = positions[0]
    expect(pos.quantity).toBe('0.00000000')
    expect(pos.realizedPnl).toBe('5000.00000000')
    // estimatedValue for zero quantity = 0
    expect(pos.estimatedValue).toBe('0.00000000')
    expect(pos.unrealizedPnl).toBe('0.00000000')
  })
})
