---
phase: "01-core-engine"
plan: "02"
subsystem: "design-system"
tags: ["glassmorphism", "tailwindcss", "framer-motion", "components", "dark-theme"]
dependency_graph:
  requires: ["01-01"]
  provides: ["globals.css design tokens", "GlassCard", "Button", "Input", "ExchangeNav"]
  affects: ["all Wave 2 and Wave 3 components"]
tech_stack:
  added: ["framer-motion ^12.38.0"]
  patterns: ["CSS custom properties via @theme inline", "glass utility classes", "forwardRef pattern", "motion.button micro-interactions"]
key_files:
  created:
    - "src/components/GlassCard.tsx"
    - "src/components/Button.tsx"
    - "src/components/Input.tsx"
    - "src/components/ExchangeNav.tsx"
  modified:
    - "src/app/globals.css"
decisions:
  - "Used simple cn() join fallback (already in utils.ts) — clsx/tailwind-merge not in project"
  - "framer-motion was absent; installed v12.38.0 before creating Button"
  - "ExchangeNav follows md:hidden pattern from existing BottomNav.tsx"
metrics:
  duration: "~8 minutes"
  completed: "2026-04-08T11:49:59Z"
  tasks_completed: 2
  files_changed: 5
requirements: ["UI-01", "UI-02", "UI-06"]
---

# Phase 01 Plan 02: Design System & Base Components Summary

**One-liner:** Dark glassmorphism design system with #0a0a0f background, #00d4ff cyan accent, glass utilities, and four atomic components (GlassCard, Button with Framer Motion, Input with forwardRef, ExchangeNav).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | globals.css dark glassmorphism design system | 58dfaed | src/app/globals.css, package.json, package-lock.json |
| 2 | GlassCard + Button + Input + ExchangeNav | 7c87912 | src/components/{GlassCard,Button,Input,ExchangeNav}.tsx |

## What Was Built

### globals.css
Complete replacement of cricket-themed Boxcar Urban Industrial system with CoinXI dark glassmorphism:
- `--color-bg: #0a0a0f` global dark background
- `--color-cyan: #00d4ff` primary accent with dim/glow variants
- `--color-green: #00ff88` / `--color-red: #ff4466` price up/down status
- `.glass` utility: `rgba(255,255,255,0.05)` background + `backdrop-filter: blur(16px)` + `rgba(255,255,255,0.1)` border
- `.glass-elevated` variant: `rgba(255,255,255,0.08)` + `blur(24px)`
- `.glow-cyan`, `.glow-cyan-sm`, `.price-up`, `.price-down`, `.text-cyan/.text-green/.text-red` helpers
- Space Grotesk (display), Inter (body), JetBrains Mono (prices) font stack

### GlassCard.tsx
Surface primitive — accepts `elevated` boolean to toggle between `.glass` and `.glass-elevated`, passes through `className` via `cn()`.

### Button.tsx
Framer Motion `motion.button` with:
- `whileHover={{ scale: 1.02 }}` / `whileTap={{ scale: 0.97 }}` (disabled/loading guard)
- `transition: spring, stiffness 400, damping 25`
- 4 variants: `primary` (cyan bg, dark text, cyan glow hover), `secondary` (glass, cyan border/text hover), `danger` (red bg, red glow hover), `ghost` (text-only)
- `isLoading` spinner state, proper `disabled` propagation

### Input.tsx
`forwardRef` component with:
- Focus state: cyan border + `box-shadow: 0 0 0 2px var(--color-cyan-dim)`
- Error state: red border + red shadow ring
- Optional `prefix` / `suffix` slots (absolute-positioned inside input)
- Auto-generated `id` from `label` prop

### ExchangeNav.tsx
Bottom nav for exchange (replaces cricket BottomNav):
- Three tabs: Trade (`/trade`), Portfolio (`/portfolio`), History (`/history`)
- `md:hidden` — only shown on mobile (consistent with BottomNav.tsx pattern)
- Active state: `text-[var(--color-cyan)]` + top cyan bar indicator
- `glass` + `border-t border-white/10` chrome

## Decisions Made

1. **cn() implementation:** Used the simple join fallback already present in `src/lib/utils.ts`. Neither `clsx` nor `tailwind-merge` are in the project's dependencies, and the simple implementation is sufficient for these components.

2. **framer-motion:** Was absent from `package.json`. Installed `framer-motion@^12.38.0` before creating Button. Added to `dependencies` (runtime requirement for client component animations).

3. **ExchangeNav icons:** Used Unicode symbols (`⬆⬇`, `◈`, `⊡`) rather than lucide-react icons, matching the plan's specified approach and keeping the nav lightweight.

4. **Tailwind v4 @theme inline:** CoinXI design tokens are registered via `@theme inline {}` block, consistent with the existing globals.css pattern. CSS custom properties are available globally via `var()` references in components.

## Deviations from Plan

None — plan executed exactly as written. The `relative` class was added to ExchangeNav tab links (for the active indicator `absolute` positioning), which is a required correctness fix, not a deviation.

## Known Stubs

None. All components are fully wired with their design tokens and functional behaviors.

## Self-Check: PASSED

Files exist:
- src/app/globals.css: FOUND
- src/components/GlassCard.tsx: FOUND
- src/components/Button.tsx: FOUND
- src/components/Input.tsx: FOUND
- src/components/ExchangeNav.tsx: FOUND

Commits exist:
- 58dfaed: FOUND (feat(01-02): replace cricket theme)
- 7c87912: FOUND (feat(01-02): add GlassCard, Button, Input, ExchangeNav)
