# Phase 2: Market Data & Real-Time - Research

**Researched:** 2026-04-08
**Domain:** Socket.IO + Next.js 16 custom server, price simulation, order book diff, Framer Motion animations
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Socket.IO with a custom Next.js server (`server.ts`). Requires adding `socket.io` package and changing `dev`/`start` scripts to run the custom server.
- **D-02:** Single global broadcast to all connected clients — no rooms. Client-side filtering selects data for the currently viewed pair.
- **D-03:** Server pushes `orderbook` events and `price` events every 1 second via `setInterval`.
- **D-04:** Recent trades pushed as `trades` events alongside order book updates (same 1s interval).
- **D-05:** Server-side random walk running in the custom server process. All connected clients see the same synchronized prices simultaneously.
- **D-06:** Three independent price generators — one per pair (BTC-USDC, ETH-USDC, SOL-USDC). Random walk: `newPrice = prevPrice * (1 + (Math.random() - 0.5) * 0.002)`. Base prices: BTC ~50000, ETH ~3000, SOL ~100.
- **D-07:** Price is a `string` — use `new Decimal(price).toFixed(2)`.
- **D-08:** Re-query the database on each broadcast tick using existing `getOrderBook(db, pairId)`.
- **D-09:** Top 20 bids and top 20 asks per pair. Order book structure: `{ bids: [{ price, quantity }], asks: [{ price, quantity }] }`.
- **D-10:** Prepend newest trade at the top. Max 50 trades shown.
- **D-11:** Each trade entry shows: price (colored green=buy, red=sell), quantity, side, and relative timestamp.
- **D-12:** New trades slide in at the top using Framer Motion `AnimatePresence`.
- **D-13:** Both animation types: new levels slide in (x: -10→0 bids, x: 10→0 asks), updated quantity flashes cyan/red, removed levels fade + collapse.
- **D-14:** Track new/updated/removed by comparing previous order book state to current. Use `price` as stable row key.
- **D-15:** `useOrderBook(pairId)` + `usePriceFeed(pairId)` hooks.
- **D-16:** `useRecentTrades(pairId)` hook.
- **D-17:** Each hook manages socket connection internally using `socket.io-client`. Hooks clean up on unmount.
- **D-18:** Hooks live in `src/hooks/` directory (new directory).

### Claude's Discretion

- Exact random walk formula parameters (can tune the 0.2% tick size)
- Socket.IO server path configuration (default `/socket.io`)
- Reconnection logic (use socket.io-client defaults)
- TypeScript types for socket events (can define in `src/types/socket.ts`)
- Whether to share a single socket instance or create per-hook (single instance preferred)

### Deferred Ideas (OUT OF SCOPE)

- Depth chart (bid/ask cumulative volume visualization) — Phase 5
- Candlestick chart — Phase 5
- Price alert notifications — out of scope (v2)
- Socket.IO authentication / rooms per user — single broadcast is sufficient
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BOOK-01 | User can view live order book for selected trading pair | Custom server broadcasts via Socket.IO; `useOrderBook` hook subscribes |
| BOOK-02 | Order book shows top 20 bid levels (price + quantity) | getOrderBook() sliced to 20; server transforms Order[] → `{price, quantity}[]` |
| BOOK-03 | Order book shows top 20 ask levels (price + quantity) | Same as BOOK-02, asks side |
| BOOK-04 | Order book updates in real-time (WebSocket) | Socket.IO 1s setInterval broadcast, confirmed approach |
| BOOK-05 | User can view recent trades for selected pair | DB query for last 50 trades; `useRecentTrades` hook |
| UI-05 | Order book rows animate on insert/update | Framer Motion AnimatePresence + useAnimate flash; diff algorithm provides change map |
</phase_requirements>

---

## Summary

Phase 2 adds a custom Node.js server (`coinxi/server.ts`) that runs Socket.IO alongside Next.js 16. The custom server hosts a 1-second `setInterval` loop that: (1) advances three independent price simulators using a random walk, (2) re-queries the SQLite database via the existing `getOrderBook()` function, and (3) broadcasts `price`, `orderbook`, and `trades` events globally to all connected clients. The client side adds three React hooks in `src/hooks/` that subscribe to these events via `socket.io-client`.

The TDD strategy extracts pure functions (`simulateTick`, `diffOrderBook`) that can be unit-tested with zero mocking, while integration tests spin up a real Socket.IO server and assert received payloads. The animated order book uses Framer Motion `AnimatePresence` for enter/exit and `useAnimate` for imperative flash effects — driven by a diff object computed on each incoming payload.

**Primary recommendation:** Install `socket.io@4.8.3` + `socket.io-client@4.8.3`. Run the custom server with `npx tsx server.ts` (tsx is already installed at 4.21.0). No additional build tooling needed for development.

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

AGENTS.md at `coinxi/AGENTS.md` contains a critical directive:

> "This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."

**Confirmed from `node_modules/next/dist/docs/01-app/02-guides/custom-server.md`:**

