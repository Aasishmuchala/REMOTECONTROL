// @vitest-environment jsdom
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// Mock apiFetch
vi.mock('@/stores/auth', () => ({
  apiFetch: vi.fn(),
}))

// Mock socket hooks
vi.mock('@/hooks/useOrderBook', () => ({
  useOrderBook: vi.fn(() => ({
    bids: [{ price: '100', quantity: '1' }],
    asks: [{ price: '101', quantity: '2' }],
    bidsDiff: { added: new Set(), updated: new Set(), removed: new Set() },
    asksDiff: { added: new Set(), updated: new Set(), removed: new Set() },
  })),
}))

vi.mock('@/hooks/usePriceFeed', () => ({
  usePriceFeed: vi.fn(() => ({ price: '100.50' })),
}))

vi.mock('@/hooks/useRecentTrades', () => ({
  useRecentTrades: vi.fn(() => ({ trades: [] })),
}))

// Mock framer-motion — include motion.button used by Button component
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, whileHover: _wh, whileTap: _wt, transition: _tr, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

import { apiFetch } from '@/stores/auth'

describe('OrderForm slippage from props', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiFetch as any).mockResolvedValue({ availableBalance: '10000' })
  })

  it('uses bids/asks props for slippage instead of REST when provided', async () => {
    const { default: OrderForm } = await import('@/components/OrderForm')

    const bids = [{ price: '99', quantity: '5' }]
    const asks = [{ price: '101', quantity: '3' }, { price: '102', quantity: '2' }]

    render(
      <OrderForm
        pairId="BTC-USDC"
        walletBalance="10000"
        bids={bids}
        asks={asks}
      />
    )

    // Switch to market order type
    const marketBtn = screen.getByText('market')
    fireEvent.click(marketBtn)

    // Enter quantity (market order has only one input — no price field)
    const qtyInput = screen.getByPlaceholderText('0.00')
    fireEvent.change(qtyInput, { target: { value: '2' } })

    // Submit to trigger slippage preview
    const previewBtn = screen.getByText('Preview Order')
    fireEvent.click(previewBtn)

    // Wait for slippage modal — fill price based on asks props
    // 2 units at ask[0]=101: totalCost=202, avg=101.00
    await waitFor(() => {
      expect(screen.getByText('Confirm Market Order')).toBeInTheDocument()
    })

    // apiFetch should NOT have been called with /api/market (slippage used props)
    const marketCalls = (apiFetch as any).mock.calls.filter(
      (call: any[]) => typeof call[0] === 'string' && call[0].includes('/api/market')
    )
    expect(marketCalls).toHaveLength(0)
  })

  it('calls onOrderPlaced callback after successful order submission', async () => {
    const { default: OrderForm } = await import('@/components/OrderForm')
    const onOrderPlaced = vi.fn()
    ;(apiFetch as any).mockResolvedValue({})

    render(
      <OrderForm
        pairId="BTC-USDC"
        walletBalance="10000"
        onOrderPlaced={onOrderPlaced}
      />
    )

    // Fill in limit order fields (default is limit: price + quantity inputs)
    const inputs = screen.getAllByPlaceholderText('0.00')
    fireEvent.change(inputs[0], { target: { value: '100' } })  // price
    fireEvent.change(inputs[1], { target: { value: '1' } })    // quantity

    const submitBtn = screen.getByText('Place buy Order')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onOrderPlaced).toHaveBeenCalledTimes(1)
    })
  })
})

describe('OpenOrders refresh behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiFetch as any).mockResolvedValue([])
  })

  it('re-fetches when refreshKey changes', async () => {
    const { default: OpenOrders } = await import('@/components/OpenOrders')
    const { rerender } = render(<OpenOrders pairId="BTC-USDC" refreshKey={0} />)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/api/orders?pairId=BTC-USDC')
    })

    const callCountBefore = (apiFetch as any).mock.calls.length

    rerender(<OpenOrders pairId="BTC-USDC" refreshKey={1} />)

    await waitFor(() => {
      expect((apiFetch as any).mock.calls.length).toBeGreaterThan(callCountBefore)
    })
  })

  it('auto-refreshes every 5 seconds via setInterval', async () => {
    vi.useFakeTimers()
    try {
      const { default: OpenOrders } = await import('@/components/OpenOrders')
      render(<OpenOrders pairId="BTC-USDC" />)

      // Flush the initial async load triggered synchronously at mount
      await act(async () => {
        await Promise.resolve()
      })

      const callCountAfterMount = (apiFetch as any).mock.calls.length
      expect(callCountAfterMount).toBeGreaterThan(0)

      // Advance 5 seconds — interval fires loadOrders
      await act(async () => {
        vi.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      expect((apiFetch as any).mock.calls.length).toBeGreaterThan(callCountAfterMount)

      // Advance another 5 seconds — should fire again
      const callCountAfterFirst = (apiFetch as any).mock.calls.length
      await act(async () => {
        vi.advanceTimersByTime(5000)
        await Promise.resolve()
      })

      expect((apiFetch as any).mock.calls.length).toBeGreaterThan(callCountAfterFirst)
    } finally {
      vi.useRealTimers()
    }
  })
})
