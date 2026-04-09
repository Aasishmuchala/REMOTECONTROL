import PortfolioHoldings from '@/components/PortfolioHoldings'
import PortfolioOrders from '@/components/PortfolioOrders'

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Portfolio
        </h1>
        <PortfolioHoldings />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-4">
          Orders
        </h2>
        <PortfolioOrders />
      </div>
    </div>
  )
}
