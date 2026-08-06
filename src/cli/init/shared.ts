import { homedir } from "node:os";
import { join } from "node:path";

/** The published package specifier every scaffolded on-ramp shells out to. */
export const PKG = "planpage";
export const SKILL_DIR = "render-plan";
export const CODEX_START = "<!-- planpage:start -->";
export const CODEX_END = "<!-- planpage:end -->";

export type AgentKey =
  | "claude"
  | "cursor"
  | "codex"
  | "windsurf"
  | "kiro"
  | "cline"
  | "copilot"
  | "amazonq"
  | "roo";

export const ALL_AGENTS: readonly AgentKey[] = [
  "claude",
  "cursor",
  "codex",
  "windsurf",
  "kiro",
  "cline",
  "copilot",
  "amazonq",
  "roo",
];

export interface InitCommandOptions {
  readonly agent?: string;
  readonly global?: boolean;
  readonly dir?: string;
  readonly force?: boolean;
}

export interface ScaffoldResult {
  readonly path: string;
  readonly status: "created" | "updated" | "skipped";
}

export const STATUS_MARK: Record<ScaffoldResult["status"], string> = {
  created: "✓ created",
  updated: "✓ updated",
  skipped: "· skipped",
};

/** The core instruction block — what to do when presenting a plan. */
export const planSteps = (): string =>
  [
    "### Plan review (planpage — queue-then-send, not Approve/Adjust)",
    "",
    "1. Shape the plan as JSON for the `plan-brief` template (title · summary · steps · options · risks · code).",
    `2. Render + serve: \`npx ${PKG} render plan-brief --data plan.json --serve --decision decision.json\` — browser opens; the user **annotates**, **edits in place**, and/or **attaches screenshots** in the fixed sidebar. Nothing is submitted until they click **Send to Agent**. Never hangs a non-TTY caller (clipboard fallback).`,
    "3. Read `decision.json` — `{ approved, flips, revisit, notes, edits, annotations, screenshots }`.",
    "4. Act on the batch:",
    "   - `edits[]` — apply each original→edited change to the plan/code",
    "   - `annotations[]` — fix what each note says is wrong (use `label` / `selectedText`)",
    "   - `screenshots[]` — each has `name`, `mime`, `dataUrl` (data URL). Write to a temp file if you need to inspect, then fix the UI/code they show",
    "   - `flips` / `revisit` — re-open those PickBlock ids",
    "   - `notes` — free-text message from the sidebar composer",
    "   - `approved:true` only means the queue was empty (rare)",
    "5. If more review is needed, re-render the revised plan and serve again.",
  ].join("\n");

/** The question-poll instruction block — for interview/grill flows. */
export const pollSteps = (): string =>
  [
    "",
    "### Interactive question flows (question-poll)",
    "",
    "When interviewing the user about preferences (code style, architecture, config):",
    "",
    "1. Shape questions as JSON: `{ title, layout?, questions: [{ id, text, group?, diagram?, options: [{ id, label, description?, code?, recommended? }] }] }`",
    `2. Render: \`npx ${PKG} render question-poll --data questions.json --serve --decision decision.json\``,
    "3. Read the decision — each answer includes `questionId`, `picked`, `questionText`, `chosenText`.",
    "",
    "Layout options: `stack` (default), `grid-2`, `grid-3`, `grid-4`, `grid-5`.",
    "Add `diagram` (Mermaid source) to any question for visual context.",
  ].join("\n");

/** The full instruction body used in all on-ramps. */
export const fullInstructions = (): string =>
  [planSteps(), pollSteps(), "", `Browse all components: \`npx ${PKG} library --open\`.`].join(
    "\n",
  );

/** Resolve Claude skill base dir for --global / --dir / default. */
export const claudeSkillsBase = (options: InitCommandOptions): string =>
  options.dir ?? join(options.global ? homedir() : ".", ".claude", "skills");
