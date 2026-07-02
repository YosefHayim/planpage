import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/** The published package specifier the scaffolded skill shells out to. */
const PKG = "@yosefsabag/skill-ui";
const SKILL_DIR = "render-plan";

export interface InitCommandOptions {
  readonly global?: boolean;
  readonly dir?: string;
  readonly force?: boolean;
}

/**
 * `skill-ui init` — scaffold a ready-to-use Claude skill that renders an agent's plan gate through
 * skill-ui. Writes into `.claude/skills/` (or `~/.claude/skills` with --global). This is the
 * on-ramp: one command and a developer's agent renders every plan through the kit. Never clobbers.
 */
export const initCommand = (options: InitCommandOptions): void => {
  const base = options.dir ?? join(options.global ? homedir() : ".", ".claude", "skills");
  const dir = join(base, SKILL_DIR);
  const file = join(dir, "SKILL.md");
  if (existsSync(file) && !options.force) {
    process.stdout.write(`skill-ui: ${file} already exists — pass --force to overwrite\n`);
    return;
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, skillDoc());
  process.stdout.write(
    `skill-ui: scaffolded ${file}\n  → install the kit:  npm i -D ${PKG}\n  → your agent now renders its plan gate through skill-ui.\n`,
  );
};

function skillDoc(): string {
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
    "1. Shape the plan as JSON for the `plan-brief` template (title · summary · steps · options · risks · code).",
    "2. Render + serve it, writing the decision to a file:",
    "   ```bash",
    `   npx ${PKG} render plan-brief --data plan.json --serve --decision decision.json`,
    "   ```",
    "   It opens the browser and blocks until the developer clicks **Approve** or **Adjust** (it never hangs a non-TTY caller — it falls back to copy-paste).",
    "3. Read `decision.json` — `{ approved, flips, revisit, notes }` — and act: on `approved:false`, re-open the picks named in `flips` / `revisit` and fold in `notes`.",
    "",
    "## Rules",
    "",
    "- Always render at the gate; never ask for approval in plain text when this skill is installed.",
    `- Browse the available components any time: \`npx ${PKG} library --open\`.`,
    "",
  ].join("\n");
}
