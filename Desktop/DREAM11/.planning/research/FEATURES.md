# Feature Research

**Domain:** Crypto-Fiat Exchange (Credits-Only, Friends Trading)
**Researched:** 2026-04-06
**Confidence:** MEDIUM (domain knowledge, not real-time verified)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels broken or fake.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Spot trading (market orders) | Core exchange function — "can I buy/sell crypto?" | MEDIUM | Matching engine, order execution, balance deduction |
| Limit orders | Standard trading — "I want to buy at a specific price" | MEDIUM | Price-time priority matching, order book insertion |
| Order book display | Trading literacy — users need to see depth and liquidity | MEDIUM | Bid/ask columns, quantity, cumulative depth |
| Wallet / balance view | "Where is my money?" — users need to see their credits | LOW | Per-asset balance, total portfolio value in credits |
| Deposit credits | Seed the economy — users need starting balance | LOW | Admin-granted or self-credit; simple number update |
| Trade history | Accountability — "did my order fill?" | LOW | Filled orders with price, quantity, timestamp |
| Live price display | Realism — prices that don't move feel fake | LOW | Poll or WebSocket price feed; can be simulated |
| Trading pair selector | "What can I trade?" — BTC, ETH, SOL pairs | LOW | Dropdown or tab-based pair list |
| Buy / Sell toggle | Trading fundamentals — direction matters | LOW | Changes form behavior, affects order type |
| User registration / login | Identity — who is trading? | LOW | Email/password or social auth; session management |

### Differentiators (Competitive Advantage)

Features that set the product apart. Aligned with CoinXI's Awwwards-tier design vision.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Animated price tickers | "This feels alive" — price numbers that count up/down | LOW | Framer Motion number morphing, color flash on direction |
| Depth chart | Visualize order book liquidity — feels professional | MEDIUM | Bid/ask depth as area chart; hover tooltips |
| Candlestick chart | Serious traders need OHLCV — not just current price | HIGH | Requires historical candle data; lightweight-lib chart |
| Portfolio P&L card | "Am I winning?" — unrealized vs realized P&L | MEDIUM | Mark-to-market per asset; daily/weekly change |
| Glassmorphism UI | Cinematic luxury — sets Awwwards-tier apart | LOW-MED | CSS backdrop-blur, gradient borders, layered surfaces |
| Staggered list animations | Polish premium feel — every list feels intentional | LOW | Framer Motion stagger on pair list, order book rows |
| Micro-interactions on buttons | Delight at every click — hover states, press feedback | LOW | Button scale, glow on hover, ripple on click |
| Mobile responsive layout | "I might check from phone" — responsive trading desk | MEDIUM | 3-panel desktop → stacked mobile; touch-friendly targets |
| Trade confirmation modal | Friction with confidence — user knows exactly what they ordered | LOW | Shows estimated fill, fees, balance impact before submit |
| Multi-crypto wallet view | Breadth — show all holdings in one scrollable card | LOW | Per-asset row: symbol, balance, USD-equivalent, 24h change |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for a credits-only demo exchange.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Margin / leverage trading | "Real exchanges have this" | Risk modeling, liquidation engine, complexity explosion | Skip for MVP; credits are not real collateral |
| Stop-loss / take-profit orders | "Serious traders need these" | Requires conditional order engine, order state machine | Limit orders are sufficient for MVP; add later |
| Fiat on/off ramp | "How do I get credits?" | Payment processor integration, KYC, regulatory surface | Admin credit grants; simple and scoped |
| Real-time WebSocket feed | "Feels more real" | Server infrastructure, connection management, reconnect logic | Polling (every 2-5s) is fine for a demo; add WS post-MVP |
| Advanced order types (OCO, trailing stop) | "Binance has them" | UI complexity, multiple order state machines | Market + limit covers 90% of trades |
| P2P trading / chat | "Friends want to chat" | Real-time messaging infra, moderation, scope explosion | Internal order book is more fun; skip P2P |
| Real KYC / identity verification | "Realism" | Document upload, compliance review, data privacy | Simulated KYC: one-click "verify" button |
| External exchange API integration | "Real prices!" | Rate limiting, API keys, data consistency | Simulated market data; internal price engine |
| Multiple order books per user | "I want to manage pending orders" | UI state, cancellation UX | Single "My Orders" tab with cancel button is enough |
| Notifications / alerts | "I want to know when price hits X" | Notification infrastructure, permission prompts | Skip; users are on the app anyway |

