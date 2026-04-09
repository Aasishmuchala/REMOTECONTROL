# Phase 4: Portfolio & Analytics - Research

**Researched:** 2026-04-09
**Domain:** Portfolio analytics, P&L computation, cross-pair order management, Framer Motion animation
**Confidence:** HIGH

## Summary

Phase 4 builds an analytics view on top of existing trading data with no schema changes. The key architectural challenge is that the `wallets` table tracks a single unified USDC-equivalent balance per user — there are no separate per-asset wallet rows. Crypto holdings (BTC, ETH, SOL quantity held) must be derived from fill history: sum all buy fills minus sum all sell fills per pair. This matches the `getTradeHistory()` pattern in `wallet.ts` and is the authoritative derivation approach.

The P&L computation logic (`lib/portfolio.ts`) must be a pure function testable without a live DB — it receives a list of `TradeRecord[]` (same shape as `getTradeHistory()` output) and a current-price map, then returns the positions array. The `/api/portfolio` route calls `getTradeHistory()` internally and passes results to this pure function before returning to the client. The client then overlays real-time Socket.IO prices via three `usePriceFeed(pairId)` calls to keep unrealized P&L live without polling the API.

The portfolio page is a full rewrite of the current USDC-only view. The single-scroll layout (D-08) places holdings cards at top, a realized P&L summary row, then status-tabbed orders below. The existing `TradeHistory` component is complete and unchanged. The existing `OpenOrders` component stays for the trade page; a new `PortfolioOrders` component handles the cross-pair, all-status tabbed view.

**Primary recommendation:** Build `lib/portfolio.ts` as the pure computation core first, unit-test it with decimal.js edge cases, then wire the API route and UI components on top.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Portfolio gets live crypto prices via the existing `usePriceFeed` hook (Socket.IO). Each asset card subscribes to price updates and re-computes estimated value in real-time.
- **D-02:** Cost basis is calculated as weighted average from fills: `sum(price * qty) / sum(qty)` across all user buy fills per asset.
- **D-03:** Realized P&L = total sell proceeds minus proportional cost basis (weighted average method). When user sells, sell revenue minus (avgCostBasis * sellQty) = realized profit/loss.
- **D-04:** New API endpoint `/api/portfolio` returns positions array: `[{asset, quantity, avgCostBasis, currentPrice, unrealizedPnl, realizedPnl}]`. Computed server-side from fills + live prices. decimal.js precision, no raw fill data to client.
- **D-05:** Open orders organized by status tabs: Pending / Partial / Filled / Cancelled. All pairs merged into each tab.
- **D-06:** New API route `/api/orders/all` returns all user orders (not just open) with status filter query param. Current `/api/orders` stays pair-scoped for the trade page.
- **D-07:** Filled and cancelled orders limited to last 7 days. Pending and partial orders always shown regardless of age.
- **D-08:** Single scroll layout — Holdings asset cards at top, P&L summary row, then Open Orders tabs below.
- **D-09:** One GlassCard per crypto asset (BTC, ETH, SOL) showing: quantity held, average cost basis, current estimated value, unrealized P&L with color. Plus a USDC balance card.
- **D-10:** P&L values animate when prices change using Framer Motion number morph — consistent with PriceTicker from Phase 2.
- **D-11:** Realized P&L shown both per-asset (on each card) and as aggregate total in a summary row at top.

### Claude's Discretion
- Loading skeleton design for portfolio cards
- Exact card layout and spacing
- Empty state when user has no positions
- Error handling for price feed disconnections
- Whether to show percentage P&L alongside absolute values

