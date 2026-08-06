import { describe, expect, it } from "vitest";
import { GALLERY } from "../../gallery/registry";
import { render } from "../../render/render";
import { Library } from "./Library";

describe("Library", () => {
  it("renders a self-contained gallery that names every registered component", () => {
    const html = render(<Library />);
    expect(html.startsWith("<!doctype html>")).toBe(true);
    for (const name of Object.keys(GALLERY)) {
      expect(html).toContain(name);
    }
  });

  it("renders each component's live sample (full status / tone matrices land in output)", () => {
    const html = render(<Library />, { sketchable: true, diagramable: true, carousel: true });
    // StatusChip matrix
    expect(html).toContain("Todo");
    expect(html).toContain("Doing");
    expect(html).toContain("Done");
    expect(html).toContain("Blocked");
    // Callout tones
    expect(html).toContain("assumption");
    expect(html).toContain("decision");
    // Whiteboard + Flow board
    expect(html).toContain("data-whiteboard");
    expect(html).toContain("data-diagram-board");
  });
});
