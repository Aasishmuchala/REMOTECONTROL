# Roadmap: CoinXI

## Overview

CoinXI v1.0 delivers a fully functional credits-only crypto-fiat exchange with Awwwards-tier UI. The journey progresses from foundational financial primitives (matching engine, wallet ledger, atomic transactions) through real-time market data infrastructure, complete trading UI connection, portfolio analytics, and finally premium mobile polish. Every phase builds on the guarantees established in the one before it — the matching engine must be correct before the UI connects to it, and the trading loop must work before users see their portfolio.

**Phase order rationale:**
- Phase 1 before everything: financial integrity (decimal.js, atomic transactions, order state machine) is the foundation every other feature depends on.
- Phase 2 before Phase 3: live price data is required to test and display order book depth and slippage estimates.
- Phase 3 before Phase 4: portfolio and trade history are downstream of actual trades.
- Phase 5 last: polish only matters after the product works.

## Phases

- [ ] **Phase 1: Core Engine** - Financial primitives: auth, wallet ledger, matching engine, decimal math, Drizzle/SQLite schema, order APIs, UI foundation
- [ ] **Phase 2: Market Data & Real-Time** - Simulated price feed, order book state, real-time broadcasts, recent trades
- [ ] **Phase 3: Trading UI End-to-End** - Connect all trading components, confirmation flows, depth validation UX, slippage display
- [ ] **Phase 4: Portfolio & Analytics** - Holdings dashboard, unrealized/realized P&L, open orders view, trade history
- [ ] **Phase 5: Polish & Mobile** - Mobile-responsive layout, cinematic animations, micro-interactions, depth chart

## Phase Details

### Phase 1: Core Engine

**Goal**: Complete financial infrastructure — user auth, credits wallet with double-entry ledger, price-time priority matching engine for market and limit orders, all with atomic transactions and decimal.js precision throughout. Dark glassmorphism UI with electric cyan accent, trading interface, and full exchange navigation.

**Depends on**: Nothing (first phase)

**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, WAL-01, WAL-02, WAL-03, WAL-04, WAL-05, PAIR-01, PAIR-02, PAIR-03, MKT-01, MKT-02, MKT-03, MKT-04, MKT-05, LMT-01, LMT-02, LMT-03, LMT-04, LMT-05, LMT-06, HIST-01, HIST-02, HIST-03, UI-01, UI-02, UI-03, UI-04, UI-06