### Deferred Ideas (OUT OF SCOPE)
- Depth chart visualization — Phase 5
- Mobile responsive layout for portfolio — Phase 5
- Cinematic card entrance animations — Phase 5
- Historical P&L chart (line graph over time) — v2
- Export trade history to CSV — v2
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PORT-01 | User can view portfolio dashboard with all holdings | New `/api/portfolio` endpoint + PortfolioHoldings component with per-asset GlassCards |
| PORT-02 | Portfolio shows per-asset balance and estimated value in credits | Position derivation from fills (D-02) + usePriceFeed live overlay (D-01) |
| PORT-03 | Portfolio shows unrealized P&L per asset (vs starting balance) | Weighted avg cost basis formula (D-02, D-03) + decimal.js math in lib/portfolio.ts (D-04) |
| PORT-04 | User can view open orders with status (pending/partial/filled/cancelled) | New `/api/orders/all?status=X` endpoint (D-06) + PortfolioOrders tabbed component (D-05) |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

The coinxi directory contains a mandatory `AGENTS.md` (referenced by `CLAUDE.md` via `@AGENTS.md`):

> "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices."

**Verified constraints from `node_modules/next/dist/docs/`** [VERIFIED: local docs]:

| Constraint | Rule |
|------------|------|
| Route handler params | `params` is a `Promise<{...}>` — must `await params` before reading |
| Route handler signature | `GET(request: NextRequest, { params }: { params: Promise<{ id: string }> })` |
| No middleware.ts | Deprecated at Next.js 16 — project uses `proxy.ts` with `export function proxy()` |
| `params` async pattern | Confirmed in `src/app/api/orders/[id]/route.ts` as the established pattern |

**Project-specific conventions** [VERIFIED: codebase]:

| Convention | Pattern |
|------------|---------|
| Auth | `getAuthUser(req)` from `@/lib/auth` — returns `JWTPayload | null` |
| Response helpers | `jsonResponse(data)` and `errorResponse(message, status)` from `@/lib/auth` |
| DB instance | `import { db } from '@/db'` — singleton better-sqlite3 WAL-mode |
| Decimal math | `decimal.js` for ALL monetary math — never native JS arithmetic |
| Fetch helper | `apiFetch(path, options?)` from `@/stores/auth` — JWT auth via Bearer header |
| Props pattern | Page owns hooks, passes data to child components (Phase 2/3 pattern) |
| Client components | `'use client'` directive for any component with hooks or browser APIs |
| Styling | CSS variables (`var(--color-green)`, `var(--color-red)`, etc.), `cn()` util, `glass` / `glass-elevated` classes |

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| decimal.js | ^10.6.0 | All monetary arithmetic | Project standard — no floating-point rounding |
| framer-motion | ^12.38.0 | P&L number animation (D-10) | Already used in PriceTicker; reuse `AnimatePresence + motion.span` pattern |
| socket.io-client | ^4.8.3 | Live price feed (D-01) | `usePriceFeed(pairId)` already returns `{price, direction}` |
| drizzle-orm | ^0.45.2 | DB queries for orders/trades | Project standard ORM |
| better-sqlite3 | ^12.8.0 | SQLite DB access | Project standard DB |

[VERIFIED: coinxi/package.json]

### No New Dependencies Required
Phase 4 uses only existing installed packages. No `npm install` step needed.

[VERIFIED: codebase inspection — all required capabilities present in installed packages]

---

## Architecture Patterns

### Recommended Project Structure (new files only)

```
coinxi/src/
├── lib/
│   └── portfolio.ts              # NEW: pure position computation, testable without DB
├── app/
│   └── api/
│       ├── portfolio/
│       │   └── route.ts          # NEW: GET /api/portfolio
│       └── orders/
│           └── all/
│               └── route.ts      # NEW: GET /api/orders/all?status=...
└── components/
    ├── PortfolioHoldings.tsx     # NEW: replaces PortfolioSummary (crypto cards + USDC card)
    ├── PortfolioOrders.tsx       # NEW: tabbed cross-pair orders
    └── (TradeHistory.tsx)        # UNCHANGED — already complete
```

**Modified files:**
- `src/app/(main)/portfolio/page.tsx` — Rewrite to use new components

