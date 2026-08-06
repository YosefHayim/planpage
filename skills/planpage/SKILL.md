---
name: planpage
description: >
  Render a skill's plan, review gate, quiz, poll, or report as a beautiful,
  self-contained INTERACTIVE HTML page via the open-source planpage package
  (Preact → static HTML + local post-back). The user edits and annotates the
  plan in the browser, attaches screenshots, stages everything in a fixed
  sidebar, then hits Send to Agent — one feedback batch returns to the
  terminal. Use whenever a skill needs a plan review gate, preference poll,
  teach/coach surface, storyboard/image grid, or shareable before/after
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
| Multi-step plan + edit/annotate + screenshots | `plan-brief` |
| Diff / deslop / migration report | `before-after` |
| Code-style picks + canonical example | `code-style-plan` |
| Preference interview / grill | `question-poll` |
| Graded teach/coach quiz | `quiz` |
| Flip-card learn deck | `flashcards` |
| Scored audit findings | `audit-report` |
| Browse every component live | `library` or `npx planpage library --open` |
| Custom page | Compose components + `render()` / `renderHighlighted()` |

## How the human feedback loop works (read this)

This is **not** Approve / Adjust anymore.

```
agent renders plan → serve opens browser
  → user annotates elements / edits text / attaches screenshots
  → items pile up in the fixed right sidebar (not sent yet)
  → user hits **Send to Agent**
  → serve writes decision.json and unblocks the terminal
  → agent reads the batch and revises
```

### What the user can do in the browser

| Action | How |
|---|---|
| **Annotate** (default mode) | Click any plan text → “What’s wrong?” card → **Queue note** |
| **Edit** | Switch to Edit mode → click text → change in place → blur queues the diff |
| **Flip / revisit** | On `PickBlock`s: use flip / revisit (shows as pills) |
| **Screenshot** | Sidebar **Screenshot** button, multi-select, or paste an image (max 5, ~1.5 MB each) |
| **Message** | Free text in the sidebar composer |
| **Send** | **Send to Agent** only — nothing reaches you before that |
| **Copy** | Clipboard fallback when no server / headless |

**Do not** poll or assume the browser auto-submits. Block on `serve` until Send.

## Quick start (CLI)

```bash
# sample page in the browser (static)
npx planpage render plan-brief --sample --open

# plan gate: render + serve + one feedback batch back
npx planpage render plan-brief --data plan.json --serve --decision decision.json

# preference poll
npx planpage render question-poll --data questions.json --serve --decision decision.json

# browse every component live
npx planpage library --open

# wire this package into local agents (Claude / Cursor / Codex / …)
npx planpage init
# reinstall / refresh on-ramps after skill changes:
npx planpage init --force
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

## Feedback contract

The page posts one JSON object when the user hits **Send to Agent**; `serve`
writes it verbatim to the terminal-side file:

```json
{
  "approved": false,
  "flips": ["rule.function-form"],
  "revisit": ["rule.error-shape"],
  "notes": "keep classes only in the DB layer",
  "edits": [
    {
      "id": "pp-t-3",
      "label": "Plan · Add the toggle button",
      "original": "Add the toggle button",
      "edited": "Add the toggle in the header only"
    }
  ],
  "annotations": [
    {
      "id": "pp-t-7",
      "label": "Risks · Flash of unstyled content",
      "selectedText": "Flash of unstyled content",
      "note": "mitigation is incomplete — also cover SSR"
    }
  ],
  "screenshots": [
    {
      "id": "shot-1",
      "name": "broken-header.png",
      "mime": "image/png",
      "dataUrl": "data:image/png;base64,…"
    }
  ]
}
```

| Field | Meaning | Agent action |
|---|---|---|
| `approved` | `true` only when queue + notes + shots were empty | Rare; treat as “nothing to fix” |
| `edits` | in-place text changes (`original` → `edited`) | Apply those wording/plan changes |
| `annotations` | notes on elements / selections | Fix the described problems |
| `screenshots` | data URLs of attached images | Inspect (write `dataUrl` to a temp file if needed) and fix what they show |
| `diagrams` | Mermaid boards the user edited / dragged / asked about | Prefer `edited` source; answer `questions[]`; honour `nodesMoved` layout hints |
| `whiteboards` | Freehand sketches (`pngDataUrl` + optional `note` / stickies) | Inspect the PNG (write data URL to a temp file), then act on the note |
| `flips` | `PickBlock` ids the user flipped | Re-open those style/design picks |
| `revisit` | marked revisit without a firm flip | Discuss or re-prompt those ids |
| `notes` | free text from the sidebar | Fold into the next revision |

Interactive pieces carry a stable **`data-id`** when they participate in flips.
Edits and annotations use client-assigned ids plus a human `label`.

**Queue-then-send.** The user stages items first; nothing reaches the agent until
**Send to Agent**.

**Never hang.** `serve` has an idle timeout; **Copy** is the clipboard/`file://`
fallback for headless / no-port callers.

### Handling screenshots

```bash
# example: dump the first screenshot from decision.json
node -e '
const d=require("./decision.json");
const s=d.screenshots?.[0];
if(!s) process.exit(0);
const b=Buffer.from(s.dataUrl.split(",")[1],"base64");
require("fs").writeFileSync("/tmp/"+s.name,b);
console.log("wrote /tmp/"+s.name);
'
```

Then open or describe the image and revise the plan/code accordingly.

## Plan-gate workflow (default)

1. Shape plan JSON for `plan-brief` (title · summary · steps · options · risks · code).
2. `npx planpage render plan-brief --data plan.json --serve --decision decision.json`
3. Wait for the user to stage feedback and hit **Send to Agent**.
4. Read `decision.json` → apply `edits`, address `annotations`, inspect `screenshots`, re-open `flips` / `revisit`, fold in `notes`.
5. If more review is needed, re-render the revised plan and serve again.

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
  plan as plain terminal text for review.
- **Do not invent Approve/Adjust.** The UX is edit → annotate → screenshot →
  **Send to Agent**.
- **Installing the package does not install skills.** Ship this skill (or run
  `npx planpage init --force`) so agents know to call the kit.

## More detail

- Component catalog + props: [COMPONENTS.md](COMPONENTS.md)
- Live gallery: `npx planpage library --open`
- Package docs: https://github.com/YosefHayim/planpage
