# planpage — messy-repo wave 1 (complete)

**Host mode:** A — host subagents  
**Default:** `main` @ `1999ad60076e655e3869c3c262bbbc3f2fecc6c4`  
**Backup:** `backup/main-20260806T184749Z` @ same SHA  
**Feature branch:** `test/planpage-gaps-new-surfaces` @ `5e65521`  
**Feature PR → main:** https://github.com/YosefHayim/planpage/pull/19  

Harden PRs target **feature branch** (not main) so review stays layered.

| Feature | Issue | Branch | Worktree | Host | cmux | PR | Head SHA | Verify | Notes |
|---------|-------|--------|----------|------|------|----|----------|--------|-------|
| feedback-ux | — | `harden/feedback-ux` | `.worktrees/feedback-ux` | A | — | [#20](https://github.com/YosefHayim/planpage/pull/20) | `f459fa9` | pnpm test 89 · typecheck | serve summary diagrams/whiteboards |
| whiteboard | — | `harden/whiteboard` | `.worktrees/whiteboard` | A | — | [#21](https://github.com/YosefHayim/planpage/pull/21) | `0510628` | pnpm test 92 · typecheck | empty/sticky/export guards |
| gallery-matrices | — | `harden/gallery-matrices` | `.worktrees/gallery-matrices` | A | — | [#22](https://github.com/YosefHayim/planpage/pull/22) | `5c8a911` | pnpm test 87 · typecheck | matrix SSOT + library flags |
| diagram-board | — | `harden/diagram-board` | `.worktrees/diagram-board` | A | — | [#23](https://github.com/YosefHayim/planpage/pull/23) | `b10e7f3` | pnpm test 99 · typecheck | original source + re-render |

## Review order

1. **#19** feature PR → main (product surface)  
2. Harden stack into feature branch: **#20 → #21 → #23 → #22** (or any order; may conflict on shared files — rebase after first merge)  
3. Re-verify feature branch, then merge #19 (or re-roll if harden landed first)

## Main safety

- No product commits on `main` from this run  
- Backup local: `backup/main-20260806T184749Z`  
- No remote branch deletions  
- Terminals/cmux: N/A (host mode A)  

## Deferred

- Browser e2e for canvas/mermaid drag (no Playwright in repo)  
- Wave 2: shell-islands · agent-skill · legacy-primitives  