---

## Feature Dependencies

```
[User Auth]
    └──required──> [Wallet / Balance View]
                          └──required──> [Deposit Credits]

[Live Price Feed]
    └──required──> [Order Book Display]
                          └──required──> [Market Order Execution]
                          └──required──> [Limit Order Placement]

[Market Order Execution]
    └──required──> [Trade History]

[Wallet / Balance View]
    └──enhances──> [Portfolio P&L Card]

[Candlestick Chart]
    └──requires──> [Historical OHLCV Data]

[Limit Order Placement]
    └──required──> [Order Book Display]

[Animated Price Ticker]
    └──enhances──> [Live Price Feed]

[Glassmorphism UI] ──independent──> [All features] (design layer, not functional)
```

### Dependency Notes

- **User Auth requires Wallet/Balance:** You cannot have a portfolio without an identity.
- **Live Price Feed requires Order Book Display:** The order book is a direct function of current bid/ask prices.
- **Market Order Execution requires Trade History:** Every fill needs to be recorded and visible.
- **Wallet/Balance View enhances Portfolio P&L Card:** P&L is meaningless without knowing starting positions (or it can be derived from transaction history).
- **Candlestick Chart requires Historical OHLCV Data:** Needs a historical data pipeline, which is non-trivial for an MVP.
- **Glassmorphism UI is independent:** This is a design layer applied everywhere, not a functional dependency.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept with friends.

- [ ] **User registration / login** — Identity for all subsequent features. LOW complexity.
- [ ] **Deposit credits** — Admin-grants credits to user wallet. LOW complexity.
- [ ] **Wallet / balance view** — See credits and crypto holdings per asset. LOW complexity.
- [ ] **Trading pair selector** — At minimum: BTC, ETH, SOL pairs against a credits base. LOW complexity.
- [ ] **Live price display** — Current bid/ask shown for selected pair. LOW complexity (simulated or polled).
- [ ] **Order book display** — Bid/ask depth table for selected pair. MEDIUM complexity.
- [ ] **Market order execution** — Buy/sell at current market price, fill immediately. MEDIUM complexity.
- [ ] **Limit order placement** — Place order at specific price, fill when market reaches it. MEDIUM complexity.
- [ ] **Trade history** — Chronological list of all filled orders. LOW complexity.
- [ ] **Animated price ticker** — Numbers animate on price change. LOW complexity.
- [ ] **Glassmorphism UI** — Dark glass surfaces, refined shadows throughout. LOW-MED complexity.

### Add After Validation (v1.x)

Features to add once core trading loop is working.

- [ ] **Portfolio P&L card** — Unrealized gains/losses per asset, total portfolio change. Trigger: users ask "am I winning?"
- [ ] **Limit order cancellation** — Cancel pending limit orders before fill. Trigger: users start leaving orders open.
- [ ] **Depth chart** — Visual order book depth. Trigger: users want to assess liquidity visually.
- [ ] **Mobile responsive layout** — Full trading experience on mobile. Trigger: users access from phone.
- [ ] **Simulated KYC flow** — One-click verify button with onboarding screens. Trigger: users want "complete" profiles.
- [ ] **Staggered list animations** — Polish on order book rows and pair list. Trigger: UI feels static.
- [ ] **Micro-interactions on buttons** — Press states, hover glows. Trigger: UI feels unfinished.

### Future Consideration (v2+)

Features to defer until product-market fit and core loop validated.

