import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type InitCommandOptions, type ScaffoldResult, fullInstructions } from "./shared";

/** Cursor — a project rule under `.cursor/rules`. */
export const scaffoldCursor = (options: InitCommandOptions): ScaffoldResult => {
  const file = join(".", ".cursor", "rules", "planpage.mdc");
  if (existsSync(file) && !options.force) {
    return { path: file, status: "skipped" };
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, cursorRule());
  return { path: file, status: "created" };
};

function cursorRule(): string {
  return [
    "---",
    "description: Render plans and review-gates as interactive HTML via planpage. User edits/annotates/screenshots in a sidebar, then Send to Agent returns one feedback batch. Apply at any plan or review step.",
    "alwaysApply: false",
    "---",
    "",
    "# Render plans through planpage",
    "",
    "When you present a plan, migration, or review-gate, don't dump it as text. Render it through the `planpage` package. I will edit/annotate the page, attach screenshots, stage feedback in the sidebar, then hit **Send to Agent** — you get one JSON batch (not Approve/Adjust).",
    "",
    fullInstructions(),
    "",
  ].join("\n");
}
