import { describe, expect, it } from "vitest";
import { render } from "../render/render";

describe("Shell island flags", () => {
  it("injects carousel script only when carousel is set", () => {
    const off = render(<p>x</p>);
    const on = render(<p>x</p>, { carousel: true });
    expect(off).not.toMatch(/data-carousel\]\[data-mode/);
    expect(on).toMatch(/scrollLeft|scrollTo/);
    expect(on).not.toMatch(/\.scrollIntoView\s*\(/);
  });

  it("injects diagram island when diagramable or interactive", () => {
    const off = render(<p>x</p>);
    const on = render(<p>x</p>, { diagramable: true });
    const viaInteractive = render(<p>x</p>, { interactive: true });
    expect(off).not.toContain("__ppCollectDiagrams");
    expect(on).toContain("__ppCollectDiagrams");
    expect(viaInteractive).toContain("__ppCollectDiagrams");
  });

  it("injects whiteboard island when sketchable or interactive", () => {
    const off = render(<p>x</p>);
    const on = render(<p>x</p>, { sketchable: true });
    const viaInteractive = render(<p>x</p>, { interactive: true });
    expect(off).not.toContain("__ppCollectWhiteboards");
    expect(on).toContain("__ppCollectWhiteboards");
    expect(viaInteractive).toContain("__ppCollectWhiteboards");
    expect(on).toContain("rough");
  });

  it("interactive mounts FeedbackSidebar chrome", () => {
    const html = render(<p>plan</p>, { interactive: true });
    expect(html).toContain('id="pp-bar"');
    expect(html).toContain('data-action="send"');
    expect(html).toContain("pp-has-sidebar");
  });

  it("injects sketch fonts, style, engine and pager only when hasSketchScenes is set", () => {
    const off = render(<p>x</p>);
    const on = render(<p>x</p>, { hasSketchScenes: true });
    expect(off).not.toContain("fonts.googleapis.com");
    expect(on).toContain("family=Kalam");
    expect(on).toContain("family=IBM+Plex+Mono");
    expect(on).toContain("html.dark .sketch-frame");
    expect(on).toContain("drawFramesIn");
    expect(on).toContain("data-sketch-page");
    expect(on).toContain("pp-rough-ready");
  });
});
