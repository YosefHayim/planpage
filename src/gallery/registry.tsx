import type { VNode } from "preact";
import { Accordion } from "../components/Accordion";
import { AnnotatedCode } from "../components/AnnotatedCode";
import { Callout } from "../components/Callout";
import { CodeBlock } from "../components/CodeBlock";
import { CodeExplorer } from "../components/CodeExplorer";
import { DiffBlock } from "../components/DiffBlock";
import { Flow } from "../components/Flow";
import { OptionCompare } from "../components/OptionCompare";
import { PickBlock } from "../components/PickBlock";
import { PlanSummary } from "../components/PlanSummary";
import { QuestionCard } from "../components/QuestionCard";
import { RiskList } from "../components/RiskList";
import { SectionCard } from "../components/SectionCard";
import { StatusChip } from "../components/StatusChip";
import { Steps } from "../components/Steps";
import { Timeline } from "../components/Timeline";
import { TreePanel } from "../components/TreePanel";

export interface PropDoc {
  readonly name: string;
  readonly type: string;
  readonly required?: boolean;
}

export interface GalleryEntry {
  /** Grouping bucket shown as a gallery heading. */
  readonly category: string;
  readonly blurb: string;
  readonly usage: string;
  readonly props: ReadonlyArray<PropDoc>;
  /** The live preview — rendered inline in the gallery. */
  readonly sample: () => VNode;
}

/**
 * The living collection: one entry per showcase component. This is the hand-annotated SSOT
 * (blurbs/tags/samples). `planpage capture` reports anything missing; `registry.test.ts` fails
 * on drift, so the gallery is always complete. Keys must equal src/components minus DENY.
 */
