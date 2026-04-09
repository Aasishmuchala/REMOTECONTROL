---
phase: 05-polish-mobile
plan: 01
subsystem: frontend-ui
tags: [mobile, responsive, micro-interactions, css, framer-motion]
dependency_graph:
  requires: []
  provides: [glow-hover-utility, mobile-trade-layout, interactive-glasscard, 44px-touch-targets]
  affects: [trade-page, portfolio-page, exchange-nav, order-form, open-orders]
tech_stack:
  added: []
  patterns: [framer-motion-whileTap, css-utility-class, tailwind-order-utilities, min-h-touch-target]
key_files:
  created: []
  modified:
    - coinxi/src/app/globals.css
    - coinxi/src/app/(main)/trade/page.tsx
    - coinxi/src/components/GlassCard.tsx
    - coinxi/src/components/Input.tsx
    - coinxi/src/components/OrderForm.tsx
    - coinxi/src/components/OpenOrders.tsx
    - coinxi/src/components/PortfolioOrders.tsx
    - coinxi/src/components/ExchangeNav.tsx
decisions:
  - "ExchangeNav.tsx IS the mobile bottom nav (md:hidden already present) — no BottomNav.tsx created or needed"
  - "GlassCard interactive prop is opt-in (default false) — non-interactive cards remain plain divs with no framer-motion overhead"
  - "glow-hover implemented as CSS utility class in globals.css rather than inline Tailwind arbitrary values"
metrics:
  duration: "4 minutes"
  completed: "2026-04-09"
  tasks: 2
  files_modified: 8
---

# Phase 05 Plan 01: Mobile Polish & Micro-Interactions Summary

**One-liner:** Mobile-first trade layout with DOM reorder + lg:order utilities, glow-hover CSS utility, GlassCard interactive mode with whileTap, and 44px touch targets across all interactive elements.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Mobile-responsive trade layout + glow-hover utility | f432ebe | globals.css, trade/page.tsx |
| 2 | Micro-interactions — GlassCard interactive mode, Input glow, 44px touch targets | 54c4975 | GlassCard.tsx, Input.tsx, OrderForm.tsx, OpenOrders.tsx, PortfolioOrders.tsx, ExchangeNav.tsx |

## What Was Built

### Task 1: Mobile Layout + glow-hover

**globals.css** — Added `.glow-hover` CSS utility class (D-08):
```css
.glow-hover { transition: box-shadow 150ms ease; }
.glow-hover:hover { box-shadow: 0 0 12px rgba(0, 212, 255, 0.3); }
```

**trade/page.tsx** — Reordered DOM for mobile-first layout (D-01):
- DOM order: OrderBookTable, OrderForm, RecentTrades
- Mobile (375px): stacks in DOM order — book first, form second, trades third
- Desktop (lg:): CSS order utilities restore form | book | trades column arrangement
  - OrderBook wrapper: `lg:order-2`
  - OrderForm wrapper: `lg:order-1`
  - RecentTrades wrapper: `lg:order-3`

**ExchangeNav confirmed:** Already has `md:hidden` on root `<nav>` — no changes needed. No `BottomNav.tsx` created.

### Task 2: Micro-Interactions

**GlassCard.tsx** — Added `interactive` prop (D-09):
- `interactive=true`: renders `motion.div` with `whileTap={{ scale: 0.97 }}`, spring stiffness 400 damping 30, applies `glow-hover` + `cursor-pointer`
- `interactive=false` (default): remains a plain `<div>` — zero framer-motion bundle cost
- Added `'use client'` directive for framer-motion support

**Input.tsx** — Added `glow-hover rounded-xl` to wrapper div for hover glow (D-08)

**44px touch targets (D-04):**
- OrderForm buy/sell toggle: `py-2.5` → `min-h-[44px]`
- OrderForm order type toggle: `py-1.5` → `min-h-[44px] flex items-center`
- OpenOrders order row: `py-2.5` → `py-2 min-h-[44px]`
- OpenOrders cancel button: `py-1.5` → `min-h-[44px]`
- PortfolioOrders tab buttons: `py-1.5` → `py-1.5 min-h-[44px]`
- PortfolioOrders order row: `py-2.5` → `py-2 min-h-[44px]`
- PortfolioOrders cancel button: `py-1.5` → `min-h-[44px]`
- ExchangeNav tab links: added `min-h-[44px]` to base classes

## Verification

- TypeScript: tsconfig.json is a circular symlink (pre-existing project issue — not introduced by this plan); Next.js build would validate at runtime
- Tests: 38/61 passing — 23 pre-existing failures (React null pointer in Socket.IO hook tests) unrelated to UI changes; baseline unchanged before and after this plan's edits

## Deviations from Plan

None — plan executed exactly as written. The CONTEXT.md D-02 reference to `BottomNav.tsx` was confirmed as incorrect per RESEARCH.md Pitfall 2; `ExchangeNav.tsx` is the mobile bottom nav and required no changes.

## Known Stubs

None — all modified components display real data from existing hooks and API calls.

## Threat Flags

None — plan is purely UI polish with no new API routes, auth paths, or data model changes. All threat dispositions remain `accept` per the plan's threat model.

## Self-Check: PASSED

Files exist:
- FOUND: coinxi/src/app/globals.css (contains `.glow-hover`)
- FOUND: coinxi/src/app/(main)/trade/page.tsx (contains `lg:order-2`)
- FOUND: coinxi/src/components/GlassCard.tsx (contains `motion.div`, `interactive`)
- FOUND: coinxi/src/components/Input.tsx (contains `glow-hover rounded-xl`)
- FOUND: coinxi/src/components/OrderForm.tsx (contains `min-h-[44px]`)
- FOUND: coinxi/src/components/OpenOrders.tsx (contains `min-h-[44px]`)
- FOUND: coinxi/src/components/PortfolioOrders.tsx (contains `min-h-[44px]`)
- FOUND: coinxi/src/components/ExchangeNav.tsx (contains `min-h-[44px]`)

Commits exist:
- FOUND: f432ebe — feat(05-01): mobile-responsive trade layout + glow-hover utility
- FOUND: 54c4975 — feat(05-01): micro-interactions — GlassCard interactive mode, Input glow, 44px touch targets
