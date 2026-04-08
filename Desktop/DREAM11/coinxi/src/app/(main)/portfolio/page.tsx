import PortfolioSummary from '@/components/PortfolioSummary'
import OpenOrders from '@/components/OpenOrders'

// Show open orders for all three pairs
const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC']

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Portfolio
        </h1>
        <PortfolioSummary />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Open Orders
        </h2>
        {PAIRS.map((pairId) => (
          <OpenOrders key={pairId} pairId={pairId} />
        ))}
      </div>
    </div>
  )
}
