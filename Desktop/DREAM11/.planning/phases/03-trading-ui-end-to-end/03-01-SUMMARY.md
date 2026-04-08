---
phase: 03-trading-ui-end-to-end
plan: 01
subsystem: trading-ui
tags: [react, props-wiring, slippage, polling, integration-tests]
dependency_graph:
  requires: [02-04]
  provides: [trading-ui-e2e-wiring]
  affects: [OrderForm, OpenOrders, trade-page]
tech_stack:
  added: []
  patterns: [prop-drilling, useCallback-deps, setInterval-cleanup, fake-timers]
key_files:
  created:
    - coinxi/src/__tests__/integration/trading-ui-e2e.test.tsx
  modified:
    - coinxi/src/components/OrderForm.tsx
    - coinxi/src/components/OpenOrders.tsx
    - coinxi/src/app/(main)/trade/page.tsx
key_decisions:
  - OrderForm fetchSlippage prefers live bids/asks props over REST when both present (conditional check `if (bids && asks)`)
  - OpenOrders refresh-on-order uses refreshKey in useCallback deps (identity change triggers existing useEffect) — no extra useEffect needed
  - Integration tests use `// @vitest-environment jsdom` docblock (same as hooks tests) rather than relying on environmentMatchGlobs glob matching
  - framer-motion mock extended with `motion.button` to cover Button component in test renders
  - jest-dom imported per-file in test rather than in setup.ts (setup.ts runs in node environment, not jsdom)
  - OpenOrders fake-timer tests use `vi.useFakeTimers()` scoped within test with try/finally to avoid inter-test contamination; `waitFor` used in real-timer tests only
metrics:
  duration: ~5.5 min
  completed: "2026-04-08"
  tasks_completed: 2
  files_changed: 4
requirements_satisfied: [UI-04]
---

# Phase 03 Plan 01: Trading UI End-to-End Wiring Summary

One-liner: Wired OrderForm to use live Socket.IO bids/asks for slippage with REST fallback, post-order refresh of wallet + OpenOrders, and 5s auto-poll via setInterval with fake-timer integration tests.

## What Was Built

Connected Phase 1 trading UI components with Phase 2 real-time data by adding three prop channels:

1. **OrderForm** — accepts optional `bids?: BookLevel[]` and `asks?: BookLevel[]` props; `fetchSlippage()` now uses these directly when present (no REST call to `/api/market`), falling back to REST only when props are absent. Also accepts `onOrderPlaced?: () => void` called after successful `submitOrder()`.

2. **OpenOrders** — accepts `refreshKey?: number` prop added to `loadOrders` useCallback dependency array (causes identity change → existing useEffect re-runs on key change). Adds a second useEffect with `setInterval(() => loadOrders(), 5000)` and `clearInterval` cleanup.

3. **Trade page** — adds `refreshKey` state + `handleOrderPlaced` useCallback that re-fetches wallet balance and increments `refreshKey`. Passes `bids`, `asks`, `onOrderPlaced` to `<OrderForm>` and `refreshKey` to `<OpenOrders>`.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update OrderForm and OpenOrders to accept new props | 720cc7f | OrderForm.tsx, OpenOrders.tsx |
| 2 | Wire trade page and write integration tests | 3504d14 | trade/page.tsx, trading-ui-e2e.test.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `// @vitest-environment jsdom` docblock to integration test file**
- **Found during:** Task 2 — all 4 tests failed with "document is not defined"
- **Issue:** `environmentMatchGlobs` in vitest.config.ts did not match the integration test path; file ran in node environment
- **Fix:** Added `// @vitest-environment jsdom` docblock (same pattern as hooks test files)
- **Files modified:** trading-ui-e2e.test.tsx
- **Commit:** 3504d14

**2. [Rule 1 - Bug] Extended framer-motion mock to include `motion.button`**
- **Found during:** Task 2 — OrderForm tests failed with "Element type is invalid: expected a string or function but got undefined. Check render method of Button"
- **Issue:** `Button` component uses `motion.button`; original mock only covered `motion.div` and `motion.span`
- **Fix:** Added `motion.button` to framer-motion mock with passthrough render (filtering animation-only props)
- **Files modified:** trading-ui-e2e.test.tsx
- **Commit:** 3504d14

**3. [Rule 1 - Bug] Added `import '@testing-library/jest-dom'` to test file**
- **Found during:** Task 2 — `toBeInTheDocument` threw "Invalid Chai property"
- **Issue:** `@testing-library/jest-dom` is installed but not imported in setup.ts (which runs in node env); matchers not available in jsdom test files
- **Fix:** Added per-file import at top of integration test (library is installed; no install needed)
- **Files modified:** trading-ui-e2e.test.tsx
- **Commit:** 3504d14

**4. [Rule 1 - Bug] Scoped `vi.useFakeTimers()` to setInterval test only (not entire describe block)**
- **Found during:** Task 2 — refreshKey test timed out with fake timers active because `waitFor` uses `setTimeout` internally
- **Issue:** Plan specified fake timers in `beforeEach` for entire OpenOrders describe block; this deadlocks `waitFor` in the refreshKey test
- **Fix:** Moved `vi.useFakeTimers()` inside only the setInterval test using try/finally for cleanup; refreshKey test uses real timers with standard `waitFor`
- **Files modified:** trading-ui-e2e.test.tsx
- **Commit:** 3504d14

## Verification

- TypeScript: Compiles clean for all source files (pre-existing errors in `.next/` generated files and `useOrderBook.test.tsx` are out of scope)
- Tests: 113 passed (109 pre-existing + 4 new integration tests), 0 failures
- All acceptance criteria grep checks pass

## Known Stubs

None — all data flows are wired end-to-end.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary changes. The 5s polling interval hits the existing authenticated `/api/orders` endpoint (T-03-02 mitigated via `clearInterval` cleanup and existing try/catch error handling in `loadOrders`).

## Self-Check: PASSED

- coinxi/src/components/OrderForm.tsx — FOUND (modified)
- coinxi/src/components/OpenOrders.tsx — FOUND (modified)
- coinxi/src/app/(main)/trade/page.tsx — FOUND (modified)
- coinxi/src/__tests__/integration/trading-ui-e2e.test.tsx — FOUND (created)
- Commit 720cc7f — FOUND
- Commit 3504d14 — FOUND
- All 113 tests passing — VERIFIED
