import { readFileSync, writeFileSync } from "node:fs";
import { type IncomingMessage, createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { openPath } from "../cli/io";

export interface ServeOptions {
  readonly htmlPath: string;
  readonly outPath: string;
  /** Idle timeout before giving up on a decision. Default 600s. */
  readonly timeoutSec?: number;
  /** Preferred port. If busy, automatically picks an available one. Default: auto. */
  readonly port?: number;
}

/**
 * Serve an HTML plan on loopback, open the browser, and block until the page POSTs one
 * feedback batch (or the idle timeout fires). Writes the JSON verbatim and resolves an
 * exit code: 0 = feedback written · 2 = server/IO error · 3 = timeout. Never hangs a caller.
 *
 * Port handling: if a preferred port is given but busy, falls back to an OS-assigned
 * available port automatically — no manual retries, no collision.
 *
 * @returns the process exit code to use
 */
export const serve = ({
  htmlPath,
  outPath,
  timeoutSec = 600,
  port = 0,
}: ServeOptions): Promise<number> => {
  const html = readFileSync(htmlPath);
  return new Promise((resolve) => {
    let settled = false;
    let fellBack = false;

    const finish = (code: number): void => {
      if (settled) return;
      settled = true;
      clearTimeout(idle);
      // Drop keep-alive / browser tabs so the process can exit (never-hang).
      if (typeof server.closeAllConnections === "function") {
        server.closeAllConnections();
      }
      server.close();
      // Resolve immediately — do not wait for close() (open sockets can stall it).
      resolve(code);
    };

    const server = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/decision") {
        collectDecision(
          req,
          () => {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(
              "<body style='font:16px system-ui;padding:3rem'>Feedback received — return to your terminal.</body>",
            );
            finish(0);
          },
          outPath,
        );
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && port !== 0 && !fellBack) {
        // Preferred port busy — let OS pick any available one
        fellBack = true;
        server.listen(0, "127.0.0.1");
        return;
      }
      if (!settled) {
        process.stderr.write(`planpage: server error — ${err.message}\n`);
        finish(2);
      }
    });

    server.listen(port, "127.0.0.1", () => {
      const address = server.address() as AddressInfo;
      const url = `http://127.0.0.1:${address.port}/`;
      if (port !== 0 && address.port !== port) {
        process.stdout.write(`planpage: port ${port} busy, using ${address.port} instead\n`);
      }
      process.stdout.write(`planpage: serving ${url}\n`);
      process.stdout.write(
        "planpage: waiting for feedback — edit/annotate in the browser, then Send to Agent…\n",
      );
      // openPath dedupes per process so re-bind / retries do not spawn extra tabs
      openPath(url);
    });

    const idle = setTimeout(() => {
      process.stderr.write("planpage: timed out waiting for feedback\n");
      finish(3);
    }, timeoutSec * 1000);
    idle.unref();
  });
};

/** Loose POST body shape used only for the stdout count summary (write stays verbatim). */
export type FeedbackSummaryBody = {
  readonly notes?: string;
  readonly edits?: unknown;
  readonly annotations?: unknown;
  readonly flips?: unknown;
  readonly revisit?: unknown;
  readonly screenshots?: unknown;
  readonly diagrams?: unknown;
  readonly whiteboards?: unknown;
};

const countArray = (value: unknown): number => (Array.isArray(value) ? value.length : 0);

/**
 * Best-effort lines for the post-back stdout summary after a successful write.
 * Covers the full feedback queue contract: edits · annotations · screenshots · diagrams · whiteboards · flips · revisit.
 */
export const feedbackSummaryLines = (parsed: FeedbackSummaryBody): readonly string[] => {
  const edits = countArray(parsed.edits);
  const annos = countArray(parsed.annotations);
  const flips = countArray(parsed.flips);
  const revisit = countArray(parsed.revisit);
  const shots = countArray(parsed.screenshots);
  const diags = countArray(parsed.diagrams);
  const wbs = countArray(parsed.whiteboards);
  const lines: string[] = [
    `planpage: ${edits} edit(s), ${annos} annotation(s), ${shots} screenshot(s), ${diags} diagram(s), ${wbs} whiteboard(s), ${flips} flip(s), ${revisit} revisit(s)`,
  ];
  const notes = typeof parsed.notes === "string" ? parsed.notes.trim() : "";
  if (notes) {
    lines.push(`planpage: notes — ${notes}`);
  }
  if (shots > 0) {
    lines.push(
      "planpage: screenshots are data URLs in the JSON — write each dataUrl to a file if you need to inspect them",
    );
  }
  if (wbs > 0) {
    lines.push(
      "planpage: whiteboards include pngDataUrl fields — write each to a PNG file if you need to inspect them",
    );
  }
  return lines;
};

function collectDecision(req: IncomingMessage, onDone: () => void, outPath: string): void {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    writeFileSync(outPath, body || "{}");
    process.stdout.write(`planpage: feedback written to ${outPath}\n`);
    try {
      const parsed = JSON.parse(body || "{}") as FeedbackSummaryBody;
      for (const line of feedbackSummaryLines(parsed)) {
        process.stdout.write(`${line}\n`);
      }
    } catch {
      /* body already on disk; summary is best-effort */
    }
    onDone();
  });
}
