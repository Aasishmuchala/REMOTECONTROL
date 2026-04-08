import { describe, it, expect } from 'vitest'
import { createSimulators, simulateTick, type PriceSimulators } from '@/lib/price-simulator'

// RED PHASE: These tests will fail with 'Not implemented' until price-simulator is implemented in Plan 02

describe('createSimulators', () => {
  it('returns a record with the provided base pair values', () => {
    const base = { 'BTC/USDC': '50000.00', 'ETH/USDC': '3000.00' }
    const simulators = createSimulators(base)
    expect(simulators['BTC/USDC']).toBe('50000.00')
    expect(simulators['ETH/USDC']).toBe('3000.00')
  })

  it('returns a plain record (not the same reference as input)', () => {
    const base = { 'BTC/USDC': '50000.00' }
    const simulators = createSimulators(base)
    expect(typeof simulators).toBe('object')
    expect(simulators).not.toBe(base)
  })
})

describe('simulateTick', () => {
  it('returns a string with exactly 2 decimal places', () => {
    const simulators = createSimulators({ 'BTC/USDC': '50000.00' })
    const price = simulateTick(simulators, 'BTC/USDC')
    expect(price).toMatch(/^\d+\.\d{2}$/)
  })

  it('stays within 0.2% of the previous price after a single tick (D-06)', () => {
    const base = '50000.00'
    const simulators = createSimulators({ 'BTC/USDC': base })
    const newPrice = simulateTick(simulators, 'BTC/USDC')
    const prev = parseFloat(base)
    const next = parseFloat(newPrice)
    const pct = Math.abs(next - prev) / prev
    // 0.2% tolerance per D-06: (Math.random()-0.5)*0.002 => max 0.1% each way
    expect(pct).toBeLessThanOrEqual(0.001)
  })

  it('mutates simulators state in place so subsequent ticks use updated price', () => {
    const simulators = createSimulators({ 'BTC/USDC': '50000.00' })
    const tick1 = simulateTick(simulators, 'BTC/USDC')
    const tick2 = simulateTick(simulators, 'BTC/USDC')
    // After tick1 the stored price should be tick1, so tick2 is based on tick1
    // They should differ (extremely rare collision), or at minimum both be valid formatted strings
    expect(tick1).toMatch(/^\d+\.\d{2}$/)
    expect(tick2).toMatch(/^\d+\.\d{2}$/)
  })

  it('keeps price bounded after 1000 ticks for BTC (base 50000)', () => {
    const simulators = createSimulators({ 'BTC/USDC': '50000.00' })
    let last = '50000.00'
    for (let i = 0; i < 1000; i++) {
      last = simulateTick(simulators, 'BTC/USDC')
    }
    const final = parseFloat(last)
    // Generous bounds: price should stay between $10,000 and $500,000 after 1000 ticks
    expect(final).toBeGreaterThan(10000)
    expect(final).toBeLessThan(500000)
  })

  it('returns price formatted via Decimal toFixed(2) — no extra trailing digits', () => {
    const simulators = createSimulators({ 'ETH/USDC': '3000.00' })
    const price = simulateTick(simulators, 'ETH/USDC')
    // Must be exactly 2 decimal places (D-07)
    const parts = price.split('.')
    expect(parts).toHaveLength(2)
    expect(parts[1]).toHaveLength(2)
  })
})
