# planpage

Render an agent's **plan, review-gate, or report** as a beautiful, self-contained **local HTML page** — authored as Preact components rendered to static HTML, with an opt-in post-back server so the browser can hand a decision back to your agent. Like mcp-ui, but for local terminal skills.

Built for skill and agent authors — and the developers who read what an agent proposes. Reader-first: the design center is the person *reading* the plan.

[![npm](https://img.shields.io/npm/v/planpage.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/planpage)
[![provenance](https://img.shields.io/badge/provenance-signed-brightgreen.svg)](https://www.npmjs.com/package/planpage)
[![license: MIT](https://img.shields.io/npm/l/planpage.svg?color=blue)](https://www.npmjs.com/package/planpage)

## Quick start

```bash
npx planpage                                       # interactive menu (in a TTY)
npx planpage render plan-brief --sample --open     # render a full sample plan and open it
```

No install needed — `npx` fetches it. `render … --sample --open` writes a self-contained HTML file and opens it in your browser, so you see the output in one command. Requires Node 18+.

## Usage

Three ways in, one render engine underneath.

### CLI

```bash
planpage render <template> --data plan.json --open       # render a template to HTML
planpage render <template> --serve --decision out.json   # render + collect one decision (post-back)
planpage serve page.html out.json                        # serve an existing HTML file, collect a decision
planpage library --open                                  # the living component gallery
planpage new my-template                                 # scaffold a new template folder
planpage capture                                         # check the gallery registry is in sync
planpage init                                            # add a ready render-plan skill to .claude/skills
planpage                                                 # (bare, in a TTY) interactive menu
```

Templates: `plan-brief` · `before-after` · `code-style-plan`. Data goes in as JSON via `--data <file>` or piped stdin; `--sample` uses built-in sample data; `planpage render <template> --help` prints the shape.

### Library

```tsx
import { render, BeforeAfter } from "planpage";

const html = render(
  <BeforeAfter
    title="Deslop pass"
    diffs={[{ file: "src/x.ts", before: "let x = 1", after: "const x = 1" }]}
  />,
);
// `html` is a complete HTML document string — write it, open it, or serve it.
```

### In your agent

planpage is a package + CLI — **not itself a skill**. To make your agent render its plans through it:

```bash
npx planpage init          # drops a render-plan skill into .claude/skills (--global for ~/.claude)
```

`init` scaffolds a small `render-plan` skill wired to `npx planpage`: it renders the plan, serves it, and reads the decision back. Ship that skill with your agent — end users install the *skill*, which depends on this package underneath. The layering is **install the package → `init` a skill that calls it → ship that skill**.

## What's inside

**Templates** — whole-page layouts:

- **plan-brief** — an entire agent plan on one page: summary · notes · steps · options · risks · annotated code (the flagship).
- **before-after** — green/red before→after diffs (the workhorse report).
- **code-style-plan** — a pick-the-code gallery + canonical example + CLI flow (an interactive gate).
- **library** — the living, auto-captured component gallery (`planpage library`).

**Components** — reader-first pieces you compose into a page: `Callout` · `RiskList` · `Steps` · `Timeline` · `StatusChip` · `OptionCompare` · `PickBlock` · `PlanSummary` · `CodeBlock` · `DiffBlock` · `AnnotatedCode` · `SectionCard` · `Accordion` · `TreePanel` · `Flow` (Mermaid). Every one is showcased live — run `planpage library --open`.

## How it works

```
data → render() → HTML string → (write / open)  OR  (serve → one decision back)
```

A static render is the floor; the post-back server is opt-in and never hangs a non-TTY caller. Everything is self-contained — Tailwind + Mermaid load from CDN, and nothing is written into your repo.

## Scope

- **Static-beautiful first, interactive by opt-in.** A page reads well with zero JavaScript; islands (the post-back, the gallery filter) are added only when asked for.
- **Local HTML, not a hosted app.** planpage renders a file you open — it is not a server framework or a client-side React app.
- **Not mcp-ui / MCP Apps.** Those own the protocol and host lane; planpage renders local pages for terminal skills.
- **Not itself a skill.** It is the engine; `planpage init` scaffolds the skill that drives it.

## Docs

- [AGENTS.md](AGENTS.md) — conventions + validation commands for coding agents (the source of truth for working here)
- [PROJECT.md](PROJECT.md) · [CONTEXT.md](CONTEXT.md) · [LANGUAGE.md](LANGUAGE.md) · [CODE-STYLE.md](CODE-STYLE.md)
- [docs/adr/](docs/adr/) — architecture decisions

## License

MIT
