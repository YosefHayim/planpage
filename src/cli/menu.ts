import { cancel, intro, isCancel, multiselect, outro, select, text } from "@clack/prompts";
import { TEMPLATES } from "../templates";
import { initCommand } from "./init";
import { libraryCommand } from "./library";
import { newCommand } from "./new";
import { renderCommand } from "./render";
import { serveCommand } from "./serve";

/** The interactive front door: bare `planpage` in a TTY. Every branch calls the same command fns. */
export const runMenu = async (): Promise<void> => {
  intro("planpage");
  const action = await select({
    message: "What do you want to do?",
    options: [
      { value: "preview", label: "Preview a template", hint: "render sample data → browser" },
      { value: "library", label: "Browse the component library" },
      { value: "serve", label: "Collect a decision", hint: "serve an HTML file, post back" },
      { value: "init", label: "Scaffold into my agent", hint: "wire in claude / cursor / codex" },
      { value: "new", label: "Scaffold a new template" },
    ],
  });
  if (isCancel(action)) {
    cancel("Nothing selected.");
    return;
  }

  if (action === "preview") {
    const name = await select({
      message: "Which template?",
      options: Object.keys(TEMPLATES).map((template) => ({ value: template, label: template })),
    });
    if (isCancel(name)) {
      cancel("Nothing selected.");
      return;
    }
    await renderCommand(name, { sample: true, open: true });
    outro(`Opening ${name} …`);
    return;
  }

  if (action === "library") {
    libraryCommand({ open: true });
    outro("Opening the component gallery …");
    return;
  }

  if (action === "serve") {
    const html = await text({ message: "Path to the HTML file to serve" });
    if (isCancel(html)) {
      cancel("Cancelled.");
      return;
    }
    const out = await text({
      message: "Where to write the decision JSON",
      initialValue: "decision.json",
    });
    if (isCancel(out)) {
      cancel("Cancelled.");
      return;
    }
    await serveCommand(html, out, { timeout: "600" });
    return;
  }

  if (action === "init") {
    const agents = await multiselect({
      message: "Which agents should render plans through planpage?",
      options: [
        { value: "claude", label: "Claude Code", hint: ".claude/skills" },
        { value: "cursor", label: "Cursor", hint: ".cursor/rules" },
        { value: "codex", label: "Codex", hint: "AGENTS.md" },
      ],
      initialValues: ["claude", "cursor", "codex"],
    });
    if (isCancel(agents) || agents.length === 0) {
      cancel("No agent selected.");
      return;
    }
    const scope = agents.includes("claude")
      ? await select({
          message: "Where should the Claude skill install?",
          options: [
            {
              value: "project",
              label: "This project only",
              hint: "./.claude/skills — this repo only",
            },
            { value: "global", label: "Globally", hint: "~/.claude/skills — all your projects" },
          ],
          initialValue: "project",
        })
      : "project";
    if (isCancel(scope)) {
      cancel("Cancelled.");
      return;
    }
    initCommand({ agent: agents.join(","), global: scope === "global" });
    outro("Scaffolded — your agents can now render plans through planpage.");
    return;
  }

  const name = await text({
    message: "New template name (kebab-case)",
    placeholder: "my-template",
  });
  if (isCancel(name)) {
    cancel("Cancelled.");
    return;
  }
  newCommand(name);
  outro(`Scaffolded src/templates/${name} …`);
};
