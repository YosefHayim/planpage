# planpage — feature inventory (test-gap)

Repo: `/Users/yosefhayimsabag/Desktop/Code/planpage`  
Unit command: `pnpm test` (vitest) · Gate: `pnpm run verify`  
E2E web/native: **none** (static HTML + opt-in localhost serve)  
Mocks/MSW: **N/A** (no external HTTP client surface)

## Feature ids

| id | Paths | Product role |
|----|-------|--------------|
| `render-engine` | `src/render/**`, `src/highlight/**` | Preact → static HTML + Shiki edge highlight |
| `shell-islands` | `src/components/Shell.tsx`, `src/render/clientScript/**` | Theme, postback, carousel, diagram, whiteboard, quiz, poll, explorer islands |
| `feedback-ux` | `src/components/FeedbackSidebar.tsx`, `src/render/clientScript/postback.ts`, `src/contracts/decision.ts` | Queue-then-send sidebar: edit/annotate/screenshots/diagrams/sketches |
| `whiteboard` | `src/components/Whiteboard.tsx`, `src/render/clientScript/whiteboard.ts` | Freehand Excalidraw-like sketch → agent PNG |
| `diagram-board` | `src/components/Flow.tsx`, `src/render/clientScript/diagram.ts` | Mermaid kinds + edit/drag/queue questions |
| `serve-postback` | `src/server/serve.ts`, `src/cli/serve.ts`, `src/cli/io.ts` | Ephemeral Node server, open browser, write decision JSON |
| `gallery-library` | `src/gallery/**`, `src/templates/Library/**`, `src/cli/library.tsx` | Auto-captured component gallery + full state matrices |
| `templates` | `src/templates/**` (minus Library) | PlanBrief, BeforeAfter, CodeStylePlan, QuestionPoll, Quiz, Flashcards, AuditReport |
| `components-primitives` | `src/components/*` (layout/notes/sequence/code/…) | Shared UI primitives |
| `cli-init` | `src/cli/**` | Dual-mode CLI: render/serve/new/library/capture/init |

## New surfaces (this campaign — “the new ones too”)

- FeedbackSidebar + postback queue (edits, annotations, screenshots, diagrams, whiteboards)
- Whiteboard freehand board
- Flow diagram board (all kinds + handDrawn)
- Gallery state matrices + carousel page-scroll fix
- Decision contract extensions