**Unchanged files:**
- `src/components/TradeHistory.tsx` — No changes needed
- `src/components/OpenOrders.tsx` — Stays for the trade page only
- `src/components/PortfolioSummary.tsx` — Replaced by PortfolioHoldings (or removed)
- All DB schema files — No schema changes in Phase 4

[VERIFIED: codebase inspection]

### Pattern 1: Position Computation (Pure Function)

**What:** `lib/portfolio.ts` computes per-asset positions from raw fill data using decimal.js. Takes `TradeRecord[]` (from `getTradeHistory()`) and a price map; returns typed `Position[]`.

**When to use:** Called by `/api/portfolio` route. Also directly unit-testable.

```typescript
// Source: derived from wallet.ts getTradeHistory() pattern + D-02/D-03 decisions
import Decimal from 'decimal.js'
import type { TradeRecord } from '@/lib/wallet'

export type Position = {
  asset: string           // e.g. 'BTC'
  pairId: string          // e.g. 'BTC-USDC'
  quantity: string        // net holdings after buys - sells
  avgCostBasis: string    // weighted average buy price
  currentPrice: string    // from DB lastPrice or passed in
  estimatedValue: string  // quantity * currentPrice
  unrealizedPnl: string   // estimatedValue - (quantity * avgCostBasis)
  realizedPnl: string     // sum of: sellProceeds - (avgCostBasis * sellQty) at time of each sell
}

export function computePositions(
  trades: TradeRecord[],
  prices: Record<string, string>,  // { 'BTC-USDC': '50000.00', ... }
): Position[] {
  // Group trades by pairId
  // For each pair:
  //   Track running avgCostBasis using buy fills (FIFO weighted average)
  //   Track realizedPnl from sell fills: (sellPrice - avgCostBasis) * sellQty
  //   Track net quantity: buys add qty, sells subtract qty
  // Return positions array (omit pairs with zero quantity AND zero realizedPnl)
}
```

**Weighted average cost basis update on each buy:**
```
newAvgCost = (prevQty * prevAvgCost + fillQty * fillPrice) / (prevQty + fillQty)
```

**Realized P&L on each sell:**
```
realizedPnl += (sellPrice - avgCostBasis) * sellQty
```

After sell: reduce `quantity` by `sellQty`, `avgCostBasis` stays the same (weighted avg method).

[VERIFIED: D-02, D-03 decisions + standard exchange P&L math]

### Pattern 2: Live Price Overlay (Client-Side)

**What:** Portfolio page calls `usePriceFeed(pairId)` three times (once per crypto pair). API returns snapshot price as `currentPrice`; client re-computes unrealized P&L locally as prices arrive.

**Why this split:** Server-side P&L uses decimal.js precision. Client re-computation uses the same formula but driven by Socket.IO price events — avoids polling `/api/portfolio` every second.

```typescript
// Source: usePriceFeed.ts + D-01/D-04 decisions
// In PortfolioHoldings.tsx (client component):
const btcFeed = usePriceFeed('BTC-USDC')
const ethFeed = usePriceFeed('ETH-USDC')
const solFeed = usePriceFeed('SOL-USDC')

// Compute live unrealized P&L when price updates:
// unrealizedPnl = (currentPrice - avgCostBasis) * quantity
```

**Note:** Client-side re-computation for unrealized P&L only. Realized P&L comes from server and does not change with price.

[VERIFIED: usePriceFeed.ts returns `{price, direction}` — confirmed pattern]

### Pattern 3: Framer Motion Number Morph (P&L Animation, D-10)

**What:** Reuse the exact `PriceTicker.tsx` pattern — `AnimatePresence + motion.span` with spring animation — for P&L values that change as prices move.

