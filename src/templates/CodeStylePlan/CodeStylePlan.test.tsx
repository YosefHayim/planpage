import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { CodeStylePlan } from "./CodeStylePlan";

const PICKS = [
  {
    id: "rule.component-form",
    rule: "Component form",
    chosen: "const C = () => <div/>",
    rejected: "function C(){}",
    why: "arrow-const",
    tag: "[taste]",
  },
];

describe("CodeStylePlan", () => {
  it("renders picks with stable data-ids and the feedback sidebar when interactive", () => {
    const html = render(<CodeStylePlan title="Style" picks={PICKS} />, { interactive: true });
    expect(html).toContain('data-id="rule.component-form"');
    expect(html).toContain('id="pp-bar"');
    expect(html).toContain('id="pp-queue"');
    expect(html).toContain('data-action="send"');
    expect(html).not.toContain('data-action="approve"');
  });

  it("omits the feedback sidebar when not interactive", () => {
    const html = render(<CodeStylePlan title="Style" picks={PICKS} />);
    expect(html).not.toContain('id="pp-bar"');
  });

  it("throws an actionable error on empty picks", () => {
    expect(() => render(<CodeStylePlan title="x" picks={[]} />)).toThrow(/picks\[\] is required/);
  });
});
