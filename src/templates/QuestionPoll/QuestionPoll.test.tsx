import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { QuestionPoll } from "./QuestionPoll";

describe("QuestionPoll", () => {
  it("renders with questions and produces valid HTML", () => {
    const html = render(
      <QuestionPoll
        title="Test poll"
        questions={[
          {
            id: "q-1",
            text: "Which approach?",
            group: "Frontend",
            options: [
              { id: "a", label: "Option A", recommended: true },
              { id: "b", label: "Option B" },
            ],
          },
          {
            id: "q-2",
            text: "Which style?",
            group: "Frontend",
            options: [
              { id: "c", label: "Option C" },
              { id: "d", label: "Option D", recommended: true },
            ],
          },
          {
            id: "q-3",
            text: "Backend choice?",
            group: "Backend",
            options: [{ id: "e", label: "Option E" }],
          },
        ]}
      />,
    );

    expect(html).toContain("data-question");
    expect(html).toContain('data-id="q-1"');
    expect(html).toContain("data-progress-fill");
    expect(html).toContain('data-nav="q-1"');
    expect(html).toContain("Frontend");
    expect(html).toContain("Backend");
    expect(html).toContain("Recommended");
  });

  it("throws when questions array is empty", () => {
    expect(() => render(<QuestionPoll title="Empty" questions={[]} />)).toThrow(
      "questions[] is required",
    );
  });

  it("renders without groups when no group field is set", () => {
    const html = render(
      <QuestionPoll
        title="No groups"
        questions={[
          {
            id: "q-flat",
            text: "Flat question?",
            options: [{ id: "x", label: "X" }],
          },
        ]}
      />,
    );

    expect(html).toContain("Flat question?");
    expect(html).not.toContain("data-group=");
  });
});
