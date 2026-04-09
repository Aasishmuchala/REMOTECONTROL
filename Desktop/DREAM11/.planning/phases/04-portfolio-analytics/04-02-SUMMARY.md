---
phase: 04-portfolio-analytics
plan: "02"
subsystem: api
tags: [api, portfolio, orders, tdd, security, drizzle]
dependency_graph:
  requires:
    - 04-01 (computePositions pure function and Position type)
    - auth.ts (getAuthUser, jsonResponse, errorResponse)
    - schema.ts (orders, tradingPairs tables)
    - wallet.ts (getTradeHistory)
  provides:
    - GET /api/portfolio — server-side position computation endpoint
    - GET /api/orders/all — cross-pair order listing with status tabs and 7-day limit
  affects:
    - 05-* (portfolio UI will consume /api/portfolio)
tech_stack:
  added: []
  patterns:
    - Two-query Drizzle pattern for different date policies (pending vs historical)
    - vi.resetModules() in beforeEach for test isolation with dynamic imports
    - DB-level date filtering with gte() — not JS post-filter (D-07)
key_files:
  created:
    - coinxi/src/app/api/portfolio/route.ts
    - coinxi/src/app/api/orders/all/route.ts
    - coinxi/src/__tests__/api/orders-all.test.ts
    - coinxi/src/db/schema.ts
    - coinxi/src/lib/auth.ts
    - coinxi/src/__tests__/setup.ts
    - coinxi/src/__tests__/helpers/db.ts
  modified:
    - coinxi/vitest.config.ts (switched from tsconfigPaths plugin to resolve.alias)
    - coinxi/tsconfig.json (symlinked from main directory)
decisions:
  - Switched vitest.config.ts from vite-tsconfig-paths plugin to resolve.alias because
    the worktree lacks node_modules natively; the plugin message suggested this migration
  - Added vi.resetModules() in beforeEach to ensure each test gets fresh module imports
    with correct db mock — required because vi.doMock caches module instances across tests
  - Committed schema.ts and auth.ts as new files (they were untracked in main repo);
    these are foundational files needed by all exchange API routes
  - Symlinked node_modules and tsconfig.json from main DREAM11/coinxi to worktree
    so tests can run from the worktree with the installed dependencies
metrics:
  duration: "~5min"
  completed_date: "2026-04-09"
  tasks_completed: 3
  files_created_or_modified: 9
---

# Phase 04 Plan 02: Portfolio and Orders API Endpoints Summary

Two API endpoints that power the portfolio dashboard: GET /api/portfolio (position
computation from fills via computePositions) and GET /api/orders/all (cross-pair order
listing with status tabs and DB-level 7-day limit for filled/cancelled orders).

## What Was Built

### GET /api/portfolio (`coinxi/src/app/api/portfolio/route.ts`)

Auth-protected endpoint that:
1. Calls `getAuthUser(req)` — returns 401 on missing/invalid JWT (T-04-06)
2. Fetches all user trade fills via `getTradeHistory(db, user.userId, 1, 999999)` (no pagination cap)
3. Builds a prices map from `db.select().from(tradingPairs)` using `lastPrice` column
4. Calls `computePositions(trades, prices)` — decimal.js precision, pure function from Plan 01
5. Returns aggregated `Position[]` only — not raw fill data (D-04 information disclosure mitigation)

### GET /api/orders/all (`coinxi/src/app/api/orders/all/route.ts`)

Auth-protected endpoint with status filtering and D-07 DoS protection:
1. Auth check (T-04-06: 401 on null user)
2. Status param parsed from searchParams; validated against `['open', 'partial', 'filled', 'cancelled']` whitelist (T-04-03: 400 on invalid)
3. **Two-query pattern** enforced at DB level:
   - Query 1: `open`/`partial` orders — no date filter; always returned regardless of age
   - Query 2: `filled`/`cancelled` orders — `gte(orders.createdAt, sevenDaysAgo)` applied in Drizzle WHERE clause (D-07: prevents unbounded result sets)
