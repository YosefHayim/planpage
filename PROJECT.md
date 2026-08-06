# planpage — Purpose & Direction

## The problem

Skills emit planning artifacts — before/after plans, decision galleries, structure diffs — as ephemeral TUI text that's hard to skim, so every skill ends up hand-rolling its own throwaway HTML to escape the wall of text. planpage is the reusable kit that renders those artifacts as beautiful, self-contained **local HTML** — solving both readability and the per-skill duplication. It sits deliberately clear of mcp-ui / MCP Apps (SEP-1865), which own interactive-UI-over-the-protocol for hosts; planpage renders a local file you open.

## Who it's for

Developers **reading** an agent's plan — the plan consumer who wants it clean and easy on the eyes. The skill author / agent is the producer; the design center is the reader. Explicitly **not** for MCP-app builders (that's mcp-ui / MCP Apps), nor as a general web-app component library (shadcn / Magic UI).

## The core insight

Agents now generate rich plans faster than a human can absorb them from monochrome scroll-back; the bottleneck moved from *generating* a plan to *reading* it. The eye reads structured, colour-coded HTML far faster, and a zero-install local render (a temp `.html` + the browser every dev already has) is a near-free readability win. Reuse and interactivity are real but **opt-in**: the static, beautiful render is the always-on floor; a template plugs in only where a skill needs it; a post-back server bolts on only when a skill wants a decision back.

## Goals

- A skill turns structured plan data into a polished local HTML page **in one call** — zero hand-rolled HTML.
- A developer **absorbs** a plan (diffs, decisions, structure) in seconds from the browser.
- Adding a template is **one component drop-in**; the gallery grows without touching the core.
- Feedback is **opt-in**: static by default; when wanted, the user edits/annotates the plan, stages items in a sidebar, posts one feedback JSON batch, and the agent continues — and it never hangs off-TTY.
- Anyone can **install it** and render the same templates in their own skill/CLI.

**v1 success bar:** skills (dufflebag grill/deslop and peers) render their plans through planpage, retiring hand-rolled HTML.

## Non-goals

- **Not** an MCP/host UI layer (no `ui://` resources, no protocol UI) — that's mcp-ui / MCP Apps.
- **Not** a general web component library or app-frontend toolkit.
- **Not** a client-side SPA — static HTML out; interactivity is opt-in islands only.
- **Not** a theming playground — a fixed shell (light + dark only) keeps every report recognizable.
- **Not** a dashboard/analytics tool — a plan/report/gate, not live data-viz beyond diagrams/flows.
- **Not** a hosted service — local files + an ephemeral localhost server only.

## Direction

- **Built:** pure render engine (Preact → static HTML); ~25 shared components (layout, notes, sequence, brainstorm, teach, metrics, code, diagram); eight templates (`PlanBrief`, `BeforeAfter`, `CodeStylePlan`, `QuestionPoll`, `Quiz`, `Flashcards`, `AuditReport`, `Library`); gallery auto-capture + sync test; Shiki render-time highlight + `CodeExplorer`; dual-mode CLI (`render` / `serve` / `new` / `library` / `capture` / `init`) with clack menu; post-back server (never-hang); agent on-ramps for nine tools; published unscoped as **`planpage`** on npm (ADR 0013).
- **Next:** keep dufflebag and other skills as thin consumers; broaden consumers beyond the originating grill/deslop skills; polish README / docs site if demand warrants.
- **Maybe:** a public showcase site; a contribution guide; more teach/coach surfaces.

## Guiding principles

- **Reader-first** — comprehension of the plan is the acceptance test.
- **Static floor, opt-in interactivity** — full value with zero JS; the post-back is additive.
- **Never hang** — every interactive path is headless / non-TTY safe.
- **Self-contained output** — one HTML file, CDN-only, no reader-side build.
- **Fixed shell, content in** — skills supply data + `data-id`s, never restyle.
- **Pure data → HTML** — the render layer is pure; all I/O lives at the edges.
- **Fit-for-purpose conventions** — decided fresh for a render library (see `docs/adr/`), not inherited.
- SSOT / KISS / YAGNI / DRY.
