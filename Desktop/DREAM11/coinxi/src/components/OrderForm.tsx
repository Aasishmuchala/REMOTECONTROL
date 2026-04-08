'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { apiFetch } from '@/stores/auth'
import { cn } from '@/lib/utils'

interface SlippageEstimate {
  estimatedFillPrice: string
  totalCost: string
  priceImpact: string
}

interface OrderFormProps {
  pairId: string
  walletBalance?: string
}

type Side = 'buy' | 'sell'
type OrderType = 'market' | 'limit'

export default function OrderForm({ pairId, walletBalance }: OrderFormProps) {
  const [side, setSide] = useState<Side>('buy')
  const [orderType, setOrderType] = useState<OrderType>('limit')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [slippage, setSlippage] = useState<SlippageEstimate | null>(null)

  const estimateCost = (): string => {
    if (!quantity || !price) return '0'
    try {
      const q = parseFloat(quantity)
      const p = parseFloat(price)
      if (isNaN(q) || isNaN(p)) return '0'
      return (q * p).toFixed(2)
    } catch {
      return '0'
    }
  }

  const fetchSlippage = async (): Promise<SlippageEstimate | null> => {
    try {
      const book = await apiFetch(`/api/market?pairId=${pairId}`) as {
        asks: Array<{ price: string; quantity: string }>
        bids: Array<{ price: string; quantity: string }>
      }
      const orders = side === 'buy' ? book.asks : book.bids
      if (!orders.length) return null

      // Walk the book to estimate fill price for quantity
      let remaining = parseFloat(quantity)
      let totalCost = 0
      for (const o of orders) {
        if (remaining <= 0) break
        const fillQty = Math.min(remaining, parseFloat(o.quantity))
        totalCost += fillQty * parseFloat(o.price)
        remaining -= fillQty
      }
      const filled = parseFloat(quantity) - remaining
      if (filled <= 0) return null

      const avgPrice = (totalCost / filled).toFixed(2)
      const bestPrice = parseFloat(orders[0].price)
      const impact = Math.abs(
        ((parseFloat(avgPrice) - bestPrice) / bestPrice) * 100
      ).toFixed(2)

      return {
        estimatedFillPrice: avgPrice,
        totalCost: totalCost.toFixed(2),
        priceImpact: impact,
      }
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!quantity) { setError('Quantity is required'); return }
    if (orderType === 'limit' && !price) { setError('Price is required for limit orders'); return }

    // Show slippage modal for market orders
    if (orderType === 'market') {
      setIsLoading(true)
      const est = await fetchSlippage()
      setIsLoading(false)
      setSlippage(est)
      setShowModal(true)
      return
    }

    await submitOrder()
  }

  const submitOrder = async () => {
    setShowModal(false)
    setIsLoading(true)
    setError('')
    try {
      await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          pairId,
          side,
          type: orderType,
          quantity,
          ...(orderType === 'limit' ? { price } : {}),
        }),
      })
      setSuccess(`${side === 'buy' ? 'Buy' : 'Sell'} order placed`)
      setQuantity('')
      setPrice('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <GlassCard className="w-full">
        {/* Side toggle */}
        <div className="flex rounded-xl overflow-hidden mb-4 glass">
          {(['buy', 'sell'] as Side[]).map((s) => (
            <button
              key={s}
              onClick={() => setSide(s)}
              className={cn(
                'flex-1 py-2.5 text-sm font-semibold capitalize transition-colors duration-150',
                side === s
                  ? s === 'buy'
                    ? 'bg-[var(--color-green)] text-[#0a0a0f]'
                    : 'bg-[var(--color-red)] text-white'
                  : 'text-[var(--color-text-muted)]'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Order type toggle */}
        <div className="flex gap-2 mb-4">
          {(['limit', 'market'] as OrderType[]).map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors duration-150',
                orderType === t
                  ? 'bg-[var(--color-cyan-dim)] text-[var(--color-cyan)] border border-[var(--color-cyan)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {orderType === 'limit' && (
            <Input
              label="Price"
              suffix="USDC"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}

          <Input
            label="Quantity"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          {orderType === 'limit' && quantity && price && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Total: <span className="text-[var(--color-text-secondary)] font-mono">{estimateCost()} USDC</span>
            </p>
          )}

          {walletBalance && (
            <p className="text-xs text-[var(--color-text-muted)]">
              Available: <span className="font-mono text-[var(--color-text-secondary)]">{walletBalance} USDC</span>
            </p>
          )}

          {error && <p className="text-xs text-[var(--color-red)]">{error}</p>}
          {success && <p className="text-xs text-[var(--color-green)]">{success}</p>}

          <Button
            type="submit"
            variant={side === 'buy' ? 'primary' : 'danger'}
            isLoading={isLoading}
            className="w-full mt-1"
          >
            {orderType === 'market' ? 'Preview Order' : `Place ${side} Order`}
          </Button>
        </form>
      </GlassCard>

      {/* Slippage confirmation modal (UI-04) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard elevated className="w-80 p-6">
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
                  Confirm Market Order
                </h3>

                <div className="flex flex-col gap-2 mb-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Side</span>
                    <span className={side === 'buy' ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}>
                      {side.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Quantity</span>
                    <span className="font-mono text-[var(--color-text-primary)]">{quantity}</span>
                  </div>
                  {slippage ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Est. Fill Price</span>
                        <span className="font-mono text-[var(--color-text-primary)]">{slippage.estimatedFillPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Total Cost</span>
                        <span className="font-mono text-[var(--color-text-primary)]">~{slippage.totalCost} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--color-text-muted)]">Price Impact</span>
                        <span className={parseFloat(slippage.priceImpact) > 1 ? 'text-[var(--color-red)]' : 'text-[var(--color-green)]'}>
                          {slippage.priceImpact}%
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-[var(--color-text-muted)] text-xs">
                      No liquidity available — order may fail
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant={side === 'buy' ? 'primary' : 'danger'}
                    className="flex-1"
                    onClick={submitOrder}
                  >
                    Confirm
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
