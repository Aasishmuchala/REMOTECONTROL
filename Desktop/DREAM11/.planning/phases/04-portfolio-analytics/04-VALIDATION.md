---
phase: 4
slug: portfolio-analytics
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| 04-01-01 | 01 | 0 | PORT-01, PORT-02, PORT-03 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/lib/portfolio.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | PORT-04 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/api/orders-all.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | PORT-01, PORT-02, PORT-03 | — | N/A | integration | `cd coinxi && npx vitest run src/__tests__/integration/portfolio.test.tsx` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 1 | PORT-01, PORT-02, PORT-03 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/lib/portfolio.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | PORT-04 | — | N/A | unit | `cd coinxi && npx vitest run src/__tests__/api/orders-all.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | PORT-01, PORT-02, PORT-03, PORT-04 | — | N/A | integration | `cd coinxi && npx vitest run src/__tests__/integration/portfolio.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/lib/portfolio.test.ts` — unit tests for computePositions (cost basis, unrealized/realized P&L with decimal.js precision)
- [ ] `src/__tests__/api/orders-all.test.ts` — unit tests for /api/orders/all (status filter, 7-day limit)
- [ ] `src/__tests__/integration/portfolio.test.tsx` — integration tests for PortfolioHoldings + PortfolioOrders components

*Existing test infrastructure (vitest, @testing-library/react, jsdom) covers all needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| P&L number morph animation | PORT-02 | Visual animation quality | Open /portfolio, trigger price change, verify smooth Framer Motion morph |
| Status tab switching UX | PORT-04 | Interactive visual flow | Click each tab, verify orders filter correctly with smooth transition |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
