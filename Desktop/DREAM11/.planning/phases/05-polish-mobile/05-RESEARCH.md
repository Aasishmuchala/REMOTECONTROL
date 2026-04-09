# Phase 5: Polish & Mobile - Research

**Researched:** 2026-04-09
**Domain:** Mobile responsive layout, Framer Motion micro-interactions, TradingView lightweight-charts depth chart, Tailwind CSS v4 breakpoints
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Mobile Responsive Layout
- **D-01:** Three-panel trade layout stacks as single column on mobile (375px+) — order book on top, then order form, then recent trades. Scrollable vertical flow.
- **D-02:** Mobile navigation uses bottom tab bar via existing `BottomNav.tsx` component. ExchangeNav stays for desktop, BottomNav replaces it on small screens. Conditional rendering at breakpoint.
- **D-03:** Breakpoints: 768px (tablet, Tailwind `md:`) and 1024px (desktop, Tailwind `lg:`). Three-panel side-by-side only at `lg:` and above. Tablet gets 2-column where sensible.
- **D-04:** Minimum 44px touch targets on all interactive elements (buttons, tab items, order rows, nav items) — Apple HIG standard.

#### Depth Chart
- **D-05:** Use `lightweight-charts` (TradingView) library for the depth chart — small bundle, canvas-based rendering, crypto-native API. Install as new dependency.
- **D-06:** Depth chart positioned below the order book on the trade page. Renders as a bid/ask area chart showing cumulative liquidity depth. Green fill for bids, red fill for asks.
- **D-07:** Depth chart updates on every `orderbook` Socket.IO event — recomputes cumulative depth from the bids/asks arrays already in memory from `useOrderBook` hook. No extra API calls.

#### Micro-Interactions & Animations
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

### Deferred Ideas (OUT OF SCOPE)
- Real-time push for order fills via Socket.IO (separate milestone)
- Optimistic UI for order placement (separate milestone)
- Candlestick chart with timeframe switching (v2 — CHRT-01/02)
- Dark/light theme toggle (v2)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-07 | App is mobile-responsive (stacked layout on small screens) | Tailwind v4 breakpoint patterns verified; existing grid already uses `lg:grid-cols-3`; ExchangeNav already `md:hidden` |
</phase_requirements>

---

## Summary

Phase 5 polishes the already-functional CoinXI exchange into an Awwwards-tier mobile-first experience. The codebase has strong foundations: Framer Motion v12.38 is installed, the three-panel trade layout already uses `grid-cols-1 lg:grid-cols-3`, the glassmorphism token system is solid, and `ExchangeNav.tsx` is already implemented as a mobile bottom tab bar (`md:hidden`). Most of the work is *extending* existing patterns rather than building new infrastructure.

The two genuinely new concerns are: (1) installing and integrating `lightweight-charts` v5.1.0 for the depth chart — a canvas-based library that requires SSR-safe treatment in Next.js 16, and (2) ensuring the glow hover utility is a reusable CSS class rather than inline styles scattered across components. Page transitions need a `template.tsx` client component wrapper to work correctly with Next.js App Router's component lifecycle.

The key architectural finding is that **`ExchangeNav.tsx` IS the mobile bottom nav** — it already renders `md:hidden` and provides the bottom tab bar. The CONTEXT.md decision D-02 references `BottomNav.tsx` but no such file exists; `ExchangeNav.tsx` at `src/components/ExchangeNav.tsx` is the bottom nav component. The layout.tsx header nav uses `hidden md:flex` already — the mobile navigation infrastructure is effectively complete and just needs activation confirmation.

**Primary recommendation:** Install `lightweight-charts@5.1.0`, build `DepthChart.tsx` as a `'use client'` component with SSR guard, add `glow-hover` utility class to `globals.css`, extend `GlassCard` and `Input` with hover glow and whileTap, and add a `template.tsx` for page fade-in transitions.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | 12.38.0 (installed) | Micro-interactions, page transitions, AnimatePresence | Already in use across Button, OrderBookTable, PriceTicker, PortfolioHoldings |
| lightweight-charts | 5.1.0 (to install) | Depth chart canvas rendering | TradingView official library; canvas-based (no SVG jank); crypto-native API; zero peer deps |
| tailwindcss | 4.2.2 (installed) | Responsive breakpoints via `md:` / `lg:` | Already in use; v4 CSS-first @theme system matches existing globals.css setup |

