import type { VNode } from "preact";
import type { SketchPartGroup } from "../../contracts/sketchScene";
import { SKETCH_PARTS } from "../../sketchParts/sketchParts";
import { SketchKitGroup } from "./SketchKitGroup";

export const SKETCH_KIT_FILE_NAME = "planpage-sketch-kit.html";

interface SketchKitSection {
  readonly group: SketchPartGroup;
  readonly title: string;
}

const SKETCH_KIT_SECTIONS: readonly SketchKitSection[] = [
  { group: "controls", title: "Controls" },
  { group: "navigation", title: "Navigation" },
  { group: "overlays", title: "Overlays and feedback" },
  { group: "content", title: "Content" },
  { group: "charts", title: "Charts" },
  { group: "frames", title: "Device frames" },
  { group: "marks", title: "Marks and notes" },
  { group: "icons", title: "Icons" },
];

export const SketchKit = (): VNode => (
  <div class="space-y-12">
    <header class="space-y-2">
      <h1 class="text-2xl font-bold">Sketch kit</h1>
      <p>Every hand-drawn wireframe part, with its examples and states. Layout is plain Tailwind.</p>
    </header>
    {SKETCH_KIT_SECTIONS.map(({ group, title }) => (
      <SketchKitGroup key={group} title={title} parts={SKETCH_PARTS.filter((part) => part.group === group)} />
    ))}
  </div>
);
