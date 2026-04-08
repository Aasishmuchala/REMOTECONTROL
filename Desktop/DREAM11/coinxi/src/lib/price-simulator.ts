import Decimal from 'decimal.js'

export type PriceSimulators = Record<string, string>

export function createSimulators(baseValues: Record<string, string>): PriceSimulators {
  return { ...baseValues }
}

export function simulateTick(simulators: PriceSimulators, pairId: string): string {
  const current = new Decimal(simulators[pairId])
  const delta = (Math.random() - 0.5) * 0.002
  const next = current.mul(new Decimal(1).plus(delta))
  const rounded = next.toFixed(2)
  simulators[pairId] = rounded
  return rounded
}