[VERIFIED: npm registry — `npm view lightweight-charts version` returned `5.1.0`]
[VERIFIED: coinxi/package.json — framer-motion@12.38.0, tailwindcss@4]
[VERIFIED: coinxi/node_modules/framer-motion/package.json — version 12.38.0]
[VERIFIED: coinxi/node_modules/tailwindcss/package.json — version 4.2.2]

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fancy-canvas | 2.1.0 (auto-installed with lightweight-charts) | Canvas DPI scaling for lightweight-charts | Installed automatically as lightweight-charts dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lightweight-charts (canvas) | recharts or Chart.js (SVG/canvas) | recharts is heavier, React-specific, not crypto-native; decision is locked as D-05 |
| template.tsx for page transitions | AnimatePresence in layout wrapper | template.tsx is simpler and correct for App Router — creates new instance per navigation |
| CSS class `glow-hover` in globals.css | Inline Tailwind arbitrary values on each component | CSS class is reusable and consistent; avoids duplication across 10+ components |

**Installation:**
```bash
npm install lightweight-charts@5.1.0
```

**Version verification:**
```bash
npm view lightweight-charts version
# 5.1.0 (verified 2026-04-09)
```

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── DepthChart.tsx        # NEW — canvas depth chart, 'use client', SSR-guarded
│   ├── Button.tsx            # EXTEND — hover glow already has shadow; add glow-hover class
│   ├── GlassCard.tsx         # EXTEND — add motion.div wrapper option or group-hover glow
│   ├── Input.tsx             # EXTEND — add hover glow class
│   ├── ExchangeNav.tsx       # VERIFY — already md:hidden mobile bottom nav (IS the BottomNav)
│   └── [all others]          # EXTEND — 44px touch targets where needed
├── app/
│   ├── (main)/
│   │   ├── template.tsx      # NEW — page fade-in transition wrapper ('use client')
│   │   ├── layout.tsx        # EXTEND — header nav already hidden md:flex (no change needed)
│   │   └── trade/page.tsx    # EXTEND — add DepthChart below OrderBookTable
└── app/globals.css           # EXTEND — add .glow-hover utility class
```

### Pattern 1: Depth Chart — SSR-Safe Canvas Component
**What:** `lightweight-charts` requires `window` and DOM — must not run on server.
**When to use:** Any canvas-based charting library in Next.js App Router.
**Pattern:** Mark component `'use client'` AND guard `createChart` call behind `typeof window !== 'undefined'` check inside `useEffect`. The `useEffect` already runs client-side only, making the double guard belt-and-suspenders.

```typescript
// Source: lightweight-charts official React tutorial + Next.js 'use client' pattern
'use client'

import { useEffect, useRef, useMemo } from 'react'
import { createChart, AreaSeries, ColorType } from 'lightweight-charts'
import type { BookLevel } from '@/types/socket'

interface DepthChartProps {
  bids: BookLevel[]
  asks: BookLevel[]
}

// Convert bids/asks to cumulative depth data
// lightweight-charts AreaSeries uses { time, value } where time is numeric
// For a depth chart, we use price as the "time" axis (numeric index)
function computeDepth(levels: BookLevel[], isAsk: boolean) {
  const sorted = [...levels].sort((a, b) =>
    isAsk
      ? parseFloat(a.price) - parseFloat(b.price)
      : parseFloat(b.price) - parseFloat(a.price)
  )
  let cumulative = 0
  return sorted.map((l) => {
    cumulative += parseFloat(l.quantity)
    return { time: parseFloat(l.price) as unknown as number, value: cumulative }
  })
}

