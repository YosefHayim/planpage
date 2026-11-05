import type { SketchIconShape } from "../../../contracts/sketchScene";
import { WIREFRAME_ICONS } from "../../../sketchParts/wireframeIcons";

interface IconDotShape {
  tag: "dot";
  attributes: { cx: number; cy: number; r: number };
}

type PreparedIconShape = SketchIconShape | IconDotShape;

const ARC_COMMAND_PATTERN = /([aA])([^a-zA-Z]*)/g;
const ARC_NUMBER_PATTERN = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;
const ARC_PARAMETER_COUNT = 7;
const ARC_FLAG_INDEXES = [3, 4];
const PACKED_FLAGS_PATTERN = /^[01]\d/;
const DOT_CIRCLE_MAX_RADIUS = 1.2;
const DOT_PATH_PATTERN = /^M(-?[\d.]+) (-?[\d.]+)h\.01$/;
const DOT_PATH_RADIUS = 1;

const expandArcNumbers = (arcNumberStrings: readonly string[]): string[] => {
  const pendingNumberStrings = [...arcNumberStrings];
  const expandedNumberStrings: string[] = [];

  while (pendingNumberStrings.length > 0) {
    const numberString = pendingNumberStrings.shift() ?? "";
    const position = expandedNumberStrings.length % ARC_PARAMETER_COUNT;
    const isFlagPosition = ARC_FLAG_INDEXES.includes(position);
    const isPackedFlag = isFlagPosition && PACKED_FLAGS_PATTERN.test(numberString);
    if (!isPackedFlag) {
      expandedNumberStrings.push(numberString);
      continue;
    }

    expandedNumberStrings.push(numberString.charAt(0));
    pendingNumberStrings.unshift(numberString.slice(1));
  }

  return expandedNumberStrings;
};

const expandCompactArcFlags = (pathData: string): string =>
  pathData.replace(
    ARC_COMMAND_PATTERN,
    (_arcString: string, commandLetter: string, parameterString: string) => {
      const arcNumberStrings = [...parameterString.matchAll(ARC_NUMBER_PATTERN)].map(
        (arcNumberMatch) => arcNumberMatch[0],
      );
      return `${commandLetter} ${expandArcNumbers(arcNumberStrings).join(" ")}`;
    },
  );

const expandShapeArcFlags = (shape: SketchIconShape): SketchIconShape => {
  const isPathShape = shape.tag === "path";
  if (!isPathShape) return shape;

  const pathData = String(shape.attributes.d);
  return {
    tag: shape.tag,
    attributes: { ...shape.attributes, d: expandCompactArcFlags(pathData) },
  };
};

const findDotInCircle = (shape: SketchIconShape): IconDotShape | null => {
  const isCircle = shape.tag === "circle";
  if (!isCircle) return null;

  const radius = Number(shape.attributes.r);
  const isDotCircle = radius <= DOT_CIRCLE_MAX_RADIUS;
  if (!isDotCircle) return null;

  return {
    tag: "dot",
    attributes: { cx: Number(shape.attributes.cx), cy: Number(shape.attributes.cy), r: radius },
  };
};

const findDotInPath = (shape: SketchIconShape): IconDotShape | null => {
  const isPath = shape.tag === "path";
  if (!isPath) return null;

  const dotPathParts = DOT_PATH_PATTERN.exec(String(shape.attributes.d));
  const isDotPath = dotPathParts !== null;
  if (!isDotPath) return null;

  return {
    tag: "dot",
    attributes: { cx: Number(dotPathParts[1]), cy: Number(dotPathParts[2]), r: DOT_PATH_RADIUS },
  };
};

const prepareShape = (shape: SketchIconShape): PreparedIconShape =>
  findDotInCircle(shape) ?? findDotInPath(shape) ?? shape;

const PREPARED_WIREFRAME_ICONS: Readonly<Record<string, readonly PreparedIconShape[]>> =
  Object.fromEntries(
    Object.entries(WIREFRAME_ICONS).map(([iconName, shapes]) => [
      iconName,
      shapes.map((shape) => prepareShape(expandShapeArcFlags(shape))),
    ]),
  );

