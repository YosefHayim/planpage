import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Paths/URLs already opened in this process — prevents repeat `open` spawning extra tabs. */
const opened = new Set<string>();

/** Write HTML to a unique temp file (keyed by pid) and return its path. */
export const writeTemp = (html: string): string => {
  const path = join(tmpdir(), `planpage-${process.pid}.html`);
  writeFileSync(path, html);
  return path;
};

/**
 * Open a file or URL in the OS default handler, detached — never blocks or throws into the caller.
 * Same path/URL opens at most once per process (avoids a stack of browser tabs on re-serve).
 * Set `PLANPAGE_NO_OPEN=1` to skip entirely.
 */
export const openPath = (path: string): void => {
  if (process.env.PLANPAGE_NO_OPEN === "1" || process.env.PLANPAGE_NO_OPEN === "true") return;
  const key = path.trim();
  if (!key || opened.has(key)) return;
  opened.add(key);
  const cmd =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    spawn(cmd, [path], {
      stdio: "ignore",
      detached: true,
      shell: process.platform === "win32",
    }).unref();
  } catch {
    process.stdout.write(`planpage: open manually → ${path}\n`);
  }
};
