'use client'

import { useState, useEffect } from 'react'
import TradingPairSelector from '@/components/TradingPairSelector'
import OrderForm from '@/components/OrderForm'
import PriceTicker from '@/components/PriceTicker'
import OpenOrders from '@/components/OpenOrders'
import GlassCard from '@/components/GlassCard'
import { apiFetch } from '@/stores/auth'

const DEFAULT_PAIR = 'BTC-USDC'

interface BookOrder {
  id: string
  side: 'buy' | 'sell'
  price: string | null
  quantity: string
  filledQuantity: string
  status: string
}

interface OrderBook {
  bids: BookOrder[]
  asks: BookOrder[]
}

export default function TradePage() {
  const [selectedPairId, setSelectedPairId] = useState(DEFAULT_PAIR)
  const [book, setBook] = useState<OrderBook>({ bids: [], asks: [] })
  const [lastPrice, setLastPrice] = useState('—')
  const [wallet, setWallet] = useState<{ availableBalance: string } | null>(null)

  // Fetch order book when pair changes
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await apiFetch(`/api/market?pairId=${selectedPairId}`) as OrderBook
        setBook(data)
        // Derive last price from best ask
        const bestAsk = data.asks[0]?.price
        if (bestAsk) setLastPrice(bestAsk)
      } catch {
        setBook({ bids: [], asks: [] })
      }
    }
    fetchBook()
  }, [selectedPairId])

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
            price={lastPrice}
            pairId={selectedPairId}
            className="text-2xl"
          />
          <span className="text-sm text-[var(--color-text-muted)]">USDC</span>
        </div>
      </div>

      {/* Main trading layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order form — left col */}
        <div className="lg:col-span-1">
          <OrderForm
            pairId={selectedPairId}
            walletBalance={wallet?.availableBalance}
          />
        </div>

        {/* Order book snapshot — right cols */}
        <div className="lg:col-span-2">
          <GlassCard>
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-4">
              Order Book
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Asks (sell orders) */}
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Asks</p>
                {book.asks.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)]">No asks</p>
                ) : (
                  book.asks.slice(0, 8).map((o) => (
                    <div key={o.id} className="flex justify-between text-xs font-mono py-0.5">
                      <span className="text-[var(--color-red)]">{o.price}</span>
                      <span className="text-[var(--color-text-muted)]">{o.quantity}</span>
                    </div>
                  ))
                )}
              </div>
              {/* Bids (buy orders) */}
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Bids</p>
                {book.bids.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-muted)]">No bids</p>
                ) : (
                  book.bids.slice(0, 8).map((o) => (
                    <div key={o.id} className="flex justify-between text-xs font-mono py-0.5">
                      <span className="text-[var(--color-green)]">{o.price}</span>
                      <span className="text-[var(--color-text-muted)]">{o.quantity}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Open orders for selected pair */}
      <OpenOrders pairId={selectedPairId} />
    </div>
  )
}
