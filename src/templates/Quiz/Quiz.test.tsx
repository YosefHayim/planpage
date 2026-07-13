import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { Quiz } from "./Quiz";

describe("Quiz", () => {
  it("renders graded cards, a progress bar, a live score, and the submit bar", () => {
    const html = render(
      <Quiz
        title="Coach check"
        intro="One is correct."
        questions={[
          {
            id: "q-1",
            group: "Rendering",
            question: "Which is pure?",
            explanation: "Markers keep render sync.",
            options: [
              { id: "a", label: "Emit a marker", correct: true },
              { id: "b", label: "await in render" },
            ],
          },
          {
            id: "q-2",
            group: "Conventions",
            question: "What blocks gallery drift?",
            options: [
              { id: "c", label: "A drift test", correct: true },
              { id: "d", label: "Nothing" },
            ],
          },
        ]}
      />,
    );
    expect(html).toContain("data-quiz-card");
    expect(html).toContain("data-progress-fill");
    expect(html).toContain("data-quiz-score");
    expect(html).toContain("Which is pure?");
    expect(html).toContain("Rendering");
    expect(html).toContain("Conventions");
    expect(html).toContain("Submit answers");
  });

  it("throws when questions is empty", () => {
    expect(() => render(<Quiz title="Empty" questions={[]} />)).toThrow("questions[] is required");
  });
});
