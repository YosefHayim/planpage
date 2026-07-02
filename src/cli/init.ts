import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

/** The published package specifier every scaffolded on-ramp shells out to. */
const PKG = "planpage";
const SKILL_DIR = "render-plan";
const CODEX_START = "<!-- planpage:start -->";
const CODEX_END = "<!-- planpage:end -->";

type AgentKey = "claude" | "cursor" | "codex";
const ALL_AGENTS: readonly AgentKey[] = ["claude", "cursor", "codex"];

export interface InitCommandOptions {
  readonly agent?: string;
  readonly global?: boolean;
  readonly dir?: string;
  readonly force?: boolean;
}

interface ScaffoldResult {
  readonly path: string;
  readonly status: "created" | "updated" | "skipped";
}

const STATUS_MARK: Record<ScaffoldResult["status"], string> = {
  created: "✓ created",
  updated: "✓ updated",
  skipped: "· skipped",
};

/**
 * `planpage init` — wire planpage into your agents so they render every plan gate through the kit.
 * Writes one small, idempotent on-ramp per agent: a Claude Code skill (`.claude/skills/`), a Cursor
 * rule (`.cursor/rules/`), and a delimited block in `AGENTS.md` for Codex. Never clobbers — an
 * existing on-ramp is skipped unless `--force`. `--agent` narrows the set; default is all three.
 */
export const initCommand = (options: InitCommandOptions): void => {
  const writers: Record<AgentKey, (options: InitCommandOptions) => ScaffoldResult> = {
    claude: scaffoldClaude,
    cursor: scaffoldCursor,
    codex: scaffoldCodex,
  };
  const results = resolveAgents(options.agent).map((agent) => writers[agent](options));
  const summary = results
    .map((result) => {
      const note = result.status === "skipped" ? "  (exists — pass --force to overwrite)" : "";
      return `  ${STATUS_MARK[result.status]}  ${result.path}${note}`;
    })
    .join("\n");
  process.stdout.write(
    [
      `planpage: wired up ${results.length} agent on-ramp${results.length === 1 ? "" : "s"} —`,
      summary,
      "",
      `  → install the kit:  npm i -D ${PKG}`,
      "  → your agents now render their plan gate through planpage.",
      "",
    ].join("\n"),
  );
};

/** Turn the `--agent` flag (`claude,cursor` · `all` · unset) into a concrete, validated set. */
const resolveAgents = (raw: string | undefined): AgentKey[] => {
  if (!raw || raw === "all") {
    return [...ALL_AGENTS];
  }
  const requested = raw.split(",").map((token) => token.trim().toLowerCase());
  const chosen = ALL_AGENTS.filter((agent) => requested.includes(agent));
  if (chosen.length === 0) {
    throw new Error(`--agent must be one of: ${ALL_AGENTS.join(", ")}, all (got "${raw}")`);
  }
  return chosen;
};

/** Claude Code — a `render-plan` skill under `.claude/skills` (or `~/.claude` with --global). */
const scaffoldClaude = (options: InitCommandOptions): ScaffoldResult => {
  const base = options.dir ?? join(options.global ? homedir() : ".", ".claude", "skills");
  const file = join(base, SKILL_DIR, "SKILL.md");
  if (existsSync(file) && !options.force) {
    return { path: file, status: "skipped" };
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, claudeSkill());
  return { path: file, status: "created" };
};

/** Cursor — a project rule under `.cursor/rules`. */
const scaffoldCursor = (options: InitCommandOptions): ScaffoldResult => {
  const file = join(".", ".cursor", "rules", "planpage.mdc");
  if (existsSync(file) && !options.force) {
    return { path: file, status: "skipped" };
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, cursorRule());
  return { path: file, status: "created" };
};

/** Codex — a delimited block in `AGENTS.md`; appended/refreshed, never clobbering existing rules. */
const scaffoldCodex = (options: InitCommandOptions): ScaffoldResult => {
  const file = join(".", "AGENTS.md");
  const block = codexBlock();
  if (!existsSync(file)) {
    writeFileSync(file, `# AGENTS.md\n\n${block}`);
    return { path: file, status: "created" };
  }
  const current = readFileSync(file, "utf8");
  const start = current.indexOf(CODEX_START);
  if (start === -1) {
    const separator = current.endsWith("\n") ? "\n" : "\n\n";
    appendFileSync(file, `${separator}${block}`);
    return { path: file, status: "updated" };
  }
  if (!options.force) {
    return { path: file, status: "skipped" };
  }
  const end = current.indexOf(CODEX_END);
  const tail = end === -1 ? "" : current.slice(end + CODEX_END.length);
  writeFileSync(file, `${current.slice(0, start)}${block}${tail.replace(/^\n+/, "\n")}`);
  return { path: file, status: "updated" };
};

/** The shared render → serve → act instruction, reused across every agent's on-ramp. */
const planSteps = (): string =>
  [
    "1. Shape the plan as JSON for the `plan-brief` template (title · summary · steps · options · risks · code).",
    `2. Render + serve it: \`npx ${PKG} render plan-brief --data plan.json --serve --decision decision.json\` — it opens the browser and blocks until **Approve** / **Adjust**, and never hangs a non-TTY caller (it falls back to copy-paste).`,
    "3. Read `decision.json` — `{ approved, flips, revisit, notes }` — and act: on `approved:false`, re-open the picks named in `flips` / `revisit` and fold in `notes`.",
  ].join("\n");

function claudeSkill(): string {
  return [
    "---",
    "name: render-plan",
    `description: Render this agent's plan / review-gate as a beautiful, self-contained HTML page and collect one approve/adjust decision back — powered by ${PKG}. Use at any plan or approval step.`,
    "---",
    "",
    "# render-plan — show the plan, get a decision",
    "",
    `At a planning or approval step, don't dump the plan as text. Render it through **${PKG}** and let the developer approve or adjust it in the browser.`,
    "",
    "## Steps",
    "",
    planSteps(),
    "",
    "## Rules",
    "",
    "- Always render at the gate; never ask for approval in plain text when this skill is installed.",
    `- Browse the available components any time: \`npx ${PKG} library --open\`.`,
    "",
  ].join("\n");
}

function cursorRule(): string {
  return [
    "---",
    "description: Render plans and review-gates as beautiful HTML via planpage, then collect one approve/adjust decision back. Apply at any plan or approval step.",
    "alwaysApply: false",
    "---",
    "",
    "# Render plans through planpage",
    "",
    "When you present a plan, migration, or review-gate for approval, don't dump it as text. Render it through the `planpage` package and let me approve or adjust it in the browser.",
    "",
    planSteps(),
    "",
    `Browse the available components any time: \`npx ${PKG} library --open\`.`,
    "",
  ].join("\n");
}

function codexBlock(): string {
  return [
    CODEX_START,
    "## Rendering plans (planpage)",
    "",
    "When you present a plan or review-gate for approval, render it through the `planpage` package instead of dumping text:",
    "",
    planSteps(),
    "",
    `Browse the available components any time: \`npx ${PKG} library --open\`.`,
    CODEX_END,
    "",
  ].join("\n");
}
