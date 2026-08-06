# planpage — messy-repo wave plan (new surfaces + residual)

**Repo:** planpage  
**Default:** `main` @ `1999ad60076e655e3869c3c262bbbc3f2fecc6c4` (origin)  
**Backup:** `backup/main-20260806T184749Z` @ same SHA  
**Working branch (test-gap WIP):** `test/planpage-gaps-new-surfaces` (dirty + new tests; not on main)

## Feature inventory for lanes

| id | Path globs | Risk | Suggested work |
|----|------------|------|----------------|
| `feedback-ux` | `src/components/FeedbackSidebar.tsx`, `src/render/clientScript/postback.ts`, `src/contracts/decision.ts`, `src/server/serve.ts` | med | harden · docs · keep tests green |
| `whiteboard` | `src/components/Whiteboard.tsx`, `src/render/clientScript/whiteboard.ts` | med | harden canvas export · deslop |
| `diagram-board` | `src/components/Flow.tsx`, `src/render/clientScript/diagram.ts` | med | harden mermaid re-render · docs |
| `gallery-matrices` | `src/gallery/registry.tsx`, `src/templates/Library/**`, `src/cli/library.tsx` | low | polish state matrices · carousel scroll fix already in |
| `shell-islands` | `src/components/Shell.tsx`, `src/render/clientScript/**` | med | island flag coherence · no page-scroll regressions |
| `agent-skill` | `skills/planpage/**`, `src/cli/init/**` | low | skill/init wording matches queue-then-send |
| `legacy-primitives` | remaining `src/components/*` without deep tests | low | optional unit matrix (partially filled) |

## Status

| Feature | Issue | Branch | Worktree | Host | cmux | PR | Head SHA | Verify | Notes |
|---------|-------|--------|----------|------|------|----|----------|--------|-------|
| — | — | — | — | **awaiting host mode** | — | — | — | — | Fan-out not started |

## Wave 1 recommendation (after host mode answer)

1. **feedback-ux** — land feedback contract + serve + sidebar  
2. **whiteboard** — sketch board  
3. **diagram-board** — Flow board  
4. **gallery-matrices** + shell islands (or merge 2–3 if small)

Do **not** commit product work on `main`. Base PRs on current default after human review of this WIP branch.

## Main safety

- No force-push of main  
- Backup ref local: `backup/main-20260806T184749Z`  
- Push backup only if user requests off-machine copy  