4. Both queries filter by `eq(orders.userId, user.userId)` (T-04-02: IDOR protection)
5. Results merged and sorted by `createdAt DESC`

### Test Infrastructure Added

- `src/__tests__/setup.ts` — mocks next/server (MockNextRequest), sets JWT_SECRET
- `src/__tests__/helpers/db.ts` — `createTestDb()`, `seedUser()`, `seedTradingPair()` using in-memory better-sqlite3
- `src/db/schema.ts` — Drizzle table definitions for all exchange tables (was untracked)
- `src/lib/auth.ts` — JWT auth helpers, getAuthUser, jsonResponse, errorResponse (was untracked)

## Test Results

All 7 tests in `orders-all.test.ts` pass (GREEN phase):
- Test 1: status=open returns only open orders
- Test 2: status=filled returns filled orders within 7 days
- Test 3: filled orders older than 7 days excluded (D-07 DoS protection)
- Test 4: no status param returns mixed result with correct date limits
- Test 5: invalid status returns 400
- Test 6: unauthenticated request returns 401
- Test 7: other users' orders not returned (IDOR protection)

Full suite: 51 tests pass across 8 test files. 1 pre-existing failure in trading-ui-e2e.test.tsx (`@/stores/auth` missing — deferred from phase 03, documented in deferred-items.md).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest.config.ts path alias resolution in worktree**
- **Found during:** Task 1 setup
- **Issue:** The worktree lacks node_modules; vite-tsconfig-paths plugin failed to resolve `@/` aliases when running tests from the worktree path
- **Fix:** Replaced `plugins: [tsconfigPaths()]` with `resolve: { alias: { '@': '...' } }` using absolute worktree path. Also symlinked node_modules and tsconfig.json from main DREAM11/coinxi directory
- **Files modified:** `coinxi/vitest.config.ts`
- **Commit:** a65837b

**2. [Rule 3 - Blocking] Prerequisite files (schema.ts, auth.ts) not in committed tree**
- **Found during:** Task 1 setup
- **Issue:** `src/db/schema.ts` and `src/lib/auth.ts` were untracked in the main repo but required by all exchange API routes and tests. The worktree only contains committed files.
- **Fix:** Added both files as new committed files in this plan (copied from main untracked versions)
- **Files modified:** `src/db/schema.ts`, `src/lib/auth.ts`, `src/__tests__/setup.ts`, `src/__tests__/helpers/db.ts`
- **Commit:** a65837b

**3. [Rule 1 - Bug] Test module isolation failure with vi.doMock**
- **Found during:** Task 3 GREEN phase
- **Issue:** Tests 2-7 failed with "database connection is not open" because `vi.doMock` caches module instances across tests. After Test 1's `afterEach` closed sqlite, subsequent tests re-used the cached route module pointing to the closed DB.
- **Fix:** Added `vi.resetModules()` in `beforeEach` so each test gets fresh module imports with the correct db instance
- **Files modified:** `src/__tests__/api/orders-all.test.ts`
- **Commit:** ebc7971

## Known Stubs

None. Both endpoints are fully wired to real DB queries.

## Threat Flags

No new threat surface beyond what was already declared in the plan's threat_model. All mitigations applied:
- T-04-02: IDOR protection — `eq(orders.userId, user.userId)` in all queries
- T-04-03: Status whitelist validation
- T-04-04: D-07 DB-level 7-day filter with `gte(orders.createdAt, sevenDaysAgo)`
- T-04-05: D-04 aggregated Position[] only, not raw fills
- T-04-06: JWT auth guard on both endpoints

## Commits

| Hash    | Type | Description |
|---------|------|-------------|
| a65837b | test | RED phase — 7 failing tests + prerequisite files + vitest config fix |
| 1171fb6 | feat | GET /api/portfolio endpoint |
| ebc7971 | feat | GET /api/orders/all with DB-level date filtering + GREEN phase fix |

## Self-Check: PASSED

All 8 created files exist on disk. All 3 task commits (a65837b, 1171fb6, ebc7971) verified in git log. 51 tests pass.
