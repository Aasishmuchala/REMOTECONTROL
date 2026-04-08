# Phase 2: Market Data & Real-Time - Context

**Gathered:** 2026-04-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the real-time data pipeline — simulated price generation for BTC/ETH/SOL pairs, order book state broadcasting, recent trades feed, and animated order book UI. All clients connected to the app receive synchronized live data.

**Does NOT include:** Order placement flow changes (Phase 3), portfolio P&L (Phase 4), depth chart (Phase 5).

</domain>

<decisions>
## Implementation Decisions

### Real-Time Transport
- **D-01:** Socket.IO with a custom Next.js server (`server.ts`). Requires adding `socket.io` package and changing `dev`/`start` scripts to run the custom server.
- **D-02:** Single global broadcast to all connected clients — no rooms. Client-side filtering selects data for the currently viewed pair. No room join/leave logic needed.
- **D-03:** Server pushes `orderbook` events and `price` events every **1 second** via `setInterval`.
- **D-04:** Recent trades pushed as `trades` events alongside order book updates (same 1s interval).

### Price Simulation
- **D-05:** Server-side random walk running in the custom server process. All connected clients see the same synchronized prices simultaneously.
- **D-06:** Three independent price generators — one per pair (BTC-USDC, ETH-USDC, SOL-USDC). Each uses a random walk: `newPrice = prevPrice * (1 + (Math.random() - 0.5) * 0.002)` (0.2% max tick). Base prices: BTC ~50000, ETH ~3000, SOL ~100.
- **D-07:** Price is a `string` — use `new Decimal(price).toFixed(2)` to maintain decimal.js precision.

### Order Book State
- **D-08:** Re-query the database on each broadcast tick. Use the existing `getOrderBook(db, pairId)` from `src/lib/matching-engine.ts`. No in-memory aggregator state.
- **D-09:** Top 20 bids and top 20 asks per pair (BOOK-02, BOOK-03). Order book structure: `{ bids: [{ price, quantity }], asks: [{ price, quantity }] }`.

### Recent Trades (BOOK-05)
- **D-10:** Prepend newest trade at the top of the list. Max 50 trades shown.
- **D-11:** Each trade entry shows: price (colored green=buy, red=sell), quantity, side, and relative timestamp (e.g., "3s ago").
- **D-12:** New trades slide in at the top using Framer Motion `AnimatePresence`.

### Order Book Row Animations (UI-05)
- **D-13:** **Both** animation types:
  - **New price levels**: slide in from the side (`x: -10 → 0` for bids, `x: 10 → 0` for asks) using `AnimatePresence`.
  - **Updated quantity on existing level**: brief flash — cyan for increased quantity, red for decreased — using `animate` background transition that fades out over ~400ms.
  - **Removed levels**: fade out with `opacity: 0` and `height: 0` collapse.
- **D-14:** Track which rows are new/updated/removed by comparing previous order book state to current. Use `price` as the stable row key.

### Client React Hooks
- **D-15:** Two custom hooks:
  - `useOrderBook(pairId: string)` — returns `{ bids, asks }`, subscribes to `orderbook` socket events, filters by pairId.
  - `usePriceFeed(pairId: string)` — returns `{ price: string, direction: 'up' | 'down' | 'neutral' }`, subscribes to `price` events.
- **D-16:** A third hook `useRecentTrades(pairId: string)` returns `{ trades: Trade[] }`, subscribes to `trades` events.
- **D-17:** Each hook manages socket connection internally using `socket.io-client`. Hooks clean up the subscription on unmount.
- **D-18:** Hooks live in `src/hooks/` directory (new directory for Phase 2).

### Claude's Discretion
- Exact random walk formula parameters (can tune the 0.2% tick size)
- Socket.IO server path configuration (default `/socket.io`)
- Reconnection logic (use socket.io-client defaults)
- TypeScript types for socket events (can define in `src/types/socket.ts`)
- Whether to share a single socket instance or create per-hook (single instance preferred for efficiency)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing real-time foundation
- `coinxi/src/app/api/market/route.ts` — Existing order book REST endpoint (GET /api/market?pairId=X). Phase 2 keeps this and adds Socket.IO on top.
- `coinxi/src/lib/matching-engine.ts` — `getOrderBook(db, pairId)` function. Phase 2 calls this from the custom server to get data to broadcast.
- `coinxi/src/components/PriceTicker.tsx` — Existing price ticker with AnimatePresence + direction coloring. Phase 2 feeds it via `usePriceFeed` hook instead of static prop.

### Animation patterns
- `coinxi/src/components/Button.tsx` — Framer Motion micro-interaction patterns used in Phase 1. Reference for animation style consistency.

### Phase 2 requirements
- `.planning/REQUIREMENTS.md` BOOK-01 through BOOK-05 and UI-05 — acceptance criteria for this phase.
- `.planning/ROADMAP.md` Phase 2 section — success criteria.

### No external specs
No ADRs or design docs beyond the requirements above — decisions are fully captured in this file.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/matching-engine.ts` — `getOrderBook(db, pairId)` returns `{ bids: Order[], asks: Order[] }`. Called from the custom server's broadcast loop.
- `src/components/PriceTicker.tsx` — Already handles `direction` ('up'/'down'/'neutral') and AnimatePresence slide animation. Phase 2 drives it with `usePriceFeed` hook.
- `src/components/GlassCard.tsx` — Container for order book and trades sections.
- `src/stores/auth.ts` — `apiFetch` helper for REST calls. Custom hooks use `socket.io-client` directly (not apiFetch) for socket connections.
- `src/app/(main)/trade/page.tsx` — Main consumer of Phase 2 hooks. Currently polls `/api/market` via `useEffect`; replace with `useOrderBook` hook.

### Established Patterns
- Framer Motion `AnimatePresence mode="wait"` used in PriceTicker — use same for trades feed.
- All monetary values as `string` via `decimal.js` — price simulation must output strings.
- `decimal.js` precision: use `new Decimal(n).toFixed(2)` for USD prices.
- TypeScript strict mode — all socket event payloads need typed interfaces.

### Integration Points
- `src/app/(main)/trade/page.tsx` — Replace `useEffect` REST polling with `useOrderBook(selectedPairId)` and `usePriceFeed(selectedPairId)`. Add `useRecentTrades(selectedPairId)` for trades feed section.
- `package.json` `scripts` — `dev` and `start` must be updated to run `server.ts` instead of `next dev`/`next start`.
- `coinxi/src/db/index.ts` — The custom server imports `db` from here to call `getOrderBook`.

</code_context>

<specifics>
## Specific Ideas

- Price simulation base values: BTC ~50000, ETH ~3000, SOL ~100 (credits denomination)
- Animation flash color: cyan (#00d4ff) for quantity increase, red for decrease — matches Phase 1 glassmorphism palette
- Recent trades list: same GlassCard treatment, green/red price coloring matching OrderForm buy/sell colors
- The custom server file: `coinxi/server.ts` at project root, exports nothing (runs as Node.js entry point)

</specifics>

<deferred>
## Deferred Ideas

- Depth chart (bid/ask cumulative volume visualization) — Phase 5 (CHRT-03)
- Candlestick chart — Phase 5 (CHRT-01, CHRT-02)
- Price alert notifications — out of scope (NOTF-02 is v2)
- Socket.IO authentication / rooms per user — overkill for friends-only app, single broadcast is sufficient

</deferred>

---

*Phase: 02-market-data-real-time*
*Context gathered: 2026-04-08*
