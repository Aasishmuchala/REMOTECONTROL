---
phase: 02-market-data-real-time
plan: 01
subsystem: testing
tags: [socket.io, vitest, tdd, typescript, react-testing-library]

requires:
  - phase: 01-core-engine
    provides: matching-engine, wallet, auth, DB schema — all financial primitives this phase broadcasts

provides:
  - Socket.IO type contracts (BookLevel, Trade, ServerToClientEvents, ClientToServerEvents)
  - price-simulator.ts stub (createSimulators, simulateTick — RED phase stubs)
  - order-book-diff.ts stub (diffOrderBook, getRowStatus — RED phase stubs)
  - 6 failing test files establishing the full TDD test suite for Phase 2
  - Vitest config extended for .tsx tests + jsdom environment + Phase 2 coverage

affects: [02-02-PLAN, 02-03-PLAN, 02-04-PLAN]

tech-stack:
  added:
    - socket.io@4.8.3
    - socket.io-client@4.8.3
    - "@testing-library/react@16.3.2"
    - jsdom@29.0.2
  patterns:
    - TDD RED phase — stub functions throw 'Not implemented', tests describe desired behavior
    - environmentMatchGlobs for per-file jsdom/node Vitest environment routing
    - Socket.IO integration test pattern — real Server on port 0, real client connection

key-files:
  created:
    - coinxi/src/types/socket.ts
    - coinxi/src/lib/price-simulator.ts
    - coinxi/src/lib/order-book-diff.ts
    - coinxi/src/__tests__/lib/price-simulator.test.ts
    - coinxi/src/__tests__/lib/order-book-diff.test.ts
    - coinxi/src/__tests__/integration/socket-broadcast.test.ts
    - coinxi/src/__tests__/hooks/useOrderBook.test.tsx
    - coinxi/src/__tests__/hooks/usePriceFeed.test.tsx
    - coinxi/src/__tests__/hooks/useRecentTrades.test.tsx
  modified:
    - coinxi/package.json
    - coinxi/vitest.config.ts

key-decisions:
  - "Stub modules throw 'Not implemented' — import resolves but all logic is deferred to Plan 02"
  - "Hook tests use dynamic import inside beforeEach so test file parses successfully even when hook modules don't exist yet"
  - "Integration test uses real Socket.IO Server on port 0 — no fake timers, no vi.useFakeTimers()"
  - "environmentMatchGlobs routes .tsx tests to jsdom, .ts tests remain in node environment"

patterns-established:
  - "TDD RED pattern: stubs export correct types + throw, tests import and assert expected behavior"
  - "Socket.IO integration test: createServer() → listen(0) → connect client → emit from server → assert client"
  - "Security test pattern: assert payload does NOT contain private fields (T-02-01 userId check)"

requirements-completed: [BOOK-01, BOOK-02, BOOK-03, BOOK-04, BOOK-05, UI-05]

duration: 3min
completed: 2026-04-08
---

# Phase 2 Plan 01: Market Data Real-Time — RED Phase Summary

**TDD Wave 0: Socket.IO type contracts, pure-function stubs, and 6 failing tests establishing the complete Phase 2 test suite.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-08T13:30:12Z
- **Completed:** 2026-04-08T13:33:30Z
- **Tasks:** 2 completed
- **Files modified:** 11

## Accomplishments

### Task 1: Packages + Type Contracts + Stubs + Vitest Config

- Installed `socket.io@4.8.3` and `socket.io-client@4.8.3` as production dependencies
- Installed `@testing-library/react@16.3.2` and `jsdom@29.0.2` as devDependencies
- Created `src/types/socket.ts` with full Socket.IO event interfaces: `BookLevel`, `Trade`, `ServerToClientEvents`, `ClientToServerEvents`
- Created `src/lib/price-simulator.ts` stub exporting `PriceSimulators`, `createSimulators`, `simulateTick` — all throw `'Not implemented'`
- Created `src/lib/order-book-diff.ts` stub exporting `BookLevel`, `RowStatus`, `DiffResult`, `diffOrderBook`, `getRowStatus` — throw `'Not implemented'`
- Updated `vitest.config.ts`: extended `include` pattern to `*.test.{ts,tsx}`, added `environmentMatchGlobs` for jsdom on `.tsx` files, added 5 Phase 2 modules to `coverage.include`

### Task 2: 6 Failing Test Files (RED Phase)

- **price-simulator.test.ts** (7 tests) — createSimulators returns record, simulateTick returns 2dp string, stays within 0.1% per tick, mutates state in place, bounded after 1000 ticks, Decimal.toFixed(2) format
- **order-book-diff.test.ts** (11 tests) — detects added/updated/removed rows, empty diff for identical books, empty prev (all added), empty curr (all removed), mixed diff, getRowStatus returns all 4 statuses
- **socket-broadcast.test.ts** (5 integration tests) — price/orderbook/trades event shapes, T-02-01 security assertion (no `userId` in orderbook payload), exact `{price, quantity}` object structure
- **useOrderBook.test.tsx** (4 tests) — initial state, update on matching pairId, ignore different pairId, bidsDiff/asksDiff computed on update
- **usePriceFeed.test.tsx** (5 tests) — initial `{price:'--', direction:'neutral'}`, updates price, direction 'up' on increase, direction 'down' on decrease, ignores wrong pairId
- **useRecentTrades.test.tsx** (4 tests) — initial empty array, updates on matching pairId, ignores wrong pairId, replaces on each event

## Test Run Results

- `price-simulator.test.ts`: **18 FAIL** (all throw 'Not implemented') — RED confirmed
- `order-book-diff.test.ts`: included in above run — RED confirmed
- `socket-broadcast.test.ts`: **5 PASS** (infrastructure validated — server emits test data directly)
- Hook tests: **FAIL at import** (modules `@/hooks/useOrderBook` etc. don't exist yet) — RED confirmed

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

| File | Stub | Reason |
|------|------|--------|
| `src/lib/price-simulator.ts` | `createSimulators`, `simulateTick` | RED phase — logic implemented in Plan 02 |
| `src/lib/order-book-diff.ts` | `diffOrderBook`, `getRowStatus` | RED phase — logic implemented in Plan 02 |
| `src/hooks/useOrderBook.ts` | (file missing) | Implemented in Plan 03 |
| `src/hooks/usePriceFeed.ts` | (file missing) | Implemented in Plan 03 |
| `src/hooks/useRecentTrades.ts` | (file missing) | Implemented in Plan 03 |

These stubs are intentional — this is Wave 0 of TDD. The plan's goal is RED phase, not GREEN.

## Threat Flags

No new security surface introduced. Type definitions and stubs do not expose any network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- All 9 source/test files confirmed present on disk
- Commits `586621f` and `1c4973d` confirmed in git log
- `vitest.config.ts` contains `test.tsx` pattern and `price-simulator` coverage entry
