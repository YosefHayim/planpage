import { describe, expect, it } from "vitest";
import type { SketchScene as SketchSceneData } from "../contracts/sketchScene";
import { render } from "../render/render";
import { SketchScene } from "./SketchScene";

const scene: SketchSceneData = {
  width: 300,
  height: 120,
  nodes: [{ id: "box", kind: "box", x: 10, y: 10, w: 120, h: 60, words: "</script><b>x</b>" }],
};

describe("SketchScene", () => {
  it("renders one labelled frame holding the scene JSON", () => {
    const html = render(<SketchScene scene={scene} label="Flow" />);
    expect(html).toContain('class="sketch-frame"');
    expect(html).toContain('aria-label="Flow"');
    expect(html).toContain('data-sketch-scene>{"width":300');
  });

  it("escapes < so scene text cannot close the script tag", () => {
    const html = render(<SketchScene scene={scene} label="Flow" />);
    expect(html).not.toContain("</script><b>");
    expect(html).toContain("\\u003c/script>");
  });

  it("carries a screen node's html into the scene markup", () => {
    const screenScene: SketchSceneData = {
      width: 300,
      height: 200,
      nodes: [
        {
          id: "login",
          kind: "screen",
          x: 10,
          y: 10,
          w: 200,
          h: 120,
          html: '<form class="sk-card">Hi</form>',
        },
      ],
    };
    const html = render(<SketchScene scene={screenScene} label="Login" />);
    expect(html).toContain('"kind":"screen"');
    expect(html).toContain('"html":"\\u003cform class=\\"sk-card\\">Hi\\u003c/form>"');
  });
});
