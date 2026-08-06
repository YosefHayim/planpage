# planpage code style

How code is written in **planpage**. Prescriptive SSOT: this file is the source, and the short rules digest in `AGENTS.md` is a mirror of it — edit here. `deslop` enforces it per-diff.

Precedence: when a general habit conflicts with a rule below, **this file wins**; `PROJECT.md` (purpose), `CONTEXT.md` (shape), `LANGUAGE.md` (vocabulary), and `docs/adr/current/` (decisions) still own their subjects, and a rule here never restates them.

Only load-bearing, project-specific decisions live here. `dist/` and anything scaffolded into a consumer repo by `planpage init` are not authored source.

## Stack & framework practices

planpage is a JSX→static HTML render library (Preact) + a dual-mode CLI (commander + a `@clack/prompts` menu) + an opt-in post-back server. For practices this file does **not** restate:

- writing / consuming skills → `write-a-skill`

Preact render-to-string has no house skill; the rules below are the SSOT.

## How to read a rule

Every rule is one card with the same five slots in the same order:

| Slot | Content |
| --- | --- |
| `###` heading | Short human name |
| Metadata line | `[rule:<id>] · verify: <command or `judgment`>` |
| Assertion | **Exactly one sentence** — the whole rule, phrased so a diff either satisfies it or does not |
| `tsx` block | A `// ✓` case and a `// ✗` case, both from real code in this repo |
| `Why:` | One line of rationale |

Two consequences worth knowing when you audit an agent's diff:

- **The assertion is the verdict.** It is one sentence on purpose; if a second sentence is needed, that is a second rule with its own ID.
- **Every ID appears exactly once here and exactly once in `code-style.rules.json`, and the assertion matches that file's `statement` byte for byte.** The JSON is therefore an accurate index of this document — audit from whichever is easier.

`verify:` names the command that actually proves the rule. `judgment` means no detector exists yet and a reviewer owns it; it is not a synonym for "unimportant".

## Rules

### Role-owned directories
[rule:path.role-layout] · verify: judgment

Every module lives in the `src/` directory that owns its role.

```tsx
// ✓ src/components/Timeline.tsx — a shared primitive, so it lives in components/
import { StatusChip, type StepStatus } from "./StatusChip";

export const Timeline = ({ items }: TimelineProps) => (
  <ol class="relative space-y-4 border-slate-200 border-l pl-6">…</ol>
);

// ✗ src/components/serveTimeline.tsx — serving is an effect; it belongs in server/
import { createServer } from "node:http";
```

Why: `components` · `templates` · `render` · `gallery` · `highlight` · `server` · `cli` · `contracts` make "is this pure?" answerable from the path alone.

### Folder per template
[rule:path.template-folder] · verify: judgment

A template is a folder under `src/templates/` holding its component, its co-located test, and its README.

```tsx
// ✓ src/templates/BeforeAfter/ — BeforeAfter.tsx · BeforeAfter.test.tsx · README.md
export const BeforeAfter = ({ title, diffs }: BeforeAfterProps) => …;

// ✗ src/templates/beforeAfter.tsx — a loose page file, no test, no README
export const beforeAfter = (data: BeforeAfterProps) => …;
```

Why: a page is documentation plus proof, not just markup, and the folder is what keeps the three from separating.

### One module per island
[rule:path.one-module-per-island] · verify: judgment

Each client island and each agent on-ramp writer is one module in the directory that owns its set.

```ts
// ✓ src/render/clientScript/index.ts — one module per island, re-exported by the barrel
export { GALLERY_FILTER } from "./galleryFilter";
export { QUIZ_SCRIPT } from "./quiz";

// ✓ src/cli/init/index.ts — one writer per agent, selected by a lookup
const writers: Record<AgentKey, (options: InitCommandOptions) => ScaffoldResult> = {
  claude: scaffoldClaude,
  cursor: scaffoldCursor,
};

// ✗ one grab-bag module that switches on the member
export const scriptFor = (island: string) => (island === "quiz" ? QUIZ : FILTER);
```