- Custom server pattern uses `import next from 'next'` + `app.getRequestHandler()` + `createServer(handler).listen(port)`.
- The custom server file (`server.ts`) does NOT run through the Next.js compiler or bundler — it is plain Node.js executed directly.
- Turbopack is enabled by default in this version. The `next({ dev, turbopack: true })` option exists.
- `package.json` scripts must change: `"dev": "node server.js"` → for TypeScript: `"dev": "npx tsx server.ts"`.
- Custom server disables Automatic Static Optimization — acceptable for this exchange app.
- **Confirmed:** `httpServer` option exists on `next()` — pass the `http.Server` instance to Next.js to avoid port conflicts.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| socket.io | 4.8.3 | WebSocket server (custom Node.js server) | Latest stable; built-in TypeScript types since v3; no `@types/socket.io` needed |
| socket.io-client | 4.8.3 | Browser WebSocket client in React hooks | Matches server version; must be same major version as server |

[VERIFIED: npm registry — `npm view socket.io version` returned `4.8.3`]
[VERIFIED: npm registry — `npm view socket.io-client version` returned `4.8.3`]

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | 4.21.0 | Run TypeScript files directly in Node.js | Replaces `ts-node` for `dev`/`start` scripts; already in devDependencies |
| decimal.js | 10.6.0 | Price precision | All monetary values; price simulator output via `.toFixed(2)` |
| framer-motion | 12.38.0 | Order book animations | AnimatePresence (enter/exit rows) + useAnimate (flash) |
| vitest | 4.1.3 | Test runner | All unit and integration tests |
| date-fns | 4.1.0 | Relative timestamps | "3s ago" formatting in trades feed |

[VERIFIED: coinxi/package.json]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| socket.io | Native WebSocket (ws package) | socket.io adds auto-reconnect, rooms, fallback polling — but rooms not needed here; native ws is lighter |
| socket.io | SSE (Server-Sent Events) | SSE is one-way only; socket.io supports bidirectional (needed for future Phase 3 order placement flow) |
| tsx to run server.ts | ts-node | tsx is faster, already installed; ts-node would be a new devDependency |

### Installation

```bash
npm install socket.io socket.io-client
```

**Version verification:**
- `socket.io@4.8.3` — confirmed current as of 2026-04-08 [VERIFIED: npm registry]
- `socket.io-client@4.8.3` — confirmed current as of 2026-04-08 [VERIFIED: npm registry]
- No `@types/socket.io-client` needed — types are bundled since Socket.IO v3 [CITED: socket.io/docs/v4/typescript/]

---

## Architecture Patterns

### Recommended Project Structure

```
coinxi/
├── server.ts                        # NEW — Custom HTTP+Socket.IO server entry point
├── src/
│   ├── lib/
│   │   ├── price-simulator.ts       # NEW — Pure functions: createSimulator, simulateTick
│   │   ├── order-book-diff.ts       # NEW — Pure function: diffOrderBook(prev, curr)
│   │   └── matching-engine.ts       # EXISTING — getOrderBook() reused by server
│   ├── types/
│   │   └── socket.ts                # NEW — ServerToClientEvents, ClientToServerEvents
│   ├── hooks/                       # NEW directory
│   │   ├── useOrderBook.ts          # NEW — subscribes to 'orderbook' events
│   │   ├── usePriceFeed.ts          # NEW — subscribes to 'price' events
│   │   └── useRecentTrades.ts       # NEW — subscribes to 'trades' events
│   └── __tests__/
│       ├── lib/
│       │   ├── price-simulator.test.ts   # NEW
│       │   └── order-book-diff.test.ts   # NEW
│       └── integration/
│           └── socket-broadcast.test.ts  # NEW
```

### Pattern 1: Custom Server Structure (`server.ts`)

**What:** Plain Node.js entry point that boots Next.js and attaches Socket.IO to the same HTTP server.
**When to use:** Any time Socket.IO must share the same port as the Next.js app.

**Key structural decisions:**
- Pass the `httpServer` to `next({ dev, hostname, port, httpServer })` — confirmed option in local docs.
- Import `db` directly from `./src/db/index.ts` — this is a plain Drizzle/SQLite instance, fully importable from Node.js.
- `server.ts` must use ES module syntax (package.json has no `"type": "module"` but tsx handles this).

