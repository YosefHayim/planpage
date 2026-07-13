import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { Flashcard } from "./Flashcard";

describe("Flashcard", () => {
  it("renders both faces of the flip card", () => {
    const html = render(<Flashcard label="term" front="Island" back="A gated client script." />);
    expect(html).toContain("flip-card");
    expect(html).toContain("flip-back");
    expect(html).toContain("Island");
    expect(html).toContain("A gated client script.");
  });

  it("throws when a face is missing", () => {
    expect(() => render(<Flashcard front="" back="x" />)).toThrow("both `front` and `back`");
  });
});