Why: these are pluggable sets, and a per-member module is what lets one be added, read, or deleted without touching the others.

### Local scripts stay gitignored
[rule:path.dev-scripts] · verify: judgment

A personal or one-off script lives in the gitignored `scripts/dev/` directory.

```ts
// ✓ .gitignore — the one home for personal scripts, never pushed
// Local one-off / personal dev scripts (see CODE-STYLE.md)
// scripts/dev/

// ✗ a debugging script committed where CI and every contributor must carry it
// scripts/probeHighlight.ts
```

Why: the test is "would CI or another contributor need this?" — if not, it should not enter the repository's history.

### Pure render core
[rule:render.pure-core] · verify: judgment

Code under `src/components/`, `src/templates/`, and `src/render/` is pure data-to-HTML with no I/O, clock, randomness, or DOM access.

```tsx
// ✓ src/components/DiffBlock.tsx — props in, JSX out
export const DiffBlock = ({ file, before, after, lang = "ts" }: DiffBlockProps) => (
  <div class="overflow-hidden rounded-xl border border-slate-200">…</div>
);

// ✗ effects and ambient state inside the pure tree
export const DiffBlock = (props: DiffBlockProps) => {
  writeFileSync(props.file, props.after);
  const id = `d-${Math.random()}`;
  document.querySelector(`#${id}`)?.remove();
  return <div id={id} />;
};
```

Why: the pure half snapshots with zero disk, and the server can never leak into the render path.

### `render()` is the only string boundary
[rule:api.render-boundary] · verify: judgment

A component tree becomes an HTML string only through `render()`.

```tsx
// ✓ src/cli/library.tsx — the edge renders, then runs the async highlight pass
const html = await highlight(render(<Library />, { filterable: true, explorable: true }));

// ✗ a bespoke string function that hides the components from the consumer
export const library = (data: LibraryProps): string => `<html>…</html>`;
```

Why: consumers build pages by nesting components, and a string function ends that composition at the first template.

### Public barrel
[rule:api.barrel-export] · verify: judgment

Every public component, template, and helper is re-exported from `src/index.ts`.

```ts
// ✓ src/index.ts
export { Timeline, type TimelineItem, type TimelineProps } from "./components/Timeline";
export { render, type RenderOptions } from "./render/render";

// ✗ a component a consumer can only reach by deep path
import { Timeline } from "planpage/dist/components/Timeline";
```

Why: `package.json` publishes only the `.` export, so anything missing from the barrel does not exist for a consumer.

### Escaping is the default
[rule:render.escape-default] · verify: `npm run lint`

Raw HTML reaches the page only through `raw()` or the `Shell`'s own constant infra.

```tsx
// ✓ src/render/raw.tsx — the single sanctioned hatch, reviewed and commented
export const raw = (html: string): VNode => (
  // biome-ignore lint/security/noDangerouslySetInnerHtml: this is the sole sanctioned raw() hatch
  <span style="display:contents" dangerouslySetInnerHTML={{ __html: html }} />
);

// ✗ skill-supplied data injected as HTML from a component
export const Note = ({ body }: NoteProps) => <div dangerouslySetInnerHTML={{ __html: body }} />;
```

Why: injection is the top risk in a data→HTML tool, and JSX interpolation already escapes every value it prints.

### Islands live in the Shell
[rule:render.island-in-shell] · verify: judgment

Client-side behavior is a constant script from `src/render/clientScript/` that the `Shell` injects behind a boolean flag.

```tsx
// ✓ src/components/Shell.tsx — constant, gated, and inert on a page without its hooks
{filterable ? (
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
  <script dangerouslySetInnerHTML={{ __html: GALLERY_FILTER }} />
) : null}

// ✗ a template shipping its own script, or a script string built from props
<script>{`document.getElementById('${id}').onclick = submit;`}</script>
```

Why: one owner for every script is what keeps the static render the floor and keeps skill data out of executable position.

### `pp-` for owned DOM ids
[rule:render.pp-prefix] · verify: judgment

Every DOM id the render layer owns is prefixed `pp-`.

```tsx
// ✓ src/components/SubmitBar.tsx — pp-bar · pp-notes · pp-token, queried by the post-back island
<input id="pp-notes" placeholder="Notes / what to adjust…" />

