# AGENTS.md

Single source of truth for working in **planpage**. `CLAUDE.md` / `GEMINI.md` point here.

## What this is

**planpage** — a reusable, open-source kit that renders a skill's plan / gate / report as a beautiful, self-contained **local HTML** page. Reader-first: the design center is the developer *reading* the plan. Authored as **Preact components → static HTML** (`render(<Template {...data} />) → string`); a static render is the floor, interactivity is opt-in islands (the `serve` **post-back** · the gallery **filter**). Clear of mcp-ui / MCP Apps (the protocol/host lane). Published unscoped as **`planpage`** — one name for the package, the CLI bin, and the import (ADR 0013). Seeded by extracting the `planpage` spike from `dufflebag`, which becomes a thin consumer.

## Repo layout

| Path | Purpose |
|---|---|
| `src/components/` | shared primitives (flat), grouped by role — layout (`Shell` · `SectionCard` · `TreePanel` · `Accordion`) · notes (`Callout` · `RiskList`) · sequence (`StatusChip` · `Steps` · `Timeline`) · brainstorm (`PickBlock` · `OptionCompare`) · metrics (`PlanSummary`) · code (`DiffBlock` · `CodeBlock` · `AnnotatedCode`) · diagram (`Flow`) · `SubmitBar` |
| `src/templates/<Name>/` | pages (folder-per-template: component + test + README) — `BeforeAfter`, `CodeStylePlan`, `PlanBrief` (flagship agent-plan page), `Library` (auto-captured gallery); registry in `templates/index.tsx` |
| `src/gallery/` | the living collection — `registry` (SSOT) · `capture` (pure diff) · sync test; powers `Library` + `planpage capture` |
| `src/render/` | pure engine — `render()`, `Shell` wiring, `raw()`, client scripts (theme toggle · post-back · gallery filter). `Shell` owns the `Theme` type + the animated sun/moon toggle |
| `src/server/` | opt-in post-back — `serve` (ephemeral port, never-hang), `Decision` |
| `src/cli/` | dual-mode CLI (commander) — `render` / `serve` / `new` / `library` / `capture` / `init`; bare TTY → `menu` (clack); shared `io` (open/writeTemp) |
| `src/contracts/` | shared types — `Decision` |
| `src/index.ts` | public API barrel |
| `docs/adr/current/` | decisions (why) |
| `*.test.tsx` (co-located) | vitest, beside source |

## Conventions
<!-- rules digest — full guide in CODE-STYLE.md; edit there -->
- **Pure render, effects at the edges** — `components`/`templates`/`render` are pure (data → HTML string); all I/O in `server` + `cli`.
- **Components + `render()`** — Preact, arrow-const, named exports, PascalCase files, exported `readonly XProps`.
- **Escaping is default** — JSX auto-escapes; raw HTML only via `raw()`; `dangerouslySetInnerHTML` allowed only in `Shell` for constant infra.
- **Client islands live in the Shell** — constant scripts from `render/clientScript.ts`, each gated by a Shell flag (`interactive` → post-back · `filterable` → gallery filter). Never inline a `<script>` in a template.
- **Agent on-ramp** — `planpage init` scaffolds per-agent on-ramps (Claude Code skill · Cursor `.mdc` rule · Codex `AGENTS.md` block, all wired to `npx planpage`); `--agent` narrows the set, each writer is idempotent (skip unless `--force`). The interactive menu is `@clack/prompts` and every branch calls the same command fn.
- **Validate at the boundary** — public templates assert required props → actionable throw.
- **Errors by layer** — render throws · server exit codes (0/2/3, never-hang) · CLI top-catch.
- **Naming** — Comp `PascalCase` · props `XProps` · fns `camelCase` · consts `SCREAMING_SNAKE` · ids/flags `kebab-case`.
- **Tests** — vitest, snapshot/assertion-first, co-located.
- **Gallery is captured** — every `src/components/*.tsx` (bar `Shell`/`SubmitBar`) has a `GALLERY` entry in `src/gallery/registry.tsx`; the `gallery-sync` test fails on drift (`planpage capture` stubs the rest).
- **Never** — micro-helpers (`isRecord`…), nested ternaries, generic names (`handleData`…), default exports, restyling the shell.
- **biome** is the one gate. **Reuse before create.** SSOT / KISS / YAGNI / DRY.

## Commands

```bash
npm run verify     # biome ci + tsc --noEmit + vitest  (the one gate)
npm run cli        # dual-mode CLI (bare = menu; -- <sub> = direct)
npm run cli -- library --open   # render the auto-captured component gallery
npm run cli -- capture          # check the gallery registry is in sync
npm run cli -- init             # scaffold a ready skill into .claude/skills (agent on-ramp)
npm test           # vitest
npm run lint:fix   # biome check --write
npm run build      # tsup → bundled ESM in dist/ (runs under plain node — ADR 0014)
# publish: npm publish  (unscoped, public by default — ADR 0013)
```

## Validate changes

From repo root: `npm run verify` must be green before shipping.

## Docs

`PROJECT.md` (purpose) · `CONTEXT.md` (orientation) · `LANGUAGE.md` (glossary) · `CODE-STYLE.md` (how code is written — SSOT; `deslop` enforces per-diff) · `docs/adr/` (decisions).
