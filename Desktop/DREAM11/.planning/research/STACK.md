# Stack Research

**Domain:** Crypto-Fiat Exchange Platform (Credits-Only)
**Project:** CoinXI — Awwwards-tier crypto exchange for friends
**Researched:** 2026-04-06
**Confidence:** MEDIUM (training data; verified with Node.js/PostgreSQL best practices)

---

## Recommended Stack

### Core Backend

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 14+ (App Router) | Full-stack framework | Provides API routes, SSR for landing pages, and frontend API layer in one repo. Eliminates need for separate Node/Express backend. Native WebSocket support via Server Actions and server-sent events. |
| **Node.js** | 20 LTS | Runtime | Non-blocking I/O critical for handling concurrent WebSocket connections for real-time price feeds. Easy integration with React frontend (shared TypeScript). Proven in production at Binance, Coinbase. |
| **Prisma** | 5.x | ORM | Type-safe database access with excellent TypeScript integration. Handles complex wallet/transaction schemas cleanly. Supports migrations and seeding for the credits system. |
| **PostgreSQL** | 15+ | Primary database | ACID compliance critical for financial transactions. Handles concurrent writes from multiple trading sessions. Supports JSON columns for flexible order metadata and market data storage. |
| **Redis** | 7+ | Cache + pub/sub | Essential for real-time order book caching, session management, and WebSocket broadcast pub/sub. Sub-millisecond reads keep trading UI responsive. |

### Real-Time Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Socket.IO** | 4.x | WebSocket abstraction | Fallback support for older browsers, built-in room/channel management for trading pairs, automatic reconnection. Simpler than raw WebSockets for this use case. |
| **Pusher** | — | Alternative real-time | Managed service, avoids self-hosting WebSocket servers. Good for MVP; scales to production. Less control but faster to implement. |

### Frontend (Already Decided)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **React** | 18+ | UI framework | Already in stack |
| **TypeScript** | 5.x | Type safety | Already in stack |
| **Tailwind CSS** | 3.x | Styling | Already in stack |
| **Framer Motion** | 11.x | Animations | Already in stack |

### State Management

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zustand** | 4.x | Lightweight store | Perfect for trading state (order book, current price, user balance). Minimal boilerplate, works with SSR. |
| **TanStack Query** | 5.x | Server state | Handles API polling for market data, caching, background refetching. Keeps real-time data fresh while managing cache lifecycle. |
| **Jotai** | 2.x | Atomic state | Alternative to Zustand. Good for granular reactive updates (price ticker, individual order book levels). |

### Charting

| Library | Purpose | Recommendation |
|---------|---------|----------------|
| **Lightweight Charts** (TradingView) | Candlestick/line charts | Industry standard, used by Binance, Bybit. Lightweight, customizable, MIT license. |
| **Recharts** | Simpler charts | Good for portfolio P&L, line charts. Easier to style for custom Awwwards aesthetic. |
| **Chart.js** | General purpose | Fallback if Recharts insufficient. Large ecosystem. |

### Additional Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Zod** | 3.x | Runtime validation | Validate all API inputs, WebSocket messages, and form data. Critical for security with any financial system. |
| **date-fns** | 3.x | Date formatting | Lightweight alternative to moment/dayjs for timestamps in trading history. |
| **clsx** | — | Conditional classes | Better DX for Tailwind class composition on dynamic trading UI elements. |

---

## Architecture Overview

```
Frontend (React + Tailwind + Framer Motion)
       |
       v
Next.js API Routes (REST)
       |
       +---> PostgreSQL (Prisma ORM) --- Wallets, Users, Orders, Transactions
       |
       +---> Redis --- Session cache, Order book cache, Pub/Sub for WebSocket
       |
       v
Socket.IO Server (integrated in Next.js or separate)
       |
       v
Real-time broadcasts (price updates, order book, trade fills)
```

---

## Recommended Setup

