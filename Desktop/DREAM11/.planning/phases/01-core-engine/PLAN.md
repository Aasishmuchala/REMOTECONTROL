---
phase: "01-core-engine"
plan: "00"
type: "master"
wave: "0"
depends_on: []
files_modified: []
autonomous: true
requirements:
  - AUTH-01
  - AUTH-02
  - AUTH-03
  - AUTH-04
  - AUTH-05
  - WAL-01
  - WAL-02
  - WAL-03
  - WAL-04
  - WAL-05
  - PAIR-01
  - PAIR-02
  - PAIR-03
  - MKT-01
  - MKT-02
  - MKT-03
  - MKT-04
  - MKT-05
  - LMT-01
  - LMT-02
  - LMT-03
  - LMT-04
  - LMT-05
  - LMT-06
  - HIST-01
  - HIST-02
  - HIST-03
  - UI-01
  - UI-02
  - UI-03
  - UI-04
  - UI-06
must_haves:
  truths:
    - "User can sign up, log in, and stay authenticated across browser refreshes (sessionStorage persist)"
    - "Wallet balances reflect total, available, and locked amounts accurately after every mutation"
    - "Market and limit orders execute with correct decimal arithmetic — no floating-point drift"
    - "Locked funds are deducted on order placement and restored atomically on cancel"
    - "getTradeHistory returns paginated records with side, price, quantity, pairId, timestamp"
    - "All 7 API routes are reachable with Bearer token auth and return structured JSON"
    - "Dark glassmorphism UI is applied globally: #0a0a0f background, rgba(255,255,255,0.05) glass, #00d4ff cyan"
    - "OrderForm shows slippage estimate modal before market order submission (UI-04)"
    - "PriceTicker uses AnimatePresence for number morphing with green/red direction coloring (UI-03)"
    - "Cricket routes (/contests, /leaderboards) are replaced by exchange routes (/trade, /portfolio, /history)"
  artifacts:
    - path: "src/lib/wallet.ts"
      provides: "getTradeHistory function added to existing wallet module"
      min_lines: 220
    - path: "src/db/index.ts"
      provides: "Drizzle singleton with WAL mode + exchange table DDL"
      min_lines: 30
    - path: "scripts/seed.ts"
      provides: "BTC/USDC, ETH/USDC, SOL/USDC trading pair seeding"
      min_lines: 50
    - path: "src/proxy.ts"
      provides: "Route protection for /trade, /portfolio, /history, /api/* (Next.js 16 proxy.ts)"
      min_lines: 30
    - path: "src/app/api/wallet/route.ts"
      provides: "GET wallet balances endpoint"
      min_lines: 20
    - path: "src/app/api/wallet/deposit/route.ts"
      provides: "POST credit wallet endpoint"
      min_lines: 25
    - path: "src/app/api/orders/route.ts"
      provides: "POST place order, GET open orders"
      min_lines: 35
    - path: "src/app/api/orders/[id]/route.ts"
      provides: "DELETE cancel order"
      min_lines: 20
    - path: "src/app/api/history/route.ts"
      provides: "GET paginated trade history"
      min_lines: 25
    - path: "src/app/api/market/route.ts"
      provides: "GET order book snapshot"
      min_lines: 20
    - path: "src/app/globals.css"
      provides: "Dark glassmorphism design system"
      min_lines: 80
    - path: "src/components/GlassCard.tsx"
      provides: "Glassmorphism card primitive"
      min_lines: 15
    - path: "src/components/Button.tsx"
      provides: "Framer Motion button with scale/glow effects"
      min_lines: 40
    - path: "src/components/Input.tsx"
      provides: "Glass-styled input with error state"
      min_lines: 35
    - path: "src/components/OrderForm.tsx"
      provides: "Buy/sell + market/limit form with slippage modal"
      min_lines: 100
    - path: "src/components/PriceTicker.tsx"
      provides: "Animated price display with direction color"
      min_lines: 50
    - path: "src/components/TradingPairSelector.tsx"
      provides: "BTC/ETH/SOL pair switcher with price display"
      min_lines: 40
    - path: "src/components/PortfolioSummary.tsx"
      provides: "Wallet balance summary display"
      min_lines: 40
    - path: "src/components/TradeHistory.tsx"
      provides: "Paginated trade history table"
      min_lines: 60
    - path: "src/app/(main)/trade/page.tsx"
      provides: "Trading interface page"
      min_lines: 40
    - path: "src/app/(main)/portfolio/page.tsx"
      provides: "Portfolio + open orders page"
      min_lines: 40
    - path: "src/app/(main)/history/page.tsx"
      provides: "Trade history page"
      min_lines: 25
    - path: "src/app/(auth)/login/page.tsx"
      provides: "Glassmorphism login form"
      min_lines: 60
    - path: "src/app/(auth)/register/page.tsx"
      provides: "Glassmorphism register form"
      min_lines: 70
  key_links:
    - from: "src/lib/wallet.ts (getTradeHistory)"
      to: "src/app/api/history/route.ts"
      via: "direct import: import { getTradeHistory } from '@/lib/wallet'"
      pattern: "getTradeHistory"
    - from: "src/db/index.ts (db singleton)"
      to: "all API routes"
      via: "import { db } from '@/db'"
      pattern: "from '@/db'"
    - from: "src/lib/auth.ts (getAuthUser)"
      to: "src/proxy.ts + all API routes"
      via: "Bearer token check in Authorization header"
      pattern: "getAuthUser"
    - from: "src/stores/auth.ts (apiFetch)"
      to: "all client components"
      via: "apiFetch adds Authorization header automatically"
      pattern: "apiFetch"
    - from: "src/lib/matching-engine.ts"
      to: "src/app/api/orders/route.ts"
      via: "placeLimitOrder / placeMarketOrder / cancelOrder / getOrderBook"
      pattern: "placeLimitOrder|placeMarketOrder"
