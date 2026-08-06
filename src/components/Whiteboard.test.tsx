import { describe, expect, it } from "vitest";
import { WHITEBOARD_SCRIPT } from "../render/clientScript/whiteboard";
import { render } from "../render/render";
import { Whiteboard } from "./Whiteboard";

describe("Whiteboard", () => {
  it("renders canvas chrome and queue control when sketchable", () => {
    const html = render(<Whiteboard id="wb1" title="Sketch" />, { sketchable: true });
    expect(html).toContain("data-whiteboard");
    expect(html).toContain('data-wb-id="wb1"');
    expect(html).toContain('data-wb-title="Sketch"');
    expect(html).toContain("data-wb-canvas");
    expect(html).toContain('data-wb-tool="pen"');
    expect(html).toContain('data-action="wb-queue"');
    expect(html).toContain("Queue sketch for agent");
    expect(html).toContain("data-wb-note");
    expect(html).toContain("data-wb-status");
    expect(html).toContain("data-wb-stickies");
  });

  it("omits edit chrome when editable is false", () => {
    const html = render(<Whiteboard editable={false} />);
    expect(html).toContain("data-whiteboard");
    expect(html).toContain('data-wb-editable="false"');
    expect(html).not.toContain('data-action="wb-queue"');
    expect(html).not.toContain("data-wb-tool");
    expect(html).not.toContain("data-wb-note");
  });

  it("exposes all draw tools and colour swatches", () => {
    const html = render(<Whiteboard />, { sketchable: true });
    for (const tool of ["pen", "highlight", "rect", "ellipse", "arrow", "sticky", "eraser"]) {
      expect(html).toContain(`data-wb-tool="${tool}"`);
    }
    for (const c of ["#1e293b", "#4f46e5", "#059669", "#d97706", "#e11d48", "#0ea5e9"]) {
      expect(html).toContain(`data-wb-color="${c}"`);
    }
    expect(html).toContain("data-wb-undo");
    expect(html).toContain("data-wb-clear");
  });

  it("defaults pen tool and first swatch as pressed for progressive enhancement", () => {
    const html = render(<Whiteboard id="x" />);
    expect(html).toMatch(/data-wb-tool="pen"[^>]*aria-pressed="true"/);
    expect(html).toContain("pp-wb-tool-on");
    expect(html).toContain("pp-wb-swatch-on");
  });

  it("clamps height to a sane range", () => {
    const tiny = render(<Whiteboard height={10} />);
    expect(tiny).toContain("height:120px");
    expect(tiny).toContain('data-wb-height="120"');

    const huge = render(<Whiteboard height={9999} />);
    expect(huge).toContain("height:1200px");
    expect(huge).toContain('data-wb-height="1200"');

    const ok = render(<Whiteboard height={280} />);
    expect(ok).toContain("height:280px");
    expect(ok).toContain('data-wb-height="280"');
  });

  it("uses stable defaults for id and title", () => {
    const html = render(<Whiteboard />);
    expect(html).toContain('data-wb-id="whiteboard"');
    expect(html).toContain('data-wb-title="Whiteboard"');
    expect(html).toContain('data-wb-editable="true"');
  });
});

describe("WHITEBOARD_SCRIPT contracts", () => {
  it("exports PNG queue + collect hooks for agent feedback", () => {
    expect(WHITEBOARD_SCRIPT).toContain("data-whiteboard");
    expect(WHITEBOARD_SCRIPT).toContain("__ppCollectWhiteboards");
    expect(WHITEBOARD_SCRIPT).toContain("__ppWhiteboards");
    expect(WHITEBOARD_SCRIPT).toContain("wb-queue");
    expect(WHITEBOARD_SCRIPT).toContain("toDataURL");
    expect(WHITEBOARD_SCRIPT).toContain("pp-wb-queued");
  });

  it("rejects empty sketches and keeps stickies in the payload", () => {
    // Empty-board guard (no strokes / stickies / note)
    expect(WHITEBOARD_SCRIPT).toContain("hasContent");
    expect(WHITEBOARD_SCRIPT).toMatch(/Draw something.*sticky.*note/i);
    // Placeholder stickies are filtered out of the payload
    expect(WHITEBOARD_SCRIPT).toContain("isPlaceholderSticky");
    expect(WHITEBOARD_SCRIPT).toContain("collectStickies");
    expect(WHITEBOARD_SCRIPT).toContain("stickies");
    // Stickies are painted onto the export PNG
    expect(WHITEBOARD_SCRIPT).toContain("paintStickiesOnto");
  });

  it("ignores zero-size shape strokes and hardens export failures", () => {
    expect(WHITEBOARD_SCRIPT).toContain("meaningfulShape");
    expect(WHITEBOARD_SCRIPT).toMatch(/Could not export sketch/);
    // Rough.js pen path with plain-canvas fallback
    expect(WHITEBOARD_SCRIPT).toContain("rough");
    expect(WHITEBOARD_SCRIPT).toContain("setPointerCapture");
  });
});
