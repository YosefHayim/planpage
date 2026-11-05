import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { SketchKit } from "./SketchKit";

describe("SketchKit", () => {
  it("shows every part class name as a section entry", () => {
    const html = render(<SketchKit />, { title: "Sketch kit" });

    expect(html).toContain('id="sk-button"');
    expect(html).toContain('id="sk-icon"');
  });

  it("marks an empty group as having no parts yet", () => {
    const html = render(<SketchKit />, { title: "Sketch kit" });

    expect(html).toContain("No parts yet.");
  });
});