```typescript
// Source: src/components/PriceTicker.tsx (existing, Phase 2)
// Reuse this exact pattern for P&L display:
<AnimatePresence mode="wait">
  <motion.span
    key={displayKey}                          // increment on value change
    initial={{ y: isUp ? 12 : -12, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: isUp ? -12 : 12, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    className={cn('block font-mono font-bold tabular-nums', colorClass)}
  >
    {pnlValue}
  </motion.span>
</AnimatePresence>
```

[VERIFIED: src/components/PriceTicker.tsx — confirmed animation pattern]

### Pattern 4: Status-Tab Navigation (D-05)

**What:** Button-based tab UI using existing `Button` component with `variant="ghost"` for inactive tabs and `variant="primary"` (or active indicator) for selected tab. No new tab library needed.

```typescript
// Source: src/components/Button.tsx exists with ghost variant
const TABS = ['open', 'partial', 'filled', 'cancelled'] as const
const [activeTab, setActiveTab] = useState<typeof TABS[number]>('open')

// Filter: open/partial always shown, filled/cancelled filtered to last 7 days server-side
```

[VERIFIED: OpenOrders.tsx uses Button with ghost variant — confirmed pattern available]

### Pattern 5: New API Route Structure

**`GET /api/portfolio`** — New endpoint, no dynamic params:
```typescript
// Source: route.ts pattern from route.md Next.js 16 docs
import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { getTradeHistory } from '@/lib/wallet'
import { db } from '@/db'
import { tradingPairs } from '@/db/schema'
import { computePositions } from '@/lib/portfolio'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  // Fetch all user trades (no pagination — need complete history for cost basis)
  const { trades } = await getTradeHistory(db, user.userId, 1, 999999)

  // Get current prices from DB (lastPrice field on tradingPairs)
  const pairs = await db.select().from(tradingPairs)
  const prices = Object.fromEntries(pairs.map(p => [p.id, p.lastPrice]))

  const positions = computePositions(trades, prices)
  return jsonResponse(positions)
}
```

**`GET /api/orders/all?status=open|partial|filled|cancelled`** — New endpoint:
```typescript
import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'
import { db } from '@/db'
import { orders } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)

  const status = new URL(req.url).searchParams.get('status')
  // Validate status enum...

  // For filled/cancelled: filter to last 7 days (D-07)
  // For open/partial: no date filter
}
```

[VERIFIED: existing API routes in src/app/api/ for pattern; Next.js 16 route docs for signatures]

### Anti-Patterns to Avoid

- **Floating-point P&L math:** Never `position.quantity * currentPrice` with native JS numbers. Use `new Decimal(qty).mul(price).toFixed()`.
- **Calling `/api/portfolio` per price tick:** The live price overlay must happen client-side via `usePriceFeed` — polling the API every second would be wasteful and wrong.
- **Fetching paginated trade history for position computation:** `getTradeHistory()` paginates. For position computation, fetch ALL trades (use a large limit or a dedicated all-trades query). The pagination in `getTradeHistory()` is for display, not computation.
- **Using the `wallets.totalBalance` for crypto holdings:** The single wallet tracks a unified credit balance. Crypto quantities must be derived from fills, not from the wallet record.
- **Missing `'use client'` on PortfolioHoldings:** Any component that calls `usePriceFeed` must be a client component.

---

## Critical Data Architecture Finding

**The wallet system has a single balance per user — not per asset.**

[VERIFIED: src/db/schema.ts — `wallets` table has one row per user with `totalBalance`, `availableBalance`, `lockedBalance`; no `asset` column]

[VERIFIED: src/lib/matching-engine.ts lines 86-88 — when a buy fill executes, the buyer receives `qty` via `creditWallet(db, buyerId, qty, ...)` where qty is the crypto amount. This means the wallet balance conflates USDC and crypto units into a single number.]

**Implication for position computation:** The only reliable source of per-asset crypto holdings is the fills table (trades). Sum all buy fills per pair (qty added) minus sum all sell fills per pair (qty removed) = current holdings.

This is the approach confirmed by D-02 and D-03. The `lib/portfolio.ts` pure function is the correct implementation point.

