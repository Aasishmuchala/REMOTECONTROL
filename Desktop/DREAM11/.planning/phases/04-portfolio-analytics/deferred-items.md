# Deferred Items - Phase 04 Portfolio Analytics

## Pre-existing Issues (Out of Scope)

### Integration test failure: missing src/stores/auth.ts in worktree

- **File:** `src/__tests__/integration/trading-ui-e2e.test.tsx`
- **Error:** `Failed to resolve import "@/stores/auth"`
- **Reason:** `src/stores/` directory exists in original project but was not tracked in worktree's git tree at base commit (0718ff2). This is a pre-existing worktree setup issue, not caused by plan 04-01 changes.
- **Impact:** Integration test suite fails in worktree; unrelated to portfolio computation logic.
- **Resolution:** Merge worktree back to main branch where src/stores/auth.ts exists.
