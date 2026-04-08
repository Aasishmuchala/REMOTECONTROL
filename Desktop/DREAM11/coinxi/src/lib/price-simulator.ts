import Decimal from 'decimal.js'

export type PriceSimulators = Record<string, string>

export function createSimulators(baseValues: Record<string, string>): PriceSimulators {
  throw new Error('Not implemented')
}

export function simulateTick(simulators: PriceSimulators, pairId: string): string {
  throw new Error('Not implemented')
}
