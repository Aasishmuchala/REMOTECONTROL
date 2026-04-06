# Pitfalls Research

**Domain:** Crypto-Fiat Exchange Platform (Credits-Only)
**Researched:** 2026-04-06
**Confidence:** MEDIUM (training data, not verified via live sources)

## Executive Summary

Building a crypto exchange is one of the most complex web application categories. The combination of financial integrity requirements, real-time data flows, security sensitivity, and user trust expectations creates a landscape where small mistakes compound quickly. For a credits-only friends exchange, many production-grade pitfalls still apply -- the code you write today will form the foundation of any future financial system. The key categories of risk are: financial integrity (balances, orders, trades), real-time data handling, security, and UX that hides or creates critical gaps.

---

## Critical Pitfalls

### Pitfall 1: Float Arithmetic for Financial Calculations

**What goes wrong:**
Balances become fractional -- a user has 0.00000001 fewer credits than they should, or a trade executes at a slightly wrong price. Over thousands of trades, the ledger becomes inconsistent.

**Why it happens:**
JavaScript's floating-point arithmetic (`0.1 + 0.2 !== 0.3`) is inappropriate for financial math. Developers use plain numbers for credit balances and trade prices. For a demo platform this seems fine until accumulated rounding errors corrupt the ledger.

**How to avoid:**
- Use integer arithmetic for all monetary values -- store credits as the smallest unit (e.g., raw credits, like satoshis)
- All calculations in integer math; convert to display format only at the UI layer
- Use `decimal.js` or `bignumber.js` for any intermediate calculations requiring precision
- Never store or compute prices as floats

**Warning signs:**
- Any `parseFloat()` on balance or price data
- Floating-point literals in order matching logic
- Division operations on monetary values without rounding strategy

**Phase to address:**
Core Engine (Phase 1) -- financial math foundation

---

### Pitfall 2: Race Conditions in Order Matching

**What goes wrong:**
Two orders execute against the same available balance simultaneously, creating double-spends. User executes a buy order and a sell order at the same time -- both check the same balance before either commits, and both succeed when only one should.

**Why it happens:**
Asynchronous order processing with no transaction isolation. Without atomic transactions or proper locking, concurrent orders can read the same balance state and both proceed.

**How to avoid:**
- All balance-mutating operations in atomic transactions with proper isolation levels
- Use database transactions with row-level locks (`SELECT FOR UPDATE`) for order matching
- Process orders in a queue with single-threaded matching, or use optimistic locking with version fields
- Never have "check balance then deduct" as two separate operations

**Warning signs:**
- Orders processed via async handlers without transactional wrapping
- Separate queries for balance check vs balance update
- No retry or conflict resolution logic for concurrent order submissions

**Phase to address:**
Core Engine (Phase 1) -- trading engine foundation

---

### Pitfall 3: Order State Machine Bugs

**What goes wrong:**
An order gets "lost" between states -- it shows as pending but never fills, or shows as filled but the funds never moved. Users see phantom balances. Cancelled orders still execute partially.

**Why it happens:**
Orders are updated via ad-hoc SQL updates instead of a well-defined state machine. Transitions like `pending -> partial_fill -> filled` or `pending -> cancelled` are not enforced, allowing invalid state jumps (e.g., a cancelled order receiving a fill).

**How to avoid:**
- Implement a strict order state machine: `PENDING -> PARTIAL_FILLED -> FILLED` and `PENDING -> CANCELLED -> CANCELLED`
- Transitions are atomic database operations, not application-level updates
- Every state transition is logged with timestamp and actor
- Cancelled/expired orders cannot receive new fills
- Partial fills track remaining quantity explicitly

**Warning signs:**
- Orders updated with raw SQL `UPDATE orders SET ...` without state validation
- No visibility into which orders are stuck in intermediate states
- No automated cleanup for stale pending orders

**Phase to address:**
Core Engine (Phase 1) -- trading engine

---

### Pitfall 4: Unrealistic Price Data Assumptions

**What goes wrong:**
The trading engine breaks when prices move rapidly, extreme values arrive, or the order book is empty. UI shows NaN, Infinity, or just breaks. Trading halts with no graceful degradation.

