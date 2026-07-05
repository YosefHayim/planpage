import type { VNode } from "preact";
import { BeforeAfter, type BeforeAfterProps } from "./BeforeAfter/BeforeAfter";
import { CodeStylePlan, type CodeStylePlanProps } from "./CodeStylePlan/CodeStylePlan";
import { Library } from "./Library/Library";
import { PlanBrief, type PlanBriefProps } from "./PlanBrief/PlanBrief";
import { QuestionPoll, type QuestionPollProps } from "./QuestionPoll/QuestionPoll";

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
      label: "src/templates/BeforeAfter/BeforeAfter.tsx",
      code: "export const BeforeAfter = ({ title, diffs }: BeforeAfterProps) => …",
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
  library: {},
};