```typescript
// Source: socket.io/how-to/use-with-nextjs + coinxi/node_modules/next/dist/docs/01-app/02-guides/custom-server.md
import { createServer } from 'node:http'
import next from 'next'
import { Server } from 'socket.io'
import { db } from './src/db/index.js'
import { getOrderBook } from './src/lib/matching-engine.js'
import { createSimulators, simulateTick } from './src/lib/price-simulator.js'
import type { ServerToClientEvents, ClientToServerEvents } from './src/types/socket.js'

const port = parseInt(process.env.PORT || '3000', 10)
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'

const httpServer = createServer()
const app = next({ dev, hostname, port, httpServer })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  httpServer.on('request', (req, res) => handle(req, res))

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: '*' },
  })

  // Three independent price simulators — one per pair
  const simulators = createSimulators({
    'BTC-USDC': '50000.00',
    'ETH-USDC': '3000.00',
    'SOL-USDC': '100.00',
  })

  const PAIRS = ['BTC-USDC', 'ETH-USDC', 'SOL-USDC']

  setInterval(async () => {
    for (const pairId of PAIRS) {
      // Advance price simulation
      const price = simulateTick(simulators, pairId)

      // Re-query order book from DB
      const rawBook = await getOrderBook(db, pairId)
      const bids = rawBook.bids.slice(0, 20).map(o => ({ price: o.price!, quantity: o.quantity }))
      const asks = rawBook.asks.slice(0, 20).map(o => ({ price: o.price!, quantity: o.quantity }))

      // Query recent trades (last 50)
      const recentTrades = await getRecentTrades(db, pairId, 50)

      io.emit('price', { pairId, price })
      io.emit('orderbook', { pairId, bids, asks })
      io.emit('trades', { pairId, trades: recentTrades })
    }
  }, 1000)

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

**CRITICAL import path note for tsx:** When `server.ts` imports from `src/`, use paths relative to the project root. tsx resolves TypeScript path aliases from `tsconfig.json` — but `server.ts` is outside `src/`, so the `@/*` alias won't resolve. Use relative paths (`./src/db/index.js`) or configure a separate `tsconfig.server.json`. Recommended: use relative paths in `server.ts` only.

[ASSUMED: tsx resolves tsconfig paths only when the file is within the src directory — needs verification at implementation time]

### Pattern 2: TypeScript Event Types (`src/types/socket.ts`)

```typescript
// Source: socket.io/docs/v4/typescript/
export interface BookLevel {
  price: string
  quantity: string
}

export interface Trade {
  id: string
  pairId: string
  price: string
  quantity: string
  side: 'buy' | 'sell'
  createdAt: string
}

export interface ServerToClientEvents {
  price: (data: { pairId: string; price: string }) => void
  orderbook: (data: { pairId: string; bids: BookLevel[]; asks: BookLevel[] }) => void
  trades: (data: { pairId: string; trades: Trade[] }) => void
}

export interface ClientToServerEvents {
  // No client-to-server events in Phase 2 (single global broadcast)
}
```

### Pattern 3: Price Simulator (Pure Functions)

**Extracted as pure functions for testability** — no `setInterval` coupling, no IO.

```typescript
// src/lib/price-simulator.ts
import Decimal from 'decimal.js'

export type PriceSimulators = Record<string, string>  // pairId → current price string

export function createSimulators(baseValues: Record<string, string>): PriceSimulators {
  return { ...baseValues }
}

// Pure function — takes state, returns new state + output price
export function simulateTick(simulators: PriceSimulators, pairId: string): string {
  const current = new Decimal(simulators[pairId])
  // Random walk: 0.2% max tick, centered at 0
  const delta = (Math.random() - 0.5) * 0.002
  const next = current.mul(new Decimal(1).plus(delta))
  const rounded = next.toFixed(2)
  simulators[pairId] = rounded  // mutate in place (intentional — single shared state)
  return rounded
}
```

**Why this design:**
- `simulateTick` is testable without any timer mocking — call it N times, assert output is within bounds.
- Mutation of the record is acceptable since it's a singleton state, not a functional data structure.
- `Decimal` ensures the `* 0.002` multiplication preserves precision throughout.

### Pattern 4: Order Book Diff Algorithm (`src/lib/order-book-diff.ts`)

**What:** Compares previous and current order book state to classify rows as added/updated/removed.
**Key:** By `price` string (stable key per D-14).

```typescript
// src/lib/order-book-diff.ts
export interface BookLevel {
  price: string
  quantity: string
}

export type RowStatus = 'added' | 'updated' | 'removed' | 'unchanged'

export interface DiffResult {
  added: Set<string>      // price strings that are new
  updated: Set<string>    // price strings with changed quantity
  removed: Set<string>    // price strings no longer present
}

export function diffOrderBook(
  prev: BookLevel[],
  curr: BookLevel[],
): DiffResult {
  const prevMap = new Map(prev.map(l => [l.price, l.quantity]))
  const currMap = new Map(curr.map(l => [l.price, l.quantity]))

  const added = new Set<string>()
  const updated = new Set<string>()
  const removed = new Set<string>()

  for (const [price, qty] of currMap) {
    if (!prevMap.has(price)) {
      added.add(price)
    } else if (prevMap.get(price) !== qty) {
      updated.add(price)
    }
  }

  for (const price of prevMap.keys()) {
    if (!currMap.has(price)) {
      removed.add(price)
    }
  }

  return { added, updated, removed }
}

// Classify a single row's status given a diff result
export function getRowStatus(price: string, diff: DiffResult): RowStatus {
  if (diff.added.has(price)) return 'added'
  if (diff.updated.has(price)) return 'updated'
  if (diff.removed.has(price)) return 'removed'
  return 'unchanged'
}
```

**How the hook uses it:**

```typescript
// src/hooks/useOrderBook.ts (key logic)
const prevRef = useRef<{ bids: BookLevel[]; asks: BookLevel[] }>({ bids: [], asks: [] })

socket.on('orderbook', (data) => {
  if (data.pairId !== pairId) return
  const bidsDiff = diffOrderBook(prevRef.current.bids, data.bids)
  const asksDiff = diffOrderBook(prevRef.current.asks, data.asks)
  prevRef.current = { bids: data.bids, asks: data.asks }
  setBook({ bids: data.bids, asks: data.asks, bidsDiff, asksDiff })
})
```

### Pattern 5: React Hook Structure (`useOrderBook`)

**Socket instance sharing:** A singleton socket instance should be created once and shared across hooks to avoid multiple WebSocket connections from the same browser tab.

```typescript
// src/lib/socket-client.ts  (singleton — not a hook)
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  if (!socket) {
    socket = io({ path: '/socket.io' })  // connects to same origin
  }
  return socket
}
```

```typescript
// src/hooks/useOrderBook.ts
'use client'
import { useEffect, useRef, useState } from 'react'
import { getSocket } from '@/lib/socket-client'
import { diffOrderBook, DiffResult } from '@/lib/order-book-diff'
import type { BookLevel } from '@/types/socket'

interface OrderBookState {
  bids: BookLevel[]
  asks: BookLevel[]
  bidsDiff: DiffResult
  asksDiff: DiffResult
}

const EMPTY_DIFF: DiffResult = { added: new Set(), updated: new Set(), removed: new Set() }

export function useOrderBook(pairId: string) {
  const [book, setBook] = useState<OrderBookState>({
    bids: [], asks: [], bidsDiff: EMPTY_DIFF, asksDiff: EMPTY_DIFF,
  })
  const prevRef = useRef<{ bids: BookLevel[]; asks: BookLevel[] }>({ bids: [], asks: [] })

  useEffect(() => {
    const socket = getSocket()
    const handler = (data: { pairId: string; bids: BookLevel[]; asks: BookLevel[] }) => {
      if (data.pairId !== pairId) return
      const bidsDiff = diffOrderBook(prevRef.current.bids, data.bids)
      const asksDiff = diffOrderBook(prevRef.current.asks, data.asks)
      prevRef.current = { bids: data.bids, asks: data.asks }
      setBook({ bids: data.bids, asks: data.asks, bidsDiff, asksDiff })
    }
    socket.on('orderbook', handler)
    return () => { socket.off('orderbook', handler) }
  }, [pairId])

  return book
}
```

### Pattern 6: Framer Motion Order Book Row Animations

**AnimatePresence for enter/exit + useAnimate for flash:**

```typescript
// Source: motion.dev/docs/react-layout-animations + motion.dev/docs/react-motion-component
import { AnimatePresence, motion, useAnimate } from 'framer-motion'

// Each row component:
function OrderBookRow({ level, status, side }: {
  level: { price: string; quantity: string }
  status: 'added' | 'updated' | 'removed' | 'unchanged'
  side: 'bid' | 'ask'
}) {
  const [scope, animate] = useAnimate()

  // Flash effect on quantity update
  useEffect(() => {
    if (status === 'updated') {
      const flashColor = /* compare with prev to determine increase/decrease */ '#00d4ff'
      animate(scope.current, 
        { backgroundColor: [flashColor, 'transparent'] },
        { duration: 0.4, ease: 'easeOut' }
      )
    }
  }, [status, level.quantity])

  // Row variants for slide-in
  const variants = {
    initial: { x: side === 'bid' ? -10 : 10, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { opacity: 0, height: 0, overflow: 'hidden' },
  }

  return (
    <motion.tr
      ref={scope}
      key={level.price}
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      layoutDependency={level.quantity}  // Only re-measure on quantity change
    >
      <td>{level.price}</td>
      <td>{level.quantity}</td>
    </motion.tr>
  )
}

