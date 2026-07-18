# planpage — components & templates

SSOT for props and live previews: **`npx planpage library --open`**.

Import from the package:

```ts
import {
  render, renderHighlighted, serve,
  // templates
  PlanBrief, BeforeAfter, CodeStylePlan, QuestionPoll, Quiz, Flashcards, AuditReport, Library,
  // layout / structure
  Shell, SectionCard, Accordion, Carousel, TreePanel, Storyboard,
  // notes / metrics
  Callout, RiskList, PlanSummary, Scorecard,
  // sequence
  StatusChip, Steps, Timeline,
  // brainstorm / teach
  PickBlock, OptionCompare, QuestionCard, QuizCard, Flashcard,
  // code
  CodeBlock, DiffBlock, AnnotatedCode, CodeExplorer, Terminal,
  // diagram / action
  Flow, SubmitBar,
} from "planpage";
```

## Templates (CLI names)

| CLI name | Component | Role |
|---|---|---|
| `plan-brief` | `PlanBrief` | Flagship agent-plan page + gate |
| `before-after` | `BeforeAfter` | Diff / migration report |
| `code-style-plan` | `CodeStylePlan` | Style picks + `CodeExplorer` canonical |
| `question-poll` | `QuestionPoll` | Preference interview (`pollable`) |
| `quiz` | `Quiz` | Graded teach/coach quiz (`quizzable`) |
| `flashcards` | `Flashcards` | Flip-card learn deck (CSS flip) |
| `audit-report` | `AuditReport` | Scored audit findings |
| `library` | `Library` | Auto-captured component gallery |

## Components by role

| Role | Components |
|---|---|
| **layout** | `Shell` · `SectionCard` · `TreePanel` · `Accordion` · `Carousel` · `Storyboard` |
| **notes** | `Callout` · `RiskList` |
| **sequence** | `StatusChip` · `Steps` · `Timeline` |
| **brainstorm** | `PickBlock` · `OptionCompare` · `QuestionCard` |
| **teach** | `QuizCard` · `Flashcard` |
| **metrics** | `PlanSummary` · `Scorecard` |
| **code** | `DiffBlock` · `CodeBlock` · `AnnotatedCode` · `CodeExplorer` · `Terminal` |
| **diagram** | `Flow` (Mermaid) |
| **action** | `SubmitBar` |

### Storyboard (image grids)

```tsx
<Storyboard
  dataId="storyboard.trailer-keyframes"
  columns={3} // 1–6; reflows down on small screens
  frames={[
    { src: "frame-01.png", caption: "Cold open", index: 1 },
    { src: "frame-02.png", alt: "Reveal keyframe" }, // alt defaults to caption / "Frame N"
  ]}
/>
```

Use for trailer keyframes, screenshot sets, design variations. Pure layout — no
post-back collector (stable `dataId` is for targeting only).

### PickBlock (decision flips)

```tsx
<PickBlock
  id="rule.function-form"
  rule="Function form"
  chosen="const f = () => {}"
  rejected="function f() {}"
  why="arrow-const"
  tag="[taste]"
/>
```

`id` is what lands in `Decision.flips` / `revisit` after Approve/Adjust.

### CodeExplorer (multi-file IDE pane)

Feed `CodeStylePlan` via `canonical.files`, or use directly:

```tsx
<CodeExplorer
  files={[
    { path: "src/x.ts", code: "export const x = 1", before: "export let x = 1" },
  ]}
/>
```

### Highlighting

Code components emit `data-hl` markers. `renderHighlighted()` / CLI `render` swap
them for Shiki dual-theme spans. Unhighlighted output stays readable monochrome.

## Recipes

| Goal | Recipe |
|---|---|
| Plan gate | `PlanBrief` + `serve` |
| Style grill | `CodeStylePlan` or `QuestionPoll` + `serve` |
| Deslop report | `BeforeAfter` diffs (open-only or serve) |
| Teach loop | `Quiz` / `Flashcards` |
| Image review | `Storyboard` inside any template body / custom page |
| Custom gate | Compose components → `renderHighlighted` → `serve` |
