# planpage

<p align="center">
  <img src="https://raw.githubusercontent.com/YosefHayim/planpage/main/public/hero.png" alt="planpage — turn an agent's plan into a beautiful HTML page" width="100%" />
</p>

[![npm](https://img.shields.io/npm/v/planpage.svg?color=cb3837&logo=npm)](https://www.npmjs.com/package/planpage)
[![license: MIT](https://img.shields.io/npm/l/planpage.svg?color=blue)](https://www.npmjs.com/package/planpage)

## Why

AI coding agents propose multi-step plans, review-gates, and reports, then often dump them as walls of terminal text. The work may be careful, but the reading experience is not: dense scrollback makes risks, choices, and next steps hard to absorb.

**planpage** turns that plan into a self-contained HTML page you open in the browser. One command gives the developer a calm, structured page for reading the plan properly — and, when needed, Approve or Adjust sends a decision straight back to the agent.

## Quick start

```bash
npx planpage render plan-brief --sample --open
```

That's it. One command renders a sample plan page and opens it in your browser. No install needed — [`npx`](https://docs.npmjs.com/cli/v10/commands/npx/) handles it. Requires [Node.js](https://nodejs.org/en) 18+.

Want the interactive menu instead?

```bash
npx planpage
```

## Features

- **Self-contained HTML** — one file, works offline, nothing written to your repo
- **Post-back server** — opt-in: the page collects an Approve/Adjust decision and returns it as JSON to your agent
- **9 agent integrations** — one `init` command wires planpage into [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview), [Cursor](https://cursor.com/docs/rules), [Codex](https://developers.openai.com/codex/guides/agents-md), [Windsurf](https://docs.windsurf.com/windsurf/cascade/agents-md), [Kiro](https://kiro.dev/docs/), [Cline](https://docs.cline.bot/customization/cline-rules), [GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions), [Amazon Q](https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/context-project-rules.html), and [Roo Code](https://roocodeinc.github.io/Roo-Code/)
- **5 templates** — plan-brief (flagship) · before-after diffs · code-style-plan · question-poll (interactive quiz with [Mermaid](https://mermaid.js.org/) diagrams) · library
- **17 components** — reader-first UI pieces: Callout · RiskList · Steps · Timeline · CodeBlock · DiffBlock · AnnotatedCode · CodeExplorer (IDE-style file tree) · Flow · QuestionCard · and more
- **Real VS Code syntax colour** — [Shiki](https://shiki.style/) highlights TS/JS (and more) at render time using [VS Code](https://code.visualstudio.com/)'s own themes; colour is baked into the HTML, so it works offline with no client JS
- **Programmable** — use the CLI, or import `render()` (or `renderHighlighted()`) and compose [Preact](https://preactjs.com/) components directly in [TypeScript](https://www.typescriptlang.org/)
- **Never hangs** — the post-back server gracefully falls back when there's no TTY

## Usage

### CLI

```bash
planpage render <template> --data plan.json --open       # render to HTML and open
planpage render <template> --serve --decision out.json   # render + collect a decision
planpage serve page.html out.json                        # serve existing HTML, collect a decision
planpage library --open                                  # browse all components live
planpage new my-template                                 # scaffold a new template
planpage init                                            # wire planpage into your agents
```

Templates: `plan-brief` · `before-after` · `code-style-plan` · `question-poll` · `library`

Data flows in as JSON via `--data <file>` or piped stdin. Use `--sample` for built-in sample data.

### Library

```tsx
import { renderHighlighted, BeforeAfter } from "planpage";

const html = await renderHighlighted(
  <BeforeAfter
    title="Deslop pass"
    diffs={[{ file: "src/x.ts", before: "let x = 1", after: "const x = 1" }]}
  />,
);
// html is a complete document string with VS Code colour baked in — write it, open it, or serve it.
// Prefer the sync `render()` if you don't need syntax colour (it leaves a readable monochrome fallback).
```

### Agent integration

planpage is a package — not itself a skill. One command wires it into whatever agent you use:

```bash
npx planpage init                  # all supported agents
npx planpage init --agent cursor   # just one
npx planpage init --global         # user-wide (Claude)
```

| Agent | What `init` writes |
|---|---|
| **Claude Code** | `.claude/skills/render-plan/SKILL.md` |
| **Cursor** | `.cursor/rules/planpage.mdc` |
| **Codex** | delimited block in `AGENTS.md` |
| **Windsurf** | `.windsurf/rules/planpage.md` |
| **Kiro** | `.kiro/steering/planpage.md` |
| **Cline** | `.clinerules/planpage.md` |
| **GitHub Copilot** | `.github/copilot-instructions.md` |
| **Amazon Q** | `.amazonq/rules/planpage.md` |
| **Roo Code** | `.roo/rules/planpage.md` |

Each on-ramp tells the agent: shape your plan as JSON → render it through `npx planpage` → read the decision back. Idempotent — existing files are never clobbered unless you pass `--force`.

## How it works

```
data → render() → marked HTML → highlight() → coloured HTML → write/open  OR  serve → one decision back
```

Static render is the default. The post-back server is opt-in and blocks until one decision arrives — then exits cleanly.

## Build locally

planpage is a Node.js package published on [npm](https://www.npmjs.com/package/planpage). Local development uses [pnpm](https://pnpm.io/):

```bash
pnpm install
pnpm run verify
pnpm run cli -- render plan-brief --sample --open
```

Use `pnpm run cli -- library --open` to inspect the captured component gallery. For code conventions and extension points, read [CODE-STYLE.md](CODE-STYLE.md) before adding templates, components, or CLI commands.

## Scope

- **Static-beautiful first.** Pages read well with zero JS; interactivity is added only when asked for.
- **Local HTML, not a hosted app.** planpage renders a file — it's not a server framework.
- **Not mcp-ui / MCP Apps.** Those own the protocol lane; planpage is for local terminal skills.
- **Not itself a skill.** It's the rendering engine. `planpage init` wires it into your agent.

## Docs

- [AGENTS.md](AGENTS.md) — conventions and validation commands for agents working in this repo
- [PROJECT.md](PROJECT.md) · [CONTEXT.md](CONTEXT.md) · [LANGUAGE.md](LANGUAGE.md) · [CODE-STYLE.md](CODE-STYLE.md)
- [docs/adr/](docs/adr/) — architecture decisions

## License

MIT
