# Phase 4: Portfolio & Analytics - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can see the full picture of their trading activity — all holdings with estimated values, unrealized and realized P&L, open orders with current status, and complete trade history. Phase 4 does NOT add new trading functionality, charts, or mobile layout — it builds the analytics view on top of existing trading data.

**Does NOT include:** Depth chart (Phase 5), mobile responsive layout (Phase 5), cinematic animations beyond price morph (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Portfolio Value & P&L Data Source
- **D-01:** Portfolio gets live crypto prices via the existing `usePriceFeed` hook (Socket.IO). Same data the trade page uses — zero extra infrastructure. Each asset card subscribes to price updates and re-computes estimated value in real-time.
- **D-02:** Cost basis is calculated as weighted average from fills: `sum(price * qty) / sum(qty)` across all user buy fills per asset. Standard exchange approach.
- **D-03:** Realized P&L = total sell proceeds minus proportional cost basis (weighted average method). When user sells, the sell revenue minus (avgCostBasis * sellQty) = realized profit/loss.
- **D-04:** New API endpoint `/api/portfolio` returns positions array: `[{asset, quantity, avgCostBasis, currentPrice, unrealizedPnl, realizedPnl}]`. Computed server-side from fills + live prices. This keeps P&L math on the server (decimal.js precision) and avoids leaking raw fill data to the client.

### Open Orders Display (PORT-04)
- **D-05:** Open orders organized by status tabs: Pending / Partial / Filled / Cancelled. All pairs merged into each tab. This is the cross-pair portfolio view (trade page already has per-pair OpenOrders).
- **D-06:** New API route `/api/orders/all` returns all user orders (not just open) with status filter query param. Current `/api/orders` stays pair-scoped for the trade page.
- **D-07:** Filled and cancelled orders limited to last 7 days to prevent unbounded growth. Pending and partial orders always shown regardless of age.

### Portfolio Page Layout
- **D-08:** Single scroll layout — Holdings asset cards at top, P&L summary row, then Open Orders tabs below. No context switching.
- **D-09:** One GlassCard per crypto asset (BTC, ETH, SOL) showing: quantity held, average cost basis, current estimated value, unrealized P&L with color (green/red). Plus a USDC balance card.
- **D-10:** P&L values animate when prices change using Framer Motion number morph — consistent with PriceTicker from Phase 2.
- **D-11:** Realized P&L shown both per-asset (on each card) and as aggregate total in a summary row at top of the holdings section.

### Claude's Discretion
- Loading skeleton design for portfolio cards
- Exact card layout and spacing
- Empty state when user has no positions
- Error handling for price feed disconnections
- Whether to show percentage P&L alongside absolute values

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 4 requirements
- `.planning/REQUIREMENTS.md` — PORT-01 through PORT-04 acceptance criteria
- `.planning/ROADMAP.md` Phase 4 section — Success criteria 1-5

### Existing components to enhance
- `coinxi/src/components/PortfolioSummary.tsx` — Currently USDC-only wallet view (total/available/locked). Phase 4 replaces this with per-asset holdings + P&L.
- `coinxi/src/components/OpenOrders.tsx` — Per-pair, open+partial only. Phase 4 adds a new cross-pair, all-status version for the portfolio page.
- `coinxi/src/components/TradeHistory.tsx` — Already complete with pagination. No changes needed.

### Data layer
- `coinxi/src/lib/wallet.ts` — `getTradeHistory()` already derives user's side from fills. Phase 4 needs similar logic for position computation.
- `coinxi/src/lib/matching-engine.ts` — `getRecentTrades()` for reference on how trades are queried.
- `coinxi/src/db/schema.ts` — `orders`, `trades`, `wallets` tables. No schema changes needed — positions are derived from existing fill data.

### Live data hooks
- `coinxi/src/hooks/usePriceFeed.ts` — Returns `{ price, direction }` per pair. Portfolio page uses this for real-time value updates.
- `coinxi/src/types/socket.ts` — Type contracts for Socket.IO events.

### Pages
- `coinxi/src/app/(main)/portfolio/page.tsx` — Current portfolio page, renders PortfolioSummary + OpenOrders per pair. Phase 4 rewrites this.
- `coinxi/src/app/(main)/history/page.tsx` — Trade history page. Already complete, no changes.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePriceFeed(pairId)` — Already returns live price + direction. Portfolio page will call this 3x (BTC, ETH, SOL).
- `GlassCard` — Used everywhere, supports `elevated` prop for visual hierarchy.
- `Button` — Has `variant="ghost"` for tab-like buttons.
- `apiFetch` — Authenticated fetch helper, used by all API calls.
- `getTradeHistory()` in wallet.ts — Pattern for deriving user's trade side from orders+trades join. Portfolio position computation follows same pattern.
- Framer Motion `motion.span` with `layout` — Used in PriceTicker for number morphing. Reuse for P&L animations.

### Established Patterns
- Props-down: Page owns hooks, passes data to child components (Phase 2/3 pattern)
- `apiFetch` for all REST calls, JWT auth via headers
- decimal.js for all monetary math server-side
- GlassCard + CSS variables for theming
- `useCallback` + `useEffect` for data fetching with refresh dependencies

### Integration Points
- `coinxi/src/app/(main)/portfolio/page.tsx` — Rewrite to use new PortfolioHoldings + PortfolioOrders components
- `coinxi/src/app/api/portfolio/route.ts` — New endpoint, computes positions from fills
- `coinxi/src/app/api/orders/all/route.ts` — New endpoint, returns all user orders with status filter
- `coinxi/src/lib/portfolio.ts` — New pure function: compute positions from fills (testable without API)

</code_context>

<specifics>
## Specific Ideas

- Position computation should be a pure function in `lib/portfolio.ts` so it can be unit tested with decimal.js precision assertions
- The portfolio API should accept an optional `prices` param or compute from `tradingPairs.lastPrice` — the client then overlays live Socket.IO prices for real-time updates
- Asset cards should show the pair name (e.g., "BTC-USDC") not just the asset symbol, to stay consistent with the trading UI

</specifics>

<deferred>
## Deferred Ideas

- Depth chart visualization — Phase 5
- Mobile responsive layout for portfolio — Phase 5
- Cinematic card entrance animations — Phase 5
- Historical P&L chart (line graph over time) — v2
- Export trade history to CSV — v2

</deferred>

---

*Phase: 04-portfolio-analytics*
*Context gathered: 2026-04-09*
