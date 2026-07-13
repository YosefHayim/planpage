import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { Carousel } from "./Carousel";

describe("Carousel", () => {
  it("renders a slideshow with viewport, slides, arrows, and dots", () => {
    const html = render(
      <Carousel
        slides={[
          { title: "One", body: "first" },
          { title: "Two", body: "second" },
        ]}
      />,
    );
    expect(html).toContain("data-carousel");
    expect(html).toContain('data-mode="slideshow"');
    expect(html).toContain("data-carousel-viewport");
    expect(html).toContain("data-slide");
    expect(html).toContain("data-carousel-next");
    expect(html).toContain("data-carousel-dot");
  });

  it("duplicates the track for a seamless marquee", () => {
    const html = render(<Carousel mode="marquee" slides={[{ title: "Ticker" }]} />);
    expect(html).toContain('data-mode="marquee"');
    expect(html).toContain("marquee-track");
    // duplicated for the seamless loop → the title appears twice
    expect(html.split("Ticker").length - 1).toBe(2);
  });

  it("throws when slides is empty", () => {
    expect(() => render(<Carousel slides={[]} />)).toThrow("slides[] is required");
  });
});
