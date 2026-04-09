'use client'

import { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Decimal from 'decimal.js'
import GlassCard from '@/components/GlassCard'
import { usePriceFeed } from '@/hooks/usePriceFeed'
import { apiFetch } from '@/stores/auth'
import { cn } from '@/lib/utils'

interface Position {
  asset: string
  pairId: string
  quantity: string
  avgCostBasis: string
  currentPrice: string
  estimatedValue: string
  unrealizedPnl: string
  realizedPnl: string
}

interface Wallet {
  id: string
  userId: string
  totalBalance: string
  availableBalance: string
  lockedBalance: string
  createdAt: string
}

// ── AnimatedPnl helper (reuses PriceTicker spring pattern, D-10) ─────────────

function AnimatedPnl({ value, className }: { value: string; className?: string }) {
  const [displayKey, setDisplayKey] = useState(0)
  const [prevValue, setPrevValue] = useState(value)
  const [dir, setDir] = useState<'up' | 'down' | 'neutral'>('neutral')

  useEffect(() => {
    if (value === prevValue) return
    const prev = parseFloat(prevValue)
    const curr = parseFloat(value)
    setDir(curr > prev ? 'up' : curr < prev ? 'down' : 'neutral')
    setPrevValue(value)
    setDisplayKey((k) => k + 1)
  }, [value])

  const isPositive = parseFloat(value) > 0
  const isNegative = parseFloat(value) < 0
  const colorClass = isPositive
    ? 'text-[var(--color-green)]'
    : isNegative
    ? 'text-[var(--color-red)]'
    : 'text-[var(--color-text-secondary)]'
  const prefix = isPositive ? '+' : ''

  return (
    <div className={cn('relative overflow-hidden inline-block', className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={displayKey}
          initial={{ y: dir === 'up' ? 12 : dir === 'down' ? -12 : 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: dir === 'up' ? -12 : 12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn('block font-mono font-bold tabular-nums', colorClass)}
        >
          {prefix}{value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

// ── Pairs config ─────────────────────────────────────────────────────────────

const PAIRS = [
  { pairId: 'BTC-USDC', asset: 'BTC', label: 'Bitcoin' },
  { pairId: 'ETH-USDC', asset: 'ETH', label: 'Ethereum' },
  { pairId: 'SOL-USDC', asset: 'SOL', label: 'Solana' },
]

const ZERO_POSITION = (asset: string, pairId: string): Position => ({
  asset,
  pairId,
  quantity: '0.00000000',
  avgCostBasis: '0.00000000',
  currentPrice: '0.00000000',
  estimatedValue: '0.00000000',
  unrealizedPnl: '0.00000000',
  realizedPnl: '0.00000000',
})

// ── Main component ────────────────────────────────────────────────────────────

export default function PortfolioHoldings() {
  const [positions, setPositions] = useState<Position[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // D-01: Live price feeds per pair
  const btcFeed = usePriceFeed('BTC-USDC')
  const ethFeed = usePriceFeed('ETH-USDC')
  const solFeed = usePriceFeed('SOL-USDC')

  const livePrices: Record<string, { price: string; direction: 'up' | 'down' | 'neutral' }> = {
    'BTC-USDC': btcFeed,
    'ETH-USDC': ethFeed,
    'SOL-USDC': solFeed,
  }

  // Fetch portfolio positions and wallet on mount
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [posData, walletData] = await Promise.all([
          apiFetch('/api/portfolio'),
          apiFetch('/api/wallet'),
        ])
        setPositions(posData as Position[])
        setWallet(walletData as Wallet)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // D-01, D-10: Recompute unrealized P&L whenever live prices change
  const livePositions = useMemo(() => {
    return positions.map((pos) => {
      const feed = livePrices[pos.pairId]
      const livePrice = feed && feed.price !== '--' ? feed.price : pos.currentPrice
      const qty = new Decimal(pos.quantity)
      const avgCost = new Decimal(pos.avgCostBasis)
      const price = new Decimal(livePrice)
      const estimatedValue = price.mul(qty).toFixed(2)
      const unrealizedPnl = price.minus(avgCost).mul(qty).toFixed(2)
      return { ...pos, currentPrice: livePrice, estimatedValue, unrealizedPnl }
    })
  }, [positions, btcFeed.price, ethFeed.price, solFeed.price])

  // D-11: Aggregate P&L totals
  const totalRealizedPnl = useMemo(() => {
    return livePositions
      .reduce((sum, p) => new Decimal(sum).plus(p.realizedPnl).toFixed(2), '0')
  }, [livePositions])

  const totalUnrealizedPnl = useMemo(() => {
    return livePositions
      .reduce((sum, p) => new Decimal(sum).plus(p.unrealizedPnl).toFixed(2), '0')
  }, [livePositions])

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 glass rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <GlassCard key={i} className="h-32 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-[var(--color-red)]">{error}</p>
  }

  // Empty state
  if (positions.length === 0 && !wallet) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
        No trading activity yet. Place your first trade to see your portfolio.
      </p>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* D-11: P&L Summary row */}
      <GlassCard elevated className="col-span-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
              Total Unrealized P&L
            </p>
            <AnimatedPnl value={totalUnrealizedPnl} />
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
              Total Realized P&L
            </p>
            <AnimatedPnl value={totalRealizedPnl} />
          </div>
        </div>
      </GlassCard>

      {/* D-09: Asset cards grid (3 crypto + 1 USDC) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PAIRS.map(({ pairId, asset, label }) => {
          const pos =
            livePositions.find((p) => p.pairId === pairId) ?? ZERO_POSITION(asset, pairId)
          const feed = livePrices[pairId]
          const livePrice = feed && feed.price !== '--' ? feed.price : pos.currentPrice

          return (
            <GlassCard key={pairId}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {label}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{pairId}</p>
                </div>
                <span className="text-xs font-bold font-mono text-[var(--color-cyan)]">
                  {asset}
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">Quantity</p>
                  <p className="text-base font-mono font-semibold tabular-nums text-[var(--color-text-primary)]">
                    {pos.quantity}
                  </p>
                </div>

                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-[var(--color-text-muted)]">Avg Cost</p>
                    <p className="font-mono tabular-nums text-[var(--color-text-secondary)]">
                      {pos.avgCostBasis}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--color-text-muted)]">Price</p>
                    <p className="font-mono tabular-nums text-[var(--color-text-secondary)]">
                      {livePrice}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-0.5">
                    Est. Value
                  </p>
                  <p className="text-sm font-mono tabular-nums text-[var(--color-text-primary)]">
                    {pos.estimatedValue}
                  </p>
                </div>

                <div className="pt-1 border-t border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Unrealized</span>
                    <AnimatedPnl value={pos.unrealizedPnl} className="text-sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-muted)]">Realized</span>
                    <AnimatedPnl value={pos.realizedPnl} className="text-xs" />
                  </div>
                </div>
              </div>
            </GlassCard>
          )
        })}

        {/* D-09: USDC balance card */}
        <GlassCard>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                USD Coin
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">Stablecoin</p>
            </div>
            <span className="text-xs font-bold font-mono text-[var(--color-cyan)]">USDC</span>
          </div>

          {wallet ? (
            <div className="space-y-2">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">
                  Available USDC
                </p>
                <p className="text-base font-mono font-semibold tabular-nums text-[var(--color-green)]">
                  {wallet.availableBalance}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-0.5">In Orders</p>
                <p className="text-sm font-mono tabular-nums text-[var(--color-text-secondary)]">
                  {wallet.lockedBalance}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--color-text-muted)]">—</p>
          )}
        </GlassCard>
      </div>
    </div>
  )
}
