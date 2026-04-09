import type { BookLevel } from '@/types/socket'

export interface DepthPoint {
  time: number
  value: number
}

/**
 * Convert order book levels to cumulative depth data for the chart.
 * For asks (isAsk=true): sort ascending by price, accumulate quantity.
 * For bids (isAsk=false): sort descending by price, accumulate quantity.
 */
export function computeCumulativeDepth(
  levels: BookLevel[],
  isAsk: boolean
): DepthPoint[] {
  if (levels.length === 0) return []

  const sorted = [...levels].sort((a, b) => {
    const pa = parseFloat(a.price)
    const pb = parseFloat(b.price)
    return isAsk ? pa - pb : pb - pa
  })

  let cumulative = 0
  return sorted.map((l) => {
    cumulative += parseFloat(l.quantity)
    return {
      time: parseFloat(l.price),
      value: cumulative,
    }
  })
}
