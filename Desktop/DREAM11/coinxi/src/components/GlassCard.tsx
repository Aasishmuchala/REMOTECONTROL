'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
  interactive?: boolean
}

export default function GlassCard({
  children,
  className,
  elevated = false,
  interactive = false,
}: GlassCardProps) {
  if (interactive) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={cn(
          'rounded-2xl p-4',
          elevated ? 'glass-elevated' : 'glass',
          'glow-hover cursor-pointer',
          className
        )}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-4',
        elevated ? 'glass-elevated' : 'glass',
        className
      )}
    >
      {children}
    </div>
  )
}
