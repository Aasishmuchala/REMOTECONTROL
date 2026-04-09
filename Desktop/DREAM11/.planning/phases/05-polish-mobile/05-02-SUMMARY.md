---
phase: 05-polish-mobile
plan: 02
subsystem: frontend-ui
tags: [depth-chart, lightweight-charts, framer-motion, page-transitions, canvas, order-book]

# Dependency graph
requires:
  - phase: 05-01
    provides: mobile-trade-layout with OrderBook first in DOM, glow-hover utility
  - phase: 02-market-data-real-time
    provides: useOrderBook hook returning bids/asks BookLevel arrays
provides:
  - lightweight-charts-depth-chart
  - cumulative-depth-computation
  - page-fade-transitions
affects: [trade-page, all-main-routes]

# Tech tracking
tech-stack:
  added: [lightweight-charts@5.1.0]
  patterns:
    - "SSR-safe canvas chart: 'use client' + createChart inside useEffect"
    - "Two-useEffect pattern: init chart once, update data separately"
    - "price-as-time-axis: numeric price cast for depth chart x-axis"
    - "template.tsx for per-navigation page transitions (not layout.tsx)"
    - "v5 API: chart.addSeries(AreaSeries, opts) not addAreaSeries()"

key-files:
  created:
    - coinxi/src/lib/depth-utils.ts
    - coinxi/src/__tests__/lib/depth-utils.test.ts
    - coinxi/src/components/DepthChart.tsx
    - coinxi/src/app/(main)/template.tsx
  modified:
    - coinxi/src/app/(main)/trade/page.tsx
    - coinxi/package.json
    - coinxi/vitest.config.ts
    - coinxi/tsconfig.json

key-decisions:
  - "lightweight-charts v5 API requires addSeries(AreaSeries, opts) — addAreaSeries() was removed in v5"
  - "Price values cast as time-axis coordinates for depth chart x-axis (price-as-time pattern)"
  - "template.tsx (not layout.tsx) for page transitions — App Router remounts template per navigation"
  - "vitest.config.ts alias changed from hardcoded absolute path to path.resolve(__dirname, 'src') for worktree compatibility"
  - "tsconfig.json circular symlink replaced with proper Next.js config; jsx: react-jsx for Vitest compatibility"
  - "PriceTicker verified complete from Phase 2 — no changes made (D-10)"

patterns-established:
  - "Two-useEffect pattern for canvas charts: init in useEffect([]), update data in useEffect([deps])"
  - "template.tsx client component wraps children in motion.div for per-route fade-in animation"

requirements-completed: [UI-07]

# Metrics
duration: 35min
completed: 2026-04-09
---

# Phase 05 Plan 02: Depth Chart + Page Transitions Summary

**lightweight-charts v5 canvas depth chart (green bids / red asks) below order book, 200ms page fade-in via template.tsx, and computeCumulativeDepth pure function with 4 unit tests**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-09T08:40:00Z
- **Completed:** 2026-04-09T08:41:34Z
- **Tasks:** 2 auto tasks completed (Task 3 is checkpoint:human-verify — awaiting)
- **Files modified:** 8

## Accomplishments

- Installed lightweight-charts@5.1.0 and built canvas-based depth chart showing bid/ask cumulative liquidity
- Created `computeCumulativeDepth` pure function with 4 passing unit tests (65 total passing)
- Wired DepthChart into trade page — updates live from existing useOrderBook hook data (no extra API calls)
- Added `app/(main)/template.tsx` providing 200ms fade-in on every route navigation
- Verified PriceTicker number morph is complete and correct from Phase 2 (no changes needed)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install lightweight-charts + DepthChart + wire to trade page** - `51a416e` (feat)
2. **Task 2: Page transitions via template.tsx + PriceTicker verification** - `65fc6b6` (feat)

## Files Created/Modified

- `coinxi/src/lib/depth-utils.ts` — Pure function `computeCumulativeDepth(levels, isAsk)` converting BookLevel[] to cumulative DepthPoint[] for chart series data
- `coinxi/src/__tests__/lib/depth-utils.test.ts` — 4 unit tests covering empty input, ascending asks, descending bids, single level
- `coinxi/src/components/DepthChart.tsx` — Canvas-based depth chart; green area for bids, red for asks; uses lightweight-charts v5 `addSeries(AreaSeries)` API; SSR-safe with useEffect guards
- `coinxi/src/app/(main)/template.tsx` — Page transition wrapper; motion.div with opacity 0→1 in 200ms; re-instantiated per navigation by App Router
- `coinxi/src/app/(main)/trade/page.tsx` — Added DepthChart import and `<DepthChart bids={bids} asks={asks} />` below OrderBookTable with mt-3 spacing
- `coinxi/package.json` — Added `lightweight-charts@^5.1.0` dependency
- `coinxi/vitest.config.ts` — Fixed alias from hardcoded absolute path to `path.resolve(__dirname, 'src')`
- `coinxi/tsconfig.json` — Replaced circular symlink with proper Next.js tsconfig; `jsx: react-jsx` for Vitest TSX parsing compatibility