---

# Phase 1: Core Engine — Master Plan

**Objective:** Complete the remaining Phase 1 work on top of the 67-test TDD session. The financial primitives are already built and tested. This phase wires them into a running Next.js app: API routes, route protection, seeded trading pairs, glassmorphism UI, and exchange pages.

**Plans:** 6 plans in 3 waves

---

## CRITICAL: Next.js 16 Breaking Change

**`middleware.ts` is deprecated in Next.js 16. The file is now `src/proxy.ts` and the exported function must be named `proxy` (not `middleware`).**

```typescript
// CORRECT (Next.js 16):
// src/proxy.ts
export function proxy(request: NextRequest) { ... }
export const config = { matcher: [...] }

// WRONG (will not run):
// src/middleware.ts
export function middleware(request: NextRequest) { ... }
```

Every executor MUST read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` before writing route protection code.

---

## Already Built (DO NOT Re-implement)

The TDD session produced 67 passing tests. These files exist and are correct:

| File | Functions | Tests |
|------|-----------|-------|
| `src/lib/auth.ts` | hashPassword, verifyPassword, signToken, verifyToken, getAuthUser, jsonResponse, errorResponse | 19 |
| `src/lib/wallet.ts` | createWallet, getWallet, creditWallet, lockBalance, unlockBalance, debitLocked, getWalletHistory | 19 |
| `src/lib/matching-engine.ts` | placeLimitOrder, placeMarketOrder, cancelOrder, getOrderBook, getOpenOrders | 22 |
| `src/db/schema.ts` | users, wallets, wallet_transactions, trading_pairs, orders, trades | — |
| `src/__tests__/` | Full test suite + helpers | 67 |

**`src/db/index.ts` also already exists** with a correct Drizzle + better-sqlite3 singleton using WAL mode. Plan 01-01 must ADD exchange table DDL to it, not replace it.

---

## Decision Coverage Matrix

| Requirement | Plan | Task | Full/Partial | Implementation |
|-------------|------|------|--------------|----------------|
| AUTH-01: Signup | Already built in TDD | — | Full (existing) | POST /api/auth/register exists |
| AUTH-02: Login | Already built in TDD | — | Full (existing) | POST /api/auth/login exists |
| AUTH-03: Session persist | Already built in TDD | — | Full (existing) | signToken 7-day JWT; sessionStorage in auth store |
| AUTH-04: Logout | 01-06 | 1 | Full | logout() in auth store; login page redirect |
| AUTH-05: Protected routes | 01-01 | 1 | Full | src/proxy.ts with getAuthUser |
| WAL-01: View balances | 01-01 | 2 | Full | GET /api/wallet returns wallet record |
| WAL-02: Available vs locked | 01-01 | 2 | Full | wallet.availableBalance + wallet.lockedBalance in response |
| WAL-03: Deposit credits | 01-01 | 2 | Full | POST /api/wallet/deposit calls creditWallet |
| WAL-04: Balance enforcement | Already built in TDD | — | Full (existing) | lockBalance throws if insufficient |
| WAL-05: Decimal precision | Already built in TDD | — | Full (existing) | decimal.js throughout wallet.ts + matching-engine.ts |
| PAIR-01: BTC/ETH/SOL pairs | 01-01 | 1 | Full | scripts/seed.ts inserts 3 pairs |
| PAIR-02: Pair selector UI | 01-03 | 1 | Full | TradingPairSelector component |
| PAIR-03: View bid/ask | 01-01 | 3 | Full | GET /api/market returns bids/asks |
| MKT-01: Market buy | Already built in TDD | — | Full (existing) | placeMarketOrder with side:'buy' |
| MKT-02: Market sell | Already built in TDD | — | Full (existing) | placeMarketOrder with side:'sell' |
| MKT-03: Immediate fill | Already built in TDD | — | Full (existing) | matchOrder called synchronously |
| MKT-04: Partial fills | Already built in TDD | — | Full (existing) | Loop in matchOrder |
| MKT-05: Fill confirmation | 01-03 | 2 | Full | OrderForm shows result after POST /api/orders |
| LMT-01: Limit buy | Already built in TDD | — | Full (existing) | placeLimitOrder with side:'buy' |
| LMT-02: Limit sell | Already built in TDD | — | Full (existing) | placeLimitOrder with side:'sell' |
| LMT-03: Auto-fill on crossing | Already built in TDD | — | Full (existing) | matchOrder price check |
| LMT-04: Cancel pending | Already built in TDD | — | Full (existing) | cancelOrder state check |
| LMT-05: Return locked funds | Already built in TDD | — | Full (existing) | unlockBalance in cancelOrder |
| LMT-06: Price validation | Already built in TDD | — | Full (existing) | requirePositive in placeLimitOrder |
| HIST-01: Trade history | 01-01 | 3 | Full | getTradeHistory added to wallet.ts + GET /api/history |
| HIST-02: Fill details | 01-01 | 3 | Full | Returns id, pairId, side, price, quantity, timestamp per record |
| HIST-03: Pagination | 01-01 | 3 | Full | page/limit params, 50/page default |
| UI-01: Dark glassmorphism | 01-02 | 1 | Full | globals.css: #0a0a0f bg, rgba(255,255,255,0.05) glass surfaces |
| UI-02: Cyan accent #00d4ff | 01-02 | 1 | Full | --color-cyan: #00d4ff CSS var; .btn-primary cyan glow |
| UI-03: Price animations | 01-03 | 2 | Full | PriceTicker AnimatePresence, green up / red down |
| UI-04: Slippage modal | 01-03 | 2 | Full | OrderForm shows slippage estimate before market order |
| UI-06: Button micro-interactions | 01-02 | 2 | Full | Button: scale(1.02) hover, scale(0.97) active via Framer Motion |
| UI-05 | Deferred to Phase 2 | — | Deferred | Order book row animations need real-time data (Phase 2) |

**Total: 32/32 Phase 1 requirements. 22 already built in TDD. 10 remain for these 6 plans.**

---

## Wave Structure

```
Wave 1 (no dependencies — runs alone first):
  Plan 01-01: Backend foundation
    - getTradeHistory in wallet.ts
    - Exchange DDL in src/db/index.ts
    - scripts/seed.ts trading pair seeding
    - src/proxy.ts route protection (Next.js 16)
    - All 7 API routes

