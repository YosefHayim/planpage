---
name: planpage
description: >
  Render a skill's plan, review gate, quiz, poll, or report as a beautiful,
  self-contained INTERACTIVE HTML page via the open-source planpage package
  (Preact → static HTML + local post-back so the user can Approve / Adjust /
  flip decisions in the browser and the choice comes back to the agent).
  Use whenever a skill needs an approval gate, decision review, preference
  poll, teach/coach surface, storyboard/image grid, or shareable before/after
  report — author with planpage instead of hand-rolling HTML.
---

# planpage — interactive HTML plans for agents

Thin consumer of **[`planpage`](https://github.com/YosefHayim/planpage)** on npm
(`npm i planpage` or zero-install `npx planpage`). Components, render engine,
gallery, and post-back live there as SSOT. **Do not hand-roll HTML** — author
with the package.

## When to use

| Need | Template / approach |
|---|---|
| Multi-step plan + risks + Approve/Adjust | `plan-brief` |
| Diff / deslop / migration report | `before-after` |
| Code-style picks + canonical example | `code-style-plan` |
| Preference interview / grill | `question-poll` |
| Graded teach/coach quiz | `quiz` |
| Flip-card learn deck | `flashcards` |
| Scored audit findings | `audit-report` |
| Browse every component live | `library` or `npx planpage library --open` |
| Custom page | Compose components + `render()` / `renderHighlighted()` |

## Quick start (CLI)

```bash
# sample page in the browser
npx planpage render plan-brief --sample --open

# plan gate: render + serve + one decision back
npx planpage render plan-brief --data plan.json --serve --decision decision.json

# preference poll
npx planpage render question-poll --data questions.json --serve --decision decision.json

# browse components
npx planpage library --open

# wire this package into local agents (Claude / Cursor / Codex / …)
npx planpage init
```

## Quick start (library)

```tsx
import { render, renderHighlighted, PlanBrief, serve } from "planpage";

const html = await renderHighlighted(
  <PlanBrief title="…" summary={/* … */} steps={/* … */} risks={/* … */} />,
);
// write html → $TMPDIR/plan-<ts>.html, then:
// await serve({ htmlPath, outPath: "decision.json", timeoutSec: 600 })
// or: npx planpage serve <html> decision.json --timeout 600
```

Prefer **`renderHighlighted()`** (or CLI `render`) for VS Code syntax colour
(Shiki, baked into the HTML). Bare **`render()`** is sync and monochrome-safe.

## Decision contract

The page posts one JSON object; `serve` writes it verbatim:

```json
{
  "approved": true,
  "flips": ["rule.function-form"],
  "revisit": ["rule.error-shape"],
  "notes": "keep classes only in the DB layer"
}
```

| Field | Meaning |
|---|---|
| `approved` | Approve (`true`) vs Adjust (`false`) |
| `flips` | `data-id`s of `PickBlock`s the user flipped — re-open these |
| `revisit` | `data-id`s marked revisit without a firm decision |
| `notes` | free text from the notes box |

Interactive pieces carry a stable **`data-id`** (or `id` / `dataId`). Name them
meaningfully (`rule.error-shape`, `move.orders-dir`) so a bare id tells you what
to re-open.

**Never hang.** `serve` has an idle timeout; **Copy decision** is the
clipboard/`file://` fallback for headless / no-port callers.

## Plan-gate workflow (default)

1. Shape plan JSON for `plan-brief` (title · summary · steps · options · risks · code).
2. `npx planpage render plan-brief --data plan.json --serve --decision decision.json`
3. Read `decision.json` → if `approved:false`, re-open picks in `flips` / `revisit` and fold in `notes`.

## Question-poll workflow

1. Shape `{ title, layout?, questions: [{ id, text, group?, diagram?, options: [{ id, label, description?, code?, recommended? }] }] }`
2. `npx planpage render question-poll --data questions.json --serve --decision decision.json`
3. Each answer includes `questionId`, `picked`, `questionText`, `chosenText`.

Layouts: `stack` · `grid-2` · `grid-3` · `grid-4` · `grid-5`. Optional Mermaid
`diagram` per question.

## Rules

- **Package owns HTML; skill owns content.** Plug content into planpage — don't
  re-derive the shell. New widgets go into the package (+ gallery entry).
- **Self-contained.** No repo assets at render time; Tailwind + Mermaid from CDN;
  Shiki colour baked in by `renderHighlighted`.
- **Always render at the gate** when this skill is available — never dump a long
  plan as plain terminal text for approval.
- **Installing the package does not install skills.** Ship this skill (or run
  `npx planpage init`) so agents know to call the kit.

## More detail

- Component catalog + props: [COMPONENTS.md](COMPONENTS.md)
- Live gallery: `npx planpage library --open`
- Package docs: https://github.com/YosefHayim/planpage
