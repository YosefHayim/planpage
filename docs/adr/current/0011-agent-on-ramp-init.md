# 0011 — Agent on-ramp: `skill-ui init`

**Status:** accepted (2026-07-02)

## Context

skill-ui is a package + CLI, not itself a Claude skill. Developers kept asking "how do I inject this into my agent?" — the answer (install the package, then have a skill shell out to `skill-ui render|serve` at its plan gate) was documented but not turnkey.

## Decision

Add **`skill-ui init`** (`src/cli/init.ts`) — it scaffolds a ready-to-use Claude skill (`render-plan/SKILL.md`) into `.claude/skills/` (or `~/.claude/skills` with `--global`), wired to `npx @yosefsabag/skill-ui render|serve`. One command and a developer's agent renders every plan through the kit.

- Never clobbers: skips an existing skill unless `--force`.
- The generated skill is the injection point — it tells the agent to render + serve the plan and read the decision back; skill-ui stays the engine underneath.

## Consequences

- The three consumption layers are now explicit: **install** the package → **`init`** a skill that calls it → **ship** that skill to end users (e.g. via a skills installer like dufflebag).
- `init` is a fs-writing effect edge, so it lives in `cli/`; it is exposed both as a flag command and as a menu branch.
