import { describe, expect, it } from "vitest";
import { DIAGRAM_SCRIPT } from "../render/clientScript/diagram";
import { render } from "../render/render";
import { FLOW_KINDS, FLOW_PRESETS, Flow, detectKind, stripInit, withInit } from "./Flow";

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

  it("injects theme into init when theme prop is set", () => {
    const html = render(
      <Flow theme="forest" source={"flowchart LR\n  A --> B"} look="handDrawn" />,
    );
    // JSX escapes quotes in the pre body as &quot;
    expect(html).toMatch(/theme(?:&quot;|")\s*:\s*(?:&quot;|")forest/);
    expect(html).toMatch(/look(?:&quot;|")\s*:\s*(?:&quot;|")handDrawn/);
    expect(html).toContain('data-diagram-theme="forest"');
  });

  it("shows editor chrome when editable", () => {
    const html = render(<Flow editable id="d1" title="Arch" source={"flowchart LR\n  A --> B"} />, {
      diagramable: true,
    });
    expect(html).toContain('data-diagram-editable="true"');
    expect(html).toContain("data-diagram-source");
    expect(html).toContain("data-diagram-preset");
    expect(html).toContain("data-diagram-look-toggle");
    expect(html).toContain("data-diagram-apply");
    expect(html).toContain("data-diagram-question");
    expect(html).toContain("data-diagram-status");
    expect(html).toContain("data-diagram-original-field");
    expect(html).toContain('data-diagram-original-look="classic"');
    expect(html).toContain('data-action="diagram-queue"');
    expect(html).toContain("Queue for agent");
    // Every kind label appears in the type switcher
    for (const kind of FLOW_KINDS) {
      expect(html).toContain(FLOW_PRESETS[kind].label);
    }
  });

  it("omits editor chrome when not editable", () => {
    const html = render(<Flow id="ro" source={"flowchart LR\n  A --> B"} />);
    expect(html).toContain('data-diagram-editable="false"');
    expect(html).not.toContain("data-diagram-source");
    expect(html).not.toContain("data-diagram-preset");
    expect(html).not.toContain('data-action="diagram-queue"');
    // Original baseline still present for the island
    expect(html).toContain("data-diagram-original-field");
  });

  it("preserves multiline original source in the hidden field (not a value= attribute)", () => {
    const src = "flowchart LR\n  A --> B\n  B --> C";
    const html = render(<Flow editable id="ml" source={src} />);
    // textarea body (not input value=") so newlines survive HTML parse
    expect(html).toMatch(
      /data-diagram-original-field[^>]*>flowchart LR\n {2}A --> B\n {2}B --> C<\/textarea>/,
    );
    expect(html).toContain('data-diagram-id="ml"');
  });

  it("selects the matching kind option from source", () => {
    const html = render(<Flow editable source={FLOW_PRESETS.sequence.source} id="seq" />);
    // Preact serializes selected as selected="" or selected="true"
    expect(html).toMatch(/<option[^>]*value="sequence"[^>]*selected/);
  });

  it("exposes every built-in diagram kind preset", () => {
    expect(FLOW_KINDS.length).toBeGreaterThanOrEqual(8);
    for (const kind of FLOW_KINDS) {
      expect(FLOW_PRESETS[kind].source.trim().length).toBeGreaterThan(0);
      expect(FLOW_PRESETS[kind].label.length).toBeGreaterThan(0);
    }
  });

  it("renders every FLOW_PRESET without throw (classic + handDrawn)", () => {
    for (const kind of FLOW_KINDS) {
      for (const look of ["classic", "handDrawn"] as const) {
        const html = render(
          <Flow
            id={`p-${kind}-${look}`}
            title={kind}
            source={FLOW_PRESETS[kind].source}
            look={look}
          />,
        );
        expect(html).toContain("data-diagram-board");
        expect(html).toContain("mermaid");
        expect(html).toContain(`data-diagram-look="${look}"`);
        if (look === "handDrawn") {
          expect(html).toContain("handDrawn");
        }
      }
    }
  });

  it("throws when source is empty", () => {
    expect(() => render(<Flow source="  " />)).toThrow(/source is required/);
  });
});