Wave 2 (depends on Wave 1, parallel with each other):
  Plan 01-02: UI foundation
    - globals.css complete redesign
    - GlassCard, Button, Input components
    - BottomNav replacement (exchange nav)

  Plan 01-03: Trading UI components
    - OrderForm with slippage modal
    - PriceTicker with AnimatePresence
    - TradingPairSelector

  Plan 01-04: Portfolio UI components
    - PortfolioSummary
    - TradeHistory table (paginated)
    - OpenOrders display

Wave 3 (depends on Wave 2):
  Plan 01-05: Pages + routing
    - /trade page (assembly)
    - /portfolio page (assembly)
    - /history page (assembly)
    - Remove /contests, /leaderboards
    - Root / redirect to /trade

  Plan 01-06: Auth pages
    - /login glassmorphism redesign
    - /register glassmorphism page
    - Main layout wire-up (exchange nav)
```

### Dependency Graph

```
01-01 (Backend)
  creates: proxy.ts, API routes, getTradeHistory, seed
  no dependencies

01-02 (UI Foundation) ────────┐
  depends: 01-01              │
  creates: globals.css,       │
    GlassCard, Button, Input  │
                              ├── parallel Wave 2
01-03 (Trading UI) ───────────┤
  depends: 01-01              │
  creates: OrderForm,         │
    PriceTicker, PairSelector │
                              │
