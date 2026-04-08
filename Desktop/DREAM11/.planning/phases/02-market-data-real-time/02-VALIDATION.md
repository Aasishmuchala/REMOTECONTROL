---
phase: 2
slug: market-data-real-time
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-08
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.3 + @vitest/coverage-v8 |
| **Config file** | `coinxi/vitest.config.ts` |
| **Quick run command** | `cd coinxi && npx vitest run src/__tests__/lib/price-simulator.test.ts src/__tests__/lib/order-book-diff.test.ts` |
| **Full suite command** | `cd coinxi && npm run test` |
| **Coverage command** | `cd coinxi && npm run test:coverage` |
| **Estimated runtime** | ~3 seconds (unit), ~8 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `cd coinxi && npx vitest run src/__tests__/lib/`
- **After every plan wave:** Run `cd coinxi && npm run test`
- **Before `/gsd-verify-work`:** Full suite + coverage must be green
- **Max feedback latency:** ~8 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | BOOK-04 | N/A | unit | `npx vitest run src/__tests__/lib/price-simulator.test.ts` | ❌ Wave 0 | ⬜ pending |
| 02-01-02 | 01 | 0 | BOOK-01 | N/A | unit | `npx vitest run src/__tests__/lib/order-book-diff.test.ts` | ❌ Wave 0 | ⬜ pending |
| 02-01-03 | 01 | 0 | BOOK-05 | N/A | unit | `npx vitest run src/__tests__/lib/matching-engine.test.ts` | ✅ exists | ⬜ pending |
| 02-02-01 | 02 | 1 | BOOK-04 | Broadcast strips userId from order data | integration | `npx vitest run src/__tests__/integration/socket-broadcast.test.ts` | ❌ Wave 0 | ⬜ pending |
| 02-03-01 | 03 | 2 | BOOK-01,02,03 | N/A | unit | `npx vitest run src/__tests__/hooks/useOrderBook.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-03-02 | 03 | 2 | BOOK-04 | N/A | unit | `npx vitest run src/__tests__/hooks/usePriceFeed.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-03-03 | 03 | 2 | BOOK-05 | N/A | unit | `npx vitest run src/__tests__/hooks/useRecentTrades.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 02-04-01 | 04 | 3 | UI-05 | N/A | full suite | `npm run test` | existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `coinxi/src/__tests__/lib/price-simulator.test.ts` — stubs for BOOK-04 price simulation
- [ ] `coinxi/src/__tests__/lib/order-book-diff.test.ts` — stubs for BOOK-01/02/03 diff logic
- [ ] `coinxi/src/__tests__/integration/socket-broadcast.test.ts` — stubs for Socket.IO broadcast
- [ ] `coinxi/src/__tests__/hooks/useOrderBook.test.tsx` — stubs for useOrderBook hook
- [ ] `coinxi/src/__tests__/hooks/usePriceFeed.test.tsx` — stubs for usePriceFeed hook
- [ ] `coinxi/src/__tests__/hooks/useRecentTrades.test.tsx` — stubs for useRecentTrades hook
- [ ] `npm install socket.io socket.io-client` — new package dependency

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Order book rows animate on insert | UI-05 | Visual animation cannot be asserted in Vitest | Open /trade in browser, place a limit order, observe rows slide in with cyan flash |
| Price ticker updates live in browser | BOOK-04 | Browser rendering not testable in Vitest | Open /trade, observe PriceTicker updating every second |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 8s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
