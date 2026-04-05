---
phase: 01-core-engine
plan: "01"
subsystem: backend
tags: [playwright, deepgaze, u2net, axe-core, wcag, cognitive-load, visual-hierarchy, prisma]

# Dependency graph
requires: []
provides:
  - Playwright headless screenshot capture with SPA hydration support
  - Saliency heatmap pipeline (DeepGaze III GPU + U2-Net CPU fallback + uniform)
  - WCAG 2.1 accessibility checking with custom contrast analysis
  - Cognitive load ensemble scoring (text + visual + layout)
  - 5-signal visual hierarchy analysis (size + contrast + position + saliency + DOM)
  - Prisma schema with Screenshot and Analysis data models
affects: [02-designmind-agent, 03-image-video-analysis]

# Tech tracking
tech-stack:
  added: [playwright, axe-core, chroma-js, textstat, prisma, tsx]
  patterns:
    - GPU-first saliency pipeline with CPU fallback chain
    - Never-throw error handling returning partial results
    - Singleton model caching for efficiency
    - Browser pool with context eviction at MAX_CONTEXTS=5
    - Multi-signal weighted ensemble for hierarchy scoring

key-files:
  created:
    - apps/backend/src/pipeline/capture.ts
    - apps/backend/src/pipeline/saliency.ts
    - apps/backend/src/pipeline/accessibility.ts
    - apps/backend/src/pipeline/complexity.ts
    - apps/backend/src/pipeline/hierarchy.ts
    - apps/backend/src/lib/playwright.ts
    - apps/backend/src/lib/deepgaze.ts
    - apps/backend/src/lib/u2net.ts
    - apps/backend/src/lib/axe.ts
    - apps/backend/src/lib/complexity.ts
    - apps/backend/src/lib/hierarchy.ts
    - apps/backend/prisma/schema.prisma
    - apps/backend/package.json
    - apps/backend/tsconfig.json
  modified: []

key-decisions:
  - "DeepGaze III primary with U2-Net CPU fallback chain — never blocks on GPU failure"
  - "SPA hydration: wait for readyState=complete + 2s buffer + Next.js __NEXT_DATA__ check"
  - "SSRF mitigation: only allow https:// URLs in capturePage"
  - "Cognitive load weights: visual 40%, text 30%, layout 30%"
  - "Hierarchy signal weights: saliency 25%, DOM 25%, size 20%, position 15%, contrast 15%"

patterns-established:
  - "Pipeline exports: named functions returning typed interfaces, never throws on model failure"
  - "Library singletons: model cached in module scope, loaded once on first use"
  - "Contrast checking: WCAG 2.1 luminance formula inline, supplemented by axe-core"
  - "Prisma relation: Screenshot 1:1 Analysis with CUID primary keys"

requirements-completed: [F1.1, F1.3, F1.7, F1.8, F1.9]

# Metrics
duration: "3.5min"
completed: 2026-04-05
---

# Phase 01: Core Analysis Engine Summary

**Playwright screenshot capture with DeepGaze III/U2-Net saliency, WCAG accessibility checking, cognitive load ensemble scoring, and 5-signal visual hierarchy analysis — all with never-throw error handling**

## Performance

- **Duration:** 3.5 min
- **Started:** 2026-04-05T17:26:53Z
- **Completed:** 2026-04-05T17:30:27Z
- **Tasks:** 5/5 auto tasks executed (checkpoint 6 pending human verification)
- **Files created:** 14

## Accomplishments

- Complete capture pipeline: Playwright headless Chromium with SPA hydration wait strategy
- Saliency heatmap generation: DeepGaze III (GPU) with U2-Net CPU fallback and uniform fallback-only mode
- WCAG 2.1 accessibility: axe-core integration plus custom contrast checking for all text elements
- Cognitive load scoring: ensemble of text complexity, visual complexity, and layout complexity
- Visual hierarchy analysis: 5-signal weighted fusion (size, contrast, position, saliency, DOM)
- Prisma data models: Screenshot + Analysis with proper relations and CUID IDs

## Task Commits

All 5 tasks committed atomically in a single commit (single-repo pattern):

- **5942dd3** (feat): complete backend analysis pipeline

## Files Created/Modified

| File | Purpose |
|------|---------|
| `apps/backend/src/pipeline/capture.ts` | URL-to-screenshot + DOM extraction with SSRF mitigation |
| `apps/backend/src/pipeline/saliency.ts` | Heatmap generation with GPU/CPU/fallback chain |
| `apps/backend/src/pipeline/accessibility.ts` | WCAG checks + custom contrast analysis |
| `apps/backend/src/pipeline/complexity.ts` | Cognitive load ensemble scoring |
| `apps/backend/src/pipeline/hierarchy.ts` | 5-signal visual hierarchy analysis |
| `apps/backend/src/lib/playwright.ts` | Browser pool with context eviction |
| `apps/backend/src/lib/deepgaze.ts` | DeepGaze III singleton wrapper |
| `apps/backend/src/lib/u2net.ts` | U2-Net CPU fallback singleton |
| `apps/backend/src/lib/axe.ts` | WCAG luminance + contrast utilities |
| `apps/backend/src/lib/complexity.ts` | DOM text/color/nesting helpers |
| `apps/backend/src/lib/hierarchy.ts` | Per-signal score calculation helpers |
| `apps/backend/prisma/schema.prisma` | Screenshot + Analysis Prisma models |
| `apps/backend/package.json` | Dependencies including playwright, axe-core, prisma |
| `apps/backend/tsconfig.json` | TypeScript config with ES2022 target |

## Decisions Made

- Used singleton caching for ML models to avoid repeated load overhead
- Browser pool with MAX_CONTEXTS=5 to prevent resource exhaustion
- Normalized all scores to 0-100 scale for consistent NeuroScore composition
- Error handling: all model failures return partial results with `modelFailed: true` flag

## Deviations from Plan

None — plan executed exactly as written.

## Threat Surface

| Flag | File | Description |
|------|------|-------------|
| security:ssrf-mitigated | capture.ts | URL scheme validation (https only) on user input |
| security:no-throw | saliency.ts | All model failures handled gracefully, never block |

## Next Phase Readiness

- Backend pipeline is complete and ready for:
  - Prisma migration (`cd apps/backend && npx prisma db push`)
  - Integration with DesignMind agent (Phase 02)
  - API route wiring in Next.js backend
- Modal GPU token required for DeepGaze III production inference (see USER_SETUP section)

## User Setup Required

**Modal account for GPU inference.** See `.planning/phases/01-core-engine/01-USER-SETUP.md` (generate separately):
- Create Modal account at modal.com
- Add credit card for pay-per-second A10G billing
- Set `MODAL_TOKEN` environment variable
- Until configured: saliency uses uniform fallback mode (still functional)

## Checkpoint

Task 6 (human-verify) is pending. Once the backend server is started with `cd apps/backend && npm run dev`, verify end-to-end with:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://news.ycombinator.com"}'
```

Expected response includes: screenshot data, heatmap (model: deepgaze/u2net/fallback), accessibility score, cognitive load score, hierarchy score.

---
*Phase: 01-core-engine*
*Completed: 2026-04-05*
*Commit: 5942dd3*
