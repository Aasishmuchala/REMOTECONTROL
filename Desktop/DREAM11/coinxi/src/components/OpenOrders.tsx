'use client'

import { useState, useEffect, useCallback } from 'react'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import { apiFetch } from '@/stores/auth'

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

interface OpenOrdersProps {
  pairId: string
  refreshKey?: number
}

export default function OpenOrders({ pairId, refreshKey }: OpenOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await apiFetch(`/api/orders?pairId=${pairId}`)
      setOrders(data as Order[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }, [pairId, refreshKey])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders()
    }, 5000)
    return () => clearInterval(interval)
  }, [loadOrders])

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      await apiFetch(`/api/orders/${orderId}`, { method: 'DELETE' })
      // Refresh orders list after cancel
      await loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wide">
          Open Orders
        </h2>
        <span className="text-xs text-[var(--color-text-muted)]">{pairId}</span>
      </div>

      {error && <p className="text-xs text-[var(--color-red)] mb-3">{error}</p>}

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 glass rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)] py-6 text-center">
          No open orders
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between gap-3 rounded-xl glass px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={[
                  'text-xs font-semibold uppercase px-2 py-0.5 rounded shrink-0',
                  order.side === 'buy'
                    ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]'
                    : 'bg-[var(--color-red-dim)] text-[var(--color-red)]',
                ].join(' ')}>
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
                    {order.status} · {order.type}
                    {order.filledQuantity !== '0' && ` · filled ${order.filledQuantity}`}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                isLoading={cancellingId === order.id}
                onClick={() => handleCancel(order.id)}
                className="text-xs px-3 py-1.5 shrink-0"
              >
                Cancel
              </Button>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  )
}
