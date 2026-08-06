import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Theme } from "../components/Shell";
import { highlight } from "../highlight/highlight";
import { render } from "../render/render";
import { Library } from "../templates/Library/Library";
import { openPath } from "./io";

export interface LibraryCommandOptions {
  readonly out?: string;
  readonly open?: boolean;
  readonly theme?: Theme;
}

/** `planpage library` — render the auto-captured component gallery to a self-contained page. */
export const libraryCommand = async (options: LibraryCommandOptions): Promise<void> => {
  const html = await highlight(
    render(<Library />, {
      title: "planpage — component gallery",
      subtitle: "the living, auto-captured collection",
      theme: options.theme,
      filterable: true,
      explorable: true,
      // Slideshow arrows/dots need the carousel island (marquee is pure CSS).
      carousel: true,
      // Diagram board (edit source · look · re-render · drag nodes).
      diagramable: true,
      // Freehand whiteboard (rough.js pen · queue PNG for agent).
      sketchable: true,
    }),
  );
  const out = options.out ?? join(tmpdir(), "planpage-gallery.html");
  writeFileSync(out, html);
  process.stdout.write(`planpage: wrote ${out}\n`);
  if (options.open) openPath(out);
};
