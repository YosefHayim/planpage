# 0012 — Published npm name is scoped: `@yosefsabag/skill-ui`

**Status:** accepted (2026-07-02)

## Context

`npm view skill-ui` 404s (the bare name is unpublished), but `npm publish` rejects it with `403 — too similar to existing package skillui`. npm's typosquat/similarity guard normalises punctuation, so `skill-ui` collapses to `skillui` (an unrelated package at v1.3.4). `skill-uii` fails the same guard (`skilluii` is one edit from `skillui`).

## Decision

Publish **scoped** as `@yosefsabag/skill-ui` — npm's own suggested escape hatch; scoped names are exempt from the similarity guard.

- `package.json` `name` is `@yosefsabag/skill-ui`; `publishConfig.access` is `public` (scoped packages default to restricted, which would otherwise 403 again).
- The **bin stays `skill-ui`** — bin names are independent of the package name — so the `skill-ui` command and `npx @yosefsabag/skill-ui` both work.
- Consumers install `@yosefsabag/skill-ui` and `import … from "@yosefsabag/skill-ui"`; the git-dep path (`github:YosefHayim/skill-ui`) is unchanged (git deps resolve by repo, not by package name).

## Consequences

- The chosen name (`skill-ui`) is preserved verbatim in the scope path and the CLI; no rename to a different word.
- Docs, the `init`-generated skill, and the dufflebag consumer reference the scoped specifier. Supersedes the "publish `skill-ui@x`" note in [0009](0009-packaging-and-dufflebag-consumer.md).
