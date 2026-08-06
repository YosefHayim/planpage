import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  type InitCommandOptions,
  PKG,
  SKILL_DIR,
  type ScaffoldResult,
  claudeSkillsBase,
  fullInstructions,
} from "./shared";

/** Claude Code — a `render-plan` skill under `.claude/skills` (or `~/.claude` with --global). */
export const scaffoldClaude = (options: InitCommandOptions): ScaffoldResult => {
  const base = claudeSkillsBase(options);
  const file = join(base, SKILL_DIR, "SKILL.md");
  if (existsSync(file) && !options.force) {
    return { path: file, status: "skipped" };
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, claudeSkill());
  return { path: file, status: "created" };
};

function claudeSkill(): string {
  return [
    "---",
    "name: render-plan",
    `description: Render this agent's plan / review-gate as interactive HTML via ${PKG}. User edits, annotates, attaches screenshots in a sidebar, then Send to Agent — one feedback batch returns. Use at any plan or review step.`,
    "---",
    "",
    "# render-plan — show the plan, collect feedback",
    "",
    `At a planning or review step, don't dump the plan as text. Render it through **${PKG}**. The developer edits/annotates the page, attaches screenshots, stages items in the sidebar, then hits **Send to Agent** — you receive one JSON feedback batch in the terminal.`,
    "",
    "## Steps",
    "",
    fullInstructions(),
    "",
    "## Rules",
    "",
    "- Always render at the gate; never ask for long-plan approval in plain text when this skill is installed.",
    "- There is **no Approve/Adjust button**. Wait for **Send to Agent** (edits + annotations + screenshots + notes).",
    "- Apply `edits`, fix `annotations`, inspect `screenshots` (data URLs), re-open `flips`/`revisit`, fold in `notes`.",
    `- Browse the available components any time: \`npx ${PKG} library --open\`.`,
    "",
  ].join("\n");
}