// Parent list:
function OrderBookSide({ levels, diff, side }: { levels: BookLevel[]; diff: DiffResult; side: 'bid' | 'ask' }) {
  return (
    <AnimatePresence mode="popLayout">
      {levels.map(level => (
        <OrderBookRow
          key={level.price}      // Stable key = price string (D-14)
          level={level}
          status={getRowStatus(level.price, diff)}
          side={side}
        />
      ))}
    </AnimatePresence>
  )
}
```

**Performance note:** `layoutDependency` tells Framer Motion to only run layout measurements when the passed value changes. For a 20-row order book updating at 1 Hz, this prevents unnecessary DOM measurements on every parent re-render. [CITED: motion.dev/docs/react-layout-animations]

**Import path for Framer Motion 12+:** Use `import { ... } from 'framer-motion'` — the `motion/react` alias is only needed for applications using the standalone Motion library without Framer Motion's full package. The existing `PriceTicker.tsx` already imports from `'framer-motion'` — maintain consistency.

[VERIFIED: coinxi/src/components/PriceTicker.tsx]

### Pattern 7: Recent Trades Feed

**AnimatePresence with `mode="popLayout"`** for prepend-at-top behavior:

```typescript
// Source: PriceTicker.tsx pattern — AnimatePresence mode="wait" → use mode="popLayout" for lists
<AnimatePresence mode="popLayout">
  {trades.slice(0, 50).map(trade => (
    <motion.tr
      key={trade.id}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <td style={{ color: trade.side === 'buy' ? 'var(--color-green)' : 'var(--color-red)' }}>
        {trade.price}
      </td>
      <td>{trade.quantity}</td>
      <td>{formatDistanceToNow(new Date(trade.createdAt), { addSuffix: true })}</td>
    </motion.tr>
  ))}
