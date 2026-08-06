import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { FLOW_KINDS, FLOW_PRESETS, Flow } from "./Flow";

describe("Flow", () => {
  it("renders mermaid source", () => {
    const html = render(<Flow source={"flowchart LR\n  A --> B"} />);
    expect(html).toContain("mermaid");
    expect(html).toContain("flowchart LR");
    expect(html).toContain("data-diagram-board");
  });

  it("injects handDrawn init when look is set", () => {
    const html = render(<Flow look="handDrawn" source={"flowchart LR\n  A --> B"} />);
    expect(html).toContain("handDrawn");
    expect(html).toContain("%%{init:");
  });

  it("shows editor chrome when editable", () => {
    const html = render(<Flow editable id="d1" title="Arch" source={"flowchart LR\n  A --> B"} />, {
      diagramable: true,
    });
    expect(html).toContain('data-diagram-editable="true"');
    expect(html).toContain("data-diagram-source");
    expect(html).toContain("data-diagram-preset");
    expect(html).toContain('data-action="diagram-queue"');
    expect(html).toContain("Queue for agent");
  });

  it("exposes every built-in diagram kind preset", () => {
    expect(FLOW_KINDS.length).toBeGreaterThanOrEqual(8);
    for (const kind of FLOW_KINDS) {
      expect(FLOW_PRESETS[kind].source.trim().length).toBeGreaterThan(0);
    }
  });

  it("renders every FLOW_PRESET without throw", () => {
    for (const kind of FLOW_KINDS) {
      const html = render(
        <Flow id={`p-${kind}`} title={kind} source={FLOW_PRESETS[kind].source} look="handDrawn" />,
      );
      expect(html).toContain("data-diagram-board");
      expect(html).toContain("mermaid");
    }
  });

  it("throws when source is empty", () => {
    expect(() => render(<Flow source="  " />)).toThrow(/source is required/);
  });
});
