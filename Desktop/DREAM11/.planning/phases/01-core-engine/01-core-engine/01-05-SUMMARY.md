---
phase: "01-core-engine"
plan: "05"
subsystem: "exchange-pages"
tags: ["pages", "routing", "trade", "portfolio", "history", "redirect"]
dependency_graph:
  requires: ["01-02", "01-03", "01-04"]
  provides: ["navigable-exchange-ui", "trade-page", "portfolio-page", "history-page"]
  affects: ["app-routing", "root-redirect"]
tech_stack:
  added: []
  patterns: ["server-component-default", "use-client-for-interactivity", "shared-state-via-props"]
key_files:
  created:
    - "src/app/(main)/trade/page.tsx"
    - "src/app/(main)/portfolio/page.tsx"
    - "src/app/(main)/history/page.tsx"
  modified:
    - "src/app/page.tsx"
decisions:
  - "portfolio/page.tsx kept as Server Component (no 'use client') — OpenOrders is 'use client' internally so it composes correctly within a server component"
  - "Trade page fetches order book via apiFetch on pair change; lastPrice derived from best ask in API response"
metrics:
  duration: "76 seconds"
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
  files_deleted: 2
---

# Phase 01 Plan 05: Exchange Pages Assembly Summary

**One-liner:** Three navigable exchange pages (/trade, /portfolio, /history) assembled from Wave 2 components with selectedPairId state wiring; root redirected to /trade; cricket route directories deleted.

## Pages Created

| Route | File | Components Used |
|-------|------|-----------------|
| `/trade` | `src/app/(main)/trade/page.tsx` | TradingPairSelector, OrderForm, PriceTicker, OpenOrders, GlassCard |
| `/portfolio` | `src/app/(main)/portfolio/page.tsx` | PortfolioSummary, OpenOrders (x3 pairs) |
| `/history` | `src/app/(main)/history/page.tsx` | TradeHistory |

## Route Changes

- `src/app/page.tsx` updated: `redirect('/contests')` → `redirect('/trade')`
- `src/app/(main)/contests/` — deleted
- `src/app/(main)/leaderboards/` — deleted

## Cricket API Routes (Untouched)

The following API routes were explicitly preserved as required by the auth system:
- `src/app/api/auth/`
- `src/app/api/coins/`
- `src/app/api/matches/`

## Server Component vs Client Component

- `trade/page.tsx` — `'use client'` (uses `useState`, `useEffect`)
- `portfolio/page.tsx` — Server Component (no directive needed; `OpenOrders` is `'use client'` internally and composes correctly)
- `history/page.tsx` — Server Component (no directive needed; `TradeHistory` is `'use client'` internally)

No TypeScript complaints about the `PAIRS` const array in portfolio's server component context — Next.js 16 handles this correctly.

## selectedPairId State Wiring

The trade page maintains `selectedPairId` state and threads it to:
- `TradingPairSelector` via `selectedPairId` + `onSelect` props (selector drives changes)
- `OrderForm` via `pairId` prop (form receives selected pair)
- `OpenOrders` via `pairId` prop (shows orders for current pair)
- `apiFetch('/api/market?pairId=...')` — order book snapshot fetched on pair change

## Commits

- `3a479a6` — feat(01-05): redirect root to /trade, delete cricket routes
- `48c1aea` — feat(01-05): add /trade, /portfolio, /history exchange pages

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/(main)/trade/page.tsx` — FOUND
- `src/app/(main)/portfolio/page.tsx` — FOUND
- `src/app/(main)/history/page.tsx` — FOUND
- `src/app/page.tsx` — FOUND (redirects to /trade)
- `src/app/(main)/contests/` — CONFIRMED deleted
- `src/app/(main)/leaderboards/` — CONFIRMED deleted
- Commits `3a479a6`, `48c1aea` — FOUND in git log
- All 67 tests pass
