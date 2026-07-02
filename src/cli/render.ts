import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Theme } from "../components/Shell";
import { render } from "../render/render";
import { serve } from "../server/serve";
import { SAMPLES, TEMPLATES, type TemplateName } from "../templates";
import { openPath, writeTemp } from "./io";

export interface RenderCommandOptions {
  readonly data?: string;
  readonly sample?: boolean;
  readonly out?: string;
  readonly open?: boolean;
  readonly serve?: boolean;
  readonly decision?: string;
  readonly theme?: Theme;
}

/** `skill-ui render <template>` — data → HTML, then write / open / serve per the flags. */
export const renderCommand = async (
  template: string,
  options: RenderCommandOptions,
): Promise<void> => {
  const factory = TEMPLATES[template as TemplateName];
  if (!factory) {
    throw new Error(`unknown template "${template}". known: ${Object.keys(TEMPLATES).join(", ")}`);
  }
  const data = options.sample ? SAMPLES[template as TemplateName] : await readData(options.data);
  const html = render(factory(data), {
    theme: options.theme,
    interactive: Boolean(options.serve),
    filterable: template === "library",
  });

  if (options.serve) {
    const outPath = options.decision ?? join(tmpdir(), "skill-ui-decision.json");
    const code = await serve({ htmlPath: writeTemp(html), outPath });
    process.exit(code);
  }
  if (options.out) {
    writeFileSync(options.out, html);
    process.stdout.write(`skill-ui: wrote ${options.out}\n`);
    if (options.open) openPath(options.out);
    return;
  }
  if (options.open) {
    openPath(writeTemp(html));
    return;
  }
  process.stdout.write(html);
};

async function readData(file?: string): Promise<unknown> {
  if (file) return JSON.parse(readFileSync(file, "utf8"));
  if (!process.stdin.isTTY) {
    const text = await readStdin();
    if (text.trim()) return JSON.parse(text);
  }
  return {};
}

function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let text = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      text += chunk;
    });
    process.stdin.on("end", () => resolve(text));
  });
}