## Decisions Made

- **lightweight-charts v5 API:** `chart.addSeries(AreaSeries, options)` is the v5 API — `addAreaSeries()` was removed. Critical breaking change documented in RESEARCH.md state-of-the-art table.
- **Price-as-time cast:** Depth charts use price on x-axis, but AreaSeries expects time-series data. Cast `parseFloat(price)` as numeric time coordinate — axis renders prices correctly as numbers.
- **template.tsx vs layout.tsx:** App Router creates new template instance per navigation but keeps layout mounted. Putting `motion.div` in `template.tsx` ensures `initial` fires on every route change.
- **PriceTicker no-change:** D-10 explicitly says verify-only. PriceTicker has AnimatePresence mode="wait", motion.span spring physics, direction tracking — complete and correct from Phase 2.
- **tsconfig.json fix:** The circular symlink (`tsconfig.json -> tsconfig.json`) in the worktree prevented `tsc --noEmit`. Replaced with standard Next.js tsconfig. Used `jsx: react-jsx` instead of `preserve` to keep Vitest TSX parsing working.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed vitest.config.ts hardcoded absolute path**
- **Found during:** Task 1 (running depth-utils tests)
- **Issue:** vitest.config.ts had `alias: { '@': '/Users/aasish/Desktop/DREAM11/coinxi/src' }` — a hardcoded absolute path to the original machine. In the worktree at a different path, `@/lib/depth-utils` imports failed with "Cannot find package".
- **Fix:** Changed to `path.resolve(__dirname, 'src')` which resolves relative to vitest.config.ts regardless of machine path
- **Files modified:** `coinxi/vitest.config.ts`
- **Verification:** All 65 tests pass after fix
- **Committed in:** `51a416e` (Task 1 commit)

**2. [Rule 1 - Bug] Replaced circular tsconfig.json symlink with proper config**
- **Found during:** Task 1 (TypeScript verification step)
- **Issue:** `tsconfig.json` was a symlink pointing to itself (`tsconfig.json -> /Users/aasish/Desktop/DREAM11/coinxi/tsconfig.json`), creating a circular reference. `tsc --noEmit` displayed help text instead of type-checking because no valid tsconfig was found.
- **Fix:** Removed symlink, created proper `tsconfig.json` with standard Next.js 16 compiler options extracted from `tsconfig.tsbuildinfo`. Used `jsx: react-jsx` (not `preserve`) to keep Vitest TSX integration tests working.
- **Files modified:** `coinxi/tsconfig.json`
- **Verification:** All 65 tests pass; TypeScript errors in my new files: 0
- **Committed in:** `51a416e` (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 × Rule 1 - Bug)
**Impact on plan:** Both fixes were necessary for test execution and TypeScript verification in the worktree environment. No scope creep — all changes directly enabled plan deliverables.

## Issues Encountered

- `lightweight-charts` AreaSeries `setData()` type: `DepthPoint.time` is `number` but `ISeriesApi<'Area'>.setData()` expects `AreaData<Time>[]`. Used `as any` type cast at call site since the numeric price-as-time pattern is valid at runtime even if TypeScript's nominal types reject it. Pre-existing TypeScript errors in `src/__tests__/hooks/` test files (from prior phases) remain — out of scope for this plan.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All Phase 5 code tasks complete
- Visual checkpoint (Task 3) pending user verification
- After visual approval, Phase 5 / CoinXI v1.0 milestone is complete

## Known Stubs

None — DepthChart receives live bids/asks from useOrderBook hook which updates on every Socket.IO orderbook event.

## Threat Flags

None — plan is UI-only. DepthChart consumes bids/asks already stripped of userId by safeBook() (T-05-01 accepted). No new trust boundaries.

## Self-Check: PASSED

Files exist:
- FOUND: `coinxi/src/lib/depth-utils.ts` (exports computeCumulativeDepth)
- FOUND: `coinxi/src/__tests__/lib/depth-utils.test.ts` (4 test cases)
- FOUND: `coinxi/src/components/DepthChart.tsx` (contains 'use client', createChart, AreaSeries, h-[200px])
- FOUND: `coinxi/src/app/(main)/template.tsx` (contains motion.div, opacity 0→1)
- FOUND: `coinxi/src/app/(main)/trade/page.tsx` (contains DepthChart import and usage)

Commits exist:
- FOUND: `51a416e` — feat(05-02): install lightweight-charts + DepthChart + depth-utils
- FOUND: `65fc6b6` — feat(05-02): page transitions via template.tsx + PriceTicker verified

---
*Phase: 05-polish-mobile*
*Completed: 2026-04-09*
