# Phase 2: Market Data & Real-Time - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-08
**Phase:** 02-market-data-real-time
**Areas discussed:** Real-time transport, Price simulation, Order book state, Order book row animations, Broadcast frequency, Recent trades feed, Client hook design

---

## Real-time Transport

| Option | Description | Selected |
|--------|-------------|----------|
| Socket.IO + custom server | Add socket.io, create server.ts, room-based broadcasting | ✓ |
| SSE — Server-Sent Events | Built-in App Router streaming, zero packages | |
| Client-side polling | setInterval + fetch, no new infra | |

**User's choice:** Socket.IO + custom server
**Notes:** Matches roadmap goal of "Socket.IO room-based broadcasting"

---

## Socket.IO Room Structure

| Option | Description | Selected |
|--------|-------------|----------|
| One room per pair | Client joins 'BTC-USDC' etc, targeted broadcast | |
| Single broadcast to all | All clients get all pairs, client-side filtering | ✓ |

**User's choice:** Single broadcast to all clients

---

## Price Simulation

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side loop (custom server) | Synchronized across clients, runs in Socket.IO server | ✓ |
| Client-side only | Each tab runs own simulation, not synchronized | |

**User's choice:** Deferred to Claude — chose server-side as optimal given Socket.IO server is already running

---

## Order Book State

| Option | Description | Selected |
|--------|-------------|----------|
| Re-query DB on each tick | Uses existing getOrderBook(), always accurate | ✓ |
| In-memory aggregator | Event-driven, fast, loses state on restart | |

**User's choice:** Re-query DB on each tick

---

## Order Book Row Animations (UI-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Flash highlight on change | Brief cyan/red flash on quantity change | |
| AnimatePresence slide-in | New levels slide in, removed slide out | |
| Both — flash + slide | New levels slide, updates flash, removals fade | ✓ |

**User's choice:** Both — flash on update + slide for new/removed rows

---

## Broadcast Frequency

| Option | Description | Selected |
|--------|-------------|----------|
| 1 second | Balanced live feel, low animation overlap | ✓ |
| 500ms | Snappier, animations may overlap | |
| 2 seconds | Calmer, more readable | |

**User's choice:** 1 second

---

## Recent Trades Feed

| Option | Description | Selected |
|--------|-------------|----------|
| Prepend newest at top, max 50 | New trades slide in at top, green/red coloring | ✓ |
| Append to bottom, auto-scroll | Log-style, less common for exchanges | |
| Separate tab/section | Own GlassCard, not inline with order book | |

**User's choice:** Prepend newest at top, max 50 shown

---

## Client Hook Design

| Option | Description | Selected |
|--------|-------------|----------|
| Custom hooks (useOrderBook + usePriceFeed) | Composable, testable, per-component | ✓ |
| Global Zustand store | Centralized, avoids prop drilling | |
| Direct in trade page | Simplest, no abstraction | |

**User's choice:** Custom hooks — useOrderBook, usePriceFeed, useRecentTrades

---

## Claude's Discretion

- Price simulation parameters (random walk formula details)
- Socket.IO configuration details
- TypeScript interface locations
- Single vs per-hook socket instance (decided: single shared instance)

## Deferred Ideas

- Depth chart visualization — Phase 5
- Candlestick charts — Phase 5
- Socket.IO per-user authentication — not needed for friends-only app
