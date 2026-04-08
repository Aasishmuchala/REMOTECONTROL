'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import type { Trade } from '@/types/socket'
import GlassCard from '@/components/GlassCard'

interface RecentTradesProps {
  trades: Trade[]
}

export default function RecentTrades({ trades }: RecentTradesProps) {
  const displayTrades = trades.slice(0, 50)

  return (
    <GlassCard>
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide mb-4">
        Recent Trades
      </h2>

      {displayTrades.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">No trades yet</p>
      ) : (
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {displayTrades.map((trade) => (
              <motion.div
                key={trade.id}
                layout
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="flex justify-between items-center text-xs font-mono py-0.5 px-1"
              >
                <span
                  className={
                    trade.side === 'buy'
                      ? 'text-[var(--color-green)]'
                      : 'text-[var(--color-red)]'
                  }
                >
                  {trade.price}
                </span>
                <span className="text-[var(--color-text-muted)]">{trade.quantity}</span>
                <span className="text-[var(--color-text-muted)] text-[10px]">
                  {formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </GlassCard>
  )
}
