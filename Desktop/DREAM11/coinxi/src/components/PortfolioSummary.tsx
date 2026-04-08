'use client'

import { useState, useEffect } from 'react'
import GlassCard from '@/components/GlassCard'
import { apiFetch } from '@/stores/auth'

interface Wallet {
  id: string
  userId: string
  totalBalance: string
  availableBalance: string
  lockedBalance: string
  createdAt: string
}

export default function PortfolioSummary() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch('/api/wallet')
        setWallet(data as Wallet)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load wallet')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <GlassCard key={i} className="h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-[var(--color-red)]">{error}</p>
  }

  if (!wallet) return null

  const balances = [
    { label: 'Total Balance', value: wallet.totalBalance, color: 'text-[var(--color-text-primary)]' },
    { label: 'Available', value: wallet.availableBalance, color: 'text-[var(--color-green)]' },
    { label: 'Locked', value: wallet.lockedBalance, color: 'text-[var(--color-text-secondary)]' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {balances.map(({ label, value, color }) => (
        <GlassCard key={label}>
          <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className={['text-xl font-bold font-mono tabular-nums', color].join(' ')}>
            {value}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">USDC</p>
        </GlassCard>
      ))}
    </div>
  )
}
