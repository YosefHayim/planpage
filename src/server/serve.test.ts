import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { EMPTY_DECISION } from "../contracts/decision";
import { feedbackSummaryLines, serve } from "./serve";

describe("feedbackSummaryLines", () => {
  it("counts diagrams and whiteboards alongside the rest of the queue contract", () => {
    const lines = feedbackSummaryLines({
      notes: "  fix the header  ",
      edits: [{}],
      annotations: [],
      screenshots: [{}, {}],
      diagrams: [{}],
      whiteboards: [{}, {}],
      flips: ["a"],
      revisit: ["b", "c"],
    });
    expect(lines[0]).toBe(
      "planpage: 1 edit(s), 0 annotation(s), 2 screenshot(s), 1 diagram(s), 2 whiteboard(s), 1 flip(s), 2 revisit(s)",
    );
    expect(lines).toContain("planpage: notes — fix the header");
    expect(lines.some((l) => l.includes("screenshots are data URLs"))).toBe(true);
    expect(lines.some((l) => l.includes("whiteboards include pngDataUrl"))).toBe(true);
  });

  it("treats missing queue arrays as zero (partial / empty body)", () => {
    const lines = feedbackSummaryLines({});
    expect(lines).toEqual([
      "planpage: 0 edit(s), 0 annotation(s), 0 screenshot(s), 0 diagram(s), 0 whiteboard(s), 0 flip(s), 0 revisit(s)",
    ]);
  });

  it("EMPTY_DECISION summarizes as an empty queue", () => {
    const lines = feedbackSummaryLines(EMPTY_DECISION);
    expect(lines[0]).toContain("0 diagram(s), 0 whiteboard(s)");
    expect(lines).toHaveLength(1);
  });
});

describe("serve — dynamic port", () => {
  const blockers: ReturnType<typeof createServer>[] = [];

  afterEach(() => {
    for (const s of blockers) s.close();
    blockers.length = 0;
  });

  /** Occupy a port so serve has to pick another one. */
  const blockPort = (port: number): Promise<number> =>
    new Promise((resolve) => {
      const blocker = createServer();
      blocker.listen(port, "127.0.0.1", () => {
        blockers.push(blocker);
        resolve(port);
      });
    });

  it("auto-picks an available port when preferred is busy", async () => {
    const preferredPort = 19876;
    await blockPort(preferredPort);

    const tmp = mkdtempSync(join(tmpdir(), "planpage-serve-"));
    const htmlPath = join(tmp, "test.html");
    const outPath = join(tmp, "decision.json");
    writeFileSync(htmlPath, "<html><body>test</body></html>");

    // Start serve — preferred port is blocked, so it should auto-pick another
    const result = serve({ htmlPath, outPath, port: preferredPort, timeoutSec: 2 });

    // Wait for bind then let it timeout — exit 3 means it bound successfully and waited
    const exitCode = await result;
    expect(exitCode).toBe(3);
  }, 10_000);

  it("writes a feedback batch on POST /decision and exits 0", async () => {
    process.env.PLANPAGE_NO_OPEN = "1";
    const tmp = mkdtempSync(join(tmpdir(), "planpage-serve-fb-"));
    const htmlPath = join(tmp, "test.html");
    const outPath = join(tmp, "decision.json");
    writeFileSync(htmlPath, "<html><body>plan</body></html>");
    const port = 18777;
    const pending = serve({ htmlPath, outPath, port, timeoutSec: 8 });
    await new Promise((r) => setTimeout(r, 200));
    const body = {
      approved: false,
      flips: [],
      revisit: [],
      notes: "fix the header",
      edits: [{ id: "e1", label: "title", original: "A", edited: "B" }],
      annotations: [],
      screenshots: [
        { id: "s1", name: "x.png", mime: "image/png", dataUrl: "data:image/png;base64,aa" },
      ],
      diagrams: [
        {
          id: "d1",
          title: "arch",
          look: "handDrawn",
          original: "flowchart LR\n A-->B",
          edited: "flowchart LR\n A-->C",
          nodesMoved: true,
          questions: ["why C?"],
        },
      ],
      whiteboards: [
        {
          id: "w1",
          title: "sketch",
          pngDataUrl: "data:image/png;base64,bb",
          strokeCount: 2,
          note: "brainstorm",
        },
      ],
    };
    const res = await fetch(`http://127.0.0.1:${port}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res.status).toBe(200);
    const code = await pending;
    expect(code).toBe(0);
    const written = JSON.parse(readFileSync(outPath, "utf8"));
    expect(written.notes).toBe("fix the header");
    expect(written.edits).toHaveLength(1);
    expect(written.screenshots).toHaveLength(1);
    expect(written.diagrams[0].questions).toEqual(["why C?"]);
    expect(written.whiteboards[0].strokeCount).toBe(2);
    process.env.PLANPAGE_NO_OPEN = undefined;
  }, 15_000);
});
