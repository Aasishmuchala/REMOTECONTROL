'use client'

import { useState, useEffect } from 'react'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import { apiFetch } from '@/stores/auth'

interface TradeRecord {
  id: string
  pairId: string
  side: 'buy' | 'sell'
  price: string
  quantity: string
  createdAt: string
}

interface TradeHistoryResponse {
  trades: TradeRecord[]
  total: number
  page: number
  totalPages: number
}

export default function TradeHistory() {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<TradeHistoryResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError('')
      try {
        const result = await apiFetch(`/api/history?page=${page}&limit=50`)
        setData(result as TradeHistoryResponse)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [page])

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
          Trade History
        </h2>
        {data && (
          <span className="text-xs text-[var(--color-text-muted)]">
            {data.total} trades total
          </span>
        )}
      </div>

      {error && <p className="text-sm text-[var(--color-red)] mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs text-[var(--color-text-muted)] uppercase tracking-wide">
              <th className="text-left pb-2 pr-4">Pair</th>
              <th className="text-left pb-2 pr-4">Side</th>
              <th className="text-right pb-2 pr-4 font-mono">Price</th>
              <th className="text-right pb-2 pr-4 font-mono">Qty</th>
              <th className="text-right pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-2 pr-4">
                      <div className="h-4 glass rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.trades.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[var(--color-text-muted)] text-xs">
                  No trades yet
                </td>
              </tr>
            ) : (
              data?.trades.map((trade) => (
                <tr key={trade.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pr-4 font-mono text-[var(--color-text-secondary)]">
                    {trade.pairId}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={[
                      'text-xs font-semibold uppercase px-2 py-0.5 rounded',
                      trade.side === 'buy'
                        ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]'
                        : 'bg-[var(--color-red-dim)] text-[var(--color-red)]',
                    ].join(' ')}>
                      {trade.side}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[var(--color-text-primary)]">
                    {trade.price}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-[var(--color-text-secondary)]">
                    {trade.quantity}
                  </td>
                  <td className="py-2.5 text-right text-[var(--color-text-muted)] text-xs">
                    {formatDate(trade.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <Button
            variant="ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-xs"
          >
            Previous
          </Button>
          <span className="text-xs text-[var(--color-text-muted)]">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            variant="ghost"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-xs"
          >
            Next
          </Button>
        </div>
      )}
    </GlassCard>
  )
}
