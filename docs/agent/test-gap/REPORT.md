# planpage — test gap report

**Mode:** full (scan → fill → run)  
**Headless:** true (no e2e suite)  
**Branch:** `test/planpage-gaps-new-surfaces`  
**Backup:** `backup/main-20260806T184749Z` @ `1999ad60076e655e3869c3c262bbbc3f2fecc6c4`

## Summary table

| Feature | backend-unit | client-unit | mocks | integration | e2e-web | e2e-native | Top gaps |
|---------|--------------|-------------|-------|-------------|---------|------------|----------|
| render-engine | N/A | partial (`highlight`) | N/A | N/A | N/A | N/A | OK for pure render |
| shell-islands | N/A | thin (string/smoke only) | N/A | N/A | N/A | N/A | inject flags for diagram/sketch/carousel |
| feedback-ux | N/A | **gap → filled** | N/A | partial serve | N/A | N/A | FeedbackSidebar + decision shape |
| whiteboard | N/A | smoke only | N/A | N/A | N/A | N/A | queue payload keys in postback |
| diagram-board | N/A | Flow tests | N/A | N/A | N/A | N/A | all presets render; queue contract |
| serve-postback | **gap → filled** | N/A | N/A | port/timeout | N/A | N/A | POST body write + summary lines |
| gallery-library | N/A | registry + Library | N/A | N/A | N/A | N/A | Whiteboard registered |
| templates | N/A | mostly covered | N/A | N/A | N/A | N/A | residual low |
| components-primitives | N/A | **many missing** | N/A | N/A | N/A | N/A | StatusChip/Callout/CodeBlock matrices |
| cli-init | N/A | init tests | N/A | N/A | N/A | N/A | feedback wording covered via force |

## Feature: feedback-ux

### Covered
- client-unit: PlanBrief/CodeStylePlan interactive chrome (`pp-bar`, `send`, no approve)
- contract: types in `decision.ts` (compile-time)

### Missing (priority) → fill
1. [client-unit] FeedbackSidebar markup (queue, shot input, modes) — `FeedbackSidebar.test.tsx`
2. [contract/client-unit] Decision payload keys `diagrams`/`whiteboards` present in postback collect string
3. [integration] serve writes JSON body and prints screenshot/diagram-oriented summary when present

## Feature: whiteboard

### Covered
- client-unit: Whiteboard chrome + sketchable Shell

### Missing → fill
1. [client-unit] Whiteboard registered in gallery GALLERY
2. [client-unit] postback includes `whiteboards` + `__ppCollectWhiteboards` hook reference

## Feature: diagram-board

### Covered
- Flow editable/handDrawn/presets list

### Missing → fill
1. [client-unit] every FLOW_PRESET source renders without throw
2. [client-unit] diagram board `data-diagram-board` + queue action in editable mode (exists)

## Feature: serve-postback

### Covered
- port busy fallback + timeout exit 3

### Missing → fill
1. [integration] POST /decision writes file and exit 0
2. [client-unit] openPath dedupe (same path twice → one open attempt)

## Feature: components-primitives

### Covered
- Carousel, CodeExplorer, Flashcard, Flow, QuizCard, Scorecard, Storyboard, Terminal, Whiteboard

### Missing → fill (P0 matrices user asked for)
1. StatusChip all four statuses
2. Callout all tones
3. CodeBlock wrap vs scroll classes
4. carousel script must not call `scrollIntoView(` as API (page jump regression)

## Feature: shell-islands

### Missing → fill
1. Shell with sketchable injects whiteboard script / rough
2. Shell with diagramable injects diagram script
3. Shell with carousel injects carousel script

## Commands

```bash
pnpm test
pnpm run verify   # biome + tsc + vitest
```

e2e-web: skip — no Playwright/Cypress  
e2e-native: skip — N/A  
mocks: skip — N/A  

## Gaps filled this run

| Layer | New tests |
|-------|-----------|
| client-unit | `FeedbackSidebar.test.tsx`, `StatusChip.test.tsx`, `Callout.test.tsx`, `CodeBlock.test.tsx`, `Shell.islands.test.tsx`, Flow all presets |
| client-unit (islands) | `render/clientScript/islands.test.ts` (carousel no scrollIntoView, diagram/wb collect hooks) |
| integration | `serve.test.ts` POST /decision full feedback batch (edits/screenshots/diagrams/whiteboards) |
| cli | `io.test.ts` openPath dedupe + PLANPAGE_NO_OPEN |

**Result (orchestrator fill):** `pnpm test` → **85 passed** (28 files) at commit `5e65521`.  
Harden lanes later raised counts further on their branches (see messy-repo MATRIX).

## Residual (deferred)

- Full browser DOM tests for canvas drawing / mermaid drag (would need jsdom+canvas or Playwright — not in repo)
- questionPoll/quiz client islands deep interaction
- SubmitBar (quiz-only) dedicated unit (covered via Quiz template)
