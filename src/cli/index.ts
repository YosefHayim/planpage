#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { TEMPLATES } from "../templates";
import { captureCommand } from "./capture";
import { initCommand } from "./init";
import { libraryCommand } from "./library";
import { runMenu } from "./menu";
import { newCommand } from "./new";
import { renderCommand } from "./render";
import { serveCommand } from "./serve";

const { version } = createRequire(import.meta.url)("../../package.json") as {
  version: string;
};

const program = new Command();
program
  .name("planpage")
  .description("Render a skill's plan, gate, or report as beautiful, self-contained local HTML.")
  .version(version);

program
  .command("render")
  .description("render a template to HTML (data in via --data or piped stdin)")
  .argument("<template>", `template to render (${Object.keys(TEMPLATES).join(" | ")})`)
  .option("--data <file>", "JSON data file; or pipe JSON via stdin")
  .option("--sample", "use the template's built-in sample data")
  .option("--out <file>", "write the HTML to this path")
  .option("--open", "open the rendered HTML in the browser")
  .option("--serve", "serve the HTML and collect one decision (post-back)")
  .option("--decision <file>", "where to write the decision JSON (with --serve)")
  .option("--theme <theme>", "auto | light | dark", "auto")
  .action(renderCommand);

program
  .command("serve")
  .description("serve an existing HTML file and collect one decision")
  .argument("<html>", "path to an HTML file to serve")
  .argument("<out>", "path to write the decision JSON")
  .option("--timeout <sec>", "idle timeout in seconds", "600")
  .action(serveCommand);

program
  .command("new")
  .description("scaffold a new template folder")
  .argument("<name>", "kebab-case template name")
  .action(newCommand);

program
  .command("init")
  .description("scaffold a ready-to-use Claude skill wired to planpage")
  .option("--global", "install into ~/.claude/skills")
  .option("--dir <path>", "install into a custom skills directory")
  .option("--force", "overwrite an existing skill")
  .action(initCommand);

program
  .command("library")
  .description("render the auto-captured component gallery")
  .option("--out <file>", "write the HTML to this path")
  .option("--open", "open the rendered gallery in the browser")
  .option("--theme <theme>", "auto | light | dark", "auto")
  .action(libraryCommand);

program
  .command("capture")
  .description("report components missing from the gallery registry (dev)")
  .option("--check", "exit non-zero if the registry has drifted (for CI)")
  .action(captureCommand);

async function main(): Promise<void> {
  const hasArgs = process.argv.length > 2;
  if (!hasArgs && process.stdout.isTTY) {
    await runMenu();
    return;
  }
  await program.parseAsync(process.argv);
}

main().catch((error: unknown) => {
  process.stderr.write(`planpage: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
