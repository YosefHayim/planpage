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
  // sketch
  SketchPlan, SketchScene,
  // diagram / action
  Flow, FeedbackSidebar, SubmitBar,
} from "planpage";
```

## Templates (CLI names)

| CLI name | Component | Role |
|---|---|---|
| `sketch-plan` | `SketchPlan` | Default plan page: hand-sketched pages, Notes and View code toggles, Your call |
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
| **sketch** | `SketchPlan` (whole plan, pager) · `SketchScene` (one picture) |
| **diagram** | `Flow` (Mermaid — all kinds + editable board) · `Whiteboard` (freehand Excalidraw-like pen → agent PNG) |
| **action** | `FeedbackSidebar` (interactive queue-then-send) · `SubmitBar` (quiz) |

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

`id` is what lands in `Decision.flips` / `revisit` after the user flips/revisits and hits **Send to Agent**.

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

### SketchScene (one picture)

One hand-sketched picture. It takes a `SketchScene` from `src/contracts/sketchScene.ts`. The full scene format is in [SKETCH-STYLE.md](SKETCH-STYLE.md).

```tsx
<SketchScene
  label="Today and after"
  scene={{
    width: 1000,
    height: 300,
    nodes: [{ id: "afterRender", kind: "box", x: 540, y: 70, w: 250, h: 60, fill: "blue", words: "npx planpage render\nsketch-plan" }],
  }}
/>
```

`label` is a required short name for the picture. `scene` is required. Pure drawing: the page's sketch script draws it, and it has no state.

### SketchPlan (default plan page)

The default template for every plan. It takes a title and a list of pages. Each page has one picture, a legend, and optional `toggle`, `code` and `decision`. The last page is usually the Your call page with 1 to 4 options.

```tsx
<SketchPlan title="Sketch plans move into planpage" pages={pages} />
```

Types: `SketchPlanProps { title: string; pages: readonly SketchPlanPage[] }`, with `SketchPlanPage` in `src/contracts/sketchScene.ts`. Keys: Left and Right change pages, Up/Down or an option's number or letter pick an option on Your call, Enter sends there, Esc closes the code drawer. Post-back returns the Decision plus `choice`.

## Recipes

| Goal | Recipe |
|---|---|
| Any plan (default) | `SketchPlan` + `serve` |
| Plan gate | `PlanBrief` + `serve` |
| Style grill | `CodeStylePlan` or `QuestionPoll` + `serve` |
| Deslop report | `BeforeAfter` diffs (open-only or serve) |
| Teach loop | `Quiz` / `Flashcards` |
| Image review | `Storyboard` inside any template body / custom page |
| Custom gate | Compose components → `renderHighlighted` → `serve` |
