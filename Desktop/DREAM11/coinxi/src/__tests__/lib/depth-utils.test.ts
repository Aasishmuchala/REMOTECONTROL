import { describe, it, expect } from 'vitest'
import { computeCumulativeDepth } from '@/lib/depth-utils'

describe('computeCumulativeDepth', () => {
  it('returns empty array for empty input', () => {
    expect(computeCumulativeDepth([], true)).toEqual([])
    expect(computeCumulativeDepth([], false)).toEqual([])
  })

  it('computes ascending cumulative depth for asks', () => {
    const asks = [
      { price: '101', quantity: '2' },
      { price: '100', quantity: '1' },
    ]
    const result = computeCumulativeDepth(asks, true)
    expect(result).toEqual([
      { time: 100, value: 1 },
      { time: 101, value: 3 },
    ])
  })

  it('computes descending cumulative depth for bids', () => {
    const bids = [
      { price: '99', quantity: '2' },
      { price: '100', quantity: '1' },
    ]
    const result = computeCumulativeDepth(bids, false)
    expect(result).toEqual([
      { time: 100, value: 1 },
      { time: 99, value: 3 },
    ])
  })

  it('handles single level', () => {
    const levels = [{ price: '50', quantity: '3' }]
    expect(computeCumulativeDepth(levels, true)).toEqual([
      { time: 50, value: 3 },
    ])
  })
})