**Confirmed pairId format:** `'BTC-USDC'`, `'ETH-USDC'`, `'SOL-USDC'` (hyphen separator, not slash).

[VERIFIED: src/server.ts line 37-40 — `createSimulators({'BTC-USDC': '50000.00', ...})`]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Decimal arithmetic | Native JS `*`, `+`, `-` | `new Decimal(a).mul(b).toFixed()` | Floating-point rounding corrupts financial values |
| Number animation | CSS transitions on text | `AnimatePresence + motion.span` (PriceTicker pattern) | Spring physics, direction-aware, already proven |
| JWT auth in API routes | Manual header parsing | `getAuthUser(req)` from `@/lib/auth` | Established auth helper, tested |
| JSON response shaping | Manual `new Response(JSON.stringify(...))` | `jsonResponse(data)` helper | Consistent response shape, simpler code |
| Loading skeletons | Custom CSS animation | `animate-pulse` + `glass` class | Already established in PortfolioSummary and OpenOrders |
| Tab state management | Redux/Zustand | `useState` | Single-component local state — no need for global state |

---

## Common Pitfalls

### Pitfall 1: Paginated Trade History for Position Computation
**What goes wrong:** `getTradeHistory(db, userId)` defaults to `limit=50` and `page=1`. If a user has more than 50 trades, position computation gets only the most recent 50 and produces wrong cost basis.
**Why it happens:** The existing function was built for display pagination, not full-scan use.
**How to avoid:** In `lib/portfolio.ts` and `/api/portfolio`, fetch trades with a very large limit (e.g., 999999) or build a dedicated `getAllTrades(db, userId)` function that returns all rows without pagination.
**Warning signs:** Avg cost basis differs from expected; holdings show negative quantity.

### Pitfall 2: Using `wallets.totalBalance` for Crypto Value
**What goes wrong:** Developer reads `wallet.totalBalance` expecting it to represent only USDC. In practice it also has credits added from crypto buy fills, making it incorrect for USDC-only display.
**Why it happens:** `creditWallet()` is called for both USDC deposits AND crypto buy fill credits — same table, same column.
**How to avoid:** The USDC balance card in the portfolio should either show a computed USDC balance (totalBalance minus unrealizedValue of crypto), or simply show `wallet.availableBalance` with a note. Alternatively, derive USDC from fills: starting credits minus total buy costs plus total sell proceeds.
**Warning signs:** USDC balance looks implausibly large.

### Pitfall 3: Forgetting `'use client'` on PortfolioHoldings
**What goes wrong:** TypeScript error "useState is not a function" or "Event handlers cannot be passed to Client Component props."
**Why it happens:** `usePriceFeed` uses `useEffect` and `useState` — it's a client hook. The component calling it must also be `'use client'`.
**How to avoid:** All components that call `usePriceFeed`, `useState`, or `useEffect` must have `'use client'` as their first line.
**Warning signs:** Next.js build error about hooks in server components.

### Pitfall 4: Drizzle `and()` with Multiple Status Values (no `inArray` shortcut)
**What goes wrong:** Trying to filter `status IN ('open', 'partial')` in Drizzle without knowing the correct API.
**Why it happens:** `getOrderBook()` in `matching-engine.ts` already works around this by filtering in JS after fetching.
**How to avoid:** Use Drizzle's `inArray(orders.status, ['open', 'partial'])` from `drizzle-orm`, or fetch all user orders and filter in JS (acceptable for portfolio-scale data sets).
**Warning signs:** SQL errors or unexpected empty results.

[VERIFIED: matching-engine.ts line 280 — existing workaround uses JS filter after full fetch]

