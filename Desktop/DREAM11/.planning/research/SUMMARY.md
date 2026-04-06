# Project Research Summary

**Project:** CoinXI — Credits-Only Crypto-Fiat Exchange
**Domain:** Financial trading platform (demo/simulation)
**Researched:** 2026-04-06
**Confidence:** MEDIUM

---

## Executive Summary

CoinXI is a crypto-fiat exchange that operates on a credits-only ledger, eliminating all real financial risk and regulatory surface. The target user is a small, trusted circle of friends who want to experience trading without monetary stakes. Despite the demo context, the financial engine must be built to production-grade integrity standards — the code patterns developed here will carry forward to any real financial product. The key insight from all research is that **this is NOT a simple web app**: it is a financial system with real-time data flows, concurrent state mutations, and precision requirements. The Awwwards-tier UI is the differentiator, but it only matters if the trading engine underneath is trustworthy.

The recommended approach is a **Next.js 14 full-stack monolith** with PostgreSQL/Prisma for persistent storage, Redis for pub/sub and caching, and Socket.IO for real-time data. The architecture is deliberately simplified for MVP scale — single server, in-memory order book — but the core patterns (atomic transactions, decimal math, strict state machines) are non-negotiable. Building it "small" does not mean building it sloppy; the most dangerous shortcut in a credits-only exchange is pretending float arithmetic is fine because "it's just credits."

The primary risk is that the credits-only nature lulls the team into treating financial integrity as optional. The three pillars of safe exchange development are: (1) decimal.js for every monetary calculation, (2) atomic transactions with row-level locking for every balance mutation, and (3) a strict order state machine with no ad-hoc state transitions. These must be established in Phase 1 and never compromised.

---

## Key Findings

### Recommended Stack

**Summary:** A well-proven, TypeScript-end-to-end stack optimized for real-time trading UX with minimal operational overhead. Next.js 14 App Router as the full-stack framework eliminates the need for a separate backend server at MVP scale. PostgreSQL via Prisma provides ACID guarantees essential for financial integrity. Redis handles pub/sub for WebSocket broadcasting and session caching. Socket.IO wraps WebSockets with built-in room management and auto-reconnection — critical for a trading app where dropped connections should not leave users confused.

**Core technologies:**
- **Next.js 14 (App Router)** — Full-stack framework: API routes, SSR landing, and frontend in one repo. Eliminates separate backend for MVP.
- **PostgreSQL 15+ + Prisma 5** — ACID-compliant persistent storage. Row-level locking via `SELECT FOR UPDATE` is the foundation for race-condition-free trading.
- **Redis 7+** — Sub-millisecond pub/sub for real-time order book broadcasts and WebSocket fan-out. Session cache.
- **Socket.IO 4.x** — WebSocket abstraction with room/channel management and auto-reconnection. Falls back to polling if WebSocket unavailable.
- **Zustand 4.x + TanStack Query 5.x** — Zustand for trading state (order book, balance, open orders). TanStack Query for REST polling with cache management.
- **decimal.js** — Non-negotiable for all financial math. Store all monetary values as decimal strings; parse with `new Decimal(str)`. Never use JavaScript floats.
- **Lightweight Charts (TradingView)** — Industry-standard candlestick/line charts, used by Binance and Bybit. MIT license.
- **Zod 3.x** — Runtime validation for all API inputs and WebSocket messages.
- **Framer Motion 11** — Already in stack; used for price ticker animations, staggered list reveals, button micro-interactions.

### Expected Features

**Summary:** The MVP must deliver a complete trading loop: deposit credits, view balances, place market/limit orders, see order book depth, and review filled trades. Everything beyond that is polish. The feature set is deliberately narrow — CoinXI competes on execution quality, not feature breadth.

**Must have (table stakes):**
- User registration/login with JWT — identity is required for all wallet and order features
- Wallet / balance view — total, in-orders, available breakdown per asset
- Deposit credits (admin-grant) — seeds the economy; simple ledger entry
- Live price display — current bid/ask for selected trading pair; simulated data acceptable for MVP
- Order book display — bid/ask depth table; users need to see liquidity before trading
- Market order execution — buy/sell at current price; immediate fill
- Limit order placement — place at specific price; fill when market reaches it
- Trade history — chronological list of fills with price, quantity, timestamp
- Trading pair selector — BTC, ETH, SOL pairs against credits base

**Should have (competitive/differentiators):**
- Animated price ticker — numbers morph up/down with color flash on direction change; creates "alive" feeling
- Glassmorphism UI — dark glass surfaces, gradient borders, layered surfaces; this is the Awwwards differentiator
- Portfolio P&L card — unrealized vs realized gains/losses per asset; triggers when users ask "am I winning?"
- Order cancellation — cancel pending limit orders before fill; required once users start leaving orders open
- Depth chart — visual order book liquidity as area chart; feels professional
- Staggered list animations — every list reveal is intentional; Framer Motion stagger on pair list, order book rows
- Micro-interactions — button scale on hover, glow effects, ripple on click; every click should feel premium