// ✗ an unprefixed infra id that can collide with skill content
<input id="notes" />
```

Why: the islands look these ids up by hand, so the prefix is the only thing separating infra from content.

### Code components emit a marker
[rule:render.highlight-marker] · verify: judgment

A code-bearing component emits a `codeMark()` marker and leaves colouring to the async `highlight()` edge pass.

```tsx
// ✓ src/components/DiffBlock.tsx — sync, readable with zero JS, coloured at the edge
<pre class="code bg-emerald-50 p-3 text-xs">{codeMark(after, lang)}</pre>

// ✗ awaiting Shiki inside a component, or shipping colour as a client island
const coloured = await codeToHtml(after, { lang, theme: "dark-plus" });
```

Why: `render()` has to stay sync and pure, and an unswapped marker still degrades to readable escaped source (ADR 0015).

### Arrow-const components
[rule:component.arrow-const] · verify: judgment

A component is one arrow const named after its PascalCase file.

```tsx
// ✓ src/components/PickBlock.tsx
export const PickBlock = ({ id, rule, chosen, rejected, why, tag }: PickBlockProps) => (
  <div class="pick grid gap-3 md:grid-cols-2" data-pick data-id={id}>…</div>
);

// ✗ a hoisted declaration for the exported component, or a file name that disagrees with it
export function pickBlock(props: PickBlockProps) {
  return <div />;
}
```

Why: one predictable file→component mapping makes the component the headline of its file.

### Named exports only
[rule:component.named-export] · verify: `npm run lint`

Every module exports by name and never by default.

```tsx
// ✓ src/components/Callout.tsx — the import name cannot drift from the definition
export const Callout = ({ tone, title, children }: CalloutProps) => (
  <div class={`flex gap-3 rounded-xl border p-4 ${cls}`}>{children}</div>
);

// ✗ a default export — `vitest.config.ts` is the only one, and it carries an explicit biome-ignore
export default Callout;
```

Why: biome errors on default exports, so every symbol keeps one discoverable name across the repo and the barrel.

### Props are a readonly `XProps` interface
[rule:component.props-interface] · verify: judgment

A component's props are an exported `interface` named `<Component>Props` with every field `readonly`.

```tsx
// ✓ src/components/StatusChip.tsx
export interface StatusChipProps {
  readonly status: StepStatus;
  readonly label?: string;
}

// ✗ inline, mutable, or differently named props
export const StatusChip = (props: { status: string; label?: string }) => …;
```

Why: consumers import the props type to shape their data, and `readonly` states that the render layer never writes back.

### Helpers below the component
[rule:component.helpers-below] · verify: judgment

A module-local helper is a `function` declaration placed below the component it serves.

```tsx
// ✓ src/templates/Library/Library.tsx — the component reads first, helpers hoist
export const Library = ({ title = "planpage — component gallery" }: LibraryProps) => {
  const groups = groupByCategory();
  return <div class="lg:flex lg:gap-8">…</div>;
};

function groupByCategory(): ReadonlyArray<[string, ReadonlyArray<GalleryName>]> {
  return […];
}

// ✗ helper consts above the component, so the reader scrolls past plumbing to reach the page
const groupByCategory = () => […];
export const Library = () => …;
```

Why: the exported component is what a reader opens the file for, so it goes first and hoisting pays for it.

### Templates assert their inputs
[rule:template.assert-props] · verify: `npm test`

A public template asserts its required props before it renders and throws an `Error` naming the template and the missing field.

```tsx
// ✓ src/templates/BeforeAfter/BeforeAfter.tsx
if (diffs.length === 0) throw new Error("BeforeAfter: diffs[] is required and non-empty");

