import { cancel, intro, isCancel, outro, select, text } from "@clack/prompts";
import { TEMPLATES } from "../templates";
import { initCommand } from "./init";
import { libraryCommand } from "./library";
import { newCommand } from "./new";
import { renderCommand } from "./render";
import { serveCommand } from "./serve";

/** The interactive front door: bare `skill-ui` in a TTY. Every branch calls the same command fns. */
export const runMenu = async (): Promise<void> => {
  intro("skill-ui");
  const action = await select({
    message: "What do you want to do?",
    options: [
      { value: "preview", label: "Preview a template", hint: "render sample data → browser" },
      { value: "library", label: "Browse the component library" },
      { value: "serve", label: "Collect a decision", hint: "serve an HTML file, post back" },
      { value: "init", label: "Scaffold into my agent", hint: "add a skill wired to skill-ui" },
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
    initCommand({});
    outro("Scaffolded — your agent can now render plans through skill-ui.");
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
