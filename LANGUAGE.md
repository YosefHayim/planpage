# planpage — Language

The shared vocabulary. Names only; use these exact terms in code, docs, and commits.

## Artifacts

**template**:
A named, gallery-listed page you can render (e.g. `BeforeAfter`, `CodeStylePlan`). Implemented as a Preact component.
_Avoid_: layout, view, page-type.

**component**:
A shared building piece templates compose from (`Shell`, `SectionCard`, `PickBlock`, `DiffBlock`, `TreePanel`, `Flow`, `CodeBlock`, `CodeExplorer`, `SubmitBar`).
_Avoid_: widget, block, part.

**CodeExplorer**:
The IDE-style multi-file view — a sidebar file tree + editor pane, with a per-file before/after toggle. The paved way to show a multi-file canonical example.
_Avoid_: file browser, editor, IDE.

**shell**:
The fixed page skeleton (`Shell`) every render nests inside — CDN tags, theme, header, submit-bar. Skills never restyle it.
_Avoid_: layout, frame.

**report** / **plan** / **gate**:
Kinds of rendered instance. A **report** is read-only (e.g. a before/after); a **plan** / **gate** is interactive — it collects a decision.

## Interaction

**decision**:
The single object a post-back returns: `{ approved, flips, revisit, notes }`.

**flip**:
Reversing a pick at review time (chosen ↔ rejected).

**revisit**:
Marking a pick undecided, to re-open later.

**post-back**:
The loopback round-trip where the served page POSTs the decision to the local server.

**island**:
An opt-in interactive region on an otherwise static page.

## Mechanism

**render**:
The pure step — a template tree → a self-contained HTML document string. No I/O.

**marker**:
The `data-hl` `<code>` element a code component emits (via `codeMark`) carrying the escaped source — the target the highlight pass rewrites.
_Avoid_: placeholder, token, tag.

**highlight**:
The async edge step — swap every marker for Shiki's VSCode dual-theme spans, colour baked into the HTML (no CDN, no client JS). `renderHighlighted` = render + highlight in one call.
_Avoid_: colourize, syntax, prism.

**serve**:
The effectful step — serve a rendered page and block for one decision (`serve-plan`).

**fallback**:
The no-server path — open the file directly; the page copies the decision to the clipboard to paste back. Ensures a non-TTY caller never hangs.

## Relationships

- A **template** composes **component**s and nests inside the **shell**.
- **render** produces a **report** or a **plan**; only a **plan** is **serve**d for a **decision**.
- **flip** / **revisit** on a pick populate the **decision**'s arrays by `data-id`.