export default function DepthChart({ bids, asks }: DepthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const bidSeriesRef = useRef<ReturnType<typeof chartRef.current.addSeries> | null>(null)
  const askSeriesRef = useRef<ReturnType<typeof chartRef.current.addSeries> | null>(null)

  // Initialize chart once
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(240, 240, 255, 0.35)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      height: 200,
      autoSize: true,
    })
    const bidSeries = chart.addSeries(AreaSeries, {
      lineColor: '#00ff88',
      topColor: 'rgba(0, 255, 136, 0.3)',
      bottomColor: 'rgba(0, 255, 136, 0.02)',
    })
    const askSeries = chart.addSeries(AreaSeries, {
      lineColor: '#ff4466',
      topColor: 'rgba(255, 68, 102, 0.3)',
      bottomColor: 'rgba(255, 68, 102, 0.02)',
    })
    chartRef.current = chart
    bidSeriesRef.current = bidSeries
    askSeriesRef.current = askSeries

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  // Update data on bids/asks change
  useEffect(() => {
    if (!bidSeriesRef.current || !askSeriesRef.current) return
    const bidData = computeDepth(bids, false)
    const askData = computeDepth(asks, true)
    if (bidData.length) bidSeriesRef.current.setData(bidData)
    if (askData.length) askSeriesRef.current.setData(askData)
  }, [bids, asks])

  return <div ref={containerRef} className="w-full h-[200px]" />
}
```
[CITED: tradingview.github.io/lightweight-charts/tutorials/react/simple]
[CITED: tradingview.github.io/lightweight-charts/docs/api/interfaces/IChartApi]

### Pattern 2: Page Fade-In via template.tsx
**What:** `app/(main)/template.tsx` — Next.js creates a new instance per navigation, enabling exit + enter animations without `AnimatePresence` complexity.
**When to use:** Simple fade-in. The `layout.tsx` approach requires `AnimatePresence` + `usePathname` key; `template.tsx` is simpler and sufficient for D-11.

```typescript
// Source: imcorfitz.com/posts/adding-framer-motion-page-transitions + framer-motion docs
'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```
[CITED: imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router]

### Pattern 3: Reusable Glow Utility in globals.css
**What:** A CSS class applied to containers; children use `group-hover` or the element itself uses `hover:` with the class.
**When to use:** D-08 — consistent cyan glow across all interactive elements.

```css
/* Source: globals.css extension — existing .glow-cyan pattern */
.glow-hover {
  transition: box-shadow 150ms ease;
}
.glow-hover:hover {
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
}
```

### Pattern 4: Tailwind Responsive Grid — Mobile-First
**What:** `grid-cols-1 lg:grid-cols-3` — mobile stacks vertically, desktop is 3 columns.
**Existing code:** `trade/page.tsx` already has `grid grid-cols-1 lg:grid-cols-3 gap-4` — the base structure is correct. Column order must match D-01: order book first on mobile (DOM order), then order form, then recent trades.

[VERIFIED: coinxi/src/app/(main)/trade/page.tsx — grid layout confirmed]
[VERIFIED: Tailwind CSS v4 defaults: md=768px, lg=1024px — matches D-03]

### Pattern 5: 44px Touch Targets
**What:** Apple HIG minimum. `py-2.5` (20px padding + text) may fall short on small elements.
**Rule:** Buttons at `py-2.5` with `text-sm` (20px line height) = ~40px. Needs `py-3` (24px) or `min-h-[44px]` on mobile for full compliance.
**Where gaps exist:** OrderForm buy/sell toggle buttons, OrderType toggle buttons, PortfolioOrders tab buttons, OpenOrders cancel buttons — all use `py-2.5` or `py-1.5`.

[ASSUMED: Specific pixel heights of each button without measuring rendered DOM — treat as needing verification during implementation]

### Anti-Patterns to Avoid
- **Split useEffect for chart init + data update:** Initialize chart in one `useEffect([], [])`, update data in a second `useEffect([bids, asks])`. Never recreate the entire chart on data changes.
- **SSR crash with lightweight-charts:** Never call `createChart` outside `useEffect`. The `'use client'` directive alone is not enough if code runs during hydration before `useEffect`.
- **AnimatePresence in layout.tsx for page transitions:** `layout.tsx` does NOT remount on navigation — `AnimatePresence` won't trigger exit animations. Use `template.tsx` instead.
- **Tailwind `transition-*` on motion components:** Framer Motion overrides CSS transitions. Remove `transition-colors` or `transition-all` from any element that also uses `motion.*` `whileHover`/`whileTap`.
- **Mixing px and rem in Tailwind v4 breakpoints:** Stick to rem. The existing `globals.css` uses `@theme` — add breakpoints there if custom values needed.
- **Rerendering chart on every orderbook tick:** Update series data only (`.setData()`), never call `createChart` again. The two-`useEffect` pattern handles this.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Canvas depth chart rendering | Custom SVG/Canvas drawing code | `lightweight-charts` AreaSeries | DPI scaling, performance, zoom, panning, dark theme support all handled; edge cases in custom canvas drawing are enormous |
| Page transitions | Custom CSS keyframe animations | Framer Motion `motion.div` in `template.tsx` | Framer's spring physics, `AnimatePresence`, and React lifecycle integration handle timing edge cases |
| Cumulative depth calculation | Complex reduce with binary search | Simple sorted reduce (O(n)) | Order book is max 20 levels — no optimization needed |
| Touch target enforcement | JS-based click area expansion | CSS `min-h-[44px]` Tailwind utility | Platform-native, zero JS cost |
| Responsive nav switching | JS window resize listener | Tailwind `md:hidden` / `hidden md:flex` CSS classes | Already used in codebase; zero JS overhead |