**Defer (v2+):**
- Candlestick chart — requires historical OHLCV data pipeline; heavy charting lib. Animated price ticker covers MVP charting needs.
- Stop-loss / take-profit orders — conditional order engine with separate state machine. Limit orders cover 90% of trades.
- Notifications / price alerts — notification infrastructure complexity; users are on the app anyway
- Withdrawal of credits to other users — double-spend risk, requires balance locking. Admin grants only for MVP.
- Real-time WebSocket feed (replace polling) — polling every 2-5s is acceptable for demo. WebSocket adds infra complexity not justified for friends exchange.
- Multi-timeframe charts — same dependency chain as candlestick chart

### Architecture Approach

**Summary:** A clean monolith appropriate for 0-100 users on a single server. The architecture is built around three core services: the Matching Engine (price-time priority order matching, in-memory), the Wallet Service (credits ledger with double-entry pattern), and the Market Data Service (order book snapshots and trade feeds via Redis pub/sub). All balance mutations happen inside Prisma transactions with `SELECT FOR UPDATE` row locking. The frontend communicates via REST for commands (place order, cancel) and Socket.IO for state updates (price changes, order fills). No external integrations at MVP — prices are simulated internally.

**Major components:**
1. **Matching Engine** — In-memory price-time priority order book. Processes market and limit orders, generates trades, emits events. Handles partial fills (one large order fills against multiple small orders). This is the core domain logic and must be built with test coverage from day one.
2. **Wallet Service** — Credits ledger. Every balance change creates a ledger entry (deposit, trade debit, trade credit). Never mutates a balance field directly — always read-modify-write in a transaction. Shows total/in-orders/available per asset.
3. **Market Data Service** — Manages in-memory order book state. Subscribes to matching engine events and broadcasts snapshots via Redis pub/sub. Feeds Socket.IO rooms. Also generates simulated price data for MVP.
4. **API Layer** — Express-style middleware on Next.js App Router. JWT auth, rate limiting, Zod request validation. Routes for: auth, orders, wallets, portfolio, market data.
5. **WebSocket Gateway** — Socket.IO server integrated with Next.js. Manages client subscriptions by trading pair. Broadcasts: order book updates, trade events, balance updates. Handles reconnection gracefully.
6. **Frontend State** — Zustand for trading state (current prices, order book, open orders). TanStack Query for REST data fetching with auto-refetch. React components organized by feature: trading/, portfolio/, wallet/.

### Critical Pitfalls

1. **Float arithmetic for financial calculations** — JavaScript floats cause `0.1 + 0.2 !== 0.3`. For credits balances and trade prices, accumulated rounding errors corrupt the ledger invisibly. Prevention: use decimal.js for all monetary math, store all values as decimal strings in DB, never use `parseFloat()` on balance or price data. This must be enforced at the code level — no exceptions.
2. **Race conditions in order matching** — Two concurrent orders check the same balance before either commits, both succeed, and the user double-spends. Prevention: all balance mutations inside atomic Prisma transactions with `SELECT FOR UPDATE`. Never have "check balance then deduct" as two separate operations.
3. **Order state machine bugs** — Ad-hoc SQL updates allow invalid state transitions (a cancelled order receiving a fill). Prevention: strict state machine — `PENDING -> PARTIAL_FILLED -> FILLED` and `PENDING -> CANCELLED`. Every transition is an atomic DB operation with validation. Cancelled/expired orders cannot receive new fills.
4. **Unrealistic price data assumptions** — Engine breaks on zero liquidity, extreme prices, or stale data. Prevention: validate all incoming price data before processing. Handle empty order books gracefully (show zero depth, not broken UI). Show "stale data" indicator when feed is interrupted. Test with prices at 0, negative, Infinity.
5. **Insufficient order book depth validation** — Users place large market orders that execute at terrible prices on shallow books. Prevention: calculate and display slippage estimate before order confirmation. Warn when order size exceeds X% of visible order book depth. Reject orders beyond configurable price impact threshold.

---

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Core Engine
**Rationale:** All subsequent work depends on the financial primitives being correct. If the matching engine has race conditions or the wallet ledger is imprecise, every feature built on top inherits those bugs. This is the highest-risk, highest-leverage phase.

**Delivers:** User auth (JWT), wallet service with credits ledger, matching engine (market + limit, price-time priority), Prisma schema with migrations, atomic transaction infrastructure, decimal math utilities, initial order API endpoints.

