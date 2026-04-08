// @vitest-environment jsdom
// RED PHASE: These tests will fail until hooks are implemented in Plan 03

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { BookLevel } from '@/types/socket'

const mockEmit = vi.fn()
const mockOn = vi.fn()
const mockOff = vi.fn()
const mockSocket = { on: mockOn, off: mockOff, emit: mockEmit, connected: true }

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

// Hook import will fail until Plan 03 creates it — that is the expected RED state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useOrderBook: (pairId: string) => any

beforeEach(async () => {
  vi.clearAllMocks()
  // Dynamically import so test file itself doesn't error on module resolution at parse time
  const mod = await import('@/hooks/useOrderBook')
  useOrderBook = mod.useOrderBook
})

describe('useOrderBook', () => {
  it('returns initial empty state { bids: [], asks: [] }', () => {
    const { result } = renderHook(() => useOrderBook('BTC/USDC'))
    expect(result.current.bids).toEqual([])
    expect(result.current.asks).toEqual([])
  })

  it('updates bids and asks when orderbook event fires for the matching pairId', async () => {
    const { result } = renderHook(() => useOrderBook('BTC/USDC'))

    const newBids: BookLevel[] = [{ price: '50000.00', quantity: '1.50' }]
    const newAsks: BookLevel[] = [{ price: '50100.00', quantity: '0.75' }]

    // Find the registered 'orderbook' event handler
    const orderbookHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'orderbook',
    )?.[1]

    await act(async () => {
      orderbookHandler?.({ pairId: 'BTC/USDC', bids: newBids, asks: newAsks })
    })

    expect(result.current.bids).toEqual(newBids)
    expect(result.current.asks).toEqual(newAsks)
  })

  it('ignores orderbook events for a different pairId', async () => {
    const { result } = renderHook(() => useOrderBook('BTC/USDC'))

    const orderbookHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'orderbook',
    )?.[1]

    await act(async () => {
      orderbookHandler?.({
        pairId: 'ETH/USDC',
        bids: [{ price: '3000.00', quantity: '5.00' }],
        asks: [{ price: '3010.00', quantity: '3.00' }],
      })
    })

    // State should remain empty because pairId doesn't match
    expect(result.current.bids).toEqual([])
    expect(result.current.asks).toEqual([])
  })

  it('computes bidsDiff and asksDiff when order book updates', async () => {
    const { result } = renderHook(() => useOrderBook('BTC/USDC'))

    const orderbookHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'orderbook',
    )?.[1]

    await act(async () => {
      orderbookHandler?.({
        pairId: 'BTC/USDC',
        bids: [{ price: '50000.00', quantity: '1.00' }],
        asks: [{ price: '50100.00', quantity: '0.50' }],
      })
    })

    // After first update all rows should be 'added'
    expect(result.current).toHaveProperty('bidsDiff')
    expect(result.current).toHaveProperty('asksDiff')
    expect(result.current.bidsDiff.added.has('50000.00')).toBe(true)
    expect(result.current.asksDiff.added.has('50100.00')).toBe(true)
  })
})
