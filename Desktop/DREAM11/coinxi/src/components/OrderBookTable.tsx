'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getRowStatus } from '@/lib/order-book-diff'
import type { BookLevel } from '@/types/socket'
import type { DiffResult } from '@/lib/order-book-diff'
import GlassCard from '@/components/GlassCard'

interface OrderBookTableProps {
  bids: BookLevel[]
  asks: BookLevel[]
  bidsDiff: DiffResult
  asksDiff: DiffResult
}

interface BookRowProps {
  level: BookLevel
  diff: DiffResult
  side: 'bid' | 'ask'
}

function BookRow({ level, diff, side }: BookRowProps) {
  const status = getRowStatus(level.price, diff)
  const prevQuantityRef = useRef<string>(level.quantity)
  const [flashColor, setFlashColor] = useState<string | null>(null)

  // Flash effect for updated rows
  useEffect(() => {
    if (status === 'updated') {
      const prevQty = parseFloat(prevQuantityRef.current)
      const currQty = parseFloat(level.quantity)
      const color = currQty > prevQty ? '#00d4ff' : 'var(--color-red)'
      setFlashColor(color)
      const timer = setTimeout(() => setFlashColor(null), 400)
      prevQuantityRef.current = level.quantity
      return () => clearTimeout(timer)
    }
    prevQuantityRef.current = level.quantity
  }, [status, level.quantity])

  const priceColor =
    side === 'bid' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'

  return (
    <motion.div
      key={level.price}
      layout
      initial={{ x: side === 'bid' ? -10 : 10, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        backgroundColor: flashColor ?? 'transparent',
      }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex justify-between text-xs font-mono py-0.5 px-1 rounded"
      style={{
        backgroundColor: flashColor ?? undefined,
        transition: flashColor ? undefined : 'background-color 400ms ease',
      }}
    >
      <span className={priceColor}>{level.price}</span>
      <span className="text-[var(--color-text-muted)]">{level.quantity}</span>
    </motion.div>
  )
}

export default function OrderBookTable({ bids, asks, bidsDiff, asksDiff }: OrderBookTableProps) {
  const displayAsks = asks.slice(0, 20)
  const displayBids = bids.slice(0, 20)

  return (
    <GlassCard>
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-4">
        Order Book
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Asks (sell orders) — left column, red prices */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Asks</p>
          {displayAsks.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">No asks</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayAsks.map((level) => (
                <BookRow
                  key={level.price}
                  level={level}
                  diff={asksDiff}
                  side="ask"
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Bids (buy orders) — right column, green prices */}
        <div>
          <p className="text-xs text-[var(--color-text-muted)] mb-2">Bids</p>
          {displayBids.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">No bids</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {displayBids.map((level) => (
                <BookRow
                  key={level.price}
                  level={level}
                  diff={bidsDiff}
                  side="bid"
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
