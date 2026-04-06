# Requirements: CoinXI

**Defined:** 2026-04-06
**Core Value:** A beautifully designed, fully functional crypto exchange that demonstrates world-class product craft — every pixel, every interaction, every flow is polished. Credits-only means zero financial risk while enabling complete exchange functionality.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in with email and password
- [ ] **AUTH-03**: User session persists across browser refresh (JWT)
- [ ] **AUTH-04**: User can log out
- [ ] **AUTH-05**: All protected API routes reject unauthenticated requests

### Wallet & Credits

- [ ] **WAL-01**: User can view wallet balance for each asset (credits + supported crypto)
- [ ] **WAL-02**: User can view available balance vs balance locked in open orders
- [ ] **WAL-03**: User can deposit credits (admin-granted via seed)
- [ ] **WAL-04**: User cannot spend more credits than available balance
- [ ] **WAL-05**: All monetary values use decimal.js precision (no floating-point math)

### Trading Pairs

- [ ] **PAIR-01**: System supports BTC, ETH, and SOL trading pairs against credits base
- [ ] **PAIR-02**: User can select active trading pair from pair list
- [ ] **PAIR-03**: User can view current bid/ask prices for selected pair

### Order Book

- [ ] **BOOK-01**: User can view live order book for selected trading pair
- [ ] **BOOK-02**: Order book shows top 20 bid levels (price + quantity)
- [ ] **BOOK-03**: Order book shows top 20 ask levels (price + quantity)
- [ ] **BOOK-04**: Order book updates in real-time (WebSocket or polling)
- [ ] **BOOK-05**: User can view recent trades for selected pair

### Market Orders

- [ ] **MKT-01**: User can place a market buy order at current price
- [ ] **MKT-02**: User can place a market sell order at current price
- [ ] **MKT-03**: Market orders fill immediately at best available price(s)
- [ ] **MKT-04**: Partial fills are supported (one large order fills against multiple orders)
- [ ] **MKT-05**: User receives immediate confirmation with fill details

### Limit Orders

- [ ] **LMT-01**: User can place a limit buy order at a specific price
- [ ] **LMT-02**: User can place a limit sell order at a specific price
- [ ] **LMT-03**: Limit orders fill when market price reaches order price
- [ ] **LMT-04**: User can cancel a pending limit order
- [ ] **LMT-05**: Cancelled orders return locked funds to available balance
- [ ] **LMT-06**: Order price validation rejects negative, zero, or extreme prices

### Trade History

- [ ] **HIST-01**: User can view personal trade history (fills they participated in)
- [ ] **HIST-02**: Trade history shows price, quantity, pair, side, and timestamp
- [ ] **HIST-03**: Trade history is paginated (50 trades per page)

### Portfolio

- [ ] **PORT-01**: User can view portfolio dashboard with all holdings
- [ ] **PORT-02**: Portfolio shows per-asset balance and estimated value in credits
- [ ] **PORT-03**: Portfolio shows unrealized P&L per asset (vs starting balance)
- [ ] **PORT-04**: User can view open orders with status (pending/partial/filled/cancelled)

### UI / Design

- [ ] **UI-01**: App uses dark glassmorphism design (glass surfaces, subtle glows)
- [ ] **UI-02**: App uses electric cyan (#00d4ff) as primary accent color
- [ ] **UI-03**: Price changes animate smoothly (Framer Motion number morphing)
- [ ] **UI-04**: Order form shows slippage estimate before confirmation
- [ ] **UI-05**: Order book rows animate on insert/update
- [ ] **UI-06**: Buttons have hover glow and press feedback micro-interactions
- [ ] **UI-07**: App is mobile-responsive (stacked layout on small screens)

## v2 Requirements

Deferred for future release.

### Advanced Orders

- **ADV-01**: User can place stop-loss orders
- **ADV-02**: User can place take-profit orders
- **ADV-03**: User can place OCO (one-cancels-other) orders

### Charts

- **CHRT-01**: User can view candlestick chart for selected trading pair
- **CHRT-02**: User can switch between timeframes (1m, 5m, 1h, 1d)
- **CHRT-03**: User can view depth chart (visual order book liquidity)

### Notifications

- **NOTF-01**: User receives in-app notifications for order fills
- **NOTF-02**: User receives notifications when price crosses threshold

### Social

- **SOCL-01**: User can transfer credits to another user
- **SOCL-02**: User can view other users' public profiles

### KYC

- **KYC-01**: User can complete simulated KYC flow
- **KYC-02**: KYC status is displayed on user profile

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Real money / actual financial transactions | Core constraint — credits only |
| Fiat on/off ramps | No real money, no need for fiat conversion |
| External exchange API integrations | Simulated prices; no external data feeds needed |
| Margin / leverage trading | Complexity explosion; requires risk modeling |
| Real KYC with document upload | Simulated KYC only; no compliance requirements |
| Institutional trading terminal | Friends exchange, not institutional |
| Real-time WebSocket feed (MVP) | Polling every 2-5s acceptable for demo; WebSocket post-MVP |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| WAL-01 | Phase 1 | Pending |
| WAL-02 | Phase 1 | Pending |
| WAL-03 | Phase 1 | Pending |
| WAL-04 | Phase 1 | Pending |
| WAL-05 | Phase 1 | Pending |
| PAIR-01 | Phase 1 | Pending |
| PAIR-02 | Phase 1 | Pending |
| PAIR-03 | Phase 1 | Pending |
| MKT-01 | Phase 1 | Pending |
| MKT-02 | Phase 1 | Pending |
| MKT-03 | Phase 1 | Pending |
| MKT-04 | Phase 1 | Pending |
| MKT-05 | Phase 1 | Pending |
| LMT-01 | Phase 1 | Pending |
| LMT-02 | Phase 1 | Pending |
| LMT-03 | Phase 1 | Pending |
| LMT-04 | Phase 1 | Pending |
| LMT-05 | Phase 1 | Pending |
| LMT-06 | Phase 1 | Pending |
| HIST-01 | Phase 1 | Pending |
| HIST-02 | Phase 1 | Pending |
| HIST-03 | Phase 1 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 1 | Pending |
| UI-04 | Phase 1 | Pending |
| UI-06 | Phase 1 | Pending |
| BOOK-01 | Phase 2 | Pending |
| BOOK-02 | Phase 2 | Pending |
| BOOK-03 | Phase 2 | Pending |
| BOOK-04 | Phase 2 | Pending |
| BOOK-05 | Phase 2 | Pending |
| UI-05 | Phase 2 | Pending |
| PORT-01 | Phase 4 | Pending |
| PORT-02 | Phase 4 | Pending |
| PORT-03 | Phase 4 | Pending |
| PORT-04 | Phase 4 | Pending |
| UI-07 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after roadmap creation*
