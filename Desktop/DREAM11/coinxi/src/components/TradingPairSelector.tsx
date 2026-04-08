'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiFetch } from '@/stores/auth'
import { cn } from '@/lib/utils'

const PAIRS = [
  { id: 'BTC-USDC', base: 'BTC', quote: 'USDC' },
  { id: 'ETH-USDC', base: 'ETH', quote: 'USDC' },
  { id: 'SOL-USDC', base: 'SOL', quote: 'USDC' },
]

interface TradingPairSelectorProps {
  selectedPairId: string
  onSelect: (pairId: string) => void
}

export default function TradingPairSelector({ selectedPairId, onSelect }: TradingPairSelectorProps) {
  const [prices, setPrices] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchPrices = async () => {
      const next: Record<string, string> = {}
      for (const pair of PAIRS) {
        try {
          const book = await apiFetch(`/api/market?pairId=${pair.id}`) as {
            bids: Array<{ price: string }>
            asks: Array<{ price: string }>
          }
          const bestBid = book.bids[0]?.price
          const bestAsk = book.asks[0]?.price
          if (bestBid && bestAsk) {
            const mid = ((parseFloat(bestBid) + parseFloat(bestAsk)) / 2).toFixed(2)
            next[pair.id] = mid
          }
        } catch {
          // No orders yet — leave price empty
        }
      }
      setPrices(next)
    }
    fetchPrices()
  }, [])

  return (
    <div className="flex gap-2 flex-wrap">
      {PAIRS.map((pair) => {
        const isActive = pair.id === selectedPairId
        return (
          <motion.button
            key={pair.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(pair.id)}
            className={cn(
              'flex flex-col items-start px-4 py-3 rounded-xl transition-colors duration-150',
              'glass font-mono text-sm',
              isActive
                ? 'border-[var(--color-cyan)] text-[var(--color-cyan)] glow-cyan-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <span className="font-semibold text-base leading-tight">
              {pair.base}
              <span className="text-[var(--color-text-muted)] text-sm">/{pair.quote}</span>
            </span>
            {prices[pair.id] && (
              <span className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {prices[pair.id]}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