// ✗ rendering a broken page from junk data, or failing without naming what was missing
if (!diffs) return null;
throw new Error("invalid props");
```

Why: the caller is usually an agent assembling JSON, so junk has to fail loud with the field name instead of rendering a hollow page.

### Case by kind
[rule:naming.case-by-kind] · verify: judgment

Each kind of name takes its fixed case: PascalCase components, camelCase functions and variables, SCREAMING_SNAKE constants, and kebab-case template ids and CLI flags.

```tsx
// ✓ src/components/Callout.tsx and src/templates/index.tsx
const TONE: Record<CalloutTone, { readonly icon: string; readonly cls: string }> = {…};
export const TEMPLATES = {
  "before-after": (data: unknown): VNode => <BeforeAfter {...(data as BeforeAfterProps)} />,
};

// ✗ mixed conventions for the same kinds of thing
const Tone = {…};
export const TEMPLATES = { beforeAfter: (Data: unknown) => <BeforeAfter /> };
```

Why: the case tells a reader what kind of thing a name is before they open its definition.

### Domain-specific names
[rule:naming.no-generic] · verify: judgment

Every identifier names the domain thing it holds or does.

```ts
// ✓ src/gallery/capture.ts
export const diffRegistry = (
  onDisk: ReadonlyArray<string>,
  registered: ReadonlyArray<string>,
): RegistryDiff => ({…});

// ✗ handleData, processItem, result, temp, data2
export const handleData = (data2: unknown) => {
  const temp = data2;
  return temp;
};
```

Why: a generic name defers the reader to the body and attracts unrelated code, because nothing in the name says what does not belong.

### `interface` for shapes, `type` for unions
[rule:type.interface-or-union] · verify: judgment

Object shapes are declared with `interface` and unions with `type`.

```ts
// ✓ src/components/RiskList.tsx
export type Severity = "low" | "med" | "high";

export interface Risk {
  readonly risk: string;
  readonly severity: Severity;
  readonly mitigation?: string;
}

// ✗ the two forms swapped
type Risk = { risk: string; severity: Severity };

// ✗ an open string where a closed set belongs
export interface Severity {
  value: string;
}
```

Why: one form per job lets a reader tell a closed set from a record without reading the definition.

### Explicit return types at the edges
[rule:type.explicit-return] · verify: judgment

An exported non-component function declares its return type.

```ts
// ✓ src/render/render.tsx and src/server/serve.ts
export const render = (content: VNode, options: RenderOptions = {}): string => …;
export const serve = ({ htmlPath, outPath }: ServeOptions): Promise<number> => …;

// ✗ an inferred public signature — only a JSX-returning component may infer
export const render = (content: VNode, options: RenderOptions = {}) => …;
```

Why: the published `.d.ts` is the contract, so its edges are written down rather than reconstructed by inference.

### No `any`
[rule:type.no-any] · verify: `npm run lint`

No authored type is `any`.

```ts
// ✓ src/cli/render.ts — `unknown` at the boundary, then the template asserts its own props
async function readData(file?: string): Promise<unknown> {
  if (file) return JSON.parse(readFileSync(file, "utf8"));
  return {};
}

// ✗
async function readData(file?: string): Promise<any> {
  return file ? JSON.parse(readFileSync(file, "utf8")) : {};
}
```

Why: `any` disables exactly the checking a JSON-in tool needs most, and biome errors on it.

### Casts only at the JSON boundary
[rule:type.no-forced-props] · verify: judgment

A cast forces a shape only at the sanctioned JSON→props boundary in `src/templates/index.tsx`.

```tsx
// ✓ src/templates/index.tsx — the one assertion, immediately backed by the template's own assert
"before-after": (data: unknown): VNode => <BeforeAfter {...(data as BeforeAfterProps)} />,

// ✗ forcing a shape anywhere inside the render tree
const stat = entry as Stat;
const first = items[0]!;
```

Why: every other cast hides a shape the types could have proved, and biome already errors on the `!` form.

### No nested ternaries in JSX
[rule:jsx.no-nested-ternary] · verify: judgment

JSX picks a branch with an early return, a lookup map, or a subcomponent, never a nested ternary.

```tsx
// ✓ src/components/Callout.tsx — a variant map picks the icon and classes
const { icon, cls } = TONE[tone];
return <div class={`flex gap-3 rounded-xl border p-4 ${cls}`}>…</div>;