export const ICONS_PART_SCRIPT = `
const ICON_GRID_SIZE = 24;
const DEFAULT_ICON_FILL = "blue";
const DISABLED_TONE = "soft";
const TILE_ICON_INSET_RATIO = 0.22;
const FEATURED_DISC_INSET_RATIO = 0.1;
const FEATURED_ICON_INSET_RATIO = 0.28;
const DIRECTIONAL_ICON_NAMES = [
  "arrow-left",
  "arrow-right",
  "chevron-left",
  "chevron-right",
  "external-link",
  "log-in",
  "log-out",
  "send",
  "undo-2",
];
const ICON_LOOKS_BY_MAX_SIZE = [
  { maxSize: 22, roughness: 0.35, bowing: 0.4, strokeWidth: 2.4, maxRandomnessOffset: 0.15 },
  { maxSize: 28, roughness: 0.5, bowing: 0.5, strokeWidth: 2.2, maxRandomnessOffset: 0.2 },
  { maxSize: Infinity, roughness: 0.7, bowing: 0.6, strokeWidth: 2, maxRandomnessOffset: 0.3 },
];
const WIREFRAME_ICON_SHAPES = ${JSON.stringify(PREPARED_WIREFRAME_ICONS)};

const readIconName = (element) => element.getAttribute("data-icon");

const readIconTone = (element) => {
  const isDisabled = window.SketchWireframe.readStatus(element) === "disabled";
  if (isDisabled) return DISABLED_TONE;

  return window.SketchWireframe.readTone(element);
};

const isDirectionalIconMirrored = (element, iconName) => {
  const isRightToLeftElement = window.SketchWireframe.isRightToLeft(element);
  const isDirectionalIcon = DIRECTIONAL_ICON_NAMES.includes(iconName);
  return isRightToLeftElement && isDirectionalIcon;
};

const insetBoxBy = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

const pickIconLook = (iconSize) => ICON_LOOKS_BY_MAX_SIZE.find((look) => iconSize <= look.maxSize);

const createIconRoughStyle = (style, look) => ({
  stroke: SKETCH_TONES[style.tone],
  strokeWidth: look.strokeWidth,
  roughness: look.roughness,
  bowing: look.bowing,
  maxRandomnessOffset: look.maxRandomnessOffset,
  seed: style.seed,
});

const createIconLayer = (layer, box, isMirrored) => {
  const iconLayer = window.SketchWireframe.createScaledLayer(layer, box, ICON_GRID_SIZE);
  const isDrawnAsIs = !isMirrored;
  if (isDrawnAsIs) return iconLayer;

  const scale = Math.min(box.w, box.h) / ICON_GRID_SIZE;
  const mirroredLeft = box.x + ICON_GRID_SIZE * scale;

  iconLayer.svg.setAttribute("transform", "translate(" + mirroredLeft + " " + box.y + ") scale(" + -scale + " " + scale + ")");

  return iconLayer;
};

const readPointPairs = (pointsAttribute) => {
  const coordinates = pointsAttribute.trim().split(/[\\s,]+/).map(Number);
  const xCoordinates = coordinates.filter((_coordinate, index) => index % 2 === 0);
  return xCoordinates.map((xCoordinate, pairIndex) => [xCoordinate, coordinates[pairIndex * 2 + 1]]);
};

const createRoundedRectanglePath = (attributes) => {
  const { x, y, width, height, rx } = attributes;
  const right = x + width;
  const bottom = y + height;
  const arcTo = (endX, endY) => "A " + rx + " " + rx + " 0 0 1 " + endX + " " + endY;
  return [
    "M " + (x + rx) + " " + y,
    "H " + (right - rx),
    arcTo(right, y + rx),
    "V " + (bottom - rx),
    arcTo(right - rx, bottom),
    "H " + (x + rx),
    arcTo(x, bottom - rx),
    "V " + (y + rx),
    arcTo(x + rx, y),
    "Z",
  ].join(" ");
};

const drawRectangle = (rough, attributes, roughStyle) => {
  const cornerRadius = attributes.rx ?? 0;
  const isRounded = cornerRadius > 0;
  if (isRounded) return rough.path(createRoundedRectanglePath({ ...attributes, rx: cornerRadius }), roughStyle);

  return rough.rectangle(attributes.x, attributes.y, attributes.width, attributes.height, roughStyle);
};

const SHAPE_DRAWERS = {
  path: (rough, attributes, roughStyle) => rough.path(attributes.d, roughStyle),
  circle: (rough, attributes, roughStyle) =>
    rough.circle(attributes.cx, attributes.cy, attributes.r * 2, roughStyle),
  ellipse: (rough, attributes, roughStyle) =>
    rough.ellipse(attributes.cx, attributes.cy, attributes.rx * 2, attributes.ry * 2, roughStyle),
  rect: drawRectangle,
  line: (rough, attributes, roughStyle) =>
    rough.line(attributes.x1, attributes.y1, attributes.x2, attributes.y2, roughStyle),
  polyline: (rough, attributes, roughStyle) => rough.linearPath(readPointPairs(attributes.points), roughStyle),
  polygon: (rough, attributes, roughStyle) => rough.polygon(readPointPairs(attributes.points), roughStyle),
};

const appendDot = (iconLayer, attributes, color) => {
  const dotNode = document.createElementNS(SVG_NAMESPACE, "circle");
  dotNode.setAttribute("cx", attributes.cx);
  dotNode.setAttribute("cy", attributes.cy);
  dotNode.setAttribute("r", attributes.r);
  dotNode.setAttribute("fill", color);
  dotNode.setAttribute("stroke", "none");
  iconLayer.svg.append(dotNode);
};

const drawShape = (iconLayer, shape, roughStyle) => {
  const isDot = shape.tag === "dot";
  if (isDot) return appendDot(iconLayer, shape.attributes, roughStyle.stroke);

  const shapeNode = SHAPE_DRAWERS[shape.tag](iconLayer.rough, shape.attributes, roughStyle);
  iconLayer.svg.append(shapeNode);
};

const drawIcon = (layer, box, iconName, style) => {
  const shapes = WIREFRAME_ICON_SHAPES[iconName];
  const isIconMissing = shapes === undefined;
  if (isIconMissing) return;

  const iconSize = Math.min(box.w, box.h);
  const look = pickIconLook(iconSize);

  const iconLayer = createIconLayer(layer, box, style.isMirrored);
  for (const [shapeIndex, shape] of shapes.entries()) {
    const roughStyle = createIconRoughStyle({ tone: style.tone, seed: style.seed + shapeIndex }, look);
    drawShape(iconLayer, shape, roughStyle);
  }
};
window.SketchWireframe.icon = drawIcon;

window.SketchWireframe.definePart("sk-icon", (drawing) => {
  const { element, box, seed, under } = drawing;
  const iconName = readIconName(element);

  const style = {
    tone: readIconTone(element),
    seed,
    isMirrored: isDirectionalIconMirrored(element, iconName),
  };

  drawIcon(under, box, iconName, style);
});

window.SketchWireframe.definePart("sk-icon-tile", (drawing) => {
  const { roundedRectangle, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fillName = readFill(element) ?? DEFAULT_ICON_FILL;
  const iconName = readIconName(element);

  roundedRectangle(under, box, { tone: "soft", fill: fillName, seed });

  const iconBox = insetBoxBy(box, Math.min(box.w, box.h) * TILE_ICON_INSET_RATIO);
  const style = {
    tone: readIconTone(element),
    seed: seed + 1,
    isMirrored: isDirectionalIconMirrored(element, iconName),
  };

  drawIcon(under, iconBox, iconName, style);
});

window.SketchWireframe.definePart("sk-featured-icon", (drawing) => {
  const { circle, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fillName = readFill(element) ?? DEFAULT_ICON_FILL;
  const iconName = readIconName(element);

  const discBox = insetBoxBy(box, Math.min(box.w, box.h) * FEATURED_DISC_INSET_RATIO);
  circle(under, discBox, { tone: "soft", fill: fillName, seed });
  circle(under, box, { tone: "soft", seed: seed + 1 });

  const iconBox = insetBoxBy(box, Math.min(box.w, box.h) * FEATURED_ICON_INSET_RATIO);
  const style = {
    tone: readIconTone(element),
    seed: seed + 2,
    isMirrored: isDirectionalIconMirrored(element, iconName),
  };

  drawIcon(under, iconBox, iconName, style);
});
`;

export const ICONS_PART_STYLE = `:where(.sk-icon) {
  display: inline-block;
  min-width: 1.5rem;
  min-height: 1.5rem;
  border: 1.6px solid transparent;
  vertical-align: middle;
}

:where(.sk-icon-tile) {
  display: inline-block;
  min-width: 3rem;
  min-height: 3rem;
  border: 1.6px solid transparent;
  vertical-align: middle;
}

:where(.sk-featured-icon) {
  display: inline-block;
  min-width: 3.5rem;
  min-height: 3.5rem;
  border: 1.6px solid transparent;
  vertical-align: middle;
}
`;
