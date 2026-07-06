# 0015 — Render-time Shiki highlighting + the CodeExplorer

**Status:** accepted (2026-07-06)

## Context

Code is the payload of a code-style plan, yet planpage showed it as flat monochrome text. A `highlighted` Shell flag pulled **Prism** from a CDN, but no code component ever emitted a `language-*` class, so nothing actually coloured — and even wired up, Prism needs client JS to run and its themes only approximate an editor. Two gaps followed:

1. **No real editor colour.** A reader skimming the canonical example got no syntactic signal, and certainly not the VSCode palette they read code in all day.
2. **No multi-file example.** The canonical example was a single `CodeBlock` string. A real "golden path" spans several files (the new module, its barrel re-export, its route/registration) with a before/after per file — there was no way to show that as a navigable unit.

The tension: `render()` is **pure and synchronous** (data → HTML string; ADR 0001) and pages are **self-contained, CDN-only** (ADR 0002). A great highlighter (Shiki) is **async** (it loads TextMate grammars) — it cannot run inside `render()`.

## Decision

**Highlight at render time with [Shiki](https://shiki.style), as an edge transform — not inside the pure render.**

- **Markers, then a pass.** Every code component emits a `<code data-hl="<lang>">…JSX-escaped source…</code>` marker via the shared `render/codeMark.tsx` helper (`codeMark()` — a function like `raw()`, not a component, so it stays a lowercase-file render helper). `render()` stays pure/sync (no `Buffer`, no encoding) and the escaped source is fully readable with zero JS. A new **`src/highlight/` layer** exposes an async `highlight(html)` that regex-matches each marker, recovers the source by reversing JSX's escaping (preact encodes only `&`/`<`/`"`), and swaps the inner for Shiki's coloured spans — plus `renderHighlighted()` = `highlight(render(…))`. The CLI (`render`, `library`) awaits it at the edge — where I/O already lives.
- **Real VSCode colour, self-contained.** Shiki's **dual-theme** output (`light-plus` / `dark-plus` — VSCode's own themes) bakes light colours inline and dark colours into a `--shiki-dark` CSS variable; one Shell rule swaps them under `.dark`. Colours ship **in the HTML** — no CDN, no client JS to see them. Code backgrounds became theme-aware (white / `#1e1e1e`) so the light/dark palettes read on a matching surface. The **JS RegExp engine** (`shiki/engine/javascript`) is used, so there's no WASM to bundle; Shiki stays an external runtime dependency (tsup default — ADR 0014).
- **`CodeExplorer` — the IDE view.** A new component renders a multi-file example as a sidebar **file tree** + an editor pane, one pane per file, with a **per-file before/after toggle** when a `before` is supplied. Panes are pre-highlighted; a small opt-in **island** (`explorable` Shell flag, scoped to `[data-explorer]`) only toggles which file/variant is visible, so the first file reads with no JS. `CodeStylePlan`'s `canonical` now takes either `code` (a `CodeBlock`) or `files` (the explorer).

Prism and the `highlighted` Shell flag are **removed**.

## Consequences

- A rendered plan shows real VSCode colour in both themes, offline, with the no-JS fallback intact — the static-first floor (ADR 0002) holds.
- Purity is preserved: components/`render()` stay sync; highlighting is an awaited edge step, consistent with "effects at the edges."
- Per-line highlighting in `AnnotatedCode` tokenises each line in isolation — a line inside a multi-line construct (template literal / block comment) can mis-tokenise. Acceptable for short annotation snippets; whole-block components (`CodeBlock`, `DiffBlock`, `CodeExplorer`) highlight with full context.
- A consumer calling bare `render()` (not `renderHighlighted`/`highlight`) still gets a valid page — just the monochrome fallback. Documented in the barrel + skill.
- `shiki` is a new runtime dependency (pinned `4.3.0`). It is bundler-external, so `dist` is unchanged in shape.
- Shipped in `planpage@0.3.0`.
