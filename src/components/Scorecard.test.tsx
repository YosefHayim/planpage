import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { Scorecard } from "./Scorecard";

describe("Scorecard", () => {
  it("renders a graded bar per dimension", () => {
    const html = render(
      <Scorecard
        title="audit"
        overall={82}
        dimensions={[
          { label: "Accessibility", score: 94 },
          { label: "Security", score: 40, note: "no CSP" },
        ]}
      />,
    );
    expect(html).toContain("Accessibility");
    expect(html).toContain("width:94%");
    expect(html).toContain("no CSP");
  });

  it("clamps out-of-range scores", () => {
    const html = render(<Scorecard dimensions={[{ label: "X", score: 150 }]} />);
    expect(html).toContain("width:100%");
  });

  it("throws when dimensions is empty", () => {
    expect(() => render(<Scorecard dimensions={[]} />)).toThrow("dimensions[] is required");
  });
});
