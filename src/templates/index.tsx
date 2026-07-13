import type { VNode } from "preact";
import { AuditReport, type AuditReportProps } from "./AuditReport/AuditReport";
import { BeforeAfter, type BeforeAfterProps } from "./BeforeAfter/BeforeAfter";
import { CodeStylePlan, type CodeStylePlanProps } from "./CodeStylePlan/CodeStylePlan";
import { Flashcards, type FlashcardsProps } from "./Flashcards/Flashcards";
import { Library } from "./Library/Library";
import { PlanBrief, type PlanBriefProps } from "./PlanBrief/PlanBrief";
import { QuestionPoll, type QuestionPollProps } from "./QuestionPoll/QuestionPoll";
import { Quiz, type QuizProps } from "./Quiz/Quiz";

/**
 * Registry mapping a kebab-case template name → a factory that builds its VNode from raw data.
 * The `as Props` spreads are the sanctioned JSON→props boundary assertion; each template then
 * asserts its own required fields at runtime.
 */
export const TEMPLATES = {
  "before-after": (data: unknown): VNode => <BeforeAfter {...(data as BeforeAfterProps)} />,
  "code-style-plan": (data: unknown): VNode => <CodeStylePlan {...(data as CodeStylePlanProps)} />,
  "plan-brief": (data: unknown): VNode => <PlanBrief {...(data as PlanBriefProps)} />,
  "question-poll": (data: unknown): VNode => <QuestionPoll {...(data as QuestionPollProps)} />,
  quiz: (data: unknown): VNode => <Quiz {...(data as QuizProps)} />,
  flashcards: (data: unknown): VNode => <Flashcards {...(data as FlashcardsProps)} />,
  "audit-report": (data: unknown): VNode => <AuditReport {...(data as AuditReportProps)} />,
  library: (): VNode => <Library />,
} satisfies Record<string, (data: unknown) => VNode>;

export type TemplateName = keyof typeof TEMPLATES;

