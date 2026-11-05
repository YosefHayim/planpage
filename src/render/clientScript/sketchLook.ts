import type { SketchFill, SketchTone } from "../../contracts/sketchScene";

export const SKETCH_LOOK = {
  tones: {
    ink: "#2b2b30",
    red: "#c92a2a",
    green: "#2b8a3e",
    blue: "#1c7ed6",
    orange: "#e8590c",
    soft: "#8a8a94",
  } satisfies Record<SketchTone, string>,
  pastelFills: {
    blue: "#d0ebff",
    grey: "#e9ecef",
    orange: "#ffe8cc",
    green: "#d3f9d8",
    red: "#ffe3e3",
    yellow: "#fff3bf",
  } satisfies Record<Exclude<SketchFill, "none">, string>,
  saturatedFills: {
    blue: "#74c0fc",
    grey: "#ced4da",
    orange: "#ffa94d",
    green: "#69db7c",
    red: "#ff8787",
    yellow: "#ffd43b",
  } satisfies Record<Exclude<SketchFill, "none">, string>,
  roughnessShape: 1.1,
  roughnessEdge: 0.9,
  bowing: 0.8,
  strokeWidth: 1.6,
  dashPattern: [6, 6],
} as const;