**Success Criteria** (what must be TRUE):

  1. User can sign up with username/password, log in, and remain authenticated across browser refreshes
  2. User can view wallet balances showing total, available, and locked (in orders) for each asset
  3. User can deposit credits (admin-granted) and those credits immediately appear in their available balance
  4. User cannot place an order costing more than their available balance — the order is rejected with a clear error
  5. User can place a market buy or sell order and receive immediate fill confirmation with price, quantity, and total cost
  6. User can place a limit buy or sell order at a specific price; the order is stored and locked funds are deducted from available balance
  7. Limit orders fill automatically when market price reaches the order price; partial fills are supported
  8. User can cancel a pending limit order and locked funds are returned to available balance within the same operation
  9. All monetary values — prices, quantities, totals, balances — are stored and calculated using decimal.js with no floating-point rounding errors
  10. Every balance mutation (deposit, order lock, fill, cancel) is handled by the tested lib functions operating on WAL-mode SQLite — no concurrent writes corrupt balances
  11. Order prices are validated: negative, zero, and extreme prices are rejected before processing
  12. App displays dark glassmorphism UI with electric cyan (#00d4ff) accent, smooth price animations, and button micro-interactions

**Plans**: 6 plans in 3 waves

Plans:
- [ ] 01-01-PLAN.md — Backend: getTradeHistory + db DDL + seed + proxy.ts + 7 API routes
- [ ] 01-02-PLAN.md — UI Foundation: globals.css + GlassCard + Button + Input + ExchangeNav
- [ ] 01-03-PLAN.md — Trading UI: OrderForm + PriceTicker + TradingPairSelector
- [ ] 01-04-PLAN.md — Portfolio UI: PortfolioSummary + TradeHistory + OpenOrders
- [ ] 01-05-PLAN.md — Pages + routing: /trade, /portfolio, /history + remove cricket routes
- [ ] 01-06-PLAN.md — Auth pages + main layout wire-up

---

### Phase 2: Market Data & Real-Time

**Goal**: Establish the real-time data pipeline — simulated price generation for BTC/ETH/SOL pairs, in-memory order book with bid/ask aggregation, Socket.IO room-based broadcasting to connected clients.

**Depends on**: Phase 1

**Requirements**: BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, UI-05

**Success Criteria** (what must be TRUE):

  1. User can view a live order book for the selected trading pair showing top 20 bid levels (price + quantity) and top 20 ask levels
  2. Order book updates in real-time — when a trade executes, bid/ask levels refresh to reflect new market depth
  3. User can view recent trades (last 50) for the selected pair with price, quantity, side, and timestamp
  4. Price ticker updates continuously with simulated price movements (BTC/ETH/SOL against credits)
  5. Order book rows animate on insert and update using Framer Motion — new levels slide in, updated levels flash

**Plans**: TBD

---

### Phase 3: Trading UI End-to-End

**Goal**: Connect the complete trading user experience end-to-end — pair selector, order entry form, order book, recent trades, and confirmation flows working together as one cohesive trading interface.

**Depends on**: Phase 2

**Requirements**: (Integration and UX — trading UI components built in Phase 1, data pipeline from Phase 2)

**Success Criteria** (what must be TRUE):

  1. User can switch between BTC, ETH, and SOL trading pairs; the entire trading interface (order book, price ticker, order form) updates to reflect the selected pair
  2. User can select market or limit order type and place buy/sell orders; the order is submitted to the engine and reflected in the order book within one second
  3. Before submitting a market order, the order form displays a slippage estimate — the expected fill price impact based on current order book depth
  4. User sees a confirmation modal before market orders execute, showing estimated fill price, total cost, and a clear accept/cancel choice
  5. User sees live open orders listed in the trading interface with current status (pending/partial filled) and can cancel any pending order directly from the list

**Plans**: TBD

---

### Phase 4: Portfolio & Analytics

**Goal**: Users can see the full picture of their trading activity — all holdings with estimated values, unrealized and realized P&L, open orders with current status, and complete trade history.

**Depends on**: Phase 3

**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04

**Success Criteria** (what must be TRUE):

  1. User can view a portfolio dashboard showing all asset holdings (credits and crypto balances) with current estimated values
  2. Portfolio displays unrealized P&L per asset — the difference between current value and cost basis — updated in real-time as prices move
  3. Portfolio shows realized P&L — total gains/losses from completed trades
  4. User can view open orders tabbed by status (pending, partially filled, filled, cancelled) with order details and timestamps
  5. User can browse paginated trade history (50 trades per page) showing price, quantity, pair, side, and timestamp for every completed fill

**Plans**: TBD

---

### Phase 5: Polish & Mobile

**Goal**: Deliver the Awwwards-tier premium experience — cinematic animations, responsive mobile layout, depth chart visualization, and polished micro-interactions across every screen.

**Depends on**: Phase 4

**Requirements**: UI-07

**Success Criteria** (what must be TRUE):

  1. App renders correctly on mobile viewports (375px and up) — three-panel trading layout stacks vertically, navigation adapts, touch targets are appropriately sized
  2. App renders correctly on tablet and desktop — three-panel layout side by side with responsive breakpoints at 768px and 1024px
  3. Depth chart displays order book liquidity as a bid/ask area chart overlaid on the trading view
  4. Every interactive element (buttons, cards, inputs) has visible hover glow and press scale feedback
  5. Price ticker uses smooth number morphing (Framer Motion spring animation) — numbers count up/down fluidly when price changes

**Plans**: TBD

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Engine | 0/1 | Planned    |  |
| 2. Market Data & Real-Time | 0/TBD | Not started | - |
| 3. Trading UI End-to-End | 0/TBD | Not started | - |
| 4. Portfolio & Analytics | 0/TBD | Not started | - |
| 5. Polish & Mobile | 0/TBD | Not started | - |

## Coverage Summary

| Category | Requirements | Phase |
|----------|--------------|-------|
| Authentication | AUTH-01 to AUTH-05 | Phase 1 |
| Wallet & Credits | WAL-01 to WAL-05 | Phase 1 |
| Trading Pairs | PAIR-01 to PAIR-03 | Phase 1 |
| Market Orders | MKT-01 to MKT-05 | Phase 1 |
| Limit Orders | LMT-01 to LMT-06 | Phase 1 |
| Trade History | HIST-01 to HIST-03 | Phase 1 |
| UI Foundation | UI-01, UI-02, UI-03, UI-04, UI-06 | Phase 1 |
| Order Book | BOOK-01 to BOOK-05 | Phase 2 |
| Order Book Animations | UI-05 | Phase 2 |
| Trading UI Connect | (Phase 1 + Phase 2 integration) | Phase 3 |
| Portfolio | PORT-01 to PORT-04 | Phase 4 |
| Mobile Responsive | UI-07 | Phase 5 |

**Total: 29/29 requirements mapped across 5 phases**
