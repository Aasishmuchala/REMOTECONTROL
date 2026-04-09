'use client'

import { useState, useEffect, useCallback } from 'react'
import TradingPairSelector from '@/components/TradingPairSelector'
import OrderForm from '@/components/OrderForm'
import PriceTicker from '@/components/PriceTicker'
import OpenOrders from '@/components/OpenOrders'
import OrderBookTable from '@/components/OrderBookTable'
import RecentTrades from '@/components/RecentTrades'
import DepthChart from '@/components/DepthChart'
import { useOrderBook } from '@/hooks/useOrderBook'
import { usePriceFeed } from '@/hooks/usePriceFeed'
import { useRecentTrades } from '@/hooks/useRecentTrades'
import { apiFetch } from '@/stores/auth'

const DEFAULT_PAIR = 'BTC-USDC'

export default function TradePage() {
  const [selectedPairId, setSelectedPairId] = useState(DEFAULT_PAIR)
  const [wallet, setWallet] = useState<{ availableBalance: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Real-time Socket.IO hooks
  const { bids, asks, bidsDiff, asksDiff } = useOrderBook(selectedPairId)
  const { price } = usePriceFeed(selectedPairId)
  const { trades } = useRecentTrades(selectedPairId)

  const handleOrderPlaced = useCallback(async () => {
    // Re-fetch wallet balance
    try {
      const w = await apiFetch('/api/wallet') as { availableBalance: string }
      setWallet(w)
    } catch {
      // Non-critical
    }
    // Bump refreshKey to trigger OpenOrders re-fetch
    setRefreshKey(k => k + 1)
  }, [])

  // Fetch wallet balance for OrderForm display
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const w = await apiFetch('/api/wallet') as { availableBalance: string }
        setWallet(w)
      } catch {
        // Not critical for page load
      }
    }
    fetchWallet()
  }, [])

  return (
    <div className="space-y-4">
      {/* Pair selector + ticker row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <TradingPairSelector
          selectedPairId={selectedPairId}
          onSelect={setSelectedPairId}
        />
        <div className="flex items-baseline gap-2">
          <PriceTicker
            price={price}
            pairId={selectedPairId}
            className="text-2xl"
          />
          <span className="text-sm text-[var(--color-text-muted)]">USDC</span>
        </div>
      </div>

      {/* Main trading layout — 3 columns on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order book — center on desktop, FIRST on mobile (D-01) */}
        <div className="lg:order-2">
          <OrderBookTable
            bids={bids}
            asks={asks}
            bidsDiff={bidsDiff}
            asksDiff={asksDiff}
          />
          <div className="mt-3">
            <DepthChart bids={bids} asks={asks} />
          </div>
        </div>

        {/* Order form — left on desktop, second on mobile (D-01) */}
        <div className="lg:order-1">
          <OrderForm
            pairId={selectedPairId}
            walletBalance={wallet?.availableBalance}
            bids={bids}
            asks={asks}
            onOrderPlaced={handleOrderPlaced}
          />
        </div>

        {/* Recent trades — right on desktop, third on mobile (D-01) */}
        <div className="lg:order-3">
          <RecentTrades trades={trades} />
        </div>
      </div>

      {/* Open orders for selected pair */}
      <OpenOrders pairId={selectedPairId} refreshKey={refreshKey} />
    </div>
  )
}