**Why it happens:**
Developers build against stable market conditions and never test edge cases: zero liquidity, price spikes 100x, stale data, missing tickers.

**How to avoid:**
- Validate all incoming price data before processing (reject null, negative, extreme values)
- Handle empty order books gracefully -- display zero depth, not broken UI
- Use price circuit breakers: halt trading on a pair if price moves >X% in Y seconds
- Show last known price with "stale data" indicator when feed is interrupted
- Test with artificially injected extreme values (prices at 0, negative, Infinity)

**Warning signs:**
- No validation on price feed data before storage or display
- Division by current price without zero-check
- No price freshness indicators in the UI

**Phase to address:**
Market Data (Phase 2) -- real-time data infrastructure

---

### Pitfall 5: Insufficient Order Book Depth Validation

**What goes wrong:**
Users place large limit orders that cannot fill, or market orders that execute at terrible prices due to shallow order books. In a credits-only system, this misleads users about what real trading would feel like.

**Why it happens:**
No slippage estimation before order submission. No warning when order size exceeds X% of visible order book depth. No market order depth validation.

**How to avoid:**
- Calculate and display slippage estimate before order confirmation
- Warn when market order exceeds Y% of visible order book depth
- Reject orders that would execute beyond configurable price impact threshold
- Show order book depth alongside order form -- users must see how much liquidity exists at each price level

**Warning signs:**
- No slippage calculation shown at order confirmation
- Market orders execute without depth checks
- Order book shows only top 10 levels with no aggregate depth indication

**Phase to address:**
Trading UI (Phase 3) -- order entry and confirmation

---

## Security Mistakes

These apply even to a credits-only system -- the patterns transfer to any future financial product.

| Mistake | Risk | Prevention |
|---------|------|------------|
| No CSRF protection on trading endpoints | Account takeover via embedded forms | CSRF tokens on all state-changing requests |
| Insufficient rate limiting on order submission | Brute-force trading exhaustion, DoS | Rate limit by user: X orders/minute, Y credits/minute moved |
| Storing any secrets in frontend code | API key exposure, credential theft | Never store secrets client-side; use server-side-only auth flows |
| No input sanitization on order parameters | Injection attacks via order metadata | Parameterized queries, typed validation for all inputs |
| Weak session management | Session hijacking, unauthorized trades | Short session expiry, rotate tokens, detect anomalies |
| No audit log for financial operations | Cannot trace who did what, when | Every balance change, order, and trade logged with actor + timestamp |

**Phase to address:**
Security Layer (Phase 4) -- auth and audit

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No real-time feedback on order submission | User does not know if order was accepted, pending, or failed | Optimistic UI with immediate state update + server confirmation |
| Unclear order status (pending vs filled vs cancelled) | Users do not know their money's state | Explicit status badges, state transition animations, detailed order drawer |
| No price chart or historical context for trading decisions | Users trade blind | Candlestick chart with volume, at least last 24h of data |
| Confusing wallet balance vs available balance | Users do not know how much they can actually trade | Always show: Total Balance / In Orders / Available -- three clear numbers |
| No transaction history or export | Users cannot reconcile their trades | Full trade history with filters, downloadable CSV export |
| Poor mobile order entry | Cannot trade on mobile | Full trading capability on mobile, not just a portfolio view |
| No error messages for failed orders | User does not know why order was rejected | Specific error messages: "Insufficient balance", "Price outside limits", "Market closed" |

**Phase to address:**
Trading UI (Phase 3) + Portfolio (Phase 4) -- user-facing features

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| WebSocket subscription without cleanup | Memory leaks, stale data, disconnected sockets | Always unsubscribe on component unmount; limit concurrent subscriptions | With 10+ trading pairs open simultaneously |
| Polling for market data instead of WebSocket | Stale prices, high bandwidth, rate limit hits | Use WebSocket for real-time data; polling only as fallback | With >5 simultaneous users |
| Large order book rendered as full DOM | UI freeze on deep order books | Virtualized list rendering for order book rows | With >100 price levels displayed |
| No pagination on trade history | Slow page loads, memory issues | Paginate trade history, load 50 at a time | With >1000 historical trades |
| No caching of static assets | Repeat downloads, slow reloads | Cache market metadata, trading pair configs | Always, degrades UX from the first use |