</AnimatePresence>
```

**`mode="popLayout"` vs `mode="wait"`:** `popLayout` instantly removes exiting elements from layout flow before they animate out — ideal for a bounded list (max 50 items) where new items push old ones off the bottom without layout jank. `mode="wait"` (used in PriceTicker) would block new items entering until old ones exit — wrong for a live feed.

### Anti-Patterns to Avoid

- **Don't share `io` instance across module boundaries in tests:** Always create a fresh Server + httpServer per test suite to avoid port conflicts. Use `httpServer.listen(0)` (port 0) to get a random available port.
- **Don't use `key={index}` for order book rows:** Framer Motion requires stable keys for enter/exit detection. Use `level.price` (per D-14).
- **Don't import `db` from `@/db` in server.ts:** The `@` alias is a tsconfig path that only applies inside the Next.js build. Use relative paths from the repo root: `./src/db/index.js`.
- **Don't add `tsx` as a build dependency for production:** Only needed for dev/start scripts. The tsx package is already in `devDependencies`.
- **Don't call `vi.useFakeTimers()` without cleanup:** Always pair with `afterEach(() => vi.useRealTimers())`. Socket.IO client uses real timeouts internally for reconnection — fake timers will interfere with integration tests.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Random walk bounded-ness | Custom clamping logic | Decimal.js `* (1 + delta)` — naturally bounded by multiplicative random walk | Multiplicative RW can't reach 0 or go negative (unlike additive), automatically stays proportional |
| Relative timestamps | Manual `Date.now()` arithmetic | `date-fns` `formatDistanceToNow()` | Already installed; handles locale, edge cases (sub-1s, minutes, hours) |
| WebSocket reconnection | Manual retry loop | socket.io-client defaults | Built-in exponential backoff, connection state events |
| Socket TypeScript types | Untyped `any` | TypeScript generics on `Server<C, S>` and `Socket<S, C>` | Built into socket.io v3+ — free type safety on all emit/on calls |
| Test server creation | Custom HTTP server setup | Official socket.io testing pattern (`createServer()` + `httpServer.listen(0)`) | Port 0 = OS assigns free port; prevents test port conflicts |

---

## Runtime State Inventory

Step 2.5: SKIPPED — Phase 2 is a greenfield addition (new files only), not a rename/refactor/migration. No runtime state inventory required.

---

## Common Pitfalls

### Pitfall 1: `@` Alias Doesn't Resolve in server.ts

**What goes wrong:** `server.ts` imports `import { db } from '@/db'` — tsx fails with `Cannot find module '@/db'`.
**Why it happens:** The `@/*` path alias in `tsconfig.json` is configured for Next.js bundler resolution (`"moduleResolution": "bundler"`). tsx running `server.ts` as a standalone Node.js script does not automatically inherit the Next.js build context.
**How to avoid:** Use relative paths in `server.ts`: `import { db } from './src/db/index.js'`. Add a separate `tsconfig.server.json` if many imports needed, or configure `tsx --tsconfig tsconfig.server.json`.
**Warning signs:** `Error: Cannot find module '@/db'` or `Module not found` at startup.

[ASSUMED: tsx path alias behavior with non-standard moduleResolution — verify at implementation time by running `npx tsx server.ts` before writing full server code]

### Pitfall 2: Socket.IO and Next.js Both Trying to Own the Port

**What goes wrong:** If `httpServer` is NOT passed to `next()`, Next.js starts its own internal HTTP server on the same port, causing `EADDRINUSE`.
**Why it happens:** The custom server doc example uses `createServer(handler)` as the HTTP server AND passes it to `next({ httpServer })`. If you create two servers, both bind to port 3000.
**How to avoid:** Pass the same `httpServer` instance to both `next({ httpServer })` and `new Server(httpServer)`. See Pattern 1 above.
**Warning signs:** `Error: listen EADDRINUSE :::3000` at startup.

[VERIFIED: coinxi/node_modules/next/dist/docs/01-app/02-guides/custom-server.md — `httpServer` is a supported option]

### Pitfall 3: Vitest Fake Timers Break Socket.IO Integration Tests

**What goes wrong:** Tests use `vi.useFakeTimers()` globally; Socket.IO client never connects (`socket.connected` stays `false`).
**Why it happens:** `socket.io-client` uses real `setTimeout`/`setInterval` for reconnection and connection handshake. Fake timers prevent these from firing.
**How to avoid:** Do NOT use `vi.useFakeTimers()` in integration tests that create real Socket.IO connections. Use fake timers only in isolated unit tests (price simulator, diff algorithm). For broadcaster interval tests, extract the tick function as a callback and test it synchronously — don't test the `setInterval` itself.
**Warning signs:** Test hangs at "waiting for socket connection", or `clientSocket.connect` never resolves.

[CITED: vitest-websocket-mock README — "mock-socket has a strong usage of setTimeout delays, meaning using vi.useFakeTimers() will cause issues"]

### Pitfall 4: Order Book getOrderBook() Returns Full Order Objects, Not Aggregated Levels

**What goes wrong:** Broadcast sends raw `Order[]` objects (with userId, id, etc.) instead of `{ price, quantity }[]`.
**Why it happens:** `getOrderBook()` returns the full `Order` type from `matching-engine.ts`, which includes userId, orderId, status.
**How to avoid:** Transform in the broadcast loop: `bids.slice(0, 20).map(o => ({ price: o.price!, quantity: o.quantity }))`.
**Why this matters:** Sending userId to all clients is a privacy/security leak.

[VERIFIED: coinxi/src/lib/matching-engine.ts — getOrderBook returns Order[] which includes userId]

### Pitfall 5: AnimatePresence Requires Direct Children

**What goes wrong:** Rows don't animate on exit — they disappear instantly.
**Why it happens:** The AnimatePresence component only tracks direct child components for exit animations. If rows are wrapped in a fragment or a non-motion component between AnimatePresence and the motion element, exits are not detected.
**How to avoid:** Ensure `motion.tr` (or `motion.div`) is a direct child of `AnimatePresence`. Each row component's root element must be the motion element.
**Warning signs:** Enter animations work but exit animations don't fire.

[CITED: motion.dev/docs/react-animate-presence]

### Pitfall 6: getRecentTrades is Not in matching-engine.ts

**What goes wrong:** The plan assumes a `getRecentTrades()` function exists but it doesn't — only `getOrderBook()` and `getOpenOrders()` are exported.
**Why it happens:** The trades table exists in the schema and DDL but has no query function yet.
**How to avoid:** Phase 2 must add `getRecentTrades(db, pairId, limit)` to `src/lib/matching-engine.ts` (or a new `src/lib/trades.ts`). The schema `trades` table has `pairId`, `price`, `quantity`, `createdAt` — enough to serve BOOK-05.

[VERIFIED: coinxi/src/lib/matching-engine.ts — no getRecentTrades function exists]
[VERIFIED: coinxi/src/db/schema.ts — `trades` table exists with correct columns]

---

## Code Examples

Verified patterns from official and codebase sources:

### package.json Script Changes

```json
{
  "scripts": {
    "dev": "npx tsx server.ts",
    "build": "next build",
    "start": "NODE_ENV=production npx tsx server.ts",
    "seed": "tsx scripts/seed.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Note: `tsx` is already installed as a devDependency — `npx tsx` finds it from node_modules without a global install. [VERIFIED: coinxi/package.json `"tsx": "^4.21.0"` in devDependencies]

### Vitest Config Update for Phase 2

The existing `vitest.config.ts` must add Phase 2 modules to the `coverage.include` array:

```typescript
// vitest.config.ts — additions for Phase 2
coverage: {
  include: [
    'src/lib/auth.ts',
    'src/lib/wallet.ts',
    'src/lib/matching-engine.ts',
    // Phase 2 additions:
    'src/lib/price-simulator.ts',
    'src/lib/order-book-diff.ts',
    'src/hooks/useOrderBook.ts',
    'src/hooks/usePriceFeed.ts',
    'src/hooks/useRecentTrades.ts',
  ],
}
```

[VERIFIED: coinxi/vitest.config.ts]

### Socket.IO Integration Test Pattern (Official)

```typescript
// src/__tests__/integration/socket-broadcast.test.ts
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { createServer } from 'node:http'
import { io as ioc } from 'socket.io-client'
import { Server } from 'socket.io'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/socket'

describe('Socket.IO broadcast', () => {
  let io: Server
  let clientSocket: ReturnType<typeof ioc>
  let serverPort: number

  beforeAll(() => {
    return new Promise<void>((resolve) => {
      const httpServer = createServer()
      io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer)
      httpServer.listen(0, () => {
        serverPort = (httpServer.address() as { port: number }).port
        clientSocket = ioc(`http://localhost:${serverPort}`)
        clientSocket.on('connect', resolve)
      })
    })
  })

  afterAll(() => {
    io.close()
    clientSocket.disconnect()
  })

  it('receives price event with correct shape', () => {
    return new Promise<void>((resolve) => {
      clientSocket.on('price', (data) => {
        expect(data).toHaveProperty('pairId')
        expect(data).toHaveProperty('price')
        expect(typeof data.price).toBe('string')
        resolve()
      })
      io.emit('price', { pairId: 'BTC-USDC', price: '50000.00' })
    })
  })
})
```

[CITED: socket.io/docs/v4/testing/]

### Price Simulator Unit Test

```typescript
// src/__tests__/lib/price-simulator.test.ts
import { describe, it, expect } from 'vitest'
import { createSimulators, simulateTick } from '@/lib/price-simulator'
import Decimal from 'decimal.js'

describe('simulateTick', () => {
  it('returns a string with 2 decimal places', () => {
    const sims = createSimulators({ 'BTC-USDC': '50000.00' })
    const price = simulateTick(sims, 'BTC-USDC')
    expect(price).toMatch(/^\d+\.\d{2}$/)
  })

  it('stays within 1% of starting price after 1 tick', () => {
    const sims = createSimulators({ 'BTC-USDC': '50000.00' })
    const price = simulateTick(sims, 'BTC-USDC')
    const delta = Math.abs(parseFloat(price) - 50000) / 50000
    expect(delta).toBeLessThan(0.002)  // 0.2% max tick
  })

  it('stays bounded after 1000 ticks (no drift to 0 or infinity)', () => {
    const sims = createSimulators({ 'BTC-USDC': '50000.00' })
    for (let i = 0; i < 1000; i++) simulateTick(sims, 'BTC-USDC')
    const final = parseFloat(sims['BTC-USDC'])
    expect(final).toBeGreaterThan(10000)
    expect(final).toBeLessThan(500000)
  })

  it('mutates simulators state in place', () => {
    const sims = createSimulators({ 'BTC-USDC': '50000.00' })
    simulateTick(sims, 'BTC-USDC')
    expect(sims['BTC-USDC']).not.toBe('50000.00')
  })
})
```

### Order Book Diff Unit Test

```typescript
// src/__tests__/lib/order-book-diff.test.ts
import { describe, it, expect } from 'vitest'
import { diffOrderBook } from '@/lib/order-book-diff'

describe('diffOrderBook', () => {
  it('detects added row', () => {
    const prev = [{ price: '50000', quantity: '1' }]
    const curr = [{ price: '50000', quantity: '1' }, { price: '49999', quantity: '2' }]
    const diff = diffOrderBook(prev, curr)
    expect(diff.added.has('49999')).toBe(true)
    expect(diff.added.size).toBe(1)
    expect(diff.updated.size).toBe(0)
    expect(diff.removed.size).toBe(0)
  })

  it('detects updated quantity', () => {
    const prev = [{ price: '50000', quantity: '1' }]
    const curr = [{ price: '50000', quantity: '3' }]
    const diff = diffOrderBook(prev, curr)
    expect(diff.updated.has('50000')).toBe(true)
    expect(diff.added.size).toBe(0)
  })

  it('detects removed row', () => {
    const prev = [{ price: '50000', quantity: '1' }, { price: '49999', quantity: '2' }]
    const curr = [{ price: '50000', quantity: '1' }]
    const diff = diffOrderBook(prev, curr)
    expect(diff.removed.has('49999')).toBe(true)
  })

  it('returns empty diff for identical books', () => {
    const book = [{ price: '50000', quantity: '1' }]
    const diff = diffOrderBook(book, book)
    expect(diff.added.size).toBe(0)
    expect(diff.updated.size).toBe(0)
    expect(diff.removed.size).toBe(0)
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@types/socket.io-client` | Types bundled in `socket.io-client` | Socket.IO v3 (2020) | Don't install `@types/socket.io-client` — it causes type conflicts |
| `ts-node` for TypeScript server | `tsx` (already installed) | 2022+ | tsx is faster, no separate tsconfig needed for basic usage |
| `mode="wait"` for lists | `mode="popLayout"` for list feeds | Framer Motion v10+ | popLayout is correct for prepend-to-list; wait blocks entry while exit plays |
| `import { motion } from 'framer-motion'` | Same in v12 | No change needed | The existing PriceTicker.tsx import pattern is still correct |

**Deprecated/outdated:**
- `@types/socket.io-client`: Do not install — conflicts with bundled types since Socket.IO v3.
- `socket.io-mock` (npm package): Not maintained; prefer official Socket.IO integration test pattern or `socket.io-mock-ts` for unit mock scenarios.
- `layoutId` on table rows: `layoutId` is for shared-element transitions between distinct components. For order book rows that stay in the same list, use `layout` prop + `AnimatePresence` — not `layoutId`. [CITED: motion.dev/docs/react-layout-animations]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | tsx resolves relative imports but not `@/*` aliases in `server.ts` | Architecture Pattern 1, Pitfall 1 | If wrong, `@/*` imports work fine in server.ts and simpler code is possible |
| A2 | `next({ httpServer })` option prevents port conflicts when passing the same server to both Next.js and Socket.IO | Architecture Pattern 1, Pitfall 2 | If wrong, need to pass handler via `httpServer.on('request', handle)` separately (which is what Pattern 1 does anyway) |

---

## Open Questions

1. **Does `getOrderBook()` need aggregation at the price level?**
   - What we know: `getOrderBook()` returns one row per `Order` record. Two limit orders at the same price would appear as two separate rows.
   - What's unclear: Should BOOK-02/03 show aggregated quantities per price level (like real exchange order books), or individual orders?
   - Recommendation: Aggregate by price level in the broadcast transform. `{ price, quantity }` in the broadcast payload should sum all quantities at each price. This is standard order book display behavior.

2. **How does the trade `side` field get determined for recent trades?**
   - What we know: The `trades` table has `buyOrderId` and `sellOrderId` but no `side` field. The `Trade` type in socket.ts needs a `side`.
   - What's unclear: The initiating (taker) side determines the trade side. This requires joining trades with orders.
   - Recommendation: Define side as "the order that was placed second (taker)". Add a `side TEXT` column to the trades table in the broadcast transform, or compute it at query time.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Custom server runtime | ✓ | v22.22.0 | — |
| tsx | Run server.ts in dev | ✓ | 4.21.0 | ts-node (not installed) |
| socket.io | Server WebSocket | ✗ (not installed) | — | Must install |
| socket.io-client | Browser hooks | ✗ (not installed) | — | Must install |
| better-sqlite3 | DB access from server.ts | ✓ | 12.8.0 | — |
| framer-motion | Animations | ✓ | 12.38.0 | — |

[VERIFIED: coinxi/package.json + `node --version` + `npm view socket.io version`]

**Missing dependencies with no fallback:**
- `socket.io` — must be installed before server.ts can run
- `socket.io-client` — must be installed before hooks can compile

**Install command:**
```bash
cd coinxi && npm install socket.io socket.io-client
```

---

## Validation Architecture

> nyquist_validation is enabled (no config.json found, treated as enabled).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.3 + @vitest/coverage-v8 |
| Config file | `coinxi/vitest.config.ts` (exists) |
| Quick run command | `cd coinxi && npx vitest run src/__tests__/lib/price-simulator.test.ts src/__tests__/lib/order-book-diff.test.ts` |
| Full suite command | `cd coinxi && npm run test` |
| Coverage command | `cd coinxi && npm run test:coverage` |

[VERIFIED: coinxi/vitest.config.ts, coinxi/package.json]

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BOOK-01 | Order book data received via socket | integration | `npx vitest run src/__tests__/integration/socket-broadcast.test.ts` | ❌ Wave 0 |
| BOOK-02 | Exactly 20 bids in broadcast payload | unit | `npx vitest run src/__tests__/lib/order-book-diff.test.ts` | ❌ Wave 0 |
| BOOK-03 | Exactly 20 asks in broadcast payload | unit | `npx vitest run src/__tests__/lib/order-book-diff.test.ts` | ❌ Wave 0 |
| BOOK-04 | Socket emits at 1s interval | unit (fake timers) | `npx vitest run src/__tests__/lib/price-simulator.test.ts` | ❌ Wave 0 |
| BOOK-05 | Recent trades returned with correct shape | integration | `npx vitest run src/__tests__/integration/socket-broadcast.test.ts` | ❌ Wave 0 |
| UI-05 | diffOrderBook correctly classifies rows | unit | `npx vitest run src/__tests__/lib/order-book-diff.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `cd coinxi && npx vitest run src/__tests__/lib/`
- **Per wave merge:** `cd coinxi && npm run test`
- **Phase gate:** `cd coinxi && npm run test:coverage` — all thresholds must pass before `/gsd-verify-work`

### Coverage Thresholds (existing, from vitest.config.ts)

```
lines: 80%, branches: 75%, functions: 80%, statements: 80%
```

vitest.config.ts `coverage.include` must be expanded to include Phase 2 new modules (see Code Examples section).

### Wave 0 Gaps (all test files for Phase 2 are new)

- [ ] `src/__tests__/lib/price-simulator.test.ts` — covers BOOK-04 (pure function testing)
- [ ] `src/__tests__/lib/order-book-diff.test.ts` — covers UI-05 (diff algorithm)
- [ ] `src/__tests__/integration/socket-broadcast.test.ts` — covers BOOK-01, BOOK-05 (socket integration)
- [ ] `src/lib/price-simulator.ts` — implementation under test
- [ ] `src/lib/order-book-diff.ts` — implementation under test
- [ ] vitest.config.ts `coverage.include` update — adds Phase 2 modules

---

## Security Domain

Phase 2 adds no authentication-gated endpoints. The Socket.IO server broadcasts public market data (prices, order book, trades) to all connected clients. No user-specific data is transmitted. Therefore:

- **V2 Authentication:** Not applicable — socket broadcasts are public, unauthenticated market data
- **V3 Session Management:** Not applicable — no session state in Phase 2 socket layer
- **V4 Access Control:** Not applicable — no access control needed for public market data
- **V5 Input Validation:** Applicable but minimal — server generates all data (price simulator, DB query); no client input processed by the Phase 2 socket server
- **V6 Cryptography:** Not applicable — no secrets or encrypted data in Phase 2

**Privacy note:** The `getOrderBook()` transformation to `{ price, quantity }` MUST strip `userId`, `orderId`, and other private order fields before broadcast (see Pitfall 4). This is the only security-relevant action in Phase 2.

---

## Sources

### Primary (HIGH confidence)
- `coinxi/node_modules/next/dist/docs/01-app/02-guides/custom-server.md` — custom server pattern, httpServer option, script changes
- `npm view socket.io version` — confirmed 4.8.3 current version
- `npm view socket.io-client version` — confirmed 4.8.3 current version
- [socket.io/docs/v4/typescript/](https://socket.io/docs/v4/typescript/) — TypeScript generics pattern for Server/Socket
- [socket.io/docs/v4/testing/](https://socket.io/docs/v4/testing/) — official integration test pattern with Vitest
- `coinxi/package.json` — all existing dependency versions verified
- `coinxi/vitest.config.ts` — existing test configuration
- `coinxi/src/lib/matching-engine.ts` — getOrderBook() return type, confirmed no getRecentTrades()
- `coinxi/src/db/schema.ts` — trades table columns verified
- `coinxi/src/components/PriceTicker.tsx` — AnimatePresence pattern reference

### Secondary (MEDIUM confidence)
- [socket.io/how-to/use-with-nextjs](https://socket.io/how-to/use-with-nextjs) — official Socket.IO + Next.js guide with code examples
- [vitest.dev/guide/mocking/timers](https://vitest.dev/guide/mocking/timers) — fake timer API for setInterval testing
- [motion.dev/docs/react-layout-animations](https://motion.dev/docs/react-layout-animations) — layoutId, layoutDependency, AnimatePresence patterns
- [motion.dev/docs/react-motion-component](https://motion.dev/docs/react-motion-component) — useAnimate for imperative flash

### Tertiary (LOW confidence)
- DEV Community article (2025) on custom socket.io server.ts in Next.js — confirms tsx usage pattern, not officially verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified via npm registry
- Architecture: HIGH — custom server pattern verified from local Next.js docs; socket patterns from official socket.io docs
- TDD patterns: HIGH — official Vitest + Socket.IO testing docs
- Framer Motion animations: MEDIUM — official motion.dev docs verified; specific order book row pattern is derived/ASSUMED
- Pitfalls: HIGH for import paths and port conflicts (verified from local docs); MEDIUM for AnimatePresence

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable ecosystem — Next.js 16, socket.io 4.x, framer-motion 12 all stable)