**Key insight:** lightweight-charts handles the hardest parts of depth chart rendering — DPI awareness via `fancy-canvas`, resize responsiveness via `autoSize: true`, axis formatting, and canvas cleanup. A custom canvas implementation would take 300+ lines and still miss edge cases.

---

## Common Pitfalls

### Pitfall 1: lightweight-charts AreaSeries Uses `time` Not `price` for X-Axis
**What goes wrong:** `AreaSeries` is a time-series type. The x-axis is a time scale. For a depth chart (price on x-axis), you must pass price values cast as the `time` parameter.
**Why it happens:** lightweight-charts is designed for OHLCV time-series; depth charts are a secondary use case.
**How to avoid:** Use `{ time: parseFloat(price) as unknown as number, value: cumulativeQty }`. The time scale will render numeric values as prices. Set `timeScale().applyOptions({ timeVisible: false })` to hide the time axis label format.
**Warning signs:** TypeScript error `Type 'number' is not assignable to type 'Time'` — use type cast.
[ASSUMED: The cast pattern works for numeric price values as time — verify against lightweight-charts v5 docs during implementation]

### Pitfall 2: ExchangeNav IS the BottomNav
**What goes wrong:** Treating `ExchangeNav.tsx` as the desktop nav and expecting a separate `BottomNav.tsx` to exist. `BottomNav.tsx` does not exist.
**Why it happens:** CONTEXT.md D-02 says "via existing `BottomNav.tsx`" but the actual file is `ExchangeNav.tsx` which already renders `md:hidden` — it IS the mobile bottom nav.
**How to avoid:** Reference `ExchangeNav.tsx` for all mobile nav work. The desktop nav is inline in `layout.tsx` (the `hidden md:flex` nav links). No new nav component needed.
**Warning signs:** `Cannot find module '@/components/BottomNav'` — the component doesn't exist.
[VERIFIED: coinxi/src/components/ directory listing — no BottomNav.tsx found]

### Pitfall 3: Framer Motion `whileTap` on Non-Motion Elements
**What goes wrong:** Adding `whileTap={{ scale: 0.97 }}` to a plain `<div>` or `<button>` does nothing.
**Why it happens:** `whileTap` requires a `motion.*` element (e.g., `motion.div`, `motion.button`).
**How to avoid:** Wrap target elements with `motion.div` or convert to `motion.button`. `GlassCard` currently uses `<div>` — needs `motion.div` to support `whileTap`.
**Warning signs:** Animation silently not firing despite correct props.

### Pitfall 4: Mobile Layout Column Order vs. DOM Order
**What goes wrong:** CSS Grid with `lg:col-span-*` can visually reorder columns on desktop, but on mobile the DOM (source) order is what stacks vertically.
**Why it happens:** D-01 specifies order book first, then order form, then recent trades on mobile. Current DOM order in `trade/page.tsx` is: OrderForm (col 1), OrderBook (col 2), RecentTrades (col 3). This is the wrong order for mobile.
**How to avoid:** Reorder DOM: `OrderBookTable` first, `OrderForm` second, `RecentTrades` third. On desktop `lg:grid-cols-3` renders them side-by-side regardless of DOM order. Use CSS `order` utilities if visual desktop order differs: `lg:order-1`, `lg:order-2`, `lg:order-3`.
**Warning signs:** On 375px viewport, order form appears before order book.
[VERIFIED: coinxi/src/app/(main)/trade/page.tsx — current DOM order is OrderForm, OrderBook, RecentTrades — NOT D-01 compliant]

