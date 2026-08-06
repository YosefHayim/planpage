import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { PlanBrief } from "./PlanBrief";

describe("PlanBrief", () => {
  it("renders title and optional sections", () => {
    const html = render(
      <PlanBrief
        title="Ship dark mode"
        summary={[{ label: "Risk", value: "low" }]}
        steps={[{ label: "Add toggle", status: "todo" }]}
      />,
    );
    expect(html).toContain("Ship dark mode");
    expect(html).toContain("Add toggle");
    expect(html).not.toContain('id="pp-bar"');
  });

  it("includes the feedback sidebar only when interactive", () => {
    const html = render(<PlanBrief title="Ship dark mode" />, { interactive: true });
    expect(html).toContain('id="pp-bar"');
    expect(html).toContain('id="pp-queue"');
    expect(html).toContain('id="pp-shot-input"');
    expect(html).toContain("pp-has-sidebar");
    expect(html).toContain('data-action="send"');
    expect(html).toContain('data-action="mode"');
    expect(html).toContain("Send to Agent");
    expect(html).toContain("Screenshot");
    expect(html).not.toContain('data-action="approve"');
  });

  it("throws when title is missing", () => {
    expect(() => render(<PlanBrief title="" />)).toThrow(/title is required/);
  });
});
