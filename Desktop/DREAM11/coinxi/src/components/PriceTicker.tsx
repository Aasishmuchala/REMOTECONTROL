'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PriceTickerProps {
  price: string
  pairId?: string
  className?: string
}

export default function PriceTicker({ price, className }: PriceTickerProps) {
  const [prevPrice, setPrevPrice] = useState(price)
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral')
  const [displayKey, setDisplayKey] = useState(0)

  useEffect(() => {
    if (price === prevPrice) return
    const prev = parseFloat(prevPrice)
    const curr = parseFloat(price)
    setDirection(curr > prev ? 'up' : curr < prev ? 'down' : 'neutral')
    setPrevPrice(price)
    setDisplayKey((k) => k + 1)
  }, [price])

  const colorClass =
    direction === 'up'
      ? 'text-[var(--color-green)]'
      : direction === 'down'
      ? 'text-[var(--color-red)]'
      : 'text-[var(--color-text-primary)]'

  return (
    <div className={cn('relative overflow-hidden inline-block', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayKey}
          initial={{ y: direction === 'up' ? 12 : direction === 'down' ? -12 : 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction === 'up' ? -12 : 12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.2 }}
          className={cn('block font-mono font-bold tabular-nums', colorClass)}
        >
          {price}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
