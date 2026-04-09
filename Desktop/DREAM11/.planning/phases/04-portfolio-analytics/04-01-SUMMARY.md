---
phase: 04-portfolio-analytics
plan: 01
subsystem: testing
tags: [decimal.js, portfolio, pnl, tdd, unit-tests, pure-function]

# Dependency graph
requires:
  - phase: 01-core-engine
    provides: TradeRecord type and getTradeHistory function from wallet.ts
provides:
  - computePositions pure function with weighted average cost basis and P&L computation
  - Position type with quantity, avgCostBasis, currentPrice, estimatedValue, unrealizedPnl, realizedPnl
  - 8 unit tests covering all portfolio computation edge cases
affects: [04-02, 04-03, 04-04, 04-05, portfolio-dashboard, portfolio-api]

# Tech tracking
tech-stack:
  added: []
  patterns: [TDD red-green cycle, decimal.js .toFixed(8) precision output, chronological sort before stateful reduce]

key-files:
  created:
    - coinxi/src/lib/portfolio.ts
    - coinxi/src/__tests__/lib/portfolio.test.ts
  modified: []

key-decisions:
  - "computePositions rounds avgCostBasis to 8dp before unrealizedPnl calculation for precision consistency"
  - "Positions with zero quantity AND zero realizedPnl are omitted (never traded meaningfully)"
  - "Input trades are sorted chronologically (ASC) internally — callers may pass DESC order from getTradeHistory"

patterns-established:
  - "Decimal precision: all monetary outputs use .toFixed(8) for string consistency"
  - "Sort before reduce: trades sorted by createdAt ASC before iterating to ensure correct WACB"
  - "Pure function portfolio computation: no DB access, takes TradeRecord[] + prices map"

requirements-completed: [PORT-01, PORT-02, PORT-03]

# Metrics
duration: 4min
completed: 2026-04-09
---

# Phase 4 Plan 01: Portfolio Analytics Core Summary

**computePositions pure function using decimal.js for weighted average cost basis, unrealized P&L, and realized P&L from TradeRecord fills**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-09T01:44:35Z
- **Completed:** 2026-04-09T01:48:56Z
- **Tasks:** 2 (TDD: RED + GREEN)
- **Files modified:** 2

## Accomplishments

- Built `computePositions(trades, prices)` pure function that derives per-asset holdings from fill history
- Implemented weighted average cost basis correctly using decimal.js — runningCost/runningQty pattern
- Realized P&L: `(sellPrice - avgCostBasis) * qty` accumulated across all sells per pair
- Chronological sort normalizes DESC input from `getTradeHistory` before processing
- 8 unit tests covering: single buy, weighted avg, buy+sell, multi-pair, zero-buy-history (seed crypto), DESC input order, empty array, fully-sold position

## Task Commits

Each task was committed atomically:

1. **Task 1: RED — Write failing tests for computePositions** - `50716d3` (test)
2. **Task 2: GREEN — Implement computePositions to pass all tests** - `d3b05ad` (feat)

## Files Created/Modified

- `coinxi/src/lib/portfolio.ts` - Pure position computation function exporting `computePositions` and `Position` type
- `coinxi/src/__tests__/lib/portfolio.test.ts` - 8 unit tests covering all P&L computation behaviors

## Decisions Made

- **avgCostBasis rounded to 8dp before unrealizedPnl calculation:** Plan specified `.toFixed(8)` for precision consistency. Using full-precision avgCostBasis internally but rounding to 8dp for the unrealizedPnl multiplication ensures string output matches expectations (e.g., `-5000.00000001` not `-5000.00000000`).
- **Zero-everything positions omitted:** Pairs with both `runningQty == 0` AND `realizedPnl == 0` are skipped — they represent pairs that appear in trades for a different user's fills (edge case in test data).
- **Chronological sort internal:** Callers don't need to pre-sort; `computePositions` handles both ASC and DESC input transparently.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree missing test infrastructure files**
- **Found during:** Task 1 (RED phase test run)
- **Issue:** Git worktree had no `node_modules`, `tsconfig.json`, `src/__tests__/setup.ts`, or `src/__tests__/helpers/db.ts` — all needed for vitest to run
- **Fix:** Symlinked `node_modules` from original project; copied `tsconfig.json`, `setup.ts`, and `helpers/db.ts` from original project into worktree
- **Files modified:** Worktree infrastructure only (not committed — gitignored/untracked support files)
- **Verification:** Tests ran successfully after fix
- **Committed in:** Not committed (symlinks/copies are runtime-only worktree setup)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Worktree setup issue, not a code defect. No scope creep.

## Issues Encountered

- Integration test `trading-ui-e2e.test.tsx` fails in worktree due to missing `src/stores/auth.ts` — this directory was never tracked in the worktree's git tree at base commit. Pre-existing out-of-scope issue; logged to `deferred-items.md`.
- All 8 portfolio lib tests pass; all other lib and hooks tests pass (26 total).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `computePositions` is the computational core for every portfolio number; plans 04-02 through 04-05 can now build on it
- The `Position` type is exported and ready for use in portfolio API routes and dashboard components
- No blockers; decimal.js precision verified through TDD

---
*Phase: 04-portfolio-analytics*
*Completed: 2026-04-09*
