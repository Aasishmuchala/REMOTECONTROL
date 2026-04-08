---
phase: "01-core-engine"
plan: "03"
subsystem: "trading-ui-components"
tags: ["framer-motion", "order-form", "price-ticker", "trading-pair-selector", "slippage-modal"]
dependency_graph:
  requires: ["01-01"]
  provides: ["OrderForm", "PriceTicker", "TradingPairSelector"]
  affects: ["01-05"]
tech_stack:
  added: ["framer-motion@^12.38.0"]
  patterns: ["AnimatePresence mode=wait", "motion.button with whileHover/whileTap", "slippage order-book walk"]
key_files:
  created:
    - "src/components/TradingPairSelector.tsx"
    - "src/components/PriceTicker.tsx"
    - "src/components/OrderForm.tsx"
  modified: []
decisions:
  - "Used plan's canonical version (GlassCard/Button/Input imports) since sibling components exist in repo"
  - "Confirm button in slippage modal is always enabled per prompt spec — server handles no-liquidity error"
  - "framer-motion installed as ^12.38.0 (latest) — no breaking changes found in usage"
metrics:
  duration: "~12 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_created: 3
---

# Phase 01 Plan 03: Trading UI Components Summary

**One-liner:** Three self-contained trading components — TradingPairSelector (Framer Motion pair switcher), PriceTicker (AnimatePresence number morphing with green/red direction), and OrderForm (buy/sell/market/limit with order-book slippage modal before market order submission).

## Components Created

### TradingPairSelector (`src/components/TradingPairSelector.tsx`)

```typescript
interface TradingPairSelectorProps {
  selectedPairId: string        // e.g. 'BTC-USDC'
  onSelect: (pairId: string) => void
}
export default function TradingPairSelector(props: TradingPairSelectorProps)
```

- Renders 3 pair buttons: BTC/USDC, ETH/USDC, SOL/USDC
- Active pair: cyan border + `glow-cyan-sm` CSS class
- On mount, fetches midpoint price (best bid + best ask / 2) from `GET /api/market?pairId=*` for each pair
- Errors silently if no orders exist yet (book is empty)
- 78 lines

### PriceTicker (`src/components/PriceTicker.tsx`)

```typescript
interface PriceTickerProps {
  price: string         // stringified decimal e.g. "45123.50"
  pairId?: string       // optional, not used internally
  className?: string
}
export default function PriceTicker(props: PriceTickerProps)
```

- `AnimatePresence mode="wait"` wraps a `motion.span` keyed on `displayKey`
- Price rise: text goes green, exits upward, enters from below
- Price fall: text goes red, exits downward, enters from above
- Neutral (unchanged or initial): no animation, default text color
- Spring: stiffness 400, damping 30
- 50 lines

### OrderForm (`src/components/OrderForm.tsx`)

```typescript
interface OrderFormProps {
  pairId: string           // e.g. 'BTC-USDC', passed to POST /api/orders
  walletBalance?: string   // displayed as "Available: X USDC" if provided
}
export default function OrderForm(props: OrderFormProps)
```

- Buy/sell tab toggle (green active for buy, red for sell)
- Market/limit type toggle (cyan border for active)
- Inputs: Price (limit only, USDC suffix), Quantity — both via `<Input>` component
- Live cost estimate shown when both price and quantity are filled (limit mode)
- Error and success messages displayed inline
- Submit button uses `<Button variant="primary|danger">` with `isLoading` spinner
- 298 lines

## Slippage Modal Interaction Flow (UI-04)

1. User selects "Market" order type
2. User fills Quantity and clicks "Preview Order"
3. `handleSubmit` calls `fetchSlippage()` — walks the order book side matching `side`:
   - Buy order: walks `asks` (ascending price)
   - Sell order: walks `bids` (descending price)
4. Calculates: `avgPrice = totalCost / filledQty`, `priceImpact = |avgPrice - bestPrice| / bestPrice * 100`
5. Modal opens (`AnimatePresence` scale + opacity spring animation)
6. Modal displays: Side, Quantity, Est. Fill Price, Total Cost, Price Impact
   - If no liquidity: shows "No liquidity available — order may fail" warning
   - Price Impact > 1%: shown in red; <= 1%: green
7. Cancel: closes modal, no order submitted
8. Confirm: calls `submitOrder()` directly, which POSTs to `/api/orders`
   - Confirm is always enabled — server returns proper error if no liquidity
9. On success: success message, form fields cleared

## Framer Motion Notes

- `framer-motion` was not in `package.json` — installed as `^12.38.0` (latest at execution time)
- `Button.tsx` (sibling component) already imports `motion` from framer-motion — no conflicts
- `AnimatePresence mode="wait"` is used in PriceTicker to ensure exit animation completes before new value enters
- All interactive elements use `whileHover={{ scale: 1.02 }}` / `whileTap={{ scale: 0.97 }}` spring pattern

## Deviations from Plan

### Auto-fixed Issues

None — plan executed as written with one intentional difference:

**Confirm button not disabled when `slippage === null`**
- Plan file had `disabled={!slippage}` on the Confirm button
- Prompt specification explicitly states: "The Confirm button in the modal is enabled even when slippage is null (no liquidity) — the server will return a proper error"
- Implemented per prompt spec: Confirm is always enabled; server-side error propagated to `error` state

**Sibling components resolved**
- Plan prompt suggested falling back to plain string concatenation if GlassCard/Button/Input missing
- On inspection, all three sibling components (`GlassCard.tsx`, `Button.tsx`, `Input.tsx`) exist in the repo
- Used canonical plan version with component imports (no fallback needed)

## Threat Model — STRIDE Mitigations Applied

| Threat ID | Mitigation in Code |
|-----------|-------------------|
| T-03-01 | Inputs are strings sent to server; server validates via `placeLimitOrder`/`placeMarketOrder` |
| T-03-02 | Slippage estimate is display-only, computed from public order book, not stored |
| T-03-03 | All API calls use `apiFetch` which reads Bearer token from `sessionStorage` |

## Self-Check: PASSED

Files verified:
- /Users/aasish/Desktop/DREAM11/coinxi/src/components/TradingPairSelector.tsx — EXISTS (78 lines)
- /Users/aasish/Desktop/DREAM11/coinxi/src/components/PriceTicker.tsx — EXISTS (50 lines)
- /Users/aasish/Desktop/DREAM11/coinxi/src/components/OrderForm.tsx — EXISTS (298 lines)

Commits verified:
- d7dc764 — feat(01-03): add TradingPairSelector component with pair price display
- ab94345 — feat(01-03): add PriceTicker and OrderForm components
