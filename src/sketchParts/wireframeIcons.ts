import type { SketchIconShape } from "../contracts/sketchScene";

export const WIREFRAME_ICONS: Readonly<Record<string, readonly SketchIconShape[]>> = {
  bell: [
    { tag: "path", attributes: { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" } },
    { tag: "path", attributes: { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" } },
  ],
  check: [{ tag: "polyline", attributes: { points: "20,6 9,17 4,12" } }],
  "chevron-down": [{ tag: "polyline", attributes: { points: "6,9 12,15 18,9" } }],
  plus: [
    { tag: "line", attributes: { x1: 5, y1: 12, x2: 19, y2: 12 } },
    { tag: "line", attributes: { x1: 12, y1: 5, x2: 12, y2: 19 } },
  ],
  search: [
    { tag: "circle", attributes: { cx: 11, cy: 11, r: 8 } },
    { tag: "path", attributes: { d: "m21 21-4.3-4.3" } },
  ],
  x: [
    { tag: "line", attributes: { x1: 18, y1: 6, x2: 6, y2: 18 } },
    { tag: "line", attributes: { x1: 6, y1: 6, x2: 18, y2: 18 } },
  ],
};