### Pitfall 5: `autoSize: true` Requires Container to Have Explicit Height
**What goes wrong:** `autoSize: true` in lightweight-charts uses `ResizeObserver` on the container. If the container has no explicit height (`h-0` or undefined), the chart renders at 0px.
**Why it happens:** Canvas elements need a determined height; `ResizeObserver` only watches width changes by default.
**How to avoid:** Always set an explicit height on the container div (`h-[200px]` or `h-48`). Also set `height: 200` in chart options as the initial value.
**Warning signs:** Blank space where depth chart should be.

### Pitfall 6: `template.tsx` vs `layout.tsx` Import of Framer Motion
**What goes wrong:** Importing `framer-motion` in `layout.tsx` when `layout.tsx` is a server component causes a runtime error.
**Why it happens:** `framer-motion` uses browser APIs. `layout.tsx` runs on server by default in Next.js App Router.
**How to avoid:** Put the `motion.div` wrapper in `template.tsx` with `'use client'` at top. `layout.tsx` stays a server component and imports no Framer Motion.
**Warning signs:** `Error: Cannot use import statement outside a module` or hydration errors.
[CITED: imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router]

---

## Code Examples

Verified patterns from official sources and codebase inspection:

### Cumulative Depth Data Transform
```typescript
// No external source — pure math on BookLevel[] type
// Source: CONTEXT.md D-07 + types/socket.ts BookLevel interface
import type { BookLevel } from '@/types/socket'

interface DepthPoint {
  // Using number cast for price-as-time-axis pattern
  time: number
  value: number
}

export function computeCumulativeDepth(
  levels: BookLevel[],
  isAsk: boolean
): DepthPoint[] {
  const sorted = [...levels].sort((a, b) => {
    const pa = parseFloat(a.price)
    const pb = parseFloat(b.price)
    return isAsk ? pa - pb : pb - pa // asks: low-to-high; bids: high-to-low
  })

  let cumulative = 0
  return sorted.map((l) => {
    cumulative += parseFloat(l.quantity)
    return {
      time: parseFloat(l.price),  // price used as x-axis
      value: cumulative,
    }
  })
}
```

### Glow Hover CSS Utility (globals.css addition)
```css
/* Reusable hover glow — D-08: 0 0 12px rgba(0,212,255,0.3) */
.glow-hover {
  transition: box-shadow 150ms ease;
}
.glow-hover:hover {
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
}
```

### GlassCard with whileTap Support
```typescript
// Source: Button.tsx whileTap pattern extended to GlassCard
'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  elevated?: boolean
  interactive?: boolean  // opt-in for whileTap + glow
}

export default function GlassCard({
  children, className, elevated = false, interactive = false
}: GlassCardProps) {
  const Comp = interactive ? motion.div : 'div'
  return (
    <Comp
      {...(interactive ? {
        whileTap: { scale: 0.97 },
        transition: { type: 'spring', stiffness: 400, damping: 30 },
      } : {})}
      className={cn(
        'rounded-2xl p-4',
        elevated ? 'glass-elevated' : 'glass',
        interactive && 'glow-hover cursor-pointer',
        className
      )}
    >
      {children}
    </Comp>
  )
}
```

### Input Hover Glow (non-breaking extension)
```typescript
// Source: Input.tsx — add glow-hover class to wrapper div
// No motion change needed — CSS hover is sufficient for inputs (not interactive enough for whileTap)
<div className="relative flex items-center glow-hover rounded-xl">
  {/* ... existing input content ... */}
</div>
```

### Responsive Trade Layout with Correct Mobile Order
```typescript
// Source: trade/page.tsx — fix DOM order per D-01
// Order book first (top on mobile), order form second, recent trades third

{/* Main trading layout */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  {/* Order book — center on desktop, FIRST on mobile (D-01) */}
  <div className="lg:order-2">
    <OrderBookTable bids={bids} asks={asks} bidsDiff={bidsDiff} asksDiff={asksDiff} />
    {/* Depth chart below order book (D-06) */}
    <div className="mt-3">
      <DepthChart bids={bids} asks={asks} />
    </div>
  </div>

  {/* Order form — left on desktop, second on mobile (D-01) */}
  <div className="lg:order-1">
    <OrderForm ... />
  </div>

  {/* Recent trades — right on desktop, third on mobile (D-01) */}
  <div className="lg:order-3">
    <RecentTrades trades={trades} />
  </div>
</div>
```