- [ ] **Candlestick chart** — OHLCV chart with timeframe selector. Why defer: requires historical data pipeline, heavier charting lib.
- [ ] **Stop-loss / take-profit** — Conditional order execution. Why defer: order state machine complexity.
- [ ] **Multi-timeframe chart** — 1m, 5m, 1h, 1d candles. Why defer: same as candlestick chart.
- [ ] **Notifications / price alerts** — Push or in-app alerts. Why defer: infrastructure complexity.
- [ ] **Withdrawal of credits** — Transfer credits out to another user. Why defer: double-spend risk, balance locking.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User registration / login | HIGH | LOW | P1 |
| Deposit credits | HIGH | LOW | P1 |
| Wallet / balance view | HIGH | LOW | P1 |
| Trading pair selector | HIGH | LOW | P1 |
| Live price display | HIGH | LOW | P1 |
| Order book display | HIGH | MEDIUM | P1 |
| Market order execution | HIGH | MEDIUM | P1 |
| Limit order placement | HIGH | MEDIUM | P1 |
| Trade history | HIGH | LOW | P1 |
| Glassmorphism UI | HIGH | MEDIUM | P1 |
| Animated price ticker | MEDIUM | LOW | P2 |
| Portfolio P&L card | MEDIUM | MEDIUM | P2 |
| Staggered list animations | MEDIUM | LOW | P2 |
| Micro-interactions | MEDIUM | LOW | P2 |
| Mobile responsive layout | MEDIUM | MEDIUM | P2 |
| Depth chart | MEDIUM | MEDIUM | P2 |
| Limit order cancellation | MEDIUM | LOW | P2 |
| Simulated KYC flow | LOW | LOW | P3 |
| Candlestick chart | MEDIUM | HIGH | P3 |
| Stop-loss / take-profit | MEDIUM | HIGH | P3 |
| Notifications / alerts | LOW | MEDIUM | P3 |
| Withdrawal of credits | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible (post-core)
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Binance | Bybit | CoinXE (CoinXI approach) |
|---------|---------|-------|--------------------------|
| Order types | Market, Limit, Stop-Limit, OCO, Trailing | Market, Limit, Conditional | Market, Limit (MVP); Stop/TP later |
| Order book | Full depth, real-time, animated | Full depth, real-time, depth chart | Order book display (v1), depth chart (v1.x) |
| Charts | TradingView candlestick, 100+ indicators | TradingView, 80+ indicators | Candlestick deferred; animated price ticker MVP |
| Wallet | Multi-asset, deposit/withdraw, internal transfer | Multi-asset, unified trading account | Wallet/balance view + deposit credits (credits-only) |
| Portfolio | Holdings + P&L, asset allocation chart | Portfolio, realized/unrealized P&L | Holdings view + P&L card (v1.x) |
| KYC | Tiered KYC required for withdrawals | Tiered KYC required | Simulated KYC button (credits-only, no real compliance) |
| Mobile UX | Full trading app | Full trading app | Mobile responsive layout (deferred) |
| UI tier | Functional | Functional + polished | Awwwards-tier glassmorphism (core differentiator) |
| Real-time | WebSocket streams | WebSocket streams | Polling every 2-5s (MVP); WebSocket later |
| Price feed | Real market data | Real market data | Simulated market data (credits-only, no API needed) |

### Key Takeaway
CoinXI competes on **design and polish**, not on features breadth. Where Binance and Bybit are feature-complete, CoinXI should be **feature-sufficient** with extraordinary execution quality. The MVP covers 80% of trading utility with 20% of the feature effort, leaving room to perfect the UI layer.

---

## Sources

- **CoinXI PROJECT.md** — Project scope, design direction, out-of-scope items
- **Domain knowledge** — Crypto exchange architecture (Coinbase Pro, Binance, Kraken docs), trading engine patterns (level-order book, price-time priority), wallet/accounting models
- **Training data caveat:** Sources not real-time verified. Recommend validation against current Binance/Bybit exchange docs before finalizing order execution logic.

---
*Feature research for: CoinXI crypto-fiat exchange MVP*
*Researched: 2026-04-06*
