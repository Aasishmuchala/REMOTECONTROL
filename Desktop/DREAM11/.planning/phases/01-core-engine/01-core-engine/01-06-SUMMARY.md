---
phase: "01-core-engine"
plan: "06"
subsystem: "auth-ui"
tags: [auth, glassmorphism, layout, nav]
dependency_graph:
  requires: ["01-02"]
  provides: ["login-page", "register-page", "main-layout"]
  affects: ["all main pages via layout"]
tech_stack:
  added: []
  patterns: ["GlassCard elevated", "Input with error prop", "Button with isLoading", "ExchangeNav mobile bottom nav"]
key_files:
  created: []
  modified:
    - "src/app/(auth)/login/page.tsx"
    - "src/app/(auth)/register/page.tsx"
    - "src/app/(main)/layout.tsx"
key_decisions:
  - "Register redirects to /login (not auto-login) — user must explicitly sign in after registration"
  - "Client-side password validation set to >=8 chars even though server only requires >=4 — stricter is safer"
  - "Layout logout clears sessionStorage via auth store logout() then pushes to /login"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 3
---

# Phase 01 Plan 06: Auth Pages + Main Layout Redesign Summary

Glassmorphism login/register pages and exchange-themed main layout with ExchangeNav replacing the cricket BottomNav — app is now fully navigable end-to-end with exchange UI.

## Auth Page Changes

### Login (`src/app/(auth)/login/page.tsx`)
- Replaced `bg-gradient-to-br from-gray-900` dark gradient with `bg-[var(--color-bg)]` design token
- Replaced raw `<form>` card (`bg-gray-800 rounded-2xl`) with `<GlassCard elevated>`
- Replaced raw `<input>` fields with `<Input>` component (label, placeholder, autoComplete)
- Replaced raw `<button>` with `<Button variant="primary" isLoading={isLoading}>`
- Fixed redirect: was `router.push('/')`, now `router.push('/trade')`
- COINXI logo in `text-[var(--color-cyan)]` replacing white text
- Error displayed inline below fields as `text-[var(--color-red)]`

### Register (`src/app/(auth)/register/page.tsx`)
- Same visual redesign as login (GlassCard, Input, Button, dark bg, cyan logo)
- Added `validate()` function with client-side rules:
  - Username >= 3 characters
  - Password >= 8 characters (stricter than server's 4 minimum)
  - Confirm password must match
- Per-field error display via `Input error={errors.field}` prop
- General API error shown as `errors.general` paragraph
- Removed `useAuthStore` import — register no longer calls `setAuth` (redirects to `/login` instead)
- Redirect on success: was `router.push('/')`, now `router.push('/login')`

**API body confirmed:** Register route accepts `{ username, password }` — no email field.

## Layout Nav Confirmed (`src/app/(main)/layout.tsx`)

| Before | After |
|--------|-------|
| `import BottomNav from '@/components/BottomNav'` | `import ExchangeNav from '@/components/ExchangeNav'` |
| Nav links: Home, Contests, Ranks | Nav links: Trade, Portfolio, History |
| `bg-[#fcf9f8]` cream background | `bg-[var(--color-bg)]` dark background |
| Orange `#a04100` / cricket colors | Cyan `var(--color-cyan)` / glass tokens |
| No logout button | Logout button: `logout()` + `router.push('/login')` |
| `gradient-cta` loading spinner | `glass` loading spinner |
| `<BottomNav />` | `<ExchangeNav />` |

Desktop nav structure: fixed glass header (`border-white/10`), `h-14`, `max-w-7xl mx-auto`. Main content: `pt-20 pb-8 px-4`.

## Deviations from Plan

None — plan executed exactly as written. The plan's inline code was used as the reference spec. Minor enhancement: login form passes field-level error routing (username/password errors) but plan's simplified version was used as-is per instructions.

## Threat Flags

None. No new network endpoints, auth paths, or schema changes introduced. Changes are purely UI/client-side.

## Final vitest Results

```
Test Files  4 passed (4)
Tests       67 passed (67)
Duration    1.29s
```

67 tests pass — no regressions from UI changes (client components are not covered by unit tests; existing API/lib tests unaffected).

## Phase 1 Plan Completion Status

| Plan | Name | SUMMARY |
|------|------|---------|
| 01-01 | Project scaffold + DB schema | SUMMARY.md exists |
| 01-02 | Design system + components | SUMMARY.md exists |
| 01-03 | Auth API routes | SUMMARY.md exists |
| 01-04 | Trade/Portfolio/History pages | SUMMARY.md exists |
| 01-05 | (pending) | No SUMMARY.md |
| 01-06 | Auth pages + main layout | SUMMARY.md — this file |
| 01-07 | (pending) | No SUMMARY.md |
| 01-08 | (pending) | No SUMMARY.md |

## Self-Check: PASSED

- `src/app/(auth)/login/page.tsx` — exists, 84 lines
- `src/app/(auth)/register/page.tsx` — exists, 108 lines
- `src/app/(main)/layout.tsx` — exists, 103 lines
- Commit `7ce2f32` — auth pages redesign
- Commit `b40e545` — main layout redesign
- 67 vitest tests pass
