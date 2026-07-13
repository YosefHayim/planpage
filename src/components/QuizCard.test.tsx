import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { QuizCard } from "./QuizCard";

describe("QuizCard", () => {
  it("renders the graded options + explanation", () => {
    const html = render(
      <QuizCard
        id="q-demo"
        question="Which is pure?"
        explanation="Emitting a marker keeps render sync."
        options={[
          { id: "a", label: "Emit a marker", correct: true },
          { id: "b", label: "await inside render" },
          { id: "c", label: "read the DOM" },
        ]}
      />,
    );
    expect(html).toContain("data-quiz-card");
    expect(html).toContain('data-id="q-demo"');
    expect(html).toContain('data-correct="true"');
    expect(html).toContain("Which is pure?");
    expect(html).toContain("Emitting a marker keeps render sync.");
  });

  it("throws when options is empty", () => {
    expect(() => render(<QuizCard id="q" question="?" options={[]} />)).toThrow(
      "options[] is required",
    );
  });

  it("throws unless exactly one option is correct", () => {
    expect(() =>
      render(
        <QuizCard
          id="q"
          question="?"
          options={[
            { id: "a", label: "A", correct: true },
            { id: "b", label: "B", correct: true },
          ]}
        />,
      ),
    ).toThrow("exactly one option must be");
  });
});
