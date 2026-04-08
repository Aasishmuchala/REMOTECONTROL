---
phase: "01-core-engine"
plan: "01"
subsystem: "exchange-api"
tags: ["api", "wallet", "orders", "matching-engine", "proxy", "drizzle", "sqlite"]
dependency_graph:
  requires: ["src/lib/auth.ts", "src/lib/wallet.ts", "src/lib/matching-engine.ts", "src/db/schema.ts"]
  provides: ["src/proxy.ts", "src/app/api/wallet/*", "src/app/api/orders/*", "src/app/api/history/*", "src/app/api/market/*"]
  affects: ["Wave 2 UI components that call API routes"]
tech_stack:
  added: []
  patterns: ["Next.js 16 proxy.ts convention", "Drizzle ORM query builder", "Bearer JWT auth", "decimal.js for all financial math"]
key_files:
  created:
    - "src/proxy.ts"
    - "src/app/api/wallet/route.ts"
    - "src/app/api/wallet/deposit/route.ts"
    - "src/app/api/orders/route.ts"
    - "src/app/api/orders/[id]/route.ts"
    - "src/app/api/history/route.ts"
    - "src/app/api/market/route.ts"
  modified:
    - "src/lib/wallet.ts"
    - "src/db/index.ts"
    - "scripts/seed.ts"
decisions:
  - "Used src/proxy.ts (not middleware.ts): Next.js 16 deprecated middleware.ts at v16.0.0 and renamed the convention to proxy.ts with export function proxy()"
  - "params typed as Promise<{id:string}> in DELETE /api/orders/[id]: Next.js 16 route-handlers doc confirms async params pattern"
  - "isAdmin verified from DB (not JWT) in deposit endpoint: mitigates T-01-02 privilege escalation"
  - "getTradeHistory derives side from buyOrderId/sellOrderId set membership — no DB column needed, no parseFloat"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_created: 7
  files_modified: 3
---

# Phase 01 Plan 01: Core Engine API Wire-Up Summary

**One-liner:** Wired 67-test-verified financial library into Next.js 16 backend — proxy route protection + 7 REST API endpoints covering wallet, orders, history, and market data.

## Files Created / Modified

| File | Status | Lines | Purpose |
|------|--------|-------|---------|
| `src/proxy.ts` | Created | 40 | Next.js 16 route protection: guards /trade, /portfolio, /history pages and /api/* routes |
| `src/app/api/wallet/route.ts` | Created | 14 | GET /api/wallet — returns authenticated user's wallet |
| `src/app/api/wallet/deposit/route.ts` | Created | 36 | POST /api/wallet/deposit — admin-only credit (403 for non-admin) |
| `src/app/api/orders/route.ts` | Created | 53 | POST /api/orders (place), GET /api/orders?pairId (user's open orders) |
| `src/app/api/orders/[id]/route.ts` | Created | 21 | DELETE /api/orders/[id] — cancel order |
| `src/app/api/history/route.ts` | Created | 16 | GET /api/history?page&limit — paginated trade history |
| `src/app/api/market/route.ts` | Created | 15 | GET /api/market?pairId — full order book {bids, asks} |
| `src/lib/wallet.ts` | Modified | 271 | Appended TradeRecord type and getTradeHistory function; added orders/trades to schema import |
| `src/db/index.ts` | Modified | 152 | Appended exchange table DDL (wallets, wallet_transactions, trading_pairs, orders, trades) |
| `scripts/seed.ts` | Modified | 157 | Appended BTC-USDC, ETH-USDC, SOL-USDC seed with INSERT OR IGNORE (idempotent) |

## proxy.ts Convention

**Used: `src/proxy.ts` with `export function proxy()`**

Confirmed by reading `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`:
- `middleware.ts` is deprecated as of Next.js v16.0.0
- The file convention was renamed to `proxy.ts`
- The exported function must be named `proxy` (not `middleware`)
- A codemod `npx @next/codemod@canary middleware-to-proxy .` exists for migration

No `src/middleware.ts` was created.

## Test Results

```
Test Files  4 passed (4)
     Tests  67 passed (67)
  Duration  1.34s
```

All 67 pre-existing tests pass with zero regressions.

## TypeScript Issues Encountered

None. The route-handler docs confirmed `params: Promise<{ id: string }>` for dynamic routes in Next.js 16, which was used in `DELETE /api/orders/[id]/route.ts`. The `any`-typed `Db` alias in `wallet.ts` (pre-existing pattern) allowed `getTradeHistory` to use Drizzle's query builder without additional type gymnastics.

## Key Patterns for Wave 2 (Client Components)

All API routes require a `Authorization: Bearer <token>` header. The token is stored in `sessionStorage` under key `coinxi_token` (per `src/stores/auth.ts`).

```typescript
// Example: fetch wallet from a client component
const token = sessionStorage.getItem('coinxi_token')
const res = await fetch('/api/wallet', {
  headers: { Authorization: `Bearer ${token}` }
})
const wallet = await res.json()
// wallet.totalBalance, wallet.availableBalance, wallet.lockedBalance — all strings

// Example: place a limit order
await fetch('/api/orders', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ pairId: 'BTC-USDC', side: 'buy', type: 'limit', price: '65000', quantity: '0.1' })
})

// Example: get trade history with pagination
await fetch('/api/history?page=1&limit=20', {
  headers: { Authorization: `Bearer ${token}` }
})
// returns { trades: TradeRecord[], total: number, page: number, totalPages: number }
```

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/proxy.ts` — FOUND
- `src/app/api/wallet/route.ts` — FOUND
- `src/app/api/wallet/deposit/route.ts` — FOUND
- `src/app/api/orders/route.ts` — FOUND
- `src/app/api/orders/[id]/route.ts` — FOUND
- `src/app/api/history/route.ts` — FOUND
- `src/app/api/market/route.ts` — FOUND
- Commit `a189eec` (Task 1) — FOUND
- Commit `4810ad2` (Task 2) — FOUND
- 67 tests passing — CONFIRMED
