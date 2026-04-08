// @vitest-environment jsdom
// RED PHASE: These tests will fail until hooks are implemented in Plan 03

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mockEmit = vi.fn()
const mockOn = vi.fn()
const mockOff = vi.fn()
const mockSocket = { on: mockOn, off: mockOff, emit: mockEmit, connected: true }

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

// Hook import will fail until Plan 03 creates it — that is the expected RED state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let usePriceFeed: (pairId: string) => any

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('@/hooks/usePriceFeed')
  usePriceFeed = mod.usePriceFeed
})

describe('usePriceFeed', () => {
  it('returns initial state { price: "--", direction: "neutral" }', () => {
    const { result } = renderHook(() => usePriceFeed('BTC/USDC'))
    expect(result.current.price).toBe('--')
    expect(result.current.direction).toBe('neutral')
  })

  it('updates price when a "price" event fires for the matching pairId', async () => {
    const { result } = renderHook(() => usePriceFeed('BTC/USDC'))

    const priceHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'price',
    )?.[1]

    await act(async () => {
      priceHandler?.({ pairId: 'BTC/USDC', price: '51000.00' })
    })

    expect(result.current.price).toBe('51000.00')
  })

  it('sets direction "up" when new price is greater than previous price', async () => {
    const { result } = renderHook(() => usePriceFeed('BTC/USDC'))

    const priceHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'price',
    )?.[1]

    // First tick establishes a price
    await act(async () => {
      priceHandler?.({ pairId: 'BTC/USDC', price: '50000.00' })
    })

    // Second tick is higher
    await act(async () => {
      priceHandler?.({ pairId: 'BTC/USDC', price: '50100.00' })
    })

    expect(result.current.direction).toBe('up')
  })

  it('sets direction "down" when new price is less than previous price', async () => {
    const { result } = renderHook(() => usePriceFeed('BTC/USDC'))

    const priceHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'price',
    )?.[1]

    // First tick
    await act(async () => {
      priceHandler?.({ pairId: 'BTC/USDC', price: '50000.00' })
    })

    // Second tick is lower
    await act(async () => {
      priceHandler?.({ pairId: 'BTC/USDC', price: '49900.00' })
    })

    expect(result.current.direction).toBe('down')
  })

  it('ignores price events for a different pairId', async () => {
    const { result } = renderHook(() => usePriceFeed('BTC/USDC'))

    const priceHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'price',
    )?.[1]

    await act(async () => {
      priceHandler?.({ pairId: 'ETH/USDC', price: '3500.00' })
    })

    // Should remain in initial state
    expect(result.current.price).toBe('--')
    expect(result.current.direction).toBe('neutral')
  })
})
