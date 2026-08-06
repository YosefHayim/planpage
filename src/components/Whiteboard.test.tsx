import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { Whiteboard } from "./Whiteboard";

describe("Whiteboard", () => {
  it("renders canvas chrome and queue control when sketchable", () => {
    const html = render(<Whiteboard id="wb1" title="Sketch" />, { sketchable: true });
    expect(html).toContain("data-whiteboard");
    expect(html).toContain("data-wb-canvas");
    expect(html).toContain('data-wb-tool="pen"');
    expect(html).toContain('data-action="wb-queue"');
    expect(html).toContain("Queue sketch for agent");
  });

  it("omits edit chrome when editable is false", () => {
    const html = render(<Whiteboard editable={false} />);
    expect(html).toContain("data-whiteboard");
    expect(html).not.toContain('data-action="wb-queue"');
  });
});