### PriceTicker Verification Checklist
```typescript
// Source: src/components/PriceTicker.tsx — already implemented
// Phase 5 is VERIFY ONLY per D-10
// Confirmed: AnimatePresence mode="wait" + motion.span with spring stiffness:400 damping:30
// Confirmed: direction tracking (up/down/neutral) with y slide animation
// Confirmed: tabular-nums font-mono for number stability
// STATUS: COMPLETE — no changes needed
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `framer-motion` import | `motion/react` import (v11+) | Framer Motion v11 | Either works in v12; `framer-motion` still exported; no breaking change needed |
| `addAreaSeries()` (lightweight-charts v4) | `addSeries(AreaSeries, options)` (v5) | lightweight-charts v5 | BREAKING: must use new API |
| `tailwind.config.js` screens | `@theme { --breakpoint-*: value }` in CSS | Tailwind v4 | Existing breakpoints (md/lg) are default values — no config needed |
| `next/dynamic` with `ssr: false` | `'use client'` + `useEffect` guard | Next.js App Router | `'use client'` is sufficient; `ssr: false` now only valid inside client components |

**Deprecated/outdated:**
- `addAreaSeries()`: Removed in lightweight-charts v5. Use `addSeries(AreaSeries, options)` instead. [VERIFIED: npm view lightweight-charts@5.1.0 — v5 is `latest`]
- `addLineSeries()`, `addBarSeries()`: Same pattern change in v5 — all use `addSeries(SeriesType, options)`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Price-as-time-axis cast pattern works in lightweight-charts v5 for depth chart | Code Examples, Common Pitfalls | Depth chart x-axis may render as dates not prices — need to verify or use custom plugin |
| A2 | `lg:order-*` CSS utilities exist in Tailwind v4 | Architecture Patterns | Column reordering won't work; would need explicit CSS grid `order` properties |
| A3 | 44px is achievable with `py-3` on existing button/toggle elements | Architecture Patterns | May need `min-h-[44px]` explicit instead of padding — verify with computed styles |

---

## Open Questions

1. **Depth chart x-axis: price-as-time workaround vs. custom series plugin**
   - What we know: `AreaSeries` is time-based; depth charts need price on x-axis
   - What's unclear: Whether the numeric cast approach is officially supported or if the community market-depth plugin (`lightweight-charts-line-tools-market-depth`) would be better
   - Recommendation: Use the cast approach first (simpler, no extra deps). If axis labels show dates, add `timeScale().applyOptions({ tickMarkFormatter: (t) => t.toString() })` to override label formatting.

2. **GlassCard interactive prop: opt-in vs. default**
   - What we know: Not every GlassCard should have `whileTap` (e.g., info panels, stat cards)
   - What's unclear: Which specific card instances in portfolio/trade pages need interactive feedback
   - Recommendation: Claude's discretion — add `interactive` prop to GlassCard, apply it to TradingPairSelector dropdown items, PortfolioHoldings asset cards, OpenOrders rows.

3. **Mobile column order vs. desktop visual order**
   - What we know: D-01 says order book first on mobile; current DOM has order form first
   - What's unclear: Whether `lg:order-*` in Tailwind v4 is the right approach vs. DOM reorder
   - Recommendation: Use DOM reorder (order book first in JSX) + `lg:order-1/2/3` to preserve desktop visual left-to-right as: form, book, trades.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | Yes | via npm | — |
| lightweight-charts | Depth chart (D-05, D-06, D-07) | NOT INSTALLED | — | None — required |
| framer-motion | All micro-interactions | YES (installed) | 12.38.0 | — |
| tailwindcss | All responsive layouts | YES (installed) | 4.2.2 | — |

**Missing dependencies with no fallback:**
- `lightweight-charts@5.1.0` — must be installed before DepthChart.tsx can be written

**Missing dependencies with fallback:**
- None

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.3 |
| Config file | `coinxi/vitest.config.ts` |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test` (all 61 tests) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UI-07 | Mobile layout stacks vertically at 375px | Manual/visual | — | N/A |
| UI-07 | DepthChart renders without crashing | Unit (component render) | `npm test` | ❌ Wave 0 |
| UI-07 | computeCumulativeDepth produces sorted cumulative values | Unit (pure function) | `npm test` | ❌ Wave 0 |
| UI-06 | Button hover glow + whileTap present | Manual/visual | — | N/A |
| UI-03 | PriceTicker number morph animates | Manual verification | — | Exists (verify) |