describe("withInit / stripInit / detectKind", () => {
  it("withInit is a no-op for classic without theme", () => {
    const src = "flowchart LR\n  A --> B";
    expect(withInit(src, "classic", undefined)).toBe(src);
  });

  it("withInit injects handDrawn and theme", () => {
    const out = withInit("flowchart LR\n  A", "handDrawn", "dark");
    expect(out.startsWith("%%{init:")).toBe(true);
    expect(out).toContain('"look":"handDrawn"');
    expect(out).toContain('"theme":"dark"');
    expect(out).toContain("flowchart LR");
  });

  it("withInit strips a prior init when re-applying look (re-render edge case)", () => {
    const once = withInit("flowchart LR\n  A --> B", "handDrawn", undefined);
    const twice = withInit(once, "classic", "neutral");
    // Only one init block, and classic means no look key — theme only
    expect(twice.match(/%%\{init:/g)?.length).toBe(1);
    expect(twice).toContain('"theme":"neutral"');
    expect(twice).not.toContain("handDrawn");
    expect(stripInit(twice).startsWith("flowchart")).toBe(true);
  });

  it("stripInit leaves plain source alone", () => {
    expect(stripInit("sequenceDiagram\n  A->>B: hi")).toBe("sequenceDiagram\n  A->>B: hi");
  });

  it("detectKind maps every FLOW_PRESET source", () => {
    for (const kind of FLOW_KINDS) {
      expect(detectKind(FLOW_PRESETS[kind].source)).toBe(kind);
    }
  });

  it("detectKind ignores a leading init directive", () => {
    const src = '%%{init: {"look":"handDrawn"}}%%\nclassDiagram\n  class X';
    expect(detectKind(src)).toBe("class");
  });

  it("detectKind returns undefined for unknown headers", () => {
    expect(detectKind("notADiagram\n  x")).toBeUndefined();
  });
});

describe("DIAGRAM_SCRIPT contract (residual)", () => {
  it("embeds every FLOW_PRESET source (no drift with Flow.tsx)", () => {
    for (const kind of FLOW_KINDS) {
      // Sources in the island string use \\n escapes — compare line fragments
      for (const line of FLOW_PRESETS[kind].source.split("\n")) {
        const fragment = line.trim();
        if (!fragment) continue;
        expect(DIAGRAM_SCRIPT).toContain(fragment);
      }
      expect(DIAGRAM_SCRIPT).toContain(`${kind}:`);
    }
  });

  it("exposes queue + collect keys matching FeedbackDiagram", () => {
    expect(DIAGRAM_SCRIPT).toContain("data-diagram-board");
    expect(DIAGRAM_SCRIPT).toContain("__ppCollectDiagrams");
    expect(DIAGRAM_SCRIPT).toContain("diagram-queue");
    expect(DIAGRAM_SCRIPT).toContain("nodesMoved");
    expect(DIAGRAM_SCRIPT).toContain("questions");
    expect(DIAGRAM_SCRIPT).toContain("original");
    expect(DIAGRAM_SCRIPT).toContain("edited");
    expect(DIAGRAM_SCRIPT).toContain("data-diagram-original-field");
    expect(DIAGRAM_SCRIPT).toContain("data-diagram-original-look");
  });

  it("hardens re-render / original-source edge cases in the island", () => {
    // stripInit so look toggle re-applies cleanly
    expect(DIAGRAM_SCRIPT).toContain("function stripInit");
    // original frozen from hidden field, not rewritten after edits
    expect(DIAGRAM_SCRIPT).toContain("function originalOf");
    expect(DIAGRAM_SCRIPT).toMatch(/data-diagram-original['"]\s*\)/);
    // blur-to-apply matches the chrome copy
    expect(DIAGRAM_SCRIPT).toContain("addEventListener('blur'");
    // empty source guard
    expect(DIAGRAM_SCRIPT).toContain("Source is empty");
    // clear prior SVGs before mermaid.run
    expect(DIAGRAM_SCRIPT).toContain("clearStageSvgs");
    // look-diff counts as a change for auto-collect
    expect(DIAGRAM_SCRIPT).toContain("data-diagram-original-look");
  });
});
