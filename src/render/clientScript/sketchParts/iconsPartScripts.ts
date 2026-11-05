import type { SketchIconShape } from "../../../contracts/sketchScene";
import { WIREFRAME_ICONS } from "../../../sketchParts/wireframeIcons";

const ARC_COMMAND_PATTERN = /([aA])([^a-zA-Z]*)/g;
const ARC_NUMBER_PATTERN = /[-+]?(?:\d*\.\d+|\d+\.?)(?:e[-+]?\d+)?/gi;
const ARC_PARAMETER_COUNT = 7;
const ARC_FLAG_INDEXES = [3, 4];
const PACKED_FLAGS_PATTERN = /^[01]\d/;

const expandArcNumbers = (numberTexts: readonly string[]): string[] => {
  const pendingTexts = [...numberTexts];
  const expandedTexts: string[] = [];
  while (pendingTexts.length > 0) {
    const numberText = pendingTexts.shift() ?? "";
    const position = expandedTexts.length % ARC_PARAMETER_COUNT;
    const isFlagPosition = ARC_FLAG_INDEXES.includes(position);
    const isPackedFlag = isFlagPosition && PACKED_FLAGS_PATTERN.test(numberText);
    if (!isPackedFlag) {
      expandedTexts.push(numberText);
      continue;
    }

    expandedTexts.push(numberText.charAt(0));
    pendingTexts.unshift(numberText.slice(1));
  }
  return expandedTexts;
};

const expandCompactArcFlags = (pathData: string): string =>
  pathData.replace(
    ARC_COMMAND_PATTERN,
    (_arcText: string, commandLetter: string, parameterText: string) => {
      const numberTexts = [...parameterText.matchAll(ARC_NUMBER_PATTERN)].map((match) => match[0]);
      return `${commandLetter} ${expandArcNumbers(numberTexts).join(" ")}`;
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

const EXPANDED_WIREFRAME_ICONS = Object.fromEntries(
  Object.entries(WIREFRAME_ICONS).map(([iconName, shapes]) => [
    iconName,
    shapes.map(expandShapeArcFlags),
  ]),
);

export const ICONS_PART_SCRIPT = `
const ICON_GRID_SIZE = 24;
const WIREFRAME_ICON_SHAPES = ${JSON.stringify(EXPANDED_WIREFRAME_ICONS)};

const parsePoints = (pointsText) =>
  pointsText.split(" ").map((pairText) => {
    const [xText, yText] = pairText.split(",");
    return { x: Number(xText), y: Number(yText) };
  });

const SHAPE_DRAWERS = {
  path: (layer, attributes, style) => window.SketchWireframe.path(layer, attributes.d, style),
  circle: (layer, attributes, style) =>
    window.SketchWireframe.circle(
      layer,
      { x: attributes.cx - attributes.r, y: attributes.cy - attributes.r, w: attributes.r * 2, h: attributes.r * 2 },
      style,
    ),
  ellipse: (layer, attributes, style) =>
    window.SketchWireframe.ellipse(
      layer,
      { x: attributes.cx - attributes.rx, y: attributes.cy - attributes.ry, w: attributes.rx * 2, h: attributes.ry * 2 },
      style,
    ),
  rect: (layer, attributes, style) =>
    window.SketchWireframe.rectangle(
      layer,
      { x: attributes.x, y: attributes.y, w: attributes.width, h: attributes.height },
      style,
    ),
  line: (layer, attributes, style) =>
    window.SketchWireframe.line(
      layer,
      { x: attributes.x1, y: attributes.y1 },
      { x: attributes.x2, y: attributes.y2 },
      style,
    ),
  polyline: (layer, attributes, style) => window.SketchWireframe.polyline(layer, parsePoints(attributes.points), style),
  polygon: (layer, attributes, style) => window.SketchWireframe.polygon(layer, parsePoints(attributes.points), style),
};

const drawIcon = (layer, box, iconName, style) => {
  const shapes = WIREFRAME_ICON_SHAPES[iconName];
  const isIconMissing = shapes === undefined;
  if (isIconMissing) return;

  const iconLayer = window.SketchWireframe.createScaledLayer(layer, box, ICON_GRID_SIZE);
  for (const shape of shapes) SHAPE_DRAWERS[shape.tag](iconLayer, shape.attributes, style);
};
window.SketchWireframe.icon = drawIcon;

window.SketchWireframe.definePart("sk-icon", (drawing) => {
  const { element, box, seed, under } = drawing;
  const style = { tone: window.SketchWireframe.readTone(element), seed };
  drawIcon(under, box, element.dataset.icon, style);
});
`;

export const ICONS_PART_STYLE = `:where(.sk-icon) {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
}
`;
