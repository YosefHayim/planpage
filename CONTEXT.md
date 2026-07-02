# skill-ui

skill-ui renders a skill's plan, review-gate, or report as a beautiful, self-contained local HTML page. It exists so skills stop hand-rolling throwaway HTML, and so the developer reading a plan gets something clean and skimmable. This file is orientation — the vocabulary lives in [LANGUAGE.md](LANGUAGE.md).

## The shape

Three layers, split pure-from-effectful:

- **Pure render core** — `components/` (plan-native pieces: callouts, steps, timelines, option-compares, risk lists, annotated code, …) compose into `templates/` (pages like the flagship `PlanBrief` and the auto-captured `Library`); `render()` turns a tree into a full HTML-document string. No I/O here.
- **Effect edges** — `server/` serves a rendered page on loopback and collects one decision (the post-back); `cli/` is the dual-mode front door (a `@clack/prompts` menu on a bare TTY) that reads data, writes/opens files, runs the server, and scaffolds a consumer skill for another agent (`init`).
- **Contracts** — the shared `Decision` shape the post-back returns.
- **The collection** — `gallery/` registers every component (SSOT + a drift test), so `Library` (`skill-ui library`) is a living, always-complete showcase.

## The actors

- **Skill author / agent** — the producer: assembles data, calls `render(<Template … />)` (or `skill-ui render`), gets HTML back.
- **Reader** — the developer who opens the HTML to understand the plan. The design center.
- **serve-plan server** — the optional middle: when a skill wants a verdict, it serves the page and hands one `Decision` back to the agent.

## The flow

```
data → render() → HTML string → (write / open)  OR  (serve → one Decision back)
```

A static render is the floor; the serve step is opt-in and never blocks a non-TTY caller (it falls back to open-file + clipboard).

See [PROJECT.md](PROJECT.md) for purpose & direction, [CODE-STYLE.md](CODE-STYLE.md) for how code is written, and [docs/adr/](docs/adr/current/) for the decisions.
