# Architecture Research: CoinXI Crypto Exchange

**Domain:** Credits-only peer-to-peer crypto exchange
**Researched:** 2026-04-06
**Confidence:** MEDIUM-HIGH

**Note:** This is a credits-only exchange MVP for friends. Architecture is simplified accordingly — no real financial regulations, no payment processing, no external integrations. Scales appropriately for a small, trusted user base.

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Trading    │  │  Portfolio   │  │   Wallet     │             │
│  │   Dashboard  │  │  Dashboard   │  │   Manager    │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                │                │                      │
├─────────┴────────────────┴────────────────┴────────────────────┤
│                    WEBSOCKET GATEWAY (Real-time)                 │
│              ws://[host]/api/ws?token=[jwt]                      │
├─────────────────────────────────────────────────────────────────┤
│                         API GATEWAY                               │
│                  REST: /api/v1/*  |  WS: /ws                    │
├─────────────────────────────────────────────────────────────────┤
│                    CORE SERVICES LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ Order Match  │  │   Wallet     │  │    Market    │            │
│  │   Engine     │  │   Service    │  │    Data      │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
├─────────────────────────────────────────────────────────────────┤
│                    DATA LAYER                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  PostgreSQL  │  │    Redis     │  │   In-Memory  │            │
│  │  (Persistent)│  │   (Cache)    │  │   Order Book │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **Frontend** | UI rendering, order entry, real-time displays | React + TypeScript + Tailwind + Framer Motion |
| **WebSocket Gateway** | Bidirectional real-time communication | Socket.io or native WebSocket server |
| **API Gateway** | HTTP routing, auth, rate limiting | Express/Fastify + middleware |
| **Order Matching Engine** | Price-time priority matching, trade execution | Custom in-memory engine |
| **Wallet Service** | Balance tracking, deposits/withdrawals, transfers | Credits ledger management |
| **Market Data Service** | Price feeds, order book snapshots, trades | In-memory pub/sub + Redis pub |
| **PostgreSQL** | Persistent storage: users, orders, trades, wallets | Prisma ORM |
| **Redis** | Session cache, rate limiting, pub/sub for scale | Standard Redis patterns |

---

## Recommended Project Structure

```
src/
├── server/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express/Fastify setup
│   ├── config/
│   │   └── index.ts            # Environment config
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.ts         # Auth endpoints
│   │   │   ├── orders.ts       # Order CRUD
│   │   │   ├── wallets.ts      # Wallet operations
│   │   │   ├── portfolio.ts    # Portfolio queries
│   │   │   └── market.ts       # Market data (public)
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── rateLimit.ts    # Request throttling
│   │   │   └── validate.ts     # Request validation
│   │   └── controllers/
│   │       ├── OrderController.ts
│   │       ├── WalletController.ts
│   │       └── PortfolioController.ts
│   ├── services/
│   │   ├── MatchingEngine.ts   # ORDER MATCHING CORE
│   │   ├── WalletService.ts   # Balance management
│   │   ├── MarketDataService.ts# Price feeds, order book
│   │   └── TradeService.ts     # Trade history
│   ├── models/
│   │   ├── Order.ts            # Order type definitions
│   │   ├── Trade.ts            # Trade type definitions
│   │   ├── Wallet.ts           # Wallet type definitions
│   │   └── User.ts             # User type definitions
│   ├── websocket/
│   │   ├── handler.ts          # WS connection handling
│   │   ├── subscriptions.ts    # Channel management
│   │   └── broadcaster.ts       # Message distribution
│   ├── db/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── migrations/         # Database migrations
│   │   └── seed.ts             # Initial data seed
│   └── lib/
│       ├── errors.ts           # Custom error classes
│       ├── logger.ts           # Logging setup
│       └── decimal.ts          # Precise math (for prices)
│
├── client/
│   ├── main.tsx                # React entry
│   ├── App.tsx                 # Root component + routing
│   ├── components/
│   │   ├── trading/
│   │   │   ├── OrderForm.tsx   # Market/Limit order entry
│   │   │   ├── OrderBook.tsx   # Bid/Ask depth display
│   │   │   ├── RecentTrades.tsx# Trade history ticker
│   │   │   └── TradingPair.tsx # Pair selector
│   │   ├── portfolio/
│   │   │   ├── BalanceCard.tsx # Wallet balances
│   │   │   ├── Holdings.tsx    # Asset positions
│   │   │   └── PnLChart.tsx    # Profit/loss visualization
│   │   ├── wallet/
│   │   │   ├── DepositModal.tsx# Credit deposit
│   │   │   └── WithdrawModal.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts     # WS connection + reconnection
│   │   ├── useOrderBook.ts     # Order book subscription
│   │   ├── useTrades.ts        # Recent trades subscription
│   │   ├── usePortfolio.ts     # Portfolio state
│   │   └── useWallet.ts        # Wallet balance state
│   ├── stores/
│   │   ├── authStore.ts        # User auth state (Zustand)
│   │   ├── marketStore.ts      # Market data state
│   │   ├── orderStore.ts       # Open orders
│   │   └── walletStore.ts      # Balances
│   ├── lib/
│   │   ├── api.ts              # REST client
│   │   ├── websocket.ts        # WS client singleton
│   │   └── formatters.ts       # Price/number formatting
│   └── types/
│       ├── order.ts
│       ├── trade.ts
│       └── market.ts
│
├── shared/
│   └── types/
│       ├── api.ts              # Shared API types
│       └── events.ts           # WS event types
│
└── prisma/
    ├── schema.prisma           # Database schema
    └── seed.ts                 # Seed data
```

### Structure Rationale

- **server/**: Backend is a clean monolith — appropriate for MVP and small user base. No need for microservice complexity.
- **client/**: Frontend follows standard React patterns with centralized state management via Zustand.
- **shared/**: Shared types prevent duplication between server/client boundaries.
- **Separation by feature (trading/, portfolio/, wallet/)**: Makes it easy to find related code.

---

## Architectural Patterns

### Pattern 1: Price-Time Priority Matching

**What:** The standard exchange matching algorithm. Orders are sorted by price first, then by timestamp. The oldest order at the best price gets matched first.

**When to use:** Any exchange that needs fair, deterministic order execution.

**Trade-offs:**
- Pros: Fair, deterministic, simple to understand and implement
- Cons: Can be slow with very large order books (mitigate with proper data structures)

**Example:**
```typescript
// MatchingEngine.ts — Simplified
class MatchingEngine {
  private bids: OrderBookSide; // Sorted descending by price
  private asks: OrderBookSide; // Sorted ascending by price

  addOrder(order: Order): Trade[] {
    const trades: Trade[] = [];
    const oppositeSide = order.side === 'BUY' ? this.asks : this.bids;
    
    // Walk through opposite orders that match price
    let remainingQty = order.quantity;
    for (const existingOrder of oppositeSide) {
      if (!this.priceMatches(order, existingOrder)) break;
      
      const matchQty = Math.min(remainingQty, existingOrder.remainingQty);
      trades.push(this.createTrade(order, existingOrder, matchQty));
      remainingQty -= matchQty;
      
      if (remainingQty <= 0) break;
    }
    
    // If order still has remaining, add to book
    if (remainingQty > 0) {
      this.addToBook(order.withRemainingQty(remainingQty));
    }
    
    return trades;
  }
  
  private priceMatches(newOrder: Order, existingOrder: Order): boolean {
    if (newOrder.type === 'MARKET') return true;
    if (newOrder.side === 'BUY') return newOrder.price >= existingOrder.price;
    return newOrder.price <= existingOrder.price;
  }
}
```

### Pattern 2: Credits Ledger with Double-Entry

**What:** Every transaction creates two entries (debit + credit) that must sum to zero. Prevents balance inconsistencies.

**When to use:** Any wallet/balance system where integrity matters.

**Trade-offs:**
- Pros: Mathematically guarantees balance conservation, easy to audit
- Cons: Slightly more complex than simple balance columns

**Example:**
```typescript
// Credits ledger pattern (simplified)
interface LedgerEntry {
  id: string;
  userId: string;
  asset: string;           // 'CREDITS', 'BTC', 'ETH', etc.
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE_DEBIT' | 'TRADE_CREDIT' | 'TRANSFER';
  amount: string;          // Decimal as string for precision
  balanceBefore: string;
  balanceAfter: string;
  referenceId: string;    // Links to trade, deposit, etc.
  createdAt: Date;
}

// Credits are unlimited (simulated) — deposit just creates entries
async function depositCredits(userId: string, amount: string): Promise<LedgerEntry> {
  return prisma.$transaction(async (tx) => {
    const balance = await getBalance(tx, userId, 'CREDITS');
    const newBalance = decimalAdd(balance, amount);
    
    return tx.ledgerEntry.create({
      data: {
        userId,
        asset: 'CREDITS',
        type: 'DEPOSIT',
        amount,
        balanceBefore: balance,
        balanceAfter: newBalance,
      }
    });
  });
}
```

### Pattern 3: WebSocket Pub/Sub with Room Channels

**What:** Clients subscribe to specific channels (e.g., `trades:BTC-ETH`, `orderbook:BTC-ETH`). Server broadcasts updates only to subscribed clients.

**When to use:** Real-time data that changes frequently (order book, trades, prices).

**Trade-offs:**
- Pros: Scales well, clients only receive relevant data, clean separation
- Cons: Requires connection management, reconnection logic

**Example:**
```typescript
// WebSocket room subscription
const rooms = new Map<string, Set<WebSocket>>();

function joinRoom(ws: WebSocket, room: string) {
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room)!.add(ws);
}

function broadcastToRoom(room: string, message: object) {
  const payload = JSON.stringify(message);
  rooms.get(room)?.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  });
}

// Matching engine calls this on each trade
function onTrade(trade: Trade) {
  broadcastToRoom('trades:' + trade.pair, {
    type: 'NEW_TRADE',
    data: trade,
  });
  broadcastToRoom('orderbook:' + trade.pair, {
    type: 'ORDER_BOOK_UPDATE',
    data: getOrderBookSnapshot(trade.pair),
  });
}
```

### Pattern 4: Decimal Math for Prices

**What:** All monetary values stored and calculated as decimal strings, not floats.

**When to use:** Any financial application where precision matters.

**Trade-offs:**
- Pros: No floating-point rounding errors (0.1 + 0.2 !== 0.3 in IEEE 754)
- Cons: Requires explicit decimal library (Decimal.js, BN.js)

**Example:**
```typescript
import Decimal from 'decimal.js';

// WRONG — float math
const price = 0.1 + 0.2; // 0.30000000000000004

// RIGHT — decimal math
const price = new Decimal('0.1').plus('0.2'); // '0.3'
new Decimal('0.1').times('100').toFixed(8);    // '10.00000000'
```

---

## Data Flow

### Order Placement Flow

```
[User clicks "Buy BTC"]
    ↓
[OrderForm.tsx] — validates input, shows loading
    ↓
[POST /api/v1/orders] — REST API call
    ↓
[auth middleware] — verifies JWT
    ↓
[OrderController.createOrder] — validates order params
    ↓
[MatchingEngine.addOrder] — attempts to match
    ↓
[WalletService.lockFunds] — reserves credits (for BUY) or crypto (for SELL)
    ↓
[TradeService.persist] — saves trades to DB
    ↓
[WalletService.settle] — updates balances atomically
    ↓
[WebSocket broadcast] — notifies all subscribers
    ↓
[Client hooks update] — UI reflects new state
```

### Real-time Order Book Flow

```
[MatchingEngine executes trade]
    ↓
[emit 'orderbook:update'] event
    ↓
[MarketDataService updates in-memory order book]
    ↓
[broadcastToRoom('orderbook:' + pair, snapshot)]
    ↓
[useOrderBook hook receives update]
    ↓
[Zustand marketStore updates]
    ↓
[OrderBook component re-renders with new data]
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|-------------------------|
| **0-100 users** | Single server, in-memory order book, SQLite or PostgreSQL |
| **100-1000 users** | Move to PostgreSQL, add Redis for session cache, consider worker threads for matching |
| **1000+ users** | Split matching engine into separate process, add load balancer, consider horizontal scaling |

### Scaling Priorities

1. **First bottleneck: Order book memory**
   - In-memory order books work fine for friends exchange
   - If scaling, persist to Redis with pub/sub

2. **Second bottleneck: WebSocket connections**
   - For MVP, single server handles hundreds of connections
   - At scale, use Socket.io with Redis adapter for multi-server

3. **Third bottleneck: Database writes**
   - Trades should be batch-written, not written one-by-one
   - Use Prisma's `$transaction` for atomicity

---

## Anti-Patterns

### Anti-Pattern 1: Float Prices

**What people do:** `const price = 0.00003421;` or `parseFloat(value)`

**Why it's wrong:** IEEE 754 floating-point causes rounding errors. `0.1 + 0.2 = 0.30000000000000004`. For crypto prices, this matters enormously.

**Do this instead:** Use `Decimal` library, store all values as strings in DB, parse with `new Decimal(str)`.

### Anti-Pattern 2: Synchronous Matching

**What people do:** Run matching in the same thread/process as HTTP requests without queueing.

**Why it's wrong:** If matching is slow, HTTP requests block. Under load, this cascades into complete unresponsiveness.

**Do this instead:** Use an async queue (Bull, Bree) or worker threads for matching. The main thread should just enqueue orders and return a pending status.

### Anti-Pattern 3: Storing Balances Directly

**What people do:** `UPDATE wallets SET balance = balance - ? WHERE ...`

**Why it's wrong:** Race conditions. Two simultaneous trades could both read the same balance and both succeed when only one should.

**Do this instead:** Use ledger entries with transactions. Always read current balance, then write new balance atomically in a transaction.

### Anti-Pattern 4: Polling for Real-time Data

**What people do:** `setInterval(() => fetch('/api/orderbook'), 1000)`

**Why it's wrong:** Wastes bandwidth, higher latency, server load. Feels sluggish.

**Do this instead:** WebSocket subscription. Push updates only when data changes.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|-------------------|-------|
| **Market Data (Mock)** | Generate simulated prices | For MVP, use random walk or sine wave. Real external APIs (CoinGecko) add later. |
| **Auth Provider** | JWT with refresh tokens | Simple email/password for friends, upgrade to OAuth later if needed. |
| **Email (Optional)** | None for MVP | Friends exchange, no verification needed initially. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Frontend ↔ Backend** | REST (commands) + WebSocket (events) | REST for actions (place order), WS for state updates (price changes) |
| **API Layer ↔ Services** | Direct method calls | Monolith — no need for message queue at MVP scale |
| **Matching Engine ↔ Database** | Prisma transactions | All state changes must be atomic |

---

## Real-time Data Architecture

### WebSocket Message Types

```typescript
// Client → Server
interface SubscribeMessage {
  type: 'subscribe';
  channel: 'trades' | 'orderbook' | 'orders' | 'portfolio';
  pair?: string;  // Optional: 'BTC-ETH', 'ETH-USD'
}

interface UnsubscribeMessage {
  type: 'unsubscribe';
  channel: string;
  pair?: string;
}

// Server → Client
interface OrderBookUpdate {
  type: 'orderbook:update';
  pair: string;
  bids: [price: string, qty: string][];  // Top 20
  asks: [price: string, qty: string][];
  spread: string;
  timestamp: number;
}

interface TradeUpdate {
  type: 'trade';
  pair: string;
  price: string;
  quantity: string;
  side: 'buy' | 'sell';
  timestamp: number;
}

interface BalanceUpdate {
  type: 'balance:update';
  asset: string;
  available: string;
  locked: string;
}
```

### Recommended Libraries

| Purpose | Library | Why |
|---------|---------|-----|
| WebSocket Server | `ws` (or `socket.io`) | Fast, minimal, battle-tested. Socket.io adds reconnection magic. |
| State Management | Zustand | Simple, TypeScript-friendly, tiny bundle. |
| Decimal Math | `decimal.js` | Required for financial precision. |
| HTTP Client | Native `fetch` | Built-in, works everywhere. |
| Validation | `zod` | Runtime type validation, inferred from types. |

---

## Prisma Schema Overview

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // hashed
  createdAt DateTime @default(now())
  
  wallets   Wallet[]
  orders    Order[]
  trades    Trade[]  @relation("UserTrades")
}

model Wallet {
  id        String   @id @default(cuid())
  userId    String
  asset     String   // 'CREDITS', 'BTC', 'ETH'
  available String   @default("0") // Decimal string
  locked    String   @default("0") // Reserved for open orders
  
  user      User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, asset])
}

model Order {
  id        String      @id @default(cuid())
  userId    String
  pair      String      // 'BTC-ETH'
  side      OrderSide
  type      OrderType   // MARKET, LIMIT
  price     String?     // Null for market orders
  quantity  String
  filled    String      @default("0")
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())
  
  user      User        @relation(fields: [userId], references: [id])
  trades    Trade[]     @relation("OrderTrades")
}

model Trade {
  id          String   @id @default(cuid())
  pair        String
  price       String
  quantity    String
  makerId     String
  makerOrderId String
  takerId     String
  takerOrderId String
  createdAt   DateTime @default(now())
  
  maker       User     @relation("UserTrades", fields: [makerId], references: [id])
  taker       User     @relation("UserTrades", fields: [takerId], references: [id])
  makerOrder  Order    @relation("OrderTrades", fields: [makerOrderId], references: [id])
  takerOrder  Order    @relation("OrderTrades", fields: [takerOrderId], references: [id])
}

model LedgerEntry {
  id           String   @id @default(cuid())
  userId       String
  asset        String
  type         LedgerType
  amount       String   // Decimal string, positive = credit, negative = debit
  balanceAfter String
  referenceId  String?  // Links to trade, deposit, etc.
  createdAt    DateTime @default(now())
}

enum OrderSide { BUY, SELL }
enum OrderType { MARKET, LIMIT }
enum OrderStatus { PENDING, PARTIAL, FILLED, CANCELLED }
enum LedgerType { DEPOSIT, WITHDRAWAL, TRADE, LOCK, UNLOCK }
```

---

## Sources

**Architecture Patterns:**
- Standard limit order book (LOB) matching — industry standard since NYSE 1970s
- Binance matching engine documentation (public)
- Gemini WebSocket API patterns
- Prisma docs for transaction patterns

**Confidence Assessment:**
- Order matching fundamentals: HIGH (well-established CS/data structures)
- Credits ledger: HIGH (standard accounting patterns)
- WebSocket architecture: HIGH (standard pub/sub)
- Scaling considerations: MEDIUM (based on general backend scaling principles, may need validation for specific load tests)

---

## Roadmap Implications

### Phase Structure Recommendations

1. **Foundation Phase**: Set up Prisma schema, Express server, JWT auth, basic wallet CRUD. This enables all future features.

2. **Matching Engine Phase**: Implement in-memory order matching with market/limit orders. This is the core differentiator. Test thoroughly.

3. **Real-time Phase**: Add WebSocket infrastructure, implement order book display and trade ticker. This makes the UI feel "live."

4. **Portfolio Phase**: Build portfolio dashboard, P&L tracking, trade history. This provides user value after trading works.

5. **Polish Phase**: Awwwards-tier animations, responsive design, micro-interactions. This is where the UI shines.

### Key Build Dependencies

```
Prisma Schema → Wallet Service → Matching Engine → WebSocket → Frontend Trading UI
                    ↓                ↓                ↓
              Auth System ← ← ← ← ← ← ← ← ← ← ← ← ← Order Form
```

---

*Architecture research for: CoinXI Crypto Exchange MVP*
*Researched: 2026-04-06*