**Addresses from FEATURES.md:** User registration/login, wallet/balance view, deposit credits, market order execution, limit order placement.

**Avoids from PITFALLS.md:** Float arithmetic (decimal.js throughout), race conditions (atomic transactions + row locks), order state machine bugs (strict transitions enforced at DB level).

**Research Flags:** Standard patterns — order matching (binary heap / sorted array by price, time) and accounting ledger patterns are well-documented. Verify Prisma `$transaction` + `SELECT FOR UPDATE` syntax before implementation.

---

### Phase 2: Market Data Infrastructure
**Rationale:** The trading UI is inert without live price data. This phase establishes the real-time data pipeline: simulated price generation, order book state management, and WebSocket broadcasting. It also addresses the most dangerous price data pitfalls before users encounter them.

**Delivers:** Simulated price feed engine (random walk or sine wave for BTC/ETH/SOL pairs), in-memory order book with depth aggregation, Socket.IO integration with room subscriptions, order book snapshot broadcasts, recent trades feed.

**Uses from STACK.md:** Socket.IO 4.x, Redis 7+ pub/sub, Zustand for market state.

**Implements from ARCHITECTURE.md:** WebSocket pub/sub with room channels, order book data structure, MarketDataService component.

**Avoids from PITFALLS.md:** Unrealistic price data assumptions (zero liquidity, extreme price, stale data edge cases), WebSocket memory leaks (proper subscription cleanup), performance traps (virtualized list rendering).

**Research Flags:** Simulated price data — no external API research needed. WebSocket architecture is standard pub/sub. Redis pub/sub for Socket.IO scaling is well-documented.

---

### Phase 3: Trading UI
**Rationale:** With the engine and data layer working, the UI can be connected and tested end-to-end. This phase delivers the primary user-facing trading experience. It is where the Awwwards-tier design work begins in earnest.

**Delivers:** Order entry form (market/limit, buy/sell toggle), order book display component, recent trades ticker, trading pair selector, trade confirmation modal with slippage estimate, order status badges with animations.

**Uses from STACK.md:** Framer Motion for animations, Tailwind for glassmorphism styling.

**Implements from ARCHITECTURE.md:** OrderForm, OrderBook, RecentTrades, TradingPair React components. REST API for order placement, Socket.IO for live data.

**Avoids from PITFALLS.md:** Insufficient order book depth validation (slippage display before order confirmation), UX pitfalls (optimistic UI feedback, specific error messages for rejected orders), double-submit of orders (idempotency key or disable-on-click).

**Research Flags:** Slippage calculation formula — standard market depth calculation. Verify formula and threshold values during implementation. No external research needed.

---

### Phase 4: Portfolio + Security Layer
**Rationale:** Users need to see the full picture: where they stand, what they have traded, and that the system is secure. This phase also establishes the security infrastructure that protects the trading engine in subsequent phases.

**Delivers:** Portfolio dashboard with holdings view, P&L card (unrealized/realized gains), trade history with filters and pagination, order history with cancellation, audit log (all balance changes logged with actor + timestamp), CSRF tokens, rate limiting on order endpoints.

**Uses from STACK.md:** Recharts for P&L visualization, Zustand for portfolio state.

**Avoids from PITFALLS.md:** Security mistakes (CSRF, rate limiting, input validation, audit logs), UX pitfalls (no transaction history, confusing available vs locked balance).

**Research Flags:** Security audit checklist — verify standard practices for JWT session expiry, token rotation, rate limit thresholds during implementation. Standard patterns, not niche.

---

### Phase 5: Polish + Performance
**Rationale:** After the core loop is validated, invest in the premium experience that differentiates CoinXI. This phase makes it Awwwards-tier: cinematic animations, responsive mobile layout, depth charts, micro-interactions. Also addresses performance traps before they become visible to users.

**Delivers:** Depth chart (TradingView Lightweight Charts), mobile responsive layout (3-panel desktop -> stacked mobile), staggered list animations (Framer Motion), micro-interactions (button scale, hover glow, click ripple), animated price ticker (Framer Motion number morphing), WebSocket reconnection handling (graceful with stale indicator), order book virtualization (for >100 price levels).

**Uses from STACK.md:** Lightweight Charts for depth chart, Framer Motion throughout.

**Avoids from PITFALLS.md:** Performance traps (DOM freeze on deep order books, memory leaks from uncleaned subscriptions, slow page loads from un-paginated history).

**Research Flags:** Candlestick chart (deferred) — research TradingView Lightweight Charts React integration when approaching v2. Depth chart for v1.x is simpler (bid/ask area chart via Recharts, not full OHLCV).

---

### Phase Ordering Rationale