**Phase to address:**
Market Data (Phase 2) + UI Polish (Phase 5)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing prices as floats | Faster initial implementation | Ledger inconsistency over time | Never |
| Single atomic balance field for all assets | Simple schema | Cannot model multi-currency positions properly | Only in MVP with single asset |
| Synchronous order processing | Easier to debug | Blocks on slow operations, no real-time feel | Only in MVP prototype |
| No database indexes on order/user tables | Simpler schema setup | Full table scans on every trade lookup | Only in prototype, MUST fix before demo |
| Mock auth in early phases | Fast progress | Have to rewrite entire auth layer later | Only in Phase 0 prototype, must replace |
| Skip order validation middleware | Faster endpoint development | Security holes, inconsistent state | Never |

---

## "Looks Done But Isn't" Checklist

- [ ] **Order Matching:** Does the engine correctly handle the case where a single large order partially fills against multiple smaller orders? (Most implementations only handle 1:1 matching)
- [ ] **Balance Reconciliation:** Can you run a query that shows all users' total balances sum to the total credits issued? (Should equal zero at all times)
- [ ] **WebSocket Reconnection:** If the WebSocket disconnects, does the UI automatically reconnect and resync state? Or does it show stale data silently?
- [ ] **Price Data Gap:** If the price feed goes down for 5 minutes, does the system show stale prices or gracefully degrade?
- [ ] **Order Cancellation:** When a user cancels a partially-filled order, does the remaining quantity return to their available balance?
- [ ] **Simultaneous Order Submission:** If a user double-clicks the "Submit Order" button, do you get two orders or one?
- [ ] **Decimal Precision:** If a user trades 0.00000001 of an asset 10 million times, does the math stay precise? (In production, this tests your decimal handling)
- [ ] **Portfolio Calculation:** If a user holds multiple partially-filled orders across different pairs, does the portfolio dashboard correctly show available vs locked funds?

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Float arithmetic ledger corruption | HIGH | Cannot easily fix; must re-audit all historical transactions, may require ledger reset |
| Race condition double-spend | HIGH | Requires balance audit across all users, potential ledger correction, no automated fix |
| Stale order book display | LOW | Refresh data, display "last updated" timestamp, auto-reconnect WebSocket |
| Order state stuck in partial fill | MEDIUM | Scheduled job to detect stuck orders, admin interface to force-complete or cancel |
| WebSocket memory leak | MEDIUM | Server restart clears, but root cause must be fixed in client unsubscribe logic |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Float arithmetic for financial calculations | Core Engine (1) | Ledger reconciliation query returns zero discrepancy |
| Race conditions in order matching | Core Engine (1) | Concurrent order test: submit 100 orders simultaneously, verify balances correct |
| Order state machine bugs | Core Engine (1) | State transition test: verify no invalid transitions are possible |
| Unrealistic price data assumptions | Market Data (2) | Edge case test: zero liquidity, extreme prices, stale data |
| Insufficient order book depth validation | Trading UI (3) | UX test: verify slippage warning appears for large orders |
| Security mistakes | Security Layer (4) | Security audit: rate limiting, CSRF, input validation, audit logs |
| UX pitfalls | Trading UI (3) + Portfolio (4) | User testing: can a new user complete a full trade flow without confusion? |
| Performance traps | Market Data (2) + UI Polish (5) | Load test: 10 concurrent users trading simultaneously, monitor memory and latency |

---

## Sources

- [LOW confidence] Exchange platform post-mortems -- common industry patterns from trading system literature
- [LOW confidence] Known exchange security incidents -- pattern analysis of documented failures
- [LOW confidence] Trading engine architecture patterns -- established practices from exchange infrastructure engineering
- [No verification] -- No live web sources were accessible at time of research. All findings are from training data and should be verified against official documentation or expert review before acting on security-specific recommendations.

---

*Pitfalls research for: CoinXI crypto-fiat exchange*
*Researched: 2026-04-06*