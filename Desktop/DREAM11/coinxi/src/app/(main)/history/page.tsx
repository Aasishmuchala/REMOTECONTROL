import TradeHistory from '@/components/TradeHistory'

export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Trade History
      </h1>
      <TradeHistory />
    </div>
  )
}
