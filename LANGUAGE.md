# planpage — Language

The shared vocabulary. Names only; use these exact terms in code, docs, and commits.

## Artifacts

**template**:
A named, gallery-listed page you can render (e.g. `BeforeAfter`, `CodeStylePlan`). Implemented as a Preact component.
_Avoid_: layout, view, page-type.

**component**:
A shared building piece templates compose from (`Shell`, `SectionCard`, `PickBlock`, `DiffBlock`, `TreePanel`, `Flow`, `CodeBlock`, `CodeExplorer`, `FeedbackSidebar`, `SubmitBar`).
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
The single object a post-back returns: `{ approved, flips, revisit, notes, edits, annotations }`. Staged in the feedback sidebar; posted only on **Send to Agent**.

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

**live plan**:
A sketch plan served with `live`: the page stays open while the agent edits it. Comments flow to the agent, and changed pages refresh in place. Ends with an Approve that writes the decision.
_Avoid_: live server, hot reload, watch mode.

**fallback**:
The no-server path — open the file directly; the page copies the decision to the clipboard to paste back. Ensures a non-TTY caller never hangs.

## Sketch plans

**sketch plan**:
A plan drawn as hand-sketched pages by the `sketch-plan` template (`SketchPlan`). The default for every plan.
_Avoid_: drawing, diagram, mockup, sketch page.

**sketch scene**:
One picture on one page: a JSON scene (`SketchScene`) that the sketch engine draws. Its shapes, words, arrows and notes.
_Avoid_: drawing, diagram, figure, picture.

**sketch recipe**:
A ready-made sketch scene kept in the package (`SKETCH_RECIPES`). `planpage recipes` lists them.
_Avoid_: variation, template sketch, sample.

**Your call page**:
The last page of a sketch plan. It shows the real options, 1 to 4, and asks the owner to pick one.
_Avoid_: decision page, choice page, final page.

**note link**:
A mono note tied to one part of the picture by a dashed line. Set with `link` on the note.
_Avoid_: callout, annotation, pointer.

## Sketch kit

**wireframe**:
A hand-drawn layout made of plain HTML and `sk-*` parts, drawn by the wireframe island.
_Avoid_: mockup picture, drawn screen

**sketch part**:
One reusable wireframe piece (a button, a card, an icon) with its drawer and gallery examples.
_Avoid_: widget, component (in the sketch kit)

**screen node**:
A scene node of kind `screen` that holds a wireframe's HTML at a box in the scene.
_Avoid_: screen box, html node

**part link**:
A note link or edge end written `"screenId#part"`, pointing at a `data-part` element in a screen node.
_Avoid_: element link, deep link

## Relationships

- A **template** composes **component**s and nests inside the **shell**.
- **render** produces a **report** or a **plan**; only a **plan** is **serve**d for a **decision**.
- **flip** / **revisit** on a pick populate the **decision**'s arrays by `data-id`.
