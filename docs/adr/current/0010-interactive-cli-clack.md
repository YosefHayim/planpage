# 0010 — Interactive CLI via @clack/prompts

**Status:** accepted (2026-07-02)

## Context

The bare-TTY front door was a hand-rolled `readline` numbered list — functional but plain, and it only previewed a template. Modern scaffolders (create-astro, create-vite) set a higher bar: labelled selects, hints, clean cancellation. We want the interactive menu to feel first-class without pulling in a heavy TUI runtime.

## Decision

Adopt **@clack/prompts** for the interactive menu (`src/cli/menu.ts`).

- Considered: **Ink** (React-in-terminal) — powerful but a second component model beside Preact and a heavy runtime for a menu; **styled readline** — zero-dep but barely better than today. clack wins on look-to-weight (its only transitive deps are `picocolors` + `sisteransi`).
- The menu routes every branch — preview / library / serve / init / new — into the SAME command functions the flag interface calls; no behaviour lives in the menu.
- Dual-mode is unchanged: `index.ts` only opens the menu on a bare TTY invocation; any flag or non-TTY defers to commander and never prompts.

## Consequences

- One small runtime dependency; the interactive surface looks modern and is cancel-safe (`isCancel`).
- New consumer-facing verbs (e.g. `init`) appear in one place and are reachable both as a flag and from the menu.