### Pitfall 5: Position Computation with Zero Buy History (Short Positions / Sells Only)
**What goes wrong:** If a user's first trade is a sell (they were given crypto in seed data), the buy-fill list is empty and `avgCostBasis` is 0. Realized P&L becomes equal to the full sell proceeds.
**Why it happens:** System starts with funded wallets; some users may receive crypto via admin grant.
**How to avoid:** Handle the `sumBuyQty === 0` case explicitly — return `avgCostBasis: '0'` and note in comments. This is correct behavior for seed-received crypto (zero cost basis).
**Warning signs:** Extreme unrealized P&L values on fresh accounts.

### Pitfall 6: `getTradeHistory()` Returns Sorted Newest-First
**What goes wrong:** Position computation must process trades in chronological order (oldest first) to correctly update the running weighted average cost basis. Processing newest-first produces wrong avg cost.
**Why it happens:** `getTradeHistory()` sorts `DESC` by `createdAt` for display purposes.
**How to avoid:** Reverse the array before calling `computePositions()`, or sort ascending inside `lib/portfolio.ts`.
**Warning signs:** Avg cost basis differs from manual calculation.

[VERIFIED: wallet.ts line 222 — `userTrades.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))` — confirmed DESC sort]

---

## Code Examples

### Weighted Average Cost Basis (Decimal.js)
```typescript
// Source: D-02 decision + standard exchange accounting
import Decimal from 'decimal.js'

// Running state per asset:
let runningQty = new Decimal('0')
let runningCost = new Decimal('0') // total cost = sum(price * qty) for buys

// On each buy fill:
const fillCost = new Decimal(fill.price).mul(fill.quantity)
runningCost = runningCost.plus(fillCost)
runningQty = runningQty.plus(fill.quantity)

const avgCostBasis = runningQty.gt(0)
  ? runningCost.div(runningQty).toFixed(8)
  : '0'
```

### Realized P&L on Sell
```typescript
// Source: D-03 decision
// On each sell fill (avgCostBasis is the running weighted average at time of sell):
const realizedThisSell = new Decimal(fill.price)
  .minus(avgCostBasis)
  .mul(fill.quantity)
  .toFixed(8)

totalRealizedPnl = new Decimal(totalRealizedPnl).plus(realizedThisSell).toFixed(8)

// Reduce holdings:
runningQty = runningQty.minus(fill.quantity)
// avgCostBasis stays the same (FIFO weighted avg method)
```

### Unrealized P&L (Live, Client-Side)
```typescript
// Source: D-01, D-04 decisions
// In React component, after usePriceFeed updates:
const unrealizedPnl = new Decimal(currentPrice)
  .minus(position.avgCostBasis)
  .mul(position.quantity)
  .toFixed(2)
```

### API Route: `/api/portfolio` (Next.js 16 Pattern)
```typescript
// Source: Next.js 16 route.md + existing routes pattern
import { NextRequest } from 'next/server'
import { getAuthUser, jsonResponse, errorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = getAuthUser(req)
  if (!user) return errorResponse('Unauthorized', 401)
  // ... fetch, compute, return
  return jsonResponse(positions)
}
```

### `inArray` for Status Filter (Drizzle ORM)
```typescript
// Source: drizzle-orm docs pattern
import { inArray } from 'drizzle-orm'

const userOrders = await db
  .select()
  .from(orders)
  .where(
    and(
      eq(orders.userId, userId),
      inArray(orders.status, ['open', 'partial'])
    )
  )
```