export const GALLERY = {
  SectionCard: {
    category: "layout",
    blurb: "A titled section with an optional state chip. Everything nests inside one.",
    usage: '<SectionCard title="Title" chip="chip">…</SectionCard>',
    props: [
      { name: "title", type: "string", required: true },
      { name: "chip", type: "string" },
      { name: "children", type: "ComponentChildren", required: true },
    ],
    sample: () => (
      <SectionCard title="Section" chip="demo">
        Body content.
      </SectionCard>
    ),
  },
  TreePanel: {
    category: "layout",
    blurb: "Side-by-side ASCII directory trees — before │ after.",
    usage: '<TreePanel before="…" after="…" />',
    props: [
      { name: "before", type: "string" },
      { name: "after", type: "string", required: true },
    ],
    sample: () => <TreePanel before={"src/\n  a.ts"} after={"src/\n  a.ts\n  b.ts"} />,
  },
  Accordion: {
    category: "layout",
    blurb: "Progressive disclosure via native <details> — skim, then expand. No JS.",
    usage: "<Accordion items={[{ summary, detail, open }]} />",
    props: [{ name: "items", type: "{ summary; detail; open? }[]", required: true }],
    sample: () => (
      <Accordion
        items={[
          { summary: "Why Preact?", detail: "3kB, JSX→string, no hydration.", open: true },
          { summary: "Why static-first?", detail: "Reading the plan is the bottleneck." },
        ]}
      />
    ),
  },
  Callout: {
    category: "notes",
    blurb: "A tone-coloured admonition — the agent's margin note.",
    usage: '<Callout tone="risk" title="…">…</Callout>',
    props: [
      { name: "tone", type: "note|warn|success|danger|risk|decision|assumption", required: true },
      { name: "title", type: "string" },
      { name: "children", type: "ComponentChildren", required: true },
    ],
    sample: () => (
      <Callout tone="risk" title="Blast radius">
        Touches 12 files across 3 modules.
      </Callout>
    ),
  },
  RiskList: {
    category: "notes",
    blurb: "Severity-tagged risks / tradeoffs, each with an optional mitigation.",
    usage: "<RiskList items={[{ risk, severity, mitigation }]} />",
    props: [
      { name: "items", type: "{ risk; severity: low|med|high; mitigation? }[]", required: true },
    ],
    sample: () => (
      <RiskList
        items={[
          {
            risk: "CDN offline breaks styling",
            severity: "med",
            mitigation: "inline critical CSS",
          },
          { risk: "Unregistered component", severity: "low", mitigation: "gallery-sync test" },
        ]}
      />
    ),
  },
  StatusChip: {
    category: "sequence",
    blurb: "A tiny status pill — todo · doing · done · blocked.",
    usage: '<StatusChip status="doing" />',
    props: [
      { name: "status", type: "todo|doing|done|blocked", required: true },
      { name: "label", type: "string" },
    ],
    sample: () => <StatusChip status="doing" />,
  },
  Steps: {
    category: "sequence",
    blurb: "A numbered checklist — the plan's ordered work, each with a status.",
    usage: "<Steps items={[{ label, status, detail }]} />",
    props: [{ name: "items", type: "{ label; status; detail? }[]", required: true }],
    sample: () => (
      <Steps
        items={[
          { label: "Read the scan", status: "done" },
          { label: "Grill the picks", status: "doing", detail: "pick-the-code gallery" },
          { label: "Write the files", status: "todo" },
        ]}
      />
    ),
  },
  Timeline: {
    category: "sequence",
    blurb: "A vertical progress rail — phases/milestones with status.",
    usage: "<Timeline items={[{ label, status, detail }]} />",
    props: [{ name: "items", type: "{ label; status; detail? }[]", required: true }],
    sample: () => (
      <Timeline
        items={[
          { label: "Scaffold", status: "done" },
          { label: "Wire CLI", status: "doing", detail: "library + capture" },
          { label: "Publish", status: "todo" },
        ]}
      />
    ),
  },
  PickBlock: {
    category: "brainstorm",
    blurb: "A ✓ chosen / ✗ rejected pair — flippable, carries a data-id for post-back.",
    usage: '<PickBlock id="rule.x" rule="Rule" chosen="A" rejected="B" />',
    props: [
      { name: "id", type: "string", required: true },
      { name: "rule", type: "string", required: true },
      { name: "chosen", type: "string", required: true },
      { name: "rejected", type: "string", required: true },
      { name: "why", type: "string" },
      { name: "tag", type: "string" },
    ],
    sample: () => (
      <PickBlock
        id="demo.pick"
        rule="Function form"
        chosen="const f = () => …"
        rejected="function f() { … }"
        why="arrow-const, named export"
        tag="[taste]"
      />
    ),
  },
  OptionCompare: {
    category: "brainstorm",
    blurb: "N-way approach comparison — pros/cons side by side with a verdict.",
    usage: "<OptionCompare options={[{ name, pros, cons, verdict }]} />",
    props: [{ name: "options", type: "{ name; pros[]; cons[]; verdict? }[]", required: true }],
    sample: () => (
      <OptionCompare
        options={[
          {
            name: "Registry + test",
            pros: ["provably complete"],
            cons: ["manual blurbs"],
            verdict: "chosen",
          },
          { name: "Codegen only", pros: ["hands-off"], cons: ["effectful step"], verdict: "maybe" },
        ]}
      />
    ),
  },
  QuestionCard: {
    category: "brainstorm",
    blurb:
      "A quiz-style question with a responsive options grid, recommended badge, and ARIA radiogroup.",
    usage: '<QuestionCard id="q-1" text="Which approach?" options={[…]} />',
    props: [
      { name: "id", type: "string", required: true },
      { name: "text", type: "string", required: true },
      { name: "group", type: "string" },
      {
        name: "options",
        type: "{ id; label; description?; code?; codeLang?; recommended? }[]",
        required: true,
      },
      { name: "expandOther", type: "boolean" },
    ],
    sample: () => (
      <QuestionCard
        id="demo.question"
        text="Which state manager?"
        options={[
          {
            id: "zustand",
            label: "Zustand",
            description: "Minimal, hook-based",
            recommended: true,
          },
          { id: "redux", label: "Redux Toolkit", description: "Battle-tested, more ceremony" },
          { id: "jotai", label: "Jotai", description: "Atomic, bottom-up" },
        ]}
        expandOther
      />
    ),
  },
  PlanSummary: {
    category: "metrics",
    blurb: "A blast-radius header — the at-a-glance metrics of a plan.",
    usage: "<PlanSummary stats={[{ label, value, hint }]} />",
    props: [{ name: "stats", type: "{ label; value; hint? }[]", required: true }],
    sample: () => (
      <PlanSummary
        stats={[
          { label: "Files", value: "17" },
          { label: "Modules", value: "4" },
          { label: "Risk", value: "Low" },
          { label: "Confidence", value: "90%" },
        ]}
      />
    ),
  },
  DiffBlock: {
    category: "code",
    blurb: "Green/red before→after for one file or snippet.",
    usage: '<DiffBlock file="src/x.ts" before="…" after="…" />',
    props: [
      { name: "file", type: "string", required: true },
      { name: "before", type: "string", required: true },
      { name: "after", type: "string", required: true },
    ],
    sample: () => <DiffBlock file="src/x.ts" before="let x = 1" after="const x = 1" />,
  },
  CodeBlock: {
    category: "code",
    blurb: "A highlighted snippet, or the composed canonical-example block.",
    usage: '<CodeBlock label="file.ts" code="…" />',
    props: [
      { name: "label", type: "string" },
      { name: "code", type: "string", required: true },
    ],
    sample: () => <CodeBlock label="hello.ts" code={'const hi = "hello"'} />,
  },
  CodeExplorer: {
    category: "code",
    blurb:
      "An IDE-style multi-file browser — sidebar file tree + editor pane, per-file before/after.",
    usage: "<CodeExplorer files={[{ path, code, before? }]} label='…' />",
    props: [
      { name: "files", type: "{ path; code; before?; lang? }[]", required: true },
      { name: "label", type: "string" },
    ],
    sample: () => (
      <CodeExplorer
        label="Canonical example — adding an endpoint"
        files={[
          {
            path: "src/orders/createOrder.ts",
            code: "export const createOrder = (input: NewOrder) => db.orders.insert(input)",
            before: "export function createOrder(input){ return db.insert(input) }",
          },
          { path: "src/orders/index.ts", code: 'export { createOrder } from "./createOrder"' },
          { path: "src/routes/orders.ts", code: 'router.post("/orders", createOrder)' },
        ]}
      />
    ),
  },
  AnnotatedCode: {
    category: "code",
    blurb: "A code snippet with inline numbered rationale — reasoning tied to the lines.",
    usage: '<AnnotatedCode code="…" annotations={[{ line, note }]} />',
    props: [
      { name: "code", type: "string", required: true },
      { name: "annotations", type: "{ line; note }[]", required: true },
      { name: "label", type: "string" },
    ],
    sample: () => (
      <AnnotatedCode
        label="render.tsx"
        code={"const html = render(node)\nwriteFileSync(out, html)"}
        annotations={[
          { line: 1, note: "pure: data → string" },
          { line: 2, note: "effect at the edge" },
        ]}
      />
    ),
  },
  Flow: {
    category: "diagram",
    blurb: "A Mermaid diagram wrapper — CLI routing, module graphs, decision trees.",
    usage: '<Flow source="flowchart LR; A-->B" />',
    props: [{ name: "source", type: "string (Mermaid)", required: true }],
    sample: () => <Flow source={"flowchart LR\n  A[plan] --> B[ship]"} />,
  },
} satisfies Record<string, GalleryEntry>;

export type GalleryName = keyof typeof GALLERY;

export interface TemplateInfo {
  readonly name: string;
  readonly blurb: string;
  readonly category: string;
}

/** The registered templates, shown as an index (a full-page render would be too heavy to inline). */
export const TEMPLATE_INDEX: ReadonlyArray<TemplateInfo> = [
  {
    name: "plan-brief",
    blurb: "A full agent plan — summary · steps · risks · options · code.",
    category: "plan",
  },
  {
    name: "before-after",
    blurb: "Green/red diff report for deslop passes and refactors.",
    category: "report",
  },
  {
    name: "code-style-plan",
    blurb: "Pick-the-code gallery + canonical example, interactive.",
    category: "gate",
  },
  {
    name: "question-poll",
    blurb: "Quiz-style question cards with progress, auto-advance, and decision post-back.",
    category: "gate",
  },
  {
    name: "library",
    blurb: "This page — the living, auto-captured component gallery.",
    category: "meta",
  },
];