// ✗ a chain the reader has to unwind in the middle of the markup
<span>{tone === "risk" ? "▲" : tone === "warn" ? "⚠" : tone === "note" ? "🛈" : "◆"}</span>
```

Why: markup is read visually, and a ternary chain inside it hides which branch actually fired.

### No micro-helpers
[rule:helper.no-micro-helper] · verify: judgment

A helper exists only when it holds real logic that more than one caller needs.

```ts
// ✓ src/gallery/capture.ts — real logic, two callers (the CLI command and the drift test)
export const componentNames = (files: ReadonlyArray<string>): ReadonlyArray<string> =>
  files
    .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
    .map((file) => file.slice(0, -".tsx".length));

// ✗ giveaway micro-helpers, one-use wrappers, and guards the props type already proves
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const ensureArray = <T,>(v: T | ReadonlyArray<T>): ReadonlyArray<T> => (Array.isArray(v) ? v : [v]);
if (!items) return null;
```

Why: each one adds a name to learn for logic the caller already had, and together they are the clearest tell that a diff was generated rather than designed.

### Variant maps keyed by a union
[rule:variant.record-map] · verify: `npm run typecheck`

A fixed set of visual variants is a `Record` map keyed by a literal union.

```ts
// ✓ src/components/StatusChip.tsx
const STATUS: Record<
  StepStatus,
  { readonly icon: string; readonly cls: string; readonly label: string; readonly spin?: boolean }
> = {…};

// ✗ an open string, with classes built by concatenation
const chip = (status: string) => `bg-${status}-500/15 text-${status}-600`;
```

Why: the union closes the set, so tsc rejects a variant the design never agreed to and forces every case to exist.

### The Shell is fixed
[rule:shell.fixed] · verify: judgment

A template supplies content and `data-id`s and never restyles the `Shell`.

```tsx
// ✓ src/templates/PlanBrief/PlanBrief.tsx — content only; the Shell owns chrome, theme, and islands
<SectionCard title={title} chip="agent plan">
  <PlanSummary stats={summary} />
</SectionCard>

// ✗ a template reaching into the page frame or inlining its own styles
<Shell title="mine">
  <style>{"body{background:#111}"}</style>
</Shell>
```

Why: a fixed shell is what makes every planpage report recognizable at a glance, and the edge already owns title, theme, and flags.

### Server exit codes
[rule:error.server-exit-code] · verify: `npm test`

The server resolves every path to an exit code — 0 for a written decision, 2 for a bad argument or IO failure, 3 for a timeout — and never hangs.

```ts
// ✓ src/server/serve.ts — one settle path, keep-alive sockets dropped, unref'd idle timer
const finish = (code: number): void => {
  if (settled) return;
  settled = true;
  clearTimeout(idle);
  server.close();
  resolve(code);
};

