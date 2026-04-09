# Phase 5: Polish & Mobile - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the Awwwards-tier premium experience — cinematic animations, responsive mobile layout, depth chart visualization, and polished micro-interactions across every screen. Phase 5 does NOT add new features, new API routes, or new data models — it polishes every existing screen for visual excellence and mobile accessibility.

**Does NOT include:** New trading features, new analytics, real-time push for order fills, optimistic UI.

</domain>

<decisions>
## Implementation Decisions

### Mobile Responsive Layout
- **D-01:** Three-panel trade layout stacks as single column on mobile (375px+) — order book on top, then order form, then recent trades. Scrollable vertical flow.
- **D-02:** Mobile navigation uses bottom tab bar via existing `BottomNav.tsx` component. ExchangeNav stays for desktop, BottomNav replaces it on small screens. Conditional rendering at breakpoint.
- **D-03:** Breakpoints: 768px (tablet, Tailwind `md:`) and 1024px (desktop, Tailwind `lg:`). Three-panel side-by-side only at `lg:` and above. Tablet gets 2-column where sensible.
- **D-04:** Minimum 44px touch targets on all interactive elements (buttons, tab items, order rows, nav items) — Apple HIG standard.

### Depth Chart
- **D-05:** Use `lightweight-charts` (TradingView) library for the depth chart — small bundle, canvas-based rendering, crypto-native API. Install as new dependency.
- **D-06:** Depth chart positioned below the order book on the trade page. Renders as a bid/ask area chart showing cumulative liquidity depth. Green fill for bids, red fill for asks.
- **D-07:** Depth chart updates on every `orderbook` Socket.IO event — recomputes cumulative depth from the bids/asks arrays already in memory from `useOrderBook` hook. No extra API calls.

### Micro-Interactions & Animations
- **D-08:** Hover glow on all interactive elements: electric cyan box-shadow `0 0 12px rgba(0,212,255,0.3)` on hover. Consistent with UI-01 (glassmorphism) and UI-02 (cyan accent).
- **D-09:** Press scale feedback: `scale(0.97)` via Framer Motion `whileTap` on buttons, cards, and inputs. Spring animation with `stiffness: 400, damping: 30`.
- **D-10:** Price ticker number morph already implemented in Phase 2 (PriceTicker component with `AnimatePresence + motion.span`). Phase 5 verifies it works correctly — no reimplementation needed.
- **D-11:** Page transitions: fade in on mount with `initial={{ opacity: 0 }} animate={{ opacity: 1 }}` on page container elements. Subtle, not distracting. Duration ~200ms.

### Claude's Discretion
- Exact card/component spacing adjustments for mobile
- Scroll snap behavior on mobile trade panels
- Whether depth chart has a toggle/minimize control
- Portfolio page mobile adaptations (card stacking, tab sizing)
- Loading skeleton adaptations for mobile viewports

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5 requirements
- `.planning/REQUIREMENTS.md` — UI-07 acceptance criteria (mobile responsive)
- `.planning/ROADMAP.md` Phase 5 section — Success criteria 1-5

### Existing components to enhance
- `coinxi/src/components/ExchangeNav.tsx` — Desktop nav, needs responsive breakpoint hiding
- `coinxi/src/components/BottomNav.tsx` — Mobile nav, already exists, needs activation at breakpoint
- `coinxi/src/components/Button.tsx` — Already has Framer Motion, extend with hover glow + whileTap
- `coinxi/src/components/GlassCard.tsx` — Add hover glow + press feedback
- `coinxi/src/components/Input.tsx` — Add hover glow
- `coinxi/src/components/OrderBookTable.tsx` — Mobile layout adaptation
- `coinxi/src/components/PriceTicker.tsx` — Verify number morph works (Phase 2)
- `coinxi/src/components/OrderForm.tsx` — Mobile touch target sizing
- `coinxi/src/components/OpenOrders.tsx` — Mobile layout
- `coinxi/src/components/PortfolioHoldings.tsx` — Mobile card stacking
- `coinxi/src/components/PortfolioOrders.tsx` — Mobile tab sizing

### Trade page (main integration point)
- `coinxi/src/app/(main)/trade/page.tsx` — Three-panel layout, needs responsive grid
- `coinxi/src/app/(main)/layout.tsx` — Main layout, nav switching logic

### Live data hooks (for depth chart)
- `coinxi/src/hooks/useOrderBook.ts` — Returns bids/asks for depth chart computation
- `coinxi/src/types/socket.ts` — BookLevel type for depth chart data

### CSS
- `coinxi/src/app/globals.css` — CSS variables, glassmorphism styles, glass class

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BottomNav.tsx` — Already exists, just needs to be conditionally rendered
- `Button.tsx` — Already has Framer Motion `motion.button` with `whileTap` and `whileHover` — extend, not replace
- `GlassCard.tsx` — Has `glass` class, needs hover glow added
- `useOrderBook(pairId)` — Returns `{ bids, asks }` — depth chart consumes this directly
- `globals.css` — Has `--color-cyan` (#00d4ff) variable for glow color
- Framer Motion v12.38 already installed

### Established Patterns
- Tailwind responsive: `md:` for tablet, `lg:` for desktop — used elsewhere in the app
- Framer Motion spring animations: `stiffness: 400, damping: 30` — Phase 1/2/4 pattern
- Props-down: trade page owns hooks, passes data to children
- GlassCard wrapping for all content sections

### Integration Points
- `app/(main)/layout.tsx` — Add BottomNav for mobile, hide ExchangeNav on small screens
- `app/(main)/trade/page.tsx` — Responsive grid (`grid-cols-1 lg:grid-cols-3`)
- New: `components/DepthChart.tsx` — Receives bids/asks as props from trade page
- `globals.css` — Add glow utility classes

</code_context>

<specifics>
## Specific Ideas

- Depth chart should use TradingView lightweight-charts `createChart` with dark theme matching our glassmorphism (transparent background, cyan/red fills)
- The glow effect should be a reusable Tailwind utility class (e.g., `glow-hover`) defined in globals.css, not inline on every component
- Mobile trade layout should feel like Binance/Coinbase mobile — familiar to crypto users

</specifics>

<deferred>
## Deferred Ideas

- Real-time push for order fills via Socket.IO (separate milestone)
- Optimistic UI for order placement (separate milestone)
- Candlestick chart with timeframe switching (v2 — CHRT-01/02)
- Dark/light theme toggle (v2)

</deferred>

---

*Phase: 05-polish-mobile*
*Context gathered: 2026-04-09*
