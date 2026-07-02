# 0014 — Bundle the shipped artifact with tsup

**Status:** accepted (2026-07-02)

## Context

The build was `tsc -p tsconfig.build.json`, and `tsconfig.json` sets `moduleResolution: "Bundler"`. Bundler resolution lets source use extensionless and bare-directory imports (`import { TEMPLATES } from "../templates"`), and `tsc` emits those specifiers **verbatim**. That is fine when a bundler later consumes the output — but the shipped `dist/cli/index.js` is run directly by **plain Node**, whose ESM resolver does no extension or directory-index lookup. `planpage@0.1.0` therefore crashed on first run with `ERR_UNSUPPORTED_DIR_IMPORT` (`dist/templates`). `tsx` had masked this in dev because it resolves those specifiers; `node` does not. 108 relative imports were affected, so the failure was systemic, not a one-off.

## Decision

Build the shipped artifact with **tsup** (esbuild) instead of `tsc`.

- `build` → `tsup`; the config lives in the `package.json` `"tsup"` key — a `tsup.config.ts` would need a default export, which the biome gate (`noDefaultExport`) forbids.
- Two entries — `src/index.ts` (library) and `src/cli/index.ts` (bin) — with `format: esm`, `target: node18`, `dts: true`, `clean: true`, `splitting: false`.
- `splitting: false` keeps each entry self-contained: the bin retains its shebang and needs no shared-chunk indirection.
- Runtime `dependencies` stay external (esbuild's node default); only local `src` is inlined, so directory/extensionless imports disappear from the output entirely.

Rejected alternative: migrate to `moduleResolution: "NodeNext"` and hand-add `.js` / `/index.js` to all 108 imports. It keeps a pure-`tsc` build but is a large, error-prone edit — and several of those import lines live inside template-literal example code in `cli/new.ts`, where a blind rewrite would corrupt the scaffolded output.

## Consequences

- `dist` is bundled ESM that runs under plain Node — `npx planpage` and `import … from "planpage"` both work off a clean install. Verified: `node dist/cli/index.js --help`, `library --out`, and a library import all succeed.
- `tsc` stays the typecheck gate (`tsc --noEmit` in `verify`); it no longer emits.
- `tsup` is a new dev-only dependency; the published tarball keeps its shape (`dist` + the four root docs).
- Shipped in `planpage@0.1.1`. `0.1.0` is left published but is known-broken at runtime.
