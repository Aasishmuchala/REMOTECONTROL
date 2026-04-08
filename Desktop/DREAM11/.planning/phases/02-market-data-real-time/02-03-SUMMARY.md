---
phase: 02-market-data-real-time
plan: "03"
subsystem: client-hooks
tags: [socket.io-client, react-hooks, real-time, order-book, price-feed, trades]
dependency_graph:
  requires: ["02-02"]
  provides: ["useOrderBook", "usePriceFeed", "useRecentTrades", "getSocket"]
  affects: ["03-trade-ui-connect"]
tech_stack:
  added: ["socket.io-client singleton pattern"]
  patterns: ["useRef for previous state", "pairId filtering", "useEffect cleanup"]
key_files:
  created:
    - coinxi/src/lib/socket-client.ts
    - coinxi/src/hooks/useOrderBook.ts
    - coinxi/src/hooks/usePriceFeed.ts
    - coinxi/src/hooks/useRecentTrades.ts
  modified: []
decisions:
  - "getSocket() lazy singleton: socket created only on first call, null guard pattern"
  - "useRecentTrades replaces trades array on each event (server sends full latest batch, not incremental)"
  - "usePriceFeed stores prevPriceRef as string to avoid floating point precision issues in comparison"
metrics:
  duration: "76s"
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 02 Plan 03: Client Hooks (Socket Singleton + 3 React Hooks) Summary

**One-liner:** Socket.IO client singleton with three React hooks (useOrderBook, usePriceFeed, useRecentTrades) that subscribe to live market events, filter by pairId, and clean up on unmount.

## What Was Built

### coinxi/src/lib/socket-client.ts
Lazy singleton returning a typed `Socket<ServerToClientEvents, ClientToServerEvents>`. Created once on first `getSocket()` call, shared across all hooks. Uses `path: '/socket.io'` to match the server configuration from Plan 02-02.

### coinxi/src/hooks/useOrderBook.ts
Subscribes to `'orderbook'` socket events. Filters by pairId. Stores previous book state in `useRef` to compute diffs via `diffOrderBook()` on each update. Returns `{ bids, asks, bidsDiff, asksDiff }`. Initial state: empty arrays and empty diff Sets.

### coinxi/src/hooks/usePriceFeed.ts
Subscribes to `'price'` socket events. Compares current price to previous (stored in `useRef`) to derive direction: `'up'` / `'down'` / `'neutral'`. Initial state: `{ price: '--', direction: 'neutral' }`. First tick is always neutral (no previous to compare against).

### coinxi/src/hooks/useRecentTrades.ts
Subscribes to `'trades'` socket events. Replaces the full trades array on each event (server already sends the latest 50). Returns `{ trades: Trade[] }`. Initial state: `{ trades: [] }`.

## Test Results

All tests go GREEN:
- `useOrderBook.test.tsx`: 4/4 passed
- `usePriceFeed.test.tsx`: 5/5 passed
- `useRecentTrades.test.tsx`: 4/4 passed
- Full suite: **109/109 passed** (10 test files, no regressions)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All four files are fully implemented with real socket subscriptions and state management.

## Threat Flags

No new threat surface introduced. All hooks connect to same-origin Socket.IO (public market data only, no user credentials on socket). Threat register entries T-02-04 and T-02-05 were reviewed and accepted in the plan.

## Self-Check

Files exist:
- coinxi/src/lib/socket-client.ts: FOUND
- coinxi/src/hooks/useOrderBook.ts: FOUND
- coinxi/src/hooks/usePriceFeed.ts: FOUND
- coinxi/src/hooks/useRecentTrades.ts: FOUND

Commits exist:
- af90bb9: feat(02-03): implement socket-client singleton and useOrderBook hook
- 1317a1b: feat(02-03): implement usePriceFeed and useRecentTrades hooks

## Self-Check: PASSED
