# Phase 3: Trading UI End-to-End - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Connect the complete trading user experience end-to-end — pair selector, order form, order book, recent trades, and open orders all working together as one cohesive interface. Slippage estimates use live data. Post-order state refreshes automatically. Phase 3 does NOT add new pages, new components, or new API routes — it wires existing pieces together correctly.

**Does NOT include:** Portfolio P&L dashboard (Phase 4), mobile responsive layout (Phase 5), charts (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Slippage Data Source
- **D-01:** OrderForm receives `bids` and `asks` as props from the trade page (passed down from `useOrderBook`). The `fetchSlippage()` function uses these props directly — no REST call to `/api/market`. This eliminates the round-trip latency and stale data problem.
- **D-02:** OrderForm signature change: add `bids?: BookLevel[]` and `asks?: BookLevel[]` optional props. If both are present, use them. If absent (e.g., rendered outside trade page), fall back to the existing REST fetch.

### Post-Order Refresh
- **D-03:** After a successful order submission, the trade page calls a refresh callback to reload wallet balance and trigger OpenOrders to re-fetch. Use a simple `onOrderPlaced` callback prop on OrderForm, which the trade page handles by re-fetching wallet and incrementing a `refreshKey` state that OpenOrders subscribes to via `key` prop or `useEffect` dependency.

### Open Orders Live Update
- **D-04:** OpenOrders re-fetches when `refreshKey` changes (triggered by `onOrderPlaced`) AND re-fetches every 5 seconds via `setInterval` in a `useEffect`. The 5s auto-refresh covers order status changes (partial fills, auto-fills) without overloading the REST API.

### Claude's Discretion
- Exact `refreshKey` implementation (state counter vs Date.now() vs toggle)
- Whether to show a loading skeleton while OpenOrders is refreshing
- Animation for newly appearing orders in OpenOrders list
- Error handling for failed order placement (current behavior kept)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 3 requirements
- `.planning/REQUIREMENTS.md` — MKT-01 through MKT-05, LMT-01 through LMT-06, UI-04 acceptance criteria
- `.planning/ROADMAP.md` Phase 3 section — Success criteria 1-5

### Existing components to wire
- `coinxi/src/app/(main)/trade/page.tsx` — Trade page, already uses useOrderBook + hooks. This is the main integration point.
- `coinxi/src/components/OrderForm.tsx` — fetchSlippage() uses REST now. Phase 3 replaces with props.
- `coinxi/src/components/OpenOrders.tsx` — Polls once on mount. Phase 3 adds 5s interval + refresh-on-order.
- `coinxi/src/hooks/useOrderBook.ts` — Returns bids/asks/bidsDiff/asksDiff. Trade page already calls this; Phase 3 passes bids/asks down to OrderForm.

### Types
- `coinxi/src/types/socket.ts` — BookLevel interface `{ price: string; quantity: string }`. OrderForm props use this type.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useOrderBook(pairId)` — Already called in trade page, returns `{ bids, asks, bidsDiff, asksDiff }`. Phase 3 passes `bids` and `asks` into `<OrderForm>`.
- `OrderForm.fetchSlippage()` — Existing slippage walk-the-book logic is correct. Only the data source changes (props instead of REST fetch). The algorithm itself stays.
- `apiFetch` — Still needed for wallet balance fetch and order submission. Only the slippage fetch is replaced.
- `OpenOrders.loadOrders()` — Already a callable async function. Phase 3 triggers it via refreshKey dependency.

### Established Patterns
- Props-down for data: trade page owns Socket.IO hooks and passes data into child components (already done with OrderBookTable and RecentTrades)
- `useCallback` + `useEffect` for refresh: OpenOrders already wraps loadOrders in useCallback — adding a dependency is clean
- Framer Motion spring animations (stiffness: 400, damping: 30) — match Phase 1 Button patterns for any new animations

### Integration Points
- `coinxi/src/app/(main)/trade/page.tsx`: Pass `bids={bids}` and `asks={asks}` to `<OrderForm>`. Add `onOrderPlaced` callback that refreshes wallet and bumps refreshKey.
- `coinxi/src/components/OrderForm.tsx`: Accept `bids?` and `asks?` props of type `BookLevel[]`. In `fetchSlippage()`, prefer props over REST.
- `coinxi/src/components/OpenOrders.tsx`: Accept `refreshKey?: number` prop. Add it to `loadOrders` useEffect dependency array. Add 5s setInterval for auto-refresh.

</code_context>

<specifics>
## Specific Ideas

- BookLevel type is already defined in `coinxi/src/types/socket.ts` — reuse it for OrderForm props (no new types needed)
- The slippage walk-the-book algorithm in OrderForm is already correct — only swap the data source
- 5 second auto-refresh for OpenOrders is a good balance: fast enough to show order status changes, slow enough not to hammer SQLite

</specifics>

<deferred>
## Deferred Ideas

- Real-time push for order fills via Socket.IO (instead of polling) — Phase 4 or separate
- Optimistic UI for order placement (show order immediately before server confirms) — Phase 5
- Mobile-responsive trade layout — Phase 5

</deferred>

---

*Phase: 03-trading-ui-end-to-end*
*Context gathered: 2026-04-08*
