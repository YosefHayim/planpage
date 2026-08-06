import { describe, expect, it } from "vitest";
import { LIBRARY_SHELL_FLAGS } from "../../cli/library";
import { FLOW_KINDS, FLOW_PRESETS } from "../../components/Flow";
import {
  GALLERY,
  GALLERY_SEVERITIES,
  GALLERY_STATUSES,
  GALLERY_TONES,
} from "../../gallery/registry";
import { render } from "../../render/render";
import { Library } from "./Library";

/** Shell flags the catalog needs for live samples (mirrors `planpage library`). */
const LIVE = { ...LIBRARY_SHELL_FLAGS };

describe("Library", () => {
  it("renders a self-contained gallery that names every registered component", () => {
    const html = render(<Library />);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    for (const name of Object.keys(GALLERY)) {
      expect(html).toContain(name);
    }
  });

  it("registers full state matrices for StatusChip · Callout · Risk · Flow · Whiteboard", () => {
    // Matrix constants are the SSOT the samples map over — length guards against silent dropouts.
    expect(GALLERY_STATUSES).toEqual(["todo", "doing", "done", "blocked"]);
    expect(GALLERY_TONES).toEqual([
      "note",
      "warn",
      "success",
      "danger",
      "risk",
      "decision",
      "assumption",
    ]);
    expect([...GALLERY_SEVERITIES]).toEqual(["low", "med", "high"]);
    expect(GALLERY.StatusChip).toBeDefined();
    expect(GALLERY.Callout).toBeDefined();
    expect(GALLERY.RiskList).toBeDefined();
    expect(GALLERY.Flow).toBeDefined();
    expect(GALLERY.Whiteboard).toBeDefined();
    expect(GALLERY.Flow.category).toBe("diagram");
    expect(GALLERY.Whiteboard.category).toBe("diagram");
  });

  it("renders each component's live sample (full status / tone / severity matrices land in output)", () => {
    const html = render(<Library />, LIVE);

    // StatusChip matrix (default labels)
    expect(html).toContain("Todo");
    expect(html).toContain("Doing");
    expect(html).toContain("Done");
    expect(html).toContain("Blocked");

    // Callout tones (title = tone id)
    for (const tone of GALLERY_TONES) {
      expect(html).toContain(tone);
    }

    // RiskList severity chips
    expect(html).toContain("Low");
    expect(html).toContain("Med");
    expect(html).toContain("High");
    expect(html).toContain("gallery-sync test");

    // Whiteboard + Flow board chrome
    expect(html).toContain("data-whiteboard");
    expect(html).toContain('data-wb-id="gallery.sketch"');
    expect(html).toContain("data-diagram-board");
    expect(html).toContain("gallery.diagram");

    // Every Flow kind preset appears (label + source)
    for (const kind of FLOW_KINDS) {
      expect(html).toContain(FLOW_PRESETS[kind].label);
      // First token of the Mermaid source is unique enough per kind
      const head = FLOW_PRESETS[kind].source.split("\n")[0] ?? "";
      expect(html).toContain(head);
    }

    // Carousel mode matrix
    expect(html).toContain('data-mode="slideshow"');
    expect(html).toContain('data-mode="marquee"');
    expect(html).toContain("data-carousel");
  });

  it("enables gallery shell islands via LIBRARY_SHELL_FLAGS (carousel · diagram · sketch · quiz)", () => {
    expect(LIBRARY_SHELL_FLAGS).toMatchObject({
      filterable: true,
      explorable: true,
      quizzable: true,
      carousel: true,
      diagramable: true,
      sketchable: true,
    });

    const html = render(<Library />, LIVE);

    // Carousel island present and does not page-jump via scrollIntoView
    expect(html).toMatch(/data-carousel/);
    expect(html).not.toMatch(/\.scrollIntoView\s*\(/);

    // Diagram + whiteboard islands (script hooks)
    expect(html).toContain("__ppCollectDiagrams");
    expect(html).toContain("__ppCollectWhiteboards");
    expect(html).toContain("data-diagram-board");
    expect(html).toContain("data-whiteboard");

    // Quiz island + QuizCard sample hooks
    expect(html).toContain("data-quiz-card");
  });
});