- **Phase 1 before everything:** The matching engine and wallet service are the foundation. No feature is meaningful without correct financial primitives. Building the UI first creates false confidence.
- **Phase 2 before Phase 3:** The trading UI is driven by live price data. You cannot test order forms or order book displays without the data pipeline running.
- **Phase 3 before Phase 4:** Portfolio and trade history are downstream of actual trades. Build the trading loop first, then show users what they have done.
- **Phase 5 last:** Polish only matters after the product works. Never polish a broken engine.
- **Grouping by data flow:** Each phase adds one layer of the stack — data model -> processing logic -> real-time data -> user interface -> polish.
- **Pitfall coverage spread across phases:** Float arithmetic and race conditions (Phase 1), price data edge cases (Phase 2), depth validation (Phase 3), security (Phase 4), performance (Phase 5).

---

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 1 (Core Engine):** Prisma `$transaction` with `SELECT FOR UPDATE` row locking — verify exact syntax and isolation level configuration for PostgreSQL. Confirm decimal.js precision API surface before committing to the pattern.
- **Phase 5 (Polish):** TradingView Lightweight Charts React integration — verify current API for v4. Recharts vs Lightweight Charts for depth chart specifically.

**Phases with standard patterns (skip dedicated research):**
- **Phase 2 (Market Data):** WebSocket pub/sub room architecture and Redis pub/sub are well-documented, standard patterns.
- **Phase 3 (Trading UI):** Order form validation, slippage calculation, optimistic UI patterns are standard frontend development.
- **Phase 4 (Portfolio/Security):** JWT auth, rate limiting, CSRF protection, audit logging — all standard security patterns.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Technologies are well-established (Next.js, PostgreSQL, Prisma, Socket.IO, Zustand). Not verified against live sources at time of research. Some version numbers (Next.js 14, Prisma 5) may have newer releases. |
| Features | MEDIUM | Domain knowledge on exchange features, validated against Binance/Bybit/Coinbase mental models. Feature priorities are sound for MVP scope. Not user-tested. |
| Architecture | MEDIUM-HIGH | Order matching (price-time priority), double-entry ledger, and WebSocket pub/sub are well-established CS/financial engineering patterns. Confidence high on fundamentals, medium on implementation specifics for this stack. |
| Pitfalls | MEDIUM | Based on training data and industry post-mortem patterns. Not verified against live exchange incident reports. All recommendations are standard practice but should be validated before treating as authoritative security guidance. |

**Overall confidence:** MEDIUM

The stack and architecture recommendations are solid and appropriate for the project scope. The primary uncertainty is that all research is based on training data without live source verification. Key areas to validate during implementation: Prisma transaction patterns, Socket.IO scaling behavior with multiple trading pairs, decimal.js precision behavior at scale.

### Gaps to Address

- **Decimal precision testing:** No research covered the specific decimal.js API surface in depth. During Phase 1, establish a shared `Decimal` utility module and write tests verifying precision across all financial operations before building the matching engine.
- **Simulated price realism:** The price feed engine has not been specified. Random walk with drift is the standard MVP approach, but mean reversion and volatility parameters need to be tuned during Phase 2 to feel realistic without external data.
- **WebSocket scaling unknown:** For a friends exchange, single-server Socket.IO will handle the load easily. If the user base grows, Redis adapter integration is well-documented but needs planning.
- **Matching engine test coverage:** The order matching engine has non-obvious edge cases (partial fills, concurrent submissions, order cancellation during fill). No research covers specific test scenarios. This must be addressed in Phase 1 implementation.

---

## Sources

### Primary (HIGH confidence)
- Prisma documentation — transaction patterns, migration workflows
- Next.js 14 App Router documentation — API routes, SSR patterns
- Socket.IO documentation — room management, reconnection

### Secondary (MEDIUM confidence)
- STACK.md — Node.js 20, PostgreSQL 15+, Prisma 5, Zustand 4.x, Lightweight Charts, Zod 3.x. Verified against training data; verify npm registry for current versions.
- ARCHITECTURE.md — Order matching algorithm (binary heap/sorted array), credits ledger double-entry pattern, WebSocket pub/sub architecture. Well-established CS patterns.
- FEATURES.md — Feature landscape validated against Binance, Bybit, Coinbase mental models. Not real-time verified.

### Tertiary (LOW confidence)
- PITFALLS.md — Exchange platform post-mortem patterns, security incident analysis. All findings from training data, not verified against live sources. Treat security recommendations (CSRF, rate limiting, audit logs) as standard practice but verify against current OWASP guidance before treating as authoritative.
- Order matching edge cases — no specific source cited. Validate against production exchange documentation (Binance matching engine docs are publicly available).

---
*Research completed: 2026-04-06*
*Ready for roadmap: yes*