/** Built-in sample data per template — powers the menu preview and `render --sample`. */
export const SAMPLES: Record<TemplateName, unknown> = {
  "before-after": {
    title: "Deslop pass",
    diffs: [
      { file: "src/render/render.tsx", before: "let out = ''", after: "const out = render(node)" },
    ],
  },
  "code-style-plan": {
    title: "planpage — code style",
    picks: [
      {
        id: "rule.component-form",
        rule: "Component form",
        chosen: "const C = () => <div/>",
        rejected: "function C(){ return <div/> }",
        why: "arrow-const, named export",
        tag: "[taste]",
      },
    ],
    canonical: {
      label: "Canonical example — adding a component",
      files: [
        {
          path: "src/components/Callout.tsx",
          code: "export interface CalloutProps {\n  readonly tone: CalloutTone;\n  readonly children: ComponentChildren;\n}\n\nexport const Callout = ({ tone, children }: CalloutProps) => (\n  <div class={toneClass(tone)}>{children}</div>\n);",
          before:
            "export function Callout(props) {\n  return <div className={getToneClass(props.tone)}>{props.children}</div>;\n}",
        },
        {
          path: "src/index.ts",
          code: 'export { Callout, type CalloutProps } from "./components/Callout";',
        },
        {
          path: "src/gallery/registry.tsx",
          code: 'Callout: {\n  category: "notes",\n  blurb: "A tone-coloured admonition.",\n  sample: () => <Callout tone="risk">Touches 12 files.</Callout>,\n},',
        },
      ],
    },
    cliFlow: "flowchart LR\n  A[planpage] -->|TTY| M[menu]\n  A -->|flags| F[render / serve / new]",
  },
  "plan-brief": {
    title: "Add dark-mode toggle",
    summary: [
      { label: "Files", value: "6" },
      { label: "Risk", value: "low" },
      { label: "Confidence", value: "85%" },
    ],
    notes: [
      {
        tone: "decision",
        title: "Approach",
        body: "Class-based dark mode, prepainted to avoid a flash.",
      },
    ],
    steps: [
      { label: "Add the toggle button", status: "done" },
      {
        label: "Prepaint the theme",
        status: "doing",
        detail: "read the OS preference before paint",
      },
      { label: "Persist the choice", status: "todo" },
    ],
    options: [
      {
        name: "Class strategy",
        pros: ["no flash", "manual override"],
        cons: ["needs prepaint"],
        verdict: "chosen",
      },
      {
        name: "Media-query only",
        pros: ["zero JS"],
        cons: ["no manual toggle"],
        verdict: "rejected",
      },
    ],
    risks: [
      { risk: "Flash of unstyled content", severity: "low", mitigation: "prepaint in <head>" },
    ],
    code: {
      label: "theme.ts",
      code: "const dark = prefersDark()\ndocument.documentElement.classList.toggle('dark', dark)",
      annotations: [
        { line: 1, note: "read the OS preference" },
        { line: 2, note: "apply before first paint" },
      ],
    },
    details: [
      {
        summary: "Why class-based over media-query?",
        detail: "It lets a manual toggle override the OS setting.",
      },
    ],
  },
  "question-poll": {
    title: "Architecture decisions",
    questions: [
      {
        id: "q-state-mgmt",
        text: "Which state management approach should we use?",
        group: "Frontend",
        options: [
          {
            id: "zustand",
            label: "Zustand",
            description: "Minimal, hook-based, no boilerplate",
            recommended: true,
          },
          {
            id: "redux",
            label: "Redux Toolkit",
            description: "Battle-tested, great devtools, more ceremony",
          },
          {
            id: "jotai",
            label: "Jotai",
            description: "Atomic, bottom-up, great for derived state",
          },
        ],
        expandOther: true,
      },
      {
        id: "q-styling",
        text: "Which styling solution should we adopt?",
        group: "Frontend",
        options: [
          {
            id: "tailwind",
            label: "Tailwind CSS",
            description: "Utility-first, tree-shakes well, fast iteration",
            recommended: true,
          },
          {
            id: "css-modules",
            label: "CSS Modules",
            description: "Scoped by default, zero runtime, standard CSS",
          },
          {
            id: "vanilla-extract",
            label: "Vanilla Extract",
            description: "Type-safe, zero runtime, build-time CSS-in-TS",
          },
        ],
      },
      {
        id: "q-api-layer",
        text: "How should we structure the API layer?",
        group: "Backend",
        options: [
          {
            id: "trpc",
            label: "tRPC",
            description: "End-to-end type safety, no codegen",
            code: "const router = t.router({ getUser: t.procedure.query(…) })",
            codeLang: "typescript",
            recommended: true,
          },
          {
            id: "rest",
            label: "REST + OpenAPI",
            description: "Universal, cacheable, well-understood",
          },
          {
            id: "graphql",
            label: "GraphQL",
            description: "Flexible queries, schema-first, higher complexity",
          },
        ],
        expandOther: true,
      },
    ],
  },
  quiz: {
    title: "Coach check — planpage architecture",
    intro: "Answer to reveal the why. One option is correct; the rest are common traps.",
    questions: [
      {
        id: "q-island",
        group: "Rendering",
        question: "How does a template add interactivity?",
        explanation:
          "Interactivity is a constant script from clientScript.ts, injected by the Shell and gated by a boolean flag — never a <script> inside a template.",
        options: [
          { id: "shell-flag", label: "A constant island gated by a Shell flag", correct: true },
          { id: "inline", label: "An inline <script> in the template" },
          { id: "hydrate", label: "Hydrate the Preact tree on the client" },
          { id: "cdn", label: "Pull a framework from a CDN" },
        ],
      },
      {
        id: "q-highlight",
        group: "Rendering",
        question: "Why do code components emit a data-hl marker instead of colouring inline?",
        explanation:
          "render() must stay pure and synchronous; Shiki highlighting is async, so it runs as an edge pass that swaps the marker — and unhighlighted output still degrades to readable code.",
        options: [
          { id: "pure", label: "To keep render() pure and synchronous", correct: true },
          { id: "smaller", label: "To make the HTML smaller" },
          { id: "seo", label: "For SEO" },
        ],
      },
      {
        id: "q-gallery",
        group: "Conventions",
        question: "What guarantees the gallery is never missing a component?",
        explanation:
          "Every src/components/*.tsx must have a GALLERY entry; registry.test.ts fails on drift, and `planpage capture` prints a stub for anything missing.",
        options: [
          { id: "drift", label: "A gallery-sync drift test over src/components", correct: true },
          { id: "manual", label: "Manual review in PRs" },
          { id: "codegen", label: "A codegen step at build time" },
          { id: "none", label: "Nothing — it can drift" },
        ],
      },
    ],
  },
  flashcards: {
    title: "planpage — core vocabulary",
    intro: "Tap a card to flip. The learn-side companion to the quiz.",
    cards: [
      {
        label: "render",
        front: "Island",
        back: "A constant client script the Shell injects, gated by a boolean flag — the only interactivity in a page.",
        code: "pollable ? <script … /> : null",
      },
      {
        label: "render",
        front: "data-hl marker",
        back: "The placeholder a code component emits so render() stays sync; the async highlight() pass swaps it for Shiki spans.",
        code: 'codeMark(code, "ts")',
      },
      {
        label: "gallery",
        front: "Capture drift test",
        back: "registry.test.ts compares src/components to the GALLERY registry and fails if any component is unregistered.",
      },
      {
        label: "cli",
        front: "Post-back",
        back: "The opt-in loop where a served page returns one Decision to the agent (POST /decision, clipboard fallback).",
      },
      {
        label: "arch",
        front: "Pure render, effects at the edges",
        back: "components / templates / render are pure data→string; all I/O lives in server/ and cli/.",
      },
      {
        label: "arch",
        front: "Static floor",
        back: "A no-JS render is the baseline; interactivity is opt-in islands layered on top.",
      },
    ],
  },
  "audit-report": {
    title: "web-best-practices — example.com",
    overall: 74,
    dimensions: [
      { label: "Semantic HTML", score: 88 },
      { label: "Accessibility", score: 92, note: "1 minor contrast issue" },
      { label: "Performance", score: 71, note: "LCP 2.4s" },
      { label: "Security headers", score: 35, note: "no CSP / HSTS" },
      { label: "SEO", score: 90 },
      { label: "AI-readability", score: 20, note: "no llms.txt" },
    ],
    command: [
      { comment: "run the zero-dep audit scanner" },
      { command: "node scripts/auditSite.mjs https://example.com" },
      { output: "7 dimensions scored · 2 gaps found" },
    ],
    notes: [
      {
        tone: "risk",
        title: "Security headers",
        body: "No Content-Security-Policy or HSTS — add a _headers file.",
      },
      {
        tone: "note",
        title: "AI-readability",
        body: "Add /llms.txt and schema.org JSON-LD so agents can parse the site.",
      },
    ],
    risks: [
      {
        risk: "Missing CSP allows injected script execution",
        severity: "high",
        mitigation: "ship a strict Content-Security-Policy",
      },
      {
        risk: "No llms.txt — agents can't discover key pages",
        severity: "low",
        mitigation: "publish /llms.txt",
      },
    ],
  },
  library: {},
};