```bash
# Backend + Database
npm install next@14 react react-dom typescript
npm install prisma @prisma/client
npm install pg pg-pool           # Direct PostgreSQL if needed beyond Prisma

# Real-time
npm install socket.io socket.io-client

# State management
npm install zustand @tanstack/react-query
npm install jotai                # Optional atomic state

# Validation + Utilities
npm install zod date-fns clsx tailwind-merge

# Charting
npm install lightweight-charts    # TradingView charts
npm install recharts             # Simpler charts

# Database
npm install -D @types/node prisma

# Frontend (already assumed installed)
npm install tailwindcss framer-motion
```

```bash
# Infrastructure
npm install ioredis              # Redis client for Node.js

# For PostgreSQL on local dev
# Use Docker or install directly
docker run --name coinxi-postgres -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:15
docker run --name coinxi-redis -p 6379:6379 -d redis:7
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js (full-stack) | Express + separate frontend | If you want strict frontend/backend separation or have a large team. More boilerplate for MVP. |
| Prisma + PostgreSQL | Prisma + SQLite | SQLite is fine for local dev and MVP scope, but PostgreSQL is essential before any production deployment. |
| Socket.IO | Raw WebSocket | Raw WebSockets save a dependency but Socket.IO's auto-reconnection and fallback handling is worth it for a trading app. |
| Zustand | Redux Toolkit | Redux is overkill for trading state. Zustand's minimal API matches the project's craftsmanship ethos. |
| Lightweight Charts | ApexCharts | ApexCharts has worse performance on real-time updates. Lightweight Charts is purpose-built for trading. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **MongoDB** | Schema-less nature makes financial data integrity harder to enforce. ACID compliance is not as mature as PostgreSQL for complex transactions. | PostgreSQL |
| **GraphQL (Apollo)** | Overhead for a trading app where REST is simpler and WebSocket subscriptions are the primary real-time mechanism. | REST + Socket.IO |
| **Redux** | Too much boilerplate for trading state. Actions/reducers overhead. | Zustand |
| **Moment.js** | 70kB bundle size. Tree-shaking not great. | date-fns |
| **Create React App** | Deprecated, no App Router support. | Next.js (already selected) |
| **MongoDB Realm** | Not designed for financial transaction integrity. | PostgreSQL + Redis |

---

## Stack by Project Phase

**MVP (Phase 1 — Core Exchange):**
- Next.js 14 + App Router
- PostgreSQL (Prisma)
- Socket.IO
- Zustand + TanStack Query
- Lightweight Charts

**Phase 2 — Portfolio + Analytics:**
- Recharts (for P&L charts, portfolio breakdown)
- No additional stack needed

**Phase 3 — Real-Time Polish:**
- Redis pub/sub (for scaled WebSocket broadcasting)
- Consider Pusher if self-hosting becomes burden

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 14 | React 18, TypeScript 5 | App Router stable |
| Prisma 5 | PostgreSQL 15+, Node 18+ | Native ESM support |
| Tailwind CSS 3 | Next.js 14 | JIT mode stable |
| Framer Motion 11 | React 18 | SSR compatible |
| Socket.IO 4 | Node 18+, Next.js 14 | Works in Edge runtime with limitations |
| Lightweight Charts 4 | React 18 | Vanilla JS, works in any framework |
| Zustand 4 | React 18, Next.js 14 | SSR-safe with proper middleware |

---

## Verification Status

| Technology | Source | Confidence | Notes |
|------------|--------|------------|-------|
| Next.js | Training data (v14 released 2023, current is v15) | MEDIUM | Verify current latest version |
| PostgreSQL | Training data | HIGH | Stable, widely used |
| Prisma | Training data | MEDIUM | Verify v5 API compatibility |
| Socket.IO | Training data | HIGH | Stable ecosystem |
| Lightweight Charts | Training data | HIGH | TradingView open-source |
| Zustand | Training data | HIGH | Current state management recommendation |

**Note:** All version numbers should be verified against current npm registry before installation.

---

## Sources

- Context7 / npm registry (verify current versions)
- TradingView lightweight-charts documentation
- Next.js App Router documentation
- Prisma documentation
- Socket.IO documentation
- Zustand GitHub examples

---
*Stack research for: CoinXI crypto-fiat exchange*
*Researched: 2026-04-06*