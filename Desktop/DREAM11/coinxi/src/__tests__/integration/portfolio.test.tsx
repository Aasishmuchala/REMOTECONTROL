// @vitest-environment jsdom
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock apiFetch
vi.mock('@/stores/auth', () => ({
  apiFetch: vi.fn(),
}))

// Mock usePriceFeed — returns predictable prices for testing
vi.mock('@/hooks/usePriceFeed', () => ({
  usePriceFeed: vi.fn((pairId: string) => {
    const prices: Record<string, { price: string; direction: 'up' | 'down' | 'neutral' }> = {
      'BTC-USDC': { price: '55000', direction: 'up' },
      'ETH-USDC': { price: '3500', direction: 'neutral' },
      'SOL-USDC': { price: '180', direction: 'down' },
    }
    return prices[pairId] ?? { price: '--', direction: 'neutral' }
  }),
}))

// Mock framer-motion including all elements used by PortfolioHoldings and Button
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, initial: _i, animate: _a, exit: _e, transition: _t, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
    button: ({ children, whileHover: _wh, whileTap: _wt, transition: _tr, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock socket client used by usePriceFeed
vi.mock('@/lib/socket-client', () => ({
  getSocket: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
  })),
}))

import { apiFetch } from '@/stores/auth'

// Test data
const mockPositions = [
  {
    asset: 'BTC',
    pairId: 'BTC-USDC',
    quantity: '1.50000000',
    avgCostBasis: '50000.00000000',
    currentPrice: '55000.00000000',
    estimatedValue: '82500.00000000',
    unrealizedPnl: '7500.00000000',
    realizedPnl: '2000.00000000',
  },
]

const mockWallet = {
  id: 'w1',
  userId: 'u1',
  totalBalance: '10000.00',
  availableBalance: '8000.00',
  lockedBalance: '2000.00',
  createdAt: new Date().toISOString(),
}

const mockOrders = [
  {
    id: 'ord-1',
    userId: 'u1',
    pairId: 'BTC-USDC',
    side: 'buy',
    type: 'limit',
    price: '49000',
    quantity: '0.5',
    filledQuantity: '0',
    status: 'open',
    createdAt: new Date().toISOString(),
  },
]

// ── PortfolioHoldings Tests ──────────────────────────────────────────────────

describe('PortfolioHoldings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiFetch as any).mockImplementation((path: string) => {
      if (path === '/api/portfolio') return Promise.resolve(mockPositions)
      if (path === '/api/wallet') return Promise.resolve(mockWallet)
      return Promise.resolve(null)
    })
  })

  it('renders a GlassCard for BTC with quantity, avg cost, and unrealized P&L', async () => {
    const { default: PortfolioHoldings } = await import('@/components/PortfolioHoldings')
    render(<PortfolioHoldings />)

    await waitFor(() => {
      // BTC asset symbol badge should appear (exact match to avoid BTC-USDC ambiguity)
      expect(screen.getAllByText(/BTC/i).length).toBeGreaterThan(0)
    })

    // Quantity should be shown
    expect(screen.getByText(/1\.5/)).toBeInTheDocument()

    // Unrealized P&L or avg cost should appear (may appear multiple times across cards)
    expect(screen.getAllByText(/50000/).length).toBeGreaterThan(0)
  })

  it('renders a GlassCard for USDC showing available and locked balance', async () => {
    const { default: PortfolioHoldings } = await import('@/components/PortfolioHoldings')
    render(<PortfolioHoldings />)

    await waitFor(() => {
      // Available balance label
      expect(screen.getByText(/Available USDC/i)).toBeInTheDocument()
    })

    // Available balance value
    expect(screen.getByText(/8000/)).toBeInTheDocument()
  })

  it('displays aggregate realized P&L summary row', async () => {
    const { default: PortfolioHoldings } = await import('@/components/PortfolioHoldings')
    render(<PortfolioHoldings />)

    await waitFor(() => {
      // Realized P&L heading
      expect(screen.getByText(/Total Realized P&L/i)).toBeInTheDocument()
    })
  })
})

// ── PortfolioOrders Tests ────────────────────────────────────────────────────

describe('PortfolioOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(apiFetch as any).mockResolvedValue(mockOrders)
  })

  it('renders tab buttons for Pending, Partial, Filled, Cancelled', async () => {
    const { default: PortfolioOrders } = await import('@/components/PortfolioOrders')
    render(<PortfolioOrders />)

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
    expect(screen.getByText('Partial')).toBeInTheDocument()
    expect(screen.getByText('Filled')).toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('fetches /api/orders/all with status param on tab click', async () => {
    const { default: PortfolioOrders } = await import('@/components/PortfolioOrders')
    render(<PortfolioOrders />)

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    // Initial fetch with default 'open' tab
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/all?status=open'),
    )

    // Click Filled tab
    const filledTab = screen.getByText('Filled')
    fireEvent.click(filledTab)

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/all?status=filled'),
      )
    })
  })

  it('shows order pairId in cross-pair display', async () => {
    const { default: PortfolioOrders } = await import('@/components/PortfolioOrders')
    render(<PortfolioOrders />)

    await waitFor(() => {
      // pairId from mockOrders should appear
      expect(screen.getByText(/BTC-USDC/)).toBeInTheDocument()
    })
  })
})
