import { describe, expect, it } from "vitest";
import { SKETCH_PARTS } from "./sketchParts";
import { WIREFRAME_ICONS } from "./wireframeIcons";

describe("SKETCH_PARTS", () => {
  it("gives every part a plain class name that starts with sk-", () => {
    const badClassNames = SKETCH_PARTS.filter((part) => !part.className.startsWith("sk-")).map(
      (part) => part.className,
    );

    expect(badClassNames).toEqual([]);
  });

  it("gives every part at least one example", () => {
    const partsWithoutExamples = SKETCH_PARTS.filter((part) => part.examples.length === 0).map(
      (part) => part.className,
    );

    expect(partsWithoutExamples).toEqual([]);
  });

  it("lists every class name once", () => {
    const classNames = SKETCH_PARTS.map((part) => part.className);

    expect(new Set(classNames).size).toBe(classNames.length);
  });
});

describe("WIREFRAME_ICONS", () => {
  it("keys every icon by its kebab-case Lucide name", () => {
    const badNames = Object.keys(WIREFRAME_ICONS).filter(
      (name) => !/^[a-z]+(-[a-z]+)*$/.test(name),
    );

    expect(badNames).toEqual([]);
  });
});
