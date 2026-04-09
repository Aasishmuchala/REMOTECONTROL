---
phase: 4
slug: portfolio-analytics
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | `coinxi/vitest.config.ts` |
| **Quick run command** | `cd coinxi && npx vitest run --reporter=verbose` |
| **Full suite command** | `cd coinxi && npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd coinxi && npx vitest run --reporter=verbose`
- **After every plan wave:** Run `cd coinxi && npx vitest run --reporter=verbose`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | PORT-01, PORT-02, PORT-03 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/lib/portfolio.test.ts` | Created by 04-01-01 | ⬜ pending |
| 04-01-02 | 01 | 1 | PORT-01, PORT-02, PORT-03 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/lib/portfolio.test.ts` | Created by 04-01-01 | ⬜ pending |
| 04-02-01 | 02 | 2 | PORT-01, PORT-04 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/api/orders-all.test.ts` | Created by 04-02-01 | ⬜ pending |
| 04-02-02 | 02 | 2 | PORT-01 | T-04-05 | Aggregated positions only | unit | `cd coinxi && npx vitest run src/__tests__/api/orders-all.test.ts` | Created by 04-02-01 | ⬜ pending |
| 04-02-03 | 02 | 2 | PORT-04 | T-04-02, T-04-04 | IDOR + DB-level date filter | unit | `cd coinxi && npx vitest run src/__tests__/api/orders-all.test.ts` | Created by 04-02-01 | ⬜ pending |
| 04-03-01 | 03 | 3 | PORT-01, PORT-02, PORT-03, PORT-04 | — | N/A | integration | `cd coinxi && npx vitest run src/__tests__/integration/portfolio.test.tsx` | Created by 04-03-01 | ⬜ pending |
| 04-03-02 | 03 | 3 | PORT-01, PORT-02, PORT-03 | — | N/A | integration | `cd coinxi && npx vitest run src/__tests__/integration/portfolio.test.tsx` | Created by 04-03-01 | ⬜ pending |
| 04-03-03 | 03 | 3 | PORT-04 | — | N/A | integration | `cd coinxi && npx vitest run src/__tests__/integration/portfolio.test.tsx` | Created by 04-03-01 | ⬜ pending |
| 04-03-04 | 03 | 3 | PORT-01, PORT-04 | — | N/A | integration | `cd coinxi && npx vitest run --reporter=verbose` | Created by 04-03-01 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/__tests__/lib/portfolio.test.ts` — unit tests for computePositions (cost basis, unrealized/realized P&L with decimal.js precision) — **created by Plan 01 Task 1**
- [x] `src/__tests__/api/orders-all.test.ts` — unit tests for /api/orders/all (status filter, 7-day DB-level limit, auth, IDOR) — **created by Plan 02 Task 1**
- [x] `src/__tests__/integration/portfolio.test.tsx` — integration tests for PortfolioHoldings + PortfolioOrders components — **created by Plan 03 Task 1**

*All Wave 0 test files are created by plan tasks (RED phase) before their corresponding implementation tasks.*

*Existing test infrastructure (vitest, @testing-library/react, jsdom) covers all needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| P&L number morph animation | PORT-02 | Visual animation quality | Open /portfolio, trigger price change, verify smooth Framer Motion morph |
| Status tab switching UX | PORT-04 | Interactive visual flow | Click each tab, verify orders filter correctly with smooth transition |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
