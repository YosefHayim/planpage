#!/usr/bin/env node
import { createRequire } from "node:module";
import { Command } from "commander";
import { TEMPLATES } from "../templates";
import { captureCommand } from "./capture";
import { initCommand } from "./init";
import { libraryCommand } from "./library";
import {
  type LiveCursorOptions,
  type LiveStartOptions,
  runLiveCommand,
  runLiveCursorCommand,
} from "./live";
import { runMenu } from "./menu";
import { newCommand } from "./new";
import { type PartsCommandOptions, partsCommand } from "./parts";
import { type RecipesCommandOptions, recipesCommand } from "./recipes";
import { renderCommand } from "./render";
import { serveCommand } from "./serve";

const { version } = createRequire(import.meta.url)("../../package.json") as {
  version: string;
};

const program = new Command();
program
  .enablePositionalOptions()
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

const liveCommand = program
  .command("live")
  .description("serve a sketch plan live: comments reach Claude, edits show in the open page")
  .enablePositionalOptions()
  .option("--data <file>", "sketch plan JSON file to serve and watch")
  .option("--decision <file>", "where to write the decision JSON on Approve")
  .option("--port <number>", "loopback port (0 picks a free one)", "0")
  .option("--timeout <seconds>", "exit after this many idle seconds", "3600")
  .option("--open", "open the live plan page in the browser", false)
  .action(async (options: LiveStartOptions) => {
    process.exit(await runLiveCommand(options));
  });

liveCommand
  .command("cursor")
  .description("point the open page at a comment or part while Claude changes the plan")
  .requiredOption("--port <number>", "port printed by planpage live")
  .requiredOption("--token <token>", "token printed by planpage live")
  .requiredOption("--say <words>", "what Claude is changing, a few words")
  .option("--comment <id>", "the comment this change answers")
  .option("--page <number>", "page to point at (defaults to the comment's page)")
  .option("--part <id>", "part to point at (defaults to the comment's part)")
  .action(async (options: LiveCursorOptions) => {
    process.exit(await runLiveCursorCommand(options));
  });

program
  .command("new")
  .description("scaffold a new template folder")
  .argument("<name>", "kebab-case template name")
  .action(newCommand);

program
  .command("init")
  .description(
    "wire planpage into your agents (claude, cursor, codex, windsurf, kiro, cline, copilot, amazonq, roo)",
  )
  .option(
    "--agent <list>",
    "agents to wire up: claude,cursor,codex,windsurf,kiro,cline,copilot,amazonq,roo or all",
    "all",
  )
  .option("--global", "install the Claude skill into ~/.claude/skills")
  .option("--dir <path>", "install the Claude skill into a custom skills directory")
  .option("--force", "overwrite existing on-ramp files")
  .action(initCommand);

program
  .command("library")
  .description("render the auto-captured component gallery")
  .option("--out <file>", "write the HTML to this path")
  .option("--open", "open the rendered gallery in the browser")
  .option("--theme <theme>", "auto | light | dark", "auto")
  .action(libraryCommand);

program
  .command("recipes")
  .description("list the sketch recipes, or print one as JSON (planpage recipes <id>)")
  .argument("[id]", "recipe id to print as JSON")
  .option("--json", "print the list as JSON (also used when there is no TTY)")
  .action((recipeId: string | undefined, options: RecipesCommandOptions) => {
    process.exitCode = recipesCommand(recipeId, options);
  });

program
  .command("parts")
  .description(
    "list the sketch kit parts, or print one part example HTML (planpage parts <className>)",
  )
  .argument("[className]", "part class name to print, e.g. sk-button")
  .option("--json", "print the list as JSON (also used when there is no TTY)")
  .action((className: string | undefined, options: PartsCommandOptions) => {
    process.exitCode = partsCommand(className, options);
  });

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