### 7-Day Date Filter (D-07)
```typescript
// Source: D-07 decision — SQLite datetime comparison
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

// For filled/cancelled orders only:
const recentOrders = await db
  .select()
  .from(orders)
  .where(
    and(
      eq(orders.userId, userId),
      inArray(orders.status, ['filled', 'cancelled']),
      gte(orders.createdAt, sevenDaysAgo)
    )
  )
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-asset wallet rows | Derive from fills (unified wallet) | Architecture decision | Position computation must use fills, not wallet |
| Per-pair open orders (OpenOrders.tsx) | Cross-pair tabbed view (PortfolioOrders.tsx) | Phase 4 | New component, old one untouched |
| USDC-only portfolio summary | Per-asset holdings with P&L | Phase 4 | Full rewrite of PortfolioSummary |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `getTradeHistory()` with `limit=999999` returns all rows without DB error | Pitfall 1 | Need a dedicated `getAllUserTrades()` function instead |
| A2 | `tradingPairs.lastPrice` is updated by the price simulator and reflects a reasonable snapshot price for server-side P&L computation | Pattern 1 | Portfolio API would return stale prices; workaround: client always overrides with Socket.IO live price |
| A3 | `inArray` is available in the installed `drizzle-orm@0.45.2` | Code Examples | Fallback: filter in JS after full fetch (matching-engine.ts pattern) |

[A1 is LOW risk — SQLite can return any number of rows; the real question is whether Drizzle slices at a library level — ASSUMED based on training knowledge]
[A2 is LOW risk — server P&L is a starting snapshot; client live price overrides it anyway]
[A3 is MEDIUM confidence — drizzle-orm has included `inArray` since early versions, but exact import path needs confirmation at implementation time]

---

## Open Questions

1. **USDC balance card: what value to show?**
   - What we know: `wallet.totalBalance` conflates USDC and crypto credits. `wallet.availableBalance` does not include locked funds.
   - What's unclear: Should the USDC card show `availableBalance` (safe, excludes locked), `totalBalance - totalCryptoValue` (accurate but complex), or just `availableBalance + lockedBalance` for total USDC?
   - Recommendation: Show `availableBalance` labeled as "Available USDC" and `lockedBalance` labeled as "In Orders" — this is what the existing `PortfolioSummary.tsx` already shows. Reuse that pattern for the USDC card within PortfolioHoldings.

2. **Empty portfolio state: show cards or hide them?**
   - What we know: A new user with no trades has zero positions computed.
   - What's unclear: Should BTC/ETH/SOL cards still render with `0.00000000 BTC` and `--` P&L, or should they be hidden?
   - Recommendation: Always render all three crypto cards even with zero holdings (shows users what they can trade). Add an empty-state message only if there are also no orders (truly inactive account). This is a Claude's Discretion area.

3. **Price feed disconnection handling (Claude's Discretion)**
   - What we know: `usePriceFeed` returns `{ price: '--', direction: 'neutral' }` as initial state.
   - What's unclear: If Socket.IO disconnects after initial load, the card shows stale live price indefinitely.
   - Recommendation: Track a `lastUpdated` timestamp in the hook; show a subtle "price delayed" indicator after 10s without a price event. This is implementation detail — mark as Claude's Discretion.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 4 is purely code changes on top of existing infrastructure. No new external dependencies (no new CLI tools, services, or runtimes required). All dependencies already installed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x (from devDependencies) |
| Config file | `coinxi/vitest.config.ts` |
| Quick run command | `npm run test -- --reporter=verbose src/__tests__/lib/portfolio.test.ts` |
| Full suite command | `npm run test` (from `coinxi/` directory) |

[VERIFIED: coinxi/vitest.config.ts — confirmed Vitest setup with node environment default, jsdom for `.tsx` files]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PORT-01 | `/api/portfolio` returns positions array for authenticated user | unit (route) | `npm run test -- src/__tests__/lib/portfolio.test.ts` | No — Wave 0 |
| PORT-02 | `computePositions()` returns correct quantity and estimated value from buy fills | unit (pure fn) | `npm run test -- src/__tests__/lib/portfolio.test.ts` | No — Wave 0 |
| PORT-03 | `computePositions()` returns correct unrealizedPnl and realizedPnl with decimal.js precision | unit (pure fn) | `npm run test -- src/__tests__/lib/portfolio.test.ts` | No — Wave 0 |
| PORT-04 | `/api/orders/all` returns orders filtered by status, 7-day limit for filled/cancelled | unit (route) | `npm run test -- src/__tests__/lib/portfolio.test.ts` | No — Wave 0 |

**Note on test file location:** Following existing project convention, pure function tests go in `src/__tests__/lib/` and API/integration tests in `src/__tests__/integration/`. The `lib/portfolio.ts` tests are `.ts` (not `.tsx`) so they use the `node` environment automatically — no `@vitest-environment` docblock needed.

### Sampling Rate
- **Per task commit:** `npm run test -- src/__tests__/lib/portfolio.test.ts`
- **Per wave merge:** `npm run test` (full suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/portfolio.test.ts` — covers PORT-01, PORT-02, PORT-03 (pure function unit tests for `computePositions`)
- [ ] `src/__tests__/integration/portfolio-api.test.ts` — covers PORT-01, PORT-04 (API route integration tests)