// ✗ a promise with no timeout and no close, so an open browser tab pins the caller forever
return new Promise((resolve) => {
  server.on("request", () => resolve(0));
});
```

Why: an agent is on the other end of this call, so an unresolved server is a hung task rather than a slow one.

### One CLI catch
[rule:error.cli-top-catch] · verify: judgment

CLI code throws and lets the one catch in `src/cli/index.ts` print the message and set a non-zero exit code.

```ts
// ✓ src/cli/index.ts
main().catch((error: unknown) => {
  process.stderr.write(`planpage: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});

// ✗ a command swallowing its own failure into a friendly nothing
try {
  await renderCommand(name, options);
} catch {
  process.stdout.write("something went wrong\n");
}
```

Why: one exit owner is what keeps every failure printed the same way and every exit code honest.

### Co-located tests assert the HTML
[rule:test.colocated-html] · verify: judgment

A vitest file sits beside the source it covers and asserts on the string `render()` returns.

```tsx
// ✓ src/templates/BeforeAfter/BeforeAfter.test.tsx
const html = render(<BeforeAfter title="Deslop pass" diffs={DIFFS} />);
expect(html.startsWith("<!doctype html>")).toBe(true);
expect(html).toContain("Deslop pass");

// ✗ a distant tests/ tree, or a test that only checks the call did not throw
expect(() => render(<BeforeAfter title="x" diffs={DIFFS} />)).not.toThrow();
```

Why: the HTML string is the product, so asserting anything else tests Preact instead of the page.

### Escaping and throw coverage
[rule:test.escape-and-throw] · verify: judgment

Every public template test covers both its escaping and its required-prop throw.

```tsx
// ✓ src/templates/BeforeAfter/BeforeAfter.test.tsx
expect(html).not.toContain("<img src=x onerror=alert(1)>");
expect(html).toContain("&lt;img");
expect(() => render(<BeforeAfter title="x" diffs={[]} />)).toThrow(/diffs\[\] is required/);

// ✗ a happy-path-only test for a template that renders skill-supplied strings
it("renders", () => expect(render(<BeforeAfter title="x" diffs={DIFFS} />)).toContain("x"));
```

Why: safe escaping and a loud failure are the two promises this kit makes to a reader, so each template proves them itself.

### Gallery captures every component
[rule:gallery.registry-entry] · verify: `npm test`

Every component in `src/components/` except `Shell` and `SubmitBar` has a `GALLERY` entry in `src/gallery/registry.tsx`.

```tsx
// ✓ src/gallery/registry.tsx — category, blurb, usage, props, and a live sample
Callout: {
  category: "notes",
  blurb: "A tone-coloured admonition — the agent's margin note.",
  usage: '<Callout tone="risk" title="…">…</Callout>',
  props: [{ name: "tone", type: "note|warn|success|danger|risk|decision|assumption", required: true }],
  sample: () => <Callout tone="risk" title="Blast radius">Touches 12 files across 3 modules.</Callout>,
},

// ✗ a new component with no entry — src/gallery/registry.test.ts fails on the drift
expect(diff).toEqual({ missing: ["Storyboard"], extra: [] });
```

Why: the gallery is only trustworthy as a catalog if it cannot silently miss a component.

### Menu and flags share one function
[rule:cli.shared-command-fn] · verify: judgment

Every menu branch and every subcommand routes into the same exported command function.

```ts
// ✓ src/cli/menu.ts calls the same fn src/cli/index.ts binds to the subcommand
await renderCommand(name, { sample: true, open: true });

// ✗ the menu re-implementing the verb it offers
if (action === "preview") {
  writeFileSync(out, render(TEMPLATES[name](SAMPLES[name])));
}
```

Why: two implementations of one verb drift, and the menu is the copy nobody tests.

### Prompts only on a TTY
[rule:cli.tty-only-prompt] · verify: judgment

A bare TTY opens the clack menu and every non-TTY invocation runs on flags without prompting.

```ts
// ✓ src/cli/index.ts
const hasArgs = process.argv.length > 2;
if (!hasArgs && process.stdout.isTTY) {
  await runMenu();
  return;
}
await program.parseAsync(process.argv);

// ✗ prompting whenever an argument is missing
const name = await text({ message: "Which template?" });
```

Why: an agent runs this without a terminal, and a prompt there is a hang rather than a question.

## Canonical example

Every rule above, composed on one real slice — the `before-after` template, its registration seams, and the CLI edge that turns it into a file.

```tsx
// src/templates/BeforeAfter/BeforeAfter.tsx — pure: data in, JSX out
import { DiffBlock } from "../../components/DiffBlock";
import { SectionCard } from "../../components/SectionCard";

export interface BeforeAfterProps {
  readonly title: string;
  readonly diffs: ReadonlyArray<{
    readonly file: string;
    readonly before: string;
    readonly after: string;
  }>;
}

/** A titled section of green/red before→after diffs — the workhorse report (deslop, refactors). */
export const BeforeAfter = ({ title, diffs }: BeforeAfterProps) => {
  if (diffs.length === 0) throw new Error("BeforeAfter: diffs[] is required and non-empty");
  return (
    <SectionCard title={title} chip="before → after">
      <div class="space-y-3">
        {diffs.map((d) => (
          <DiffBlock key={d.file} file={d.file} before={d.before} after={d.after} />
        ))}
      </div>
    </SectionCard>
  );
};

// src/templates/index.tsx — the one sanctioned JSON→props assertion, kebab-case id
export const TEMPLATES = {
  "before-after": (data: unknown): VNode => <BeforeAfter {...(data as BeforeAfterProps)} />,
} satisfies Record<string, (data: unknown) => VNode>;

// src/index.ts — public barrel
export { BeforeAfter, type BeforeAfterProps } from "./templates/BeforeAfter/BeforeAfter";

// src/cli/render.ts — the effect edge: render, highlight, then write / open / serve
const html = await highlight(render(factory(data), { theme: options.theme }));
writeFileSync(options.out, html);
```

One `readonly` props interface, an arrow const named after its file, a loud assert before the first element, composition out of shared components (whose code panes emit `codeMark()` markers), a kebab-case registry key with the single JSON boundary cast, a barrel export, and every effect kept at the CLI edge.

## Golden path — adding a template

A **template** is planpage's unit of extension: one page a skill can render by name.

1. Scaffold the folder: `npm run cli -- new <kebab-name>` writes `src/templates/<Name>/<Name>.tsx`, `<Name>.test.tsx`, and `README.md` — or create the three by hand.
2. Write the component as an arrow const named after the folder, with an exported `readonly <Name>Props` interface, and assert every required prop up top: `throw new Error("<Name>: field is required")`.
3. Compose it from `src/components/`; add a new shared component only when a second consumer really exists (then follow `## Recipes → Adding a component`).
4. Fill `<Name>.test.tsx`: `render(<Name … />)` and assert on the HTML string, plus one escaping case and the required-prop throw.
5. Fill `README.md`: what the page renders and an example `data.json`.
6. Register it in `src/templates/index.tsx` — a kebab-case key in `TEMPLATES` returning `<Name {...(data as NameProps)} />`, plus a `SAMPLES` entry so `render --sample` and the menu preview work.
7. Export the component and its props type from `src/index.ts`.
8. If it needs interactivity, add one module under `src/render/clientScript/`, re-export it from that barrel, gate it on a new boolean in `ShellProps`, inject it in `src/components/Shell.tsx`, and flip the flag for your template in `src/cli/render.ts`.
9. Add it to `TEMPLATE_INDEX` in `src/gallery/registry.tsx` so the `Library` page lists it.
10. Run `npm run verify` (biome ci → tsc → vitest) and confirm it is green.

**Definition of done**

- [ ] Shaped like the `## Canonical example`.
- [ ] Registered in `TEMPLATES` + `SAMPLES` with a kebab-case id, and exported from `src/index.ts`.
- [ ] Co-located test asserts the HTML, the escaping, and the throw.
- [ ] `README.md` shows a real `data.json`.
- [ ] Any interactivity is one gated island module, never a `<script>` in the template.
- [ ] Listed in `TEMPLATE_INDEX`; `npm run verify` passes.
- [ ] No `## Never` entry introduced.

## Recipes

### Adding a component

1. Create `src/components/<Name>.tsx` — one arrow const, exported `readonly <Name>Props`, pure data → JSX, local helpers as `function` declarations below.
2. Give any fixed variant set a `Record<Union, …>` map, as in `src/components/StatusChip.tsx`.
3. Register it in `src/gallery/registry.tsx` (`category` · `blurb` · `usage` · `props` · a live `sample`), or run `npm run cli -- capture` for a paste-ready stub — `src/gallery/registry.test.ts` fails until you do.
4. Export it from `src/index.ts`, then run `npm run verify`.

### Adding a CLI command

1. Add the subcommand in `src/cli/index.ts` (commander) with a real `--help`, delegating to one exported command function in `src/cli/`.
2. Keep every effect there: `src/cli/io.ts` owns temp-file writes and opening the browser.
3. If it is a consumer-facing verb, add a branch in `src/cli/menu.ts` that calls the same function — no behavior in the menu.
4. Leave non-TTY invocation on flags and stdin; never prompt.

### Adding a rule to this document

1. Add the card here with all five slots and a one-sentence assertion.
2. Add the same `id` to `code-style.rules.json` with a `statement` byte-identical to the assertion, in the same order.
3. Point `verify` at a command that really exists, or `judgment` when a reviewer owns it.
4. Cross-reference the rule from `## Never` if it has a concrete slop shape.

## Exemplars

Write new code like these files:

- `src/templates/BeforeAfter/BeforeAfter.tsx` — the composed template shape, assert included.
- `src/templates/PlanBrief/PlanBrief.tsx` — the flagship: one section per data block, each rendered only when present.
- `src/templates/Library/Library.tsx` — a page that reads the registry, with local subcomponents and helpers below.
- `src/components/StatusChip.tsx` — a literal union plus its `Record` variant map.
- `src/components/Callout.tsx` — the tone map and `children` composition.
- `src/components/PickBlock.tsx` — a stable `data-id` for the decision contract.
- `src/render/raw.tsx` and `src/render/codeMark.tsx` — the two sanctioned hatches, both documented.
- `src/gallery/capture.ts` — pure logic split from its CLI edge.
- `src/server/serve.ts` — an effect edge: exit codes, never-hang, helpers below.
- `src/templates/BeforeAfter/BeforeAfter.test.tsx` — the test shape: HTML, escaping, throw.

## Never

The AI-slop fingerprint for planpage. Each entry is a concrete shape, not an abstract warning:

- `isRecord`, `isDefined`, `ensureArray`, `noop`, and one-use wrappers · [rule:helper.no-micro-helper]
- `if (!items) return null` on a prop the interface already marks required · [rule:helper.no-micro-helper]
- nested ternaries inside markup · [rule:jsx.no-nested-ternary]
- `handleData`, `processItem`, `result`, `temp`, `data2` · [rule:naming.no-generic]
- `dangerouslySetInnerHTML` outside `raw()` and the `Shell` · [rule:render.escape-default]
- a `<script>` written inside a template, or a script string built from props · [rule:render.island-in-shell]
- an unprefixed infra id such as `id="bar"` or `id="notes"` · [rule:render.pp-prefix]
- `document`, `window`, `fs`, `Date.now`, or `Math.random` under `components/`, `templates/`, or `render/` · [rule:render.pure-core]
- `await` on Shiki inside a component instead of emitting `codeMark()` · [rule:render.highlight-marker]
- `export default` · [rule:component.named-export]
- `function MyComponent()` for an exported component · [rule:component.arrow-const]
- mutable or inline prop types instead of a `readonly XProps` interface · [rule:component.props-interface]
- `any` · [rule:type.no-any]
- `as SomeProps` outside `src/templates/index.tsx`, and `!` non-null assertions · [rule:type.no-forced-props]
- a page assembled by a string function instead of `render()` · [rule:api.render-boundary]
- inline `style` or a `<style>` block from a template · [rule:shell.fixed]
- a template that renders junk data instead of throwing · [rule:template.assert-props]
- a new component with no `GALLERY` entry · [rule:gallery.registry-entry]
- a prompt on a non-TTY path · [rule:cli.tty-only-prompt]
- a menu branch that re-implements the command it offers · [rule:cli.shared-command-fn]
- a one-off debug script committed outside `scripts/dev/` · [rule:path.dev-scripts]

## Formatting and verification

Biome owns 2-space indentation, double quotes (JSX included), semicolons, trailing commas, a 100-column width, and organized imports across the maintained tree.

| Command | Covers |
| --- | --- |
| `npm run verify` | `biome ci .` → `tsc --noEmit` → `vitest run`. The one gate; green before shipping. |
| `npm run lint` | biome: default exports, `any`, non-null assertions, `dangerouslySetInnerHTML`. |
| `npm test` | vitest: rendered-HTML assertions, escaping, template throws, gallery drift, serve exit codes. |
| `npm run typecheck` | tsc: variant unions, prop shapes, and the published `.d.ts`. |
| `npm run cli -- capture` | the fast local gallery-drift check that `registry.test.ts` enforces. |
