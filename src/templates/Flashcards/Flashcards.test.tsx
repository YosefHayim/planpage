import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { Flashcards } from "./Flashcards";

describe("Flashcards", () => {
  it("renders a flip card per entry", () => {
    const html = render(
      <Flashcards
        title="Vocabulary"
        intro="Tap to flip."
        cards={[
          { front: "Island", back: "A gated client script." },
          { front: "Post-back", back: "Returns one Decision." },
        ]}
      />,
    );
    expect(html).toContain("Vocabulary");
    expect(html).toContain("flip-card");
    expect(html).toContain("Island");
    expect(html).toContain("Post-back");
    // one flip checkbox per card (card-unique — the flip-card class also lives in the Shell CSS)
    expect(html.split('type="checkbox"').length - 1).toBe(2);
  });

  it("throws when cards is empty", () => {
    expect(() => render(<Flashcards title="Empty" cards={[]} />)).toThrow("cards[] is required");
  });
});
