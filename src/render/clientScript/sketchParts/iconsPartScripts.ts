import { WIREFRAME_ICONS } from "../../../sketchParts/wireframeIcons";

const WIREFRAME_ICON_SHAPES_JSON = JSON.stringify(WIREFRAME_ICONS);

export const ICONS_PART_SCRIPT = `
const ICON_GRID_SIZE = 24;
const WIREFRAME_ICON_SHAPES = ${WIREFRAME_ICON_SHAPES_JSON};

const parsePoints = (pointsText) =>
  pointsText.split(" ").map((pairText) => {
    const [xText, yText] = pairText.split(",");
    return { x: Number(xText), y: Number(yText) };
  });

const closedPoints = (pointsText) => {
  const points = parsePoints(pointsText);
  return [...points, points[0]];
};

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
  polygon: (layer, attributes, style) => window.SketchWireframe.polyline(layer, closedPoints(attributes.points), style),
};

window.SketchWireframe.definePart("sk-icon", (drawing) => {
  const { createScaledLayer } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const shapes = WIREFRAME_ICON_SHAPES[element.dataset.icon];
  const isIconMissing = shapes === undefined;
  if (isIconMissing) return;

  const iconLayer = createScaledLayer(under, box, ICON_GRID_SIZE);
  const style = { tone: element.dataset.tone ?? "ink", seed };
  shapes.forEach((shape) => SHAPE_DRAWERS[shape.tag](iconLayer, shape.attributes, style));
});
`;

export const ICONS_PART_STYLE = `.sk-icon {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  vertical-align: middle;
}
`;