*(Existing test infrastructure: `src/__tests__/helpers/db.ts` has `createTestDb`, `seedUser`, `seedTradingPair` — reuse these helpers in new tests.)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `getAuthUser(req)` — JWT Bearer token, validated on every API call |
| V3 Session Management | no | JWT handled by existing auth infrastructure |
| V4 Access Control | yes | All queries scoped by `eq(orders.userId, user.userId)` — user can only see own data |
| V5 Input Validation | yes | `status` query param on `/api/orders/all` must be validated against enum before use |
| V6 Cryptography | no | No new crypto operations; passwords handled by bcrypt in auth layer |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR on orders — user requests another user's orders | Tampering | Always filter by `eq(orders.userId, user.userId)` in Drizzle query |
| Unbounded query — no date filter for filled/cancelled | Denial of Service | D-07: 7-day limit for filled/cancelled orders |
| Raw fill data exposure — cost basis reveals trading history | Information Disclosure | `/api/portfolio` returns aggregated positions only, not raw fills |
| Status param injection | Tampering | Validate `status` against whitelist `['open', 'partial', 'filled', 'cancelled']` before Drizzle query |

---

## Sources

### Primary (HIGH confidence)
- `coinxi/src/db/schema.ts` — Full schema; confirmed wallets table structure, orders/trades columns
- `coinxi/src/lib/wallet.ts` — `getTradeHistory()` pattern; confirmed fill derivation approach
- `coinxi/src/lib/matching-engine.ts` — `settleTrade()` confirms how buyer/seller balances are settled
- `coinxi/src/hooks/usePriceFeed.ts` — Confirmed `{price, direction}` return type
- `coinxi/src/components/PriceTicker.tsx` — Confirmed `AnimatePresence + motion.span` animation pattern
- `coinxi/src/components/OpenOrders.tsx` — Confirmed tab/refresh/cancel patterns
- `coinxi/src/components/GlassCard.tsx` — Confirmed `elevated` prop, CSS class approach
- `coinxi/server.ts` — Confirmed pairIds are `'BTC-USDC'`, `'ETH-USDC'`, `'SOL-USDC'`
- `coinxi/vitest.config.ts` — Confirmed test framework, environment configuration
- `coinxi/src/__tests__/helpers/db.ts` — Confirmed test helper utilities available
- `coinxi/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md` — Confirmed async params pattern for Next.js 16
- `coinxi/package.json` — Confirmed installed packages and versions

### Secondary (MEDIUM confidence)
- `coinxi/src/__tests__/setup.ts` — Mock patterns for `next/server` in test environment
- STATE.md accumulated decisions — Confirmed proxy.ts pattern, framer-motion version, decimal.js requirement

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed and in use
- Architecture: HIGH — direct codebase inspection of all referenced files
- P&L math: HIGH — pure math confirmed against D-02/D-03 decisions and existing wallet.ts patterns
- Pitfalls: HIGH — derived from direct code reading (sort order, wallet structure, single-balance architecture)
- Test infrastructure: HIGH — vitest.config.ts and helpers confirmed

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (stable — no external API dependencies)
