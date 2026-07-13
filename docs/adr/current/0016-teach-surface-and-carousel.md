# 0016 — A teach/coach surface (graded Quiz + Flashcards) + Carousel, Scorecard, Terminal

**Status:** accepted (2026-07-13)

## Context

planpage rendered *plans*, *gates*, and *reports*, but the `dufflebag` skills had grown a whole **teaching** lane — `grill-me-code-style-coach` ("teach me as we build"), `teach`, `grill-me-stack` (a glossary with a code snippet per term) — with nowhere native to render to. The closest primitive, `QuestionCard`/`QuestionPoll`, is a **preference poll**: it collects which option the reader *wants* (a "✨ Recommended" badge, an "Other" escape hatch, a post-back) and has **no notion of a correct answer**. A coach quiz is the opposite shape: exactly one option is *right*, the reader is *graded*, the wrong pick is revealed with an explanation, and a *score* is what posts back. Overloading `QuestionCard` with correctness would fork its interaction model and bloat it.

Two adjacent gaps: report skills (`web-best-practices`' 7-dimension audit, `grill-me-code-style-review`) had no way to render a **scored verdict**, and there was no **auto-scrolling showcase** for golden exemplars / before-after strips (`png-to-code`) — a recurring request.

## Decision

**Add a small, role-grouped set of components + templates rather than stretch existing ones — reuse where the shape matches, create where it forks.**

- **`QuizCard` + `Quiz` (new `teach` category).** `QuizCard` is graded: options carry `correct`, the card asserts **exactly one** correct at the boundary, and a new **`quizzable` island** (scoped to `[data-quiz-card]`) reveals ✓/✗ + the `explanation` and locks the card on answer. `Quiz` composes them with a progress bar + live score and **renders its own `SubmitBar`**, owning submit through the `quizzable` island — so it deliberately does **not** also set `interactive` (two `[data-action]` handlers would double-submit). Distinct from `QuestionPoll`, which stays the preference-poll surface.
- **`Flashcard` + `Flashcards` — pure CSS.** The *learn* half to the Quiz's *test* half (renders a `grill-me-stack` glossary). Flip is a `:has(input:checked)` transform baked into the Shell — **no island, no Shell flag** — keeping the static-first floor (ADR 0002).
- **`Carousel` — one component, two modes.** `slideshow` = discrete auto-advancing slides (arrows + dots, pause-on-hover, infinite loop) driven by the **`carousel` island**, degrading to a swipeable scroll-snap strip with no JS; `marquee` = a seamless **pure-CSS** ticker. Both honour `prefers-reduced-motion`.
- **`Scorecard` + `Terminal` — pure.** `Scorecard` grades each dimension A–F (a web-best-practices verdict); `Terminal` is a faux CLI window. Both are no-JS. A new **`AuditReport`** template composes `Scorecard` + `Terminal` with the existing `RiskList` + `Callout` — the report surface for `web-best-practices` / the review skill.

Every new component keeps a `GALLERY` entry (the drift test enforces it) and each interactive one follows the existing island contract (a constant string, gated by a Shell flag, scoped + early-return). The `Library` render enables `quizzable` + `carousel` so the gallery samples are **live**.

## Consequences

- The teach/coach lane has a first-class render target: `Flashcards` (learn) → `Quiz` (test), plus `AuditReport` for scored reviews.
- Two new Shell flags (`quizzable`, `carousel`) and one new gallery category (`teach`); `CATEGORY_ORDER` places it after `brainstorm`.
- `Quiz` breaks the "Shell owns the SubmitBar via `interactive`" habit on purpose (it renders its own bar) — the one template that does, to avoid a double post-back. Noted in `render.ts`.
- `Flashcard`'s flip relies on CSS `:has()` — evergreen-only, with a graceful (un-flipped) fallback; acceptable for a local-preview tool.
- No new runtime dependency; `dist` shape unchanged. Five components + three templates + two islands, all behind `npm run verify`.
