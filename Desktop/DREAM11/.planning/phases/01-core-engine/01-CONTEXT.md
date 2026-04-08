# Phase 1: Core Engine - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete financial infrastructure — user auth, credits wallet with double-entry ledger, price-time priority matching engine for market and limit orders, all with atomic transactions and decimal.js precision throughout. Plus dark glassmorphism UI foundation with electric cyan accent, trading UI, and all Phase 1 API routes.

**Already built (TDD session):**
- `src/lib/auth.ts` — hashPassword, verifyPassword, signToken, verifyToken, getAuthUser, jsonResponse, errorResponse (19 tests)
- `src/lib/wallet.ts` — createWallet, getWallet, creditWallet, lockBalance, unlockBalance, debitLocked, getWalletHistory (19 tests)
- `src/lib/matching-engine.ts` — placeLimitOrder, placeMarketOrder, cancelOrder, getOrderBook, getOpenOrders (22 tests)
- Integration tests — Auth→Wallet→Order flows (7 tests), 67 total, all green
- `src/db/schema.ts` — wallets, wallet_transactions, trading_pairs, orders, trades tables added
- Vitest + decimal.js configured, 94%+ coverage on exchange modules

**Still needed for Phase 1 completion:**
- `src/lib/wallet.ts` — add getTradeHistory (HIST-01..03)
- Exchange API routes: wallet balance, deposit, orders, history, market
- Next.js middleware for route protection (AUTH-05)
- DB seed: BTC/ETH/SOL trading pairs
- UI: globals.css glassmorphism, GlassCard/Button/Input components, OrderForm, PriceTicker, TradingPairSelector, PortfolioSummary, TradeHistory, login/signup pages
- Replace cricket-app routes with exchange routes

</domain>

<decisions>
## Implementation Decisions

### ORM & Database
- Keep Drizzle + SQLite — 67 tests pass, schema is complete, no migration cost
- SQLite WAL mode for atomics — sufficient for friends-only app
- Extend existing `scripts/seed.ts` to seed BTC/USDC, ETH/USDC, SOL/USDC trading pairs on startup

### Authentication
- Keep custom JWT in `src/lib/auth.ts` — fully TDD'd, 19 tests pass
- Add lightweight `src/middleware.ts` using existing `getAuthUser()` — protects `/trade`, `/portfolio`, `/api/*` routes
- Token storage: Zustand persist + localStorage (already in place as `coinxi-auth`)

### API Routes
- Build all 7 exchange routes:
  - `GET /api/wallet` — user's wallet balances
  - `POST /api/wallet/deposit` — admin credits (AUTH-05 protected)
  - `POST /api/orders` — place market or limit order
  - `DELETE /api/orders/[id]` — cancel order
  - `GET /api/orders` — user's open orders
  - `GET /api/history` — paginated trade history (50/page)
  - `GET /api/market` — order book snapshot for selected pair
- All routes use `getAuthUser()` for auth check, `errorResponse()` for errors
- Structured JSON errors with HTTP status codes

### UI Foundation
- Add `framer-motion` package for price ticker animations + button micro-interactions
- Build custom glassmorphism components from scratch (GlassCard, Button, Input) using Tailwind v4
- Single-page `/trade` route: pair selector + order form + price ticker + order book
- Remove cricket app routes (`/contests`, `/leaderboards`) — replace with exchange routes (`/trade`, `/portfolio`, `/history`)
- Auth pages (`/login`, `/register`) — redesign with glassmorphism style

### Claude's Discretion
- Component file structure and internal organization within `src/components/`
- Exact Framer Motion animation parameters (duration, easing) within 300-400ms guideline
- Error message copy
- Order of sections within the `/trade` page layout

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/auth.ts` — complete auth helpers, all tested
- `src/lib/wallet.ts` — complete wallet ledger, all tested
- `src/lib/matching-engine.ts` — complete matching engine, all tested
- `src/stores/auth.ts` — Zustand auth store with persist (token, user, isLoading)
- `src/components/CoinBadge.tsx` — existing balance display component (can repurpose)
- `src/components/BottomNav.tsx` — existing nav (needs replacement with exchange nav)
- `scripts/seed.ts` — exists, extend with trading pair seeding
- `src/__tests__/` — full test suite, helpers/db.ts test DB factory

### Established Patterns
- API routes use `getAuthUser(req)` + `errorResponse()` / `jsonResponse()` pattern
- All monetary values stored as `text` in DB, manipulated via `decimal.js`
- Drizzle queries: `db.select().from(table).where(eq(table.field, value))`
- UUID v4 for all primary keys
- Zustand stores use `create` with `persist` middleware

### Integration Points
- Exchange routes connect to lib functions directly (no service layer needed)
- `src/app/(main)/layout.tsx` — replace cricket nav with exchange nav
- `src/app/page.tsx` — redirect root to `/trade` instead of `/contests`
- `src/app/(auth)/` — login/register pages to be redesigned

</code_context>

<specifics>
## Specific Ideas

- Design: dark bg #0a0a0f, glass surfaces rgba(255,255,255,0.05) with backdrop-blur(16px), cyan #00d4ff accent
- Typography: Space Grotesk or Inter 700 for display, Inter 400/500 for body, JetBrains Mono for prices
- Button: scale(1.02) hover, scale(0.97) active, cyan glow on hover via Framer Motion
- Price ticker: AnimatePresence with number morphing, green for up / red for down
- Order form: buy/sell toggle (tabs), market/limit toggle, quantity input with balance preview
- Slippage estimate modal before market order confirmation (UI-04)
- GlassCard: `backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl`

</specifics>

<deferred>
## Deferred Ideas

- UI-05 (order book row animations) — deferred to Phase 2 alongside real-time order book
- HTTP-only cookie auth — keep localStorage for now, can harden in v2
- KYC flow — out of scope for v1
- Race condition stress test (10M decimal precision test) — manual QA after Phase 1 complete

</deferred>
