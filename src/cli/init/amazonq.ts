import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { type InitCommandOptions, type ScaffoldResult, fullInstructions } from "./shared";

/** Amazon Q — a rule under `.amazonq/rules`. */
export const scaffoldAmazonQ = (options: InitCommandOptions): ScaffoldResult => {
  const file = join(".", ".amazonq", "rules", "planpage.md");
  if (existsSync(file) && !options.force) {
    return { path: file, status: "skipped" };
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, amazonQRule());
  return { path: file, status: "created" };
};

function amazonQRule(): string {
  return [
    "# planpage — render plans as HTML",
    "",
    "At plan or review steps, render through the `planpage` package to produce interactive HTML. The user edits/annotates, attaches screenshots, then hits Send to Agent.",
    "",
    fullInstructions(),
    "",
  ].join("\n");
}
