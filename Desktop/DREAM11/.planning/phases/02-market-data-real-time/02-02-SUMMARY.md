---
phase: 02-market-data-real-time
plan: 02
subsystem: server
tags: [socket.io, price-simulation, order-book-diff, matching-engine, custom-server]
dependency_graph:
  requires: ["02-01"]
  provides: ["02-03"]
  affects: ["coinxi/server.ts", "coinxi/src/lib/price-simulator.ts", "coinxi/src/lib/order-book-diff.ts", "coinxi/src/lib/matching-engine.ts"]
tech_stack:
  added: ["socket.io Server", "tsx custom server", "Decimal.js random walk", "Map-based diff algorithm"]
  patterns: ["safeBook() security strip", "setInterval broadcast loop", "httpServer shared port", "taker-side derivation from createdAt"]
key_files:
  created: ["coinxi/server.ts"]
  modified: ["coinxi/src/lib/price-simulator.ts", "coinxi/src/lib/order-book-diff.ts", "coinxi/src/lib/matching-engine.ts", "coinxi/package.json"]
decisions:
  - "Used httpServer option on next() so Next.js and Socket.IO share port 3000 — no EADDRINUSE risk"
  - "safeBook() maps Order[] to {price, quantity}[] stripping userId (T-02-01)"
  - "getRecentTrades derives taker side by comparing buyOrder.createdAt >= sellOrder.createdAt"
  - "Relative imports in server.ts (not @/ alias) — tsx runs as plain Node, tsconfig paths unavailable"
metrics:
  duration: "~3 minutes"
  completed: "2026-04-08T13:38:26Z"
  tasks_completed: 2
  files_changed: 5
---

# Phase 02 Plan 02: Market Data Real-Time (GREEN — Server) Summary

**One-liner:** Custom Next.js + Socket.IO server broadcasting price ticks (Decimal random walk), sanitized order book diffs, and recent trades every 1 second across 3 trading pairs.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Implement pure functions (price-simulator + order-book-diff) + getRecentTrades | 481a52c | DONE |
| 2 | Create server.ts + update package.json scripts | 30a764f | DONE |

## What Was Built

### price-simulator.ts
Replaced `throw new Error('Not implemented')` stubs with real logic:
- `createSimulators(baseValues)` — returns shallow copy of base price record
- `simulateTick(simulators, pairId)` — applies `newPrice = prev * (1 + (Math.random()-0.5)*0.002)`, stores result via `Decimal.toFixed(2)`, mutates in place

### order-book-diff.ts
Replaced stubs with Map-based diff algorithm:
- `diffOrderBook(prev, curr)` — builds price→quantity Maps, classifies each price as added/updated/removed
- `getRowStatus(price, diff)` — returns 'added'|'updated'|'removed'|'unchanged' by checking the three Sets

### matching-engine.ts (additive)
- Added `desc` import from `drizzle-orm`
- Added `getRecentTrades(db, pairId, limit=50)` — queries trades table ordered by `desc(createdAt)`, then fetches both orders per trade to compare `createdAt` timestamps; taker is whichever order was placed later

### server.ts (new file)
Custom entry point that:
1. Creates a single `httpServer` via `node:http`
2. Passes it to `next({ dev, hostname, port, httpServer })` — both frameworks share port 3000
3. Attaches `socket.io` Server to the same `httpServer`
4. Initializes `createSimulators` with BTC-USDC/ETH-USDC/SOL-USDC base prices
5. `setInterval(1000ms)`: for each pair — `simulateTick` → `getOrderBook` → `getRecentTrades` → `io.emit(price/orderbook/trades)`
6. `safeBook()` maps `Order[]` to `BookLevel[]` (`{price, quantity}` only) — strips `userId` and all private fields before broadcast

### package.json
- `"dev"` changed from `"next dev"` to `"npx tsx server.ts"`
- `"start"` changed from `"next start"` to `"NODE_ENV=production npx tsx server.ts"`
- `"build"`, `"lint"`, `"seed"`, `"test"`, `"test:watch"`, `"test:coverage"` unchanged

## Test Results

All 18 unit tests GREEN:
- `price-simulator.test.ts` — 7 tests pass (format, bounds, mutation, 1000-tick stability)
- `order-book-diff.test.ts` — 11 tests pass (added/updated/removed detection, empty cases, mixed)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all stubs replaced with real implementations.

## Threat Surface Scan

| Flag | File | Description |
|------|------|-------------|
| threat_flag: information_disclosure | coinxi/server.ts | safeBook() implemented — strips userId before broadcast (T-02-01 mitigated) |

No new unmitigated threat surface introduced.

## Self-Check: PASSED

Files created/modified:
- FOUND: coinxi/src/lib/price-simulator.ts
- FOUND: coinxi/src/lib/order-book-diff.ts
- FOUND: coinxi/src/lib/matching-engine.ts
- FOUND: coinxi/server.ts
- FOUND: coinxi/package.json

Commits:
- FOUND: 481a52c (feat(02-02): implement pure functions + getRecentTrades)
- FOUND: 30a764f (feat(02-02): create server.ts + update package.json dev/start scripts)