**Note:** Most Phase 5 deliverables are visual/interaction behavior that cannot be unit tested. The testable surface is the pure `computeCumulativeDepth` function and the DepthChart component render (no crash, correct props forwarded).

### Sampling Rate
- **Per task commit:** `npm test` (vitest run — currently 61 passing, must stay green)
- **Per wave merge:** `npm test` full suite green
- **Phase gate:** All 61 existing tests pass + new DepthChart tests pass before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/lib/depth-chart.test.ts` — covers `computeCumulativeDepth` pure function (REQ UI-07)
- [ ] `src/__tests__/integration/depth-chart.test.tsx` — covers DepthChart renders without crash (jsdom environment, mock lightweight-charts)

*(Existing test infrastructure covers all other phase requirements — vitest + jsdom already configured)*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No new auth flows in Phase 5 |
| V3 Session Management | No | No session changes |
| V4 Access Control | No | No new API routes |
| V5 Input Validation | No | No new user inputs beyond existing OrderForm |
| V6 Cryptography | No | No crypto operations |

**Phase 5 security assessment:** This phase is purely UI/visual polish with one new read-only data consumer (DepthChart reads bids/asks from memory). No new API routes, no new user inputs, no authentication changes. Security posture is unchanged from Phase 4.

---

## Project Constraints (from CLAUDE.md)

**CLAUDE.md not found** at `/Users/aasish/Desktop/DREAM11/CLAUDE.md` — no project-level directives to enforce.

**Inferred constraints from accumulated STATE.md decisions:**
- Next.js 16 is in use — `proxy.ts` replaces `middleware.ts`; async params pattern for dynamic routes
- Framer Motion imports: `from 'framer-motion'` (project uses `framer-motion` package, not `motion/react`)
- Spring animation constants: `stiffness: 400, damping: 30` (established in Phases 1-4)
- `cn()` utility used from `@/lib/utils` (no clsx/tailwind-merge)
- All financial components use decimal.js — not applicable to UI-only Phase 5

---

## Sources

### Primary (HIGH confidence)
- `coinxi/src/components/Button.tsx` — Existing whileTap/whileHover pattern, spring constants
- `coinxi/src/components/ExchangeNav.tsx` — Mobile nav is this file (md:hidden confirmed)
- `coinxi/src/app/(main)/trade/page.tsx` — Existing grid layout structure
- `coinxi/src/app/globals.css` — CSS variables, existing glow classes
- `coinxi/src/hooks/useOrderBook.ts` — bids/asks BookLevel[] interface for depth chart input
- `coinxi/package.json` — Installed dependency versions
- npm registry (`npm view`) — lightweight-charts@5.1.0 is latest stable; no peer deps

### Secondary (MEDIUM confidence)
- [tradingview.github.io/lightweight-charts/tutorials/react/simple](https://tradingview.github.io/lightweight-charts/tutorials/react/simple) — React + cleanup pattern
- [tradingview.github.io/lightweight-charts/docs/api/interfaces/IChartApi](https://tradingview.github.io/lightweight-charts/docs/api/interfaces/IChartApi) — remove() API
- [imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router](https://www.imcorfitz.com/posts/adding-framer-motion-page-transitions-to-next-js-app-router) — template.tsx pattern
- [tailwindcss.com/docs/responsive-design](https://tailwindcss.com/docs/responsive-design) — v4 mobile-first breakpoints

### Tertiary (LOW confidence)
- WebSearch: lightweight-charts v5 depth chart x-axis price pattern — community examples only, no official docs confirming price-as-time cast

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — npm registry verified, codebase verified
- Architecture: HIGH — existing code patterns directly inspected
- Depth chart API: MEDIUM — official React tutorial verified; price-as-time-axis is LOW (assumption A1)
- Pitfalls: HIGH — several discovered from direct codebase inspection (BottomNav naming, DOM order bug)
- Micro-interactions: HIGH — Button.tsx has exact pattern; extension is straightforward

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (Tailwind/Framer Motion are stable; lightweight-charts v5 is very recent — check for minor releases before implementing)