01-04 (Portfolio UI) ─────────┘
  depends: 01-01
  creates: PortfolioSummary,
    TradeHistory, OpenOrders

01-05 (Pages) ────────────────┐
  depends: 01-02, 01-03,      │
    01-04                     ├── parallel Wave 3
  creates: trade/portfolio/   │
    history pages             │
                              │
01-06 (Auth Pages) ───────────┘
  depends: 01-02
  creates: login, register,
    main layout
```

---

## File Ownership (No Overlap Between Parallel Plans)

| Plan | Files Modified |
|------|---------------|
| 01-01 | src/lib/wallet.ts, src/db/index.ts, scripts/seed.ts, src/proxy.ts, src/app/api/wallet/route.ts, src/app/api/wallet/deposit/route.ts, src/app/api/orders/route.ts, src/app/api/orders/[id]/route.ts, src/app/api/history/route.ts, src/app/api/market/route.ts |
| 01-02 | src/app/globals.css, src/components/GlassCard.tsx, src/components/Button.tsx, src/components/Input.tsx, src/components/ExchangeNav.tsx |
| 01-03 | src/components/OrderForm.tsx, src/components/PriceTicker.tsx, src/components/TradingPairSelector.tsx |
| 01-04 | src/components/PortfolioSummary.tsx, src/components/TradeHistory.tsx, src/components/OpenOrders.tsx |
| 01-05 | src/app/(main)/trade/page.tsx, src/app/(main)/portfolio/page.tsx, src/app/(main)/history/page.tsx, src/app/page.tsx |
| 01-06 | src/app/(auth)/login/page.tsx, src/app/(auth)/register/page.tsx, src/app/(main)/layout.tsx |

No file appears in more than one plan. Wave 2 plans (01-02, 01-03, 01-04) have zero overlap and can execute in parallel.

---

## "Looks Done But Isn't" Financial Integrity Checklist

These specific behaviors must hold after all plans execute:

1. **Decimal strings only** — grep the codebase after execution: `grep -rn "parseFloat\|Number(" src/app/api/ src/lib/` should return zero results in financial code paths. Every monetary value is a `string` passed to `new Decimal(x)`.

2. **getTradeHistory returns correct side** — The `trades` table does not have a `side` column. `getTradeHistory` must derive `side` by checking whether `trades.buyOrderId` references an order owned by userId (side = 'buy') or `trades.sellOrderId` (side = 'sell'). A trade record where the executor is the buyer returns `side: 'buy'`.

3. **Deposit guard** — `POST /api/wallet/deposit` is admin-only. An isAdmin check on the JWT payload must be present; a non-admin Bearer token must receive 403.

4. **Proxy route pattern** — Confirm `src/proxy.ts` exists (not `src/middleware.ts`). The exported function must be named `proxy`. Check: `grep "export function proxy\|export default function proxy" src/proxy.ts`.

5. **Seed idempotency** — Running `npx tsx scripts/seed.ts` twice must not create duplicate trading pairs. The seed must use `INSERT OR IGNORE` or check for existence.

6. **Cancel refund atomicity** — `DELETE /api/orders/[id]` calls `cancelOrder` which internally calls `unlockBalance`. Both mutations must occur or neither. Verified by placing a limit order, canceling it, then checking wallet available balance equals pre-order available balance.

7. **Market order with no liquidity** — `POST /api/orders` with `type: 'market'` when no opposing orders exist must return 400 with `"Insufficient liquidity"`. Not 500, not silent fail.

8. **framer-motion install** — `package.json` must include `framer-motion` in dependencies. Check before writing any animation code: if absent, run `npm install framer-motion`.

---

## Plan Summary

| Plan | Objective | Wave | Tasks | Key Outputs |
|------|-----------|------|-------|-------------|
| 01-01 | Backend: getTradeHistory + db setup + proxy.ts + 7 API routes | 1 | 3 | proxy.ts, all API routes, seeded pairs |
| 01-02 | UI Foundation: globals.css + GlassCard/Button/Input | 2 | 2 | Design system, base components |
| 01-03 | Trading UI: OrderForm + PriceTicker + TradingPairSelector | 2 | 2 | Core trading components |
| 01-04 | Portfolio UI: PortfolioSummary + TradeHistory + OpenOrders | 2 | 2 | Portfolio components |
| 01-05 | Pages + routing: /trade, /portfolio, /history + redirect | 3 | 2 | All exchange pages |
| 01-06 | Auth pages + main layout wire-up | 3 | 2 | Login/register, exchange nav |

---

## Success Criteria (from ROADMAP.md Phase 1)

All 12 must be TRUE when plans complete:

1. User can sign up, log in, and remain authenticated across browser refreshes
2. User can view wallet balances showing total, available, and locked
3. User can deposit credits (admin) and those credits appear in available balance
4. User cannot place an order exceeding available balance (400 error)
5. User can place a market buy or sell and receive fill confirmation with price, qty, total
6. User can place a limit order at a specific price; locked funds deducted from available
7. Limit orders fill automatically when market price crosses; partial fills supported
8. User can cancel a pending limit order; locked funds return to available
9. All monetary values use decimal.js — no floating-point rounding errors
10. Every balance mutation inside the lib functions (already tested — WAL mode ensures SQLite serializability)
11. Negative, zero, and extreme prices are rejected before processing
12. App displays dark glassmorphism UI with electric cyan (#00d4ff) accent, smooth price animations, button micro-interactions

---

## Execute

Wave 1 (alone):
```
execute: 01-core-engine plan 01-01
```

Wave 2 (after 01-01 completes, parallel):
```
execute: 01-core-engine plan 01-02
execute: 01-core-engine plan 01-03
execute: 01-core-engine plan 01-04
```

Wave 3 (after all Wave 2 complete):
```
execute: 01-core-engine plan 01-05
execute: 01-core-engine plan 01-06
```

`/clear` before each wave for a fresh context window.
