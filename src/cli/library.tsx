import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Theme } from "../components/Shell";
import { render } from "../render/render";
import { Library } from "../templates/Library/Library";
import { openPath } from "./io";

export interface LibraryCommandOptions {
  readonly out?: string;
  readonly open?: boolean;
  readonly theme?: Theme;
}

/** `skill-ui library` — render the auto-captured component gallery to a self-contained page. */
export const libraryCommand = (options: LibraryCommandOptions): void => {
  const html = render(<Library />, {
    title: "skill-ui — component gallery",
    subtitle: "the living, auto-captured collection",
    theme: options.theme,
    filterable: true,
  });
  const out = options.out ?? join(tmpdir(), "skill-ui-gallery.html");
  writeFileSync(out, html);
  process.stdout.write(`skill-ui: wrote ${out}\n`);
  if (options.open) openPath(out);
};
