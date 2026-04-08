# Phase 3: Trading UI End-to-End - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 03-trading-ui-end-to-end
**Areas discussed:** Slippage data source

---

## Slippage Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Live bids/asks via props | Trade page passes bids/asks from useOrderBook to OrderForm as props. Zero latency, no extra API call. | ✓ |
| Keep REST call | OrderForm continues fetching /api/market on demand. Slightly stale but self-contained. | |
| Both — props with REST fallback | Use live props when available; fall back to REST if props are empty. | |

**User's choice:** Live bids/asks via props
**Notes:** Zero latency, uses data already in memory from useOrderBook hook.

---

## Claude's Discretion

- Post-order refresh mechanism (refreshKey pattern for OpenOrders)
- Open orders auto-refresh interval (decided: 5s setInterval)
- Animation for new orders appearing in OpenOrders list
- Error state handling

## Deferred Ideas

- Real-time push for order fills via Socket.IO — Phase 4 or separate
- Optimistic UI for order placement — Phase 5
- Mobile-responsive trade layout — Phase 5
