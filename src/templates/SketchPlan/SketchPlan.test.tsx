import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { SketchPlan } from "./SketchPlan";
import { SKETCH_PLAN_SAMPLE } from "./sketchPlanSample";

describe("SketchPlan", () => {
  it("renders every page of the sample plan", () => {
    const html = render(
      <SketchPlan title={SKETCH_PLAN_SAMPLE.title} pages={SKETCH_PLAN_SAMPLE.pages} />,
      {
        hasSketchScenes: true,
      },
    );
    for (const page of SKETCH_PLAN_SAMPLE.pages) {
      expect(html).toContain(page.title);
      expect(html).toContain(page.nav);
    }
    expect(html.match(/<section class="sketch-section" data-sketch-page/g)).toHaveLength(
      SKETCH_PLAN_SAMPLE.pages.length,
    );
  });

  it("lists the option letters on the decision page", () => {
    const decisionPage = SKETCH_PLAN_SAMPLE.pages.find((page) => page.decision !== undefined);
    if (decisionPage === undefined) throw new Error("the sample has no decision page");

    const html = render(<SketchPlan title="Plan" pages={[decisionPage]} />);
    for (const option of decisionPage.decision?.options ?? []) {
      expect(html).toContain(`value="${option.letter}"`);
      expect(html).toContain(`${option.letter}. ${option.title}`);
    }
    expect(html).toContain("1-3 or A-C: pick");
  });

  it("shows only the code tabs that have content", () => {
    const html = render(
      <SketchPlan
        title="Plan"
        pages={[
          {
            nav: "One",
            title: "One",
            scene: { width: 100, height: 100, nodes: [] },
            code: { diff: "+ a" },
          },
        ]}
      />,
    );
    expect(html).toContain(">Diff<");
    expect(html).not.toContain(">Pseudo<");
    expect(html).toContain('<pre class="sketch-code-body"');
  });

  it("throws when the plan has no pages", () => {
    expect(() => render(<SketchPlan title="Plan" pages={[]} />)).toThrow("pages[] is required");
  });
});
