'use client'

import { useState, useEffect, useCallback } from 'react'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import { apiFetch } from '@/stores/auth'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  userId: string
  pairId: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  price: string | null
  quantity: string
  filledQuantity: string
  status: 'open' | 'partial' | 'filled' | 'cancelled'
  createdAt: string
}

// D-05: Tab configuration
const TABS = [
  { key: 'open', label: 'Pending' },
  { key: 'partial', label: 'Partial' },
  { key: 'filled', label: 'Filled' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

type TabKey = typeof TABS[number]['key']

export default function PortfolioOrders() {
  const [activeTab, setActiveTab] = useState<TabKey>('open')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  // D-06: Fetch orders with status filter
  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await apiFetch(`/api/orders/all?status=${activeTab}`)
      setOrders(data as Order[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Auto-refresh every 10 seconds (portfolio view is less time-sensitive than trade page)
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders()
    }, 10000)
    return () => clearInterval(interval)
  }, [loadOrders])

  // Cancel handler — only available for open/partial orders
  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      await apiFetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      await loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setCancellingId(null)
    }
  }

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!

  return (
    <GlassCard>
      {/* D-05: Status tab bar */}
      <div className="flex gap-1 mb-4">
        {TABS.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'primary' : 'ghost'}
            onClick={() => setActiveTab(tab.key)}
            className="text-xs px-3 py-1.5"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {error && (
        <p className="text-xs text-[var(--color-red)] mb-3">{error}</p>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">
          No {activeTabConfig.label.toLowerCase()} orders
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 rounded-xl glass px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    'text-xs font-semibold uppercase px-2 py-0.5 rounded shrink-0',
                    order.side === 'buy'
                      ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]'
                      : 'bg-[var(--color-red-dim)] text-[var(--color-red)]',
                  )}
                >
                  {order.side}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-mono text-[var(--color-text-primary)] truncate">
                    {order.quantity}
                    {order.price && (
                      <span className="text-[var(--color-text-muted)]"> @ {order.price}</span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {order.pairId} · {order.type}
                    {order.filledQuantity !== '0' && ` · filled ${order.filledQuantity}`}
                  </p>
                </div>
              </div>

              {(order.status === 'open' || order.status === 'partial') && (
                <Button
                  variant="danger"
                  isLoading={cancellingId === order.id}
                  onClick={() => handleCancel(order.id)}
                  className="text-xs px-3 py-1.5 shrink-0"
                >
                  Cancel
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
