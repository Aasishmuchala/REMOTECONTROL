---
phase: "01-core-engine"
plan: "04"
subsystem: "portfolio-components"
tags: ["components", "wallet", "trade-history", "open-orders", "pagination", "cancel"]
dependency_graph:
  requires: ["01-01"]
  provides: ["PortfolioSummary", "TradeHistory", "OpenOrders"]
  affects: ["01-05"]
tech_stack:
  added: []
  patterns: ["useCallback for stable fetch ref", "cancellingId per-row loading state", "animate-pulse skeleton loading"]
key_files:
  created:
    - "coinxi/src/components/PortfolioSummary.tsx"
    - "coinxi/src/components/TradeHistory.tsx"
    - "coinxi/src/components/OpenOrders.tsx"
  modified: []
decisions:
  - "Used GlassCard and Button imports per plan spec (will resolve at assembly time in 01-05)"
  - "PortfolioSummary uses raw grid layout rather than GlassCard wrapping the grid (GlassCard used per-balance-card)"
  - "TradeHistory pagination renders only when totalPages > 1 to avoid empty pagination bar"
  - "OpenOrders Cancel button uses Button variant=danger with isLoading prop for per-row spinner"
metrics:
  duration: "~2 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 01 Plan 04: Portfolio UI Components Summary

**One-liner:** Three portfolio-facing components — wallet balance cards, paginated trade fills table, open orders list with per-row cancel — wired to API routes from Plan 01-01 via apiFetch.

## Components Created

### PortfolioSummary
- **Export:** `export default function PortfolioSummary()`
- **Props:** none (self-contained, fetches own data)
- **File:** `coinxi/src/components/PortfolioSummary.tsx`
- **API:** `GET /api/wallet`
- **Displays:** Total Balance (text-primary), Available (green), Locked (secondary) in a responsive 3-column grid

### TradeHistory
- **Export:** `export default function TradeHistory()`
- **Props:** none (self-contained, fetches own data)
- **File:** `coinxi/src/components/TradeHistory.tsx`
- **API:** `GET /api/history?page=N&limit=50`
- **Displays:** Table with Pair, Side, Price, Qty, Time columns; pagination prev/next controls

### OpenOrders
- **Export:** `export default function OpenOrders({ pairId }: OpenOrdersProps)`
- **Props:** `pairId: string` — trading pair to show orders for (e.g. "BTC_USDC")
- **File:** `coinxi/src/components/OpenOrders.tsx`
- **API:** `GET /api/orders?pairId=X` (load), `DELETE /api/orders/[id]` (cancel)
- **Displays:** Order rows with side badge, quantity @ price, status line, Cancel button

## Props Interfaces (for Plan 01-05 page assembly)

```typescript
// PortfolioSummary — no props
<PortfolioSummary />

// TradeHistory — no props
<TradeHistory />

// OpenOrders — requires pairId
<OpenOrders pairId="BTC_USDC" />
```

## Loading States

| Component | Skeleton |
|-----------|----------|
| PortfolioSummary | 3 GlassCard placeholders with `animate-pulse` |
| TradeHistory | 5 table rows × 5 cells, each `h-4 glass rounded animate-pulse` |
| OpenOrders | 3 `h-10 glass rounded-xl animate-pulse` rows |

## Empty States

| Component | Empty State |
|-----------|-------------|
| PortfolioSummary | Shows wallet with zero balances (wallet always exists after login) |
| TradeHistory | "No trades yet" centered in table body spanning 5 columns |
| OpenOrders | "No open orders" centered paragraph |

## Error States

All three components display error text in `text-[var(--color-red)]` if apiFetch throws.

## apiFetch Typing

`apiFetch` returns `Promise<unknown>`. All three components cast with `as Wallet`, `as TradeHistoryResponse`, and `as Order[]` respectively. This is correct given the API contracts from 01-01 and avoids adding a generic to apiFetch (which would require changing a sibling file).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | e24a90b | feat(01-core-engine-04): add PortfolioSummary component |
| Task 2 | af63d39 | feat(01-core-engine-04): add TradeHistory and OpenOrders components |

## Deviations from Plan

None — plan executed exactly as written. Both the plan's `<task>` sections (using GlassCard/Button imports) and the top-level task descriptions were consistent. Followed the plan's `<task>` implementations which use GlassCard and Button as specified in the interfaces block.

## Known Stubs

None. Components fetch real data from API routes. No hardcoded values flow to UI rendering.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced. All API calls go through existing `apiFetch` which adds Bearer token. Server-side ownership checks (T-04-01, T-04-02) are enforced by the API routes in Plan 01-01.

## Self-Check: PASSED
