import type { SketchPart } from "../contracts/sketchScene";
import { CHARTS_PARTS } from "./chartsParts";
import { CONTENT_PARTS } from "./contentParts";
import { CONTROLS_PARTS } from "./controlsParts";
import { FRAMES_PARTS } from "./framesParts";
import { ICONS_PARTS } from "./iconsParts";
import { MARKS_PARTS } from "./marksParts";
import { NAVIGATION_PARTS } from "./navigationParts";
import { OVERLAYS_PARTS } from "./overlaysParts";

export const SKETCH_PARTS: readonly SketchPart[] = [
  ...CONTROLS_PARTS,
  ...NAVIGATION_PARTS,
  ...OVERLAYS_PARTS,
  ...CONTENT_PARTS,
  ...CHARTS_PARTS,
  ...FRAMES_PARTS,
  ...MARKS_PARTS,
  ...ICONS_PARTS,
];
