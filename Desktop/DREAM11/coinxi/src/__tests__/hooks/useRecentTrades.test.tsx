// @vitest-environment jsdom
// RED PHASE: These tests will fail until hooks are implemented in Plan 03

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { Trade } from '@/types/socket'

const mockEmit = vi.fn()
const mockOn = vi.fn()
const mockOff = vi.fn()
const mockSocket = { on: mockOn, off: mockOff, emit: mockEmit, connected: true }

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}))

// Hook import will fail until Plan 03 creates it — that is the expected RED state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let useRecentTrades: (pairId: string) => any

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('@/hooks/useRecentTrades')
  useRecentTrades = mod.useRecentTrades
})

describe('useRecentTrades', () => {
  it('returns an initial empty trades array', () => {
    const { result } = renderHook(() => useRecentTrades('BTC/USDC'))
    expect(result.current.trades).toEqual([])
  })

  it('updates trades when a "trades" event fires for the matching pairId', async () => {
    const { result } = renderHook(() => useRecentTrades('BTC/USDC'))

    const tradesHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'trades',
    )?.[1]

    const newTrades: Trade[] = [
      {
        id: 'trade-1',
        pairId: 'BTC/USDC',
        price: '50050.00',
        quantity: '0.10',
        side: 'buy',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'trade-2',
        pairId: 'BTC/USDC',
        price: '50000.00',
        quantity: '0.25',
        side: 'sell',
        createdAt: new Date().toISOString(),
      },
    ]

    await act(async () => {
      tradesHandler?.({ pairId: 'BTC/USDC', trades: newTrades })
    })

    expect(result.current.trades).toEqual(newTrades)
    expect(result.current.trades).toHaveLength(2)
  })

  it('ignores trades events for a different pairId', async () => {
    const { result } = renderHook(() => useRecentTrades('BTC/USDC'))

    const tradesHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'trades',
    )?.[1]

    await act(async () => {
      tradesHandler?.({
        pairId: 'ETH/USDC',
        trades: [
          {
            id: 'trade-eth-1',
            pairId: 'ETH/USDC',
            price: '3010.00',
            quantity: '1.00',
            side: 'buy',
            createdAt: new Date().toISOString(),
          },
        ],
      })
    })

    // Should remain empty because pairId doesn't match
    expect(result.current.trades).toEqual([])
  })

  it('replaces trades on each new event (latest state wins)', async () => {
    const { result } = renderHook(() => useRecentTrades('BTC/USDC'))

    const tradesHandler = mockOn.mock.calls.find(
      ([event]: [string]) => event === 'trades',
    )?.[1]

    const firstBatch: Trade[] = [
      {
        id: 'trade-1',
        pairId: 'BTC/USDC',
        price: '50000.00',
        quantity: '0.10',
        side: 'buy',
        createdAt: new Date().toISOString(),
      },
    ]

    const secondBatch: Trade[] = [
      {
        id: 'trade-2',
        pairId: 'BTC/USDC',
        price: '50200.00',
        quantity: '0.20',
        side: 'sell',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'trade-3',
        pairId: 'BTC/USDC',
        price: '50150.00',
        quantity: '0.05',
        side: 'buy',
        createdAt: new Date().toISOString(),
      },
    ]

    await act(async () => {
      tradesHandler?.({ pairId: 'BTC/USDC', trades: firstBatch })
    })

    await act(async () => {
      tradesHandler?.({ pairId: 'BTC/USDC', trades: secondBatch })
    })

    expect(result.current.trades).toHaveLength(2)
    expect(result.current.trades[0].id).toBe('trade-2')
  })
})
