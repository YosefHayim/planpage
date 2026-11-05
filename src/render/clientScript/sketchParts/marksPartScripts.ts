export const MARKS_PART_SCRIPT = `
const DEFAULT_TAP_RING_COUNT = 1;
const TAP_DOT_RATIO = 0.5;
const DEFAULT_RIPPLE_RING_COUNT = 2;
const RIPPLE_INNER_RATIO = 0.4;
const DEFAULT_CALLOUT_FILL = "yellow";
const DEFAULT_STICKY_FILL = "yellow";
const DEFAULT_HIGHLIGHT_FILL = "yellow";
const HIGHLIGHT_TOP_RATIO = 0.55;
const HIGHLIGHT_BOTTOM_RATIO = 0.95;
const HIGHLIGHT_BAND_OPACITY = 0.7;
const HIGHLIGHT_BAND_COLORS = { yellow: "#ffd43b", green: "#8ce99a", blue: "#74c0fc", orange: "#ffa94d", red: "#ff8787", grey: "#ced4da" };
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const TAP_DOT_COLOR = "#1971c2";

const drawSolidDot = (layer, box, color) => {
  const dotShape = document.createElementNS(SVG_NAMESPACE, "circle");
  dotShape.setAttribute("cx", box.x + box.w / 2);
  dotShape.setAttribute("cy", box.y + box.h / 2);
  dotShape.setAttribute("r", Math.min(box.w, box.h) / 2);
  dotShape.setAttribute("fill", color);
  layer.svg.append(dotShape);
};

const drawSolidBand = (layer, box, color, opacity) => {
  const bandShape = document.createElementNS(SVG_NAMESPACE, "rect");
  bandShape.setAttribute("x", box.x);
  bandShape.setAttribute("y", box.y);
  bandShape.setAttribute("width", box.w);
  bandShape.setAttribute("height", box.h);
  bandShape.setAttribute("fill", color);
  bandShape.setAttribute("fill-opacity", opacity);
  layer.svg.append(bandShape);
};
const STRIKE_OVERHANG_RATIO = 0.04;
const STRIKE_START_Y_RATIO = 0.55;
const STRIKE_END_Y_RATIO = 0.45;
const STICKY_FOLD_RATIO = 0.18;
const TAPE_HALF_WIDTH_RATIO = 0.3;
const TAPE_HALF_HEIGHT_RATIO = 0.12;
const STAMP_INNER_INSET_RATIO = 0.06;
const MEASURE_LINE_RATIO = 0.82;
const MEASURE_TICK_RATIO = 0.3;
const SWIPE_START_RATIO = 0.85;
const SWIPE_END_RATIO = 0.15;
const SWIPE_DOT_RATIO = 0.25;
const SWIPE_HEAD_RATIO = 0.2;
const ANNOTATION_HEAD_LENGTH_RATIO = 0.22;
const ANNOTATION_HEAD_ANGLE_RADIANS = 0.45;
const MATRIX_PREFIX_LENGTH = "matrix(".length;
const CURSOR_POINT_RATIOS = [
  { x: 0, y: 0 },
  { x: 0, y: 0.9 },
  { x: 0.25, y: 0.7 },
  { x: 0.42, y: 1 },
  { x: 0.56, y: 0.93 },
  { x: 0.4, y: 0.64 },
  { x: 0.72, y: 0.64 },
];

const pickCenteredBox = (box, sideRatio) => {
  const side = Math.min(box.w, box.h) * sideRatio;
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  return { x: centerX - side / 2, y: centerY - side / 2, w: side, h: side };
};

const pickSquareAround = (point, side) => ({
  x: point.x - side / 2,
  y: point.y - side / 2,
  w: side,
  h: side,
});

const placeRatioPoints = (box, ratioPoints) =>
  ratioPoints.map((ratioPoint) => ({
    x: box.x + box.w * ratioPoint.x,
    y: box.y + box.h * ratioPoint.y,
  }));

const pickMirroredX = (box, ratio, isRight) => {
  const fromLeftX = box.x + box.w * ratio;
  const fromRightX = box.x + box.w * (1 - ratio);
  return isRight ? fromRightX : fromLeftX;
};

const drawRingsInBox = (layer, box, ringCount, innerRatio, seed) => {
  const { circle } = window.SketchWireframe;
  const ringIndexes = [...Array(ringCount).keys()];
  const ringStep = (1 - innerRatio) / ringCount;

  for (const ringIndex of ringIndexes) {
    const ringRatio = innerRatio + ringStep * (ringIndex + 1);
    circle(layer, pickCenteredBox(box, ringRatio), { tone: "blue", seed: seed + ringIndex });
  }
};

const readTiltRadians = (element) => {
  const transformText = window.getComputedStyle(element).transform;
  const isNotTilted = transformText === "none";
  if (isNotTilted) return 0;

  const matrixValues = transformText.slice(MATRIX_PREFIX_LENGTH, -1).split(", ").map(Number);
  const [cosineValue, sineValue] = matrixValues;
  return Math.atan2(sineValue, cosineValue);
};

const pickTiltedFrame = (element, box) => {
  const angle = readTiltRadians(element);
  const cosine = Math.abs(Math.cos(angle));
  const sine = Math.abs(Math.sin(angle));
  const boundingWidthInCssPixels = element.offsetWidth * cosine + element.offsetHeight * sine;
  const scale = box.w / boundingWidthInCssPixels;

  return {
    angle,
    center: { x: box.x + box.w / 2, y: box.y + box.h / 2 },
    halfWidth: (element.offsetWidth * scale) / 2,
    halfHeight: (element.offsetHeight * scale) / 2,
  };
};

const placeTiltedPoint = (frame, offsetX, offsetY) => {
  const cosine = Math.cos(frame.angle);
  const sine = Math.sin(frame.angle);
  return {
    x: frame.center.x + offsetX * cosine - offsetY * sine,
    y: frame.center.y + offsetX * sine + offsetY * cosine,
  };
};

const placeTiltedRectangle = (frame, edges) => [
  placeTiltedPoint(frame, edges.left, edges.top),
  placeTiltedPoint(frame, edges.right, edges.top),
  placeTiltedPoint(frame, edges.right, edges.bottom),
  placeTiltedPoint(frame, edges.left, edges.bottom),
];

const pickInsetEdges = (frame, inset) => ({
  left: -frame.halfWidth + inset,
  top: -frame.halfHeight + inset,
  right: frame.halfWidth - inset,
  bottom: frame.halfHeight - inset,
});

window.SketchWireframe.definePart("sk-tap-marker", (drawing) => {
  const { readCount } = window.SketchWireframe;
  const { element, box, seed, over } = drawing;
  const ringCount = readCount(element, DEFAULT_TAP_RING_COUNT);
  const dotBox = pickCenteredBox(box, TAP_DOT_RATIO);

  drawSolidDot(over, dotBox, TAP_DOT_COLOR);
  drawRingsInBox(over, box, ringCount, TAP_DOT_RATIO, seed + 1);
});

window.SketchWireframe.definePart("sk-cursor", (drawing) => {
  const { polygon } = window.SketchWireframe;
  const { box, seed, over } = drawing;

  polygon(over, placeRatioPoints(box, CURSOR_POINT_RATIOS), { tone: "ink", fill: "grey", seed });
});

window.SketchWireframe.definePart("sk-click-ripple", (drawing) => {
  const { readCount } = window.SketchWireframe;
  const { element, box, seed, over } = drawing;
  const ringCount = readCount(element, DEFAULT_RIPPLE_RING_COUNT);

  drawRingsInBox(over, box, ringCount, RIPPLE_INNER_RATIO, seed);
});

window.SketchWireframe.definePart("sk-focus-ring", (drawing) => {
  const { roundedRectangle } = window.SketchWireframe;
  const { box, seed, over } = drawing;

  roundedRectangle(over, box, { tone: "blue", dashed: true, seed });
});

window.SketchWireframe.definePart("sk-numbered-callout", (drawing) => {
  const { circle, readFill, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const calloutFill = readFill(element) ?? DEFAULT_CALLOUT_FILL;

  circle(under, box, { tone: readTone(element), fill: calloutFill, seed });
});

window.SketchWireframe.definePart("sk-highlight-marker", (drawing) => {
  const { readFill } = window.SketchWireframe;
  const { element, box, under } = drawing;
  const highlightBox = {
    x: box.x,
    y: box.y + box.h * HIGHLIGHT_TOP_RATIO,
    w: box.w,
    h: box.h * (HIGHLIGHT_BOTTOM_RATIO - HIGHLIGHT_TOP_RATIO),
  };
  const highlightFill = readFill(element) ?? DEFAULT_HIGHLIGHT_FILL;

  drawSolidBand(under, highlightBox, HIGHLIGHT_BAND_COLORS[highlightFill], HIGHLIGHT_BAND_OPACITY);
});

window.SketchWireframe.definePart("sk-redline-strike", (drawing) => {
  const { line, readTone } = window.SketchWireframe;
  const { element, box, seed, over } = drawing;
  const overhang = box.w * STRIKE_OVERHANG_RATIO;
  const strikeStart = { x: box.x - overhang, y: box.y + box.h * STRIKE_START_Y_RATIO };
  const strikeEnd = { x: box.x + box.w + overhang, y: box.y + box.h * STRIKE_END_Y_RATIO };

  line(over, strikeStart, strikeEnd, { tone: readTone(element), seed });
});

window.SketchWireframe.definePart("sk-error-outline", (drawing) => {
  const { roundedRectangle, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;

  roundedRectangle(under, box, { tone: "red", fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-sticky-note", (drawing) => {
  const { roundedRectangle, line, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const noteFill = readFill(element) ?? DEFAULT_STICKY_FILL;
  const foldSize = Math.min(box.w, box.h) * STICKY_FOLD_RATIO;
  const foldStart = { x: box.x + box.w - foldSize, y: box.y + box.h };
  const foldEnd = { x: box.x + box.w, y: box.y + box.h - foldSize };

  roundedRectangle(under, box, { tone: "ink", fill: noteFill, seed });
  line(under, foldStart, foldEnd, { tone: "ink", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-taped-note", (drawing) => {
  const { polygon } = window.SketchWireframe;
  const { element, box, seed, under, over } = drawing;
  const frame = pickTiltedFrame(element, box);
  const paperEdges = pickInsetEdges(frame, 0);
  const tapeHalfWidth = frame.halfWidth * TAPE_HALF_WIDTH_RATIO;
  const tapeHalfHeight = frame.halfHeight * TAPE_HALF_HEIGHT_RATIO;
  const tapeEdges = {
    left: -tapeHalfWidth,
    right: tapeHalfWidth,
    top: -frame.halfHeight - tapeHalfHeight,
    bottom: -frame.halfHeight + tapeHalfHeight,
  };

  polygon(under, placeTiltedRectangle(frame, paperEdges), { tone: "ink", seed });
  polygon(over, placeTiltedRectangle(frame, tapeEdges), { tone: "soft", fill: "blue", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-stamp", (drawing) => {
  const { polygon, readTone } = window.SketchWireframe;
  const { element, box, seed, over } = drawing;
  const frame = pickTiltedFrame(element, box);
  const innerInset = Math.min(frame.halfWidth, frame.halfHeight) * STAMP_INNER_INSET_RATIO;
  const stampTone = readTone(element);

  polygon(over, placeTiltedRectangle(frame, pickInsetEdges(frame, 0)), { tone: stampTone, seed });
  polygon(over, placeTiltedRectangle(frame, pickInsetEdges(frame, innerInset)), {
    tone: stampTone,
    seed: seed + 1,
  });
});

window.SketchWireframe.definePart("sk-measure", (drawing) => {
  const { line } = window.SketchWireframe;
  const { box, seed, over } = drawing;
  const lineY = box.y + box.h * MEASURE_LINE_RATIO;
  const tickHalfHeight = (box.h * MEASURE_TICK_RATIO) / 2;
  const leftX = box.x;
  const rightX = box.x + box.w;

  line(over, { x: leftX, y: lineY }, { x: rightX, y: lineY }, { tone: "blue", seed });
  line(over, { x: leftX, y: lineY - tickHalfHeight }, { x: leftX, y: lineY + tickHalfHeight }, { tone: "blue", seed: seed + 1 });
  line(over, { x: rightX, y: lineY - tickHalfHeight }, { x: rightX, y: lineY + tickHalfHeight }, { tone: "blue", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-swipe-arrow", (drawing) => {
  const { line, chevron, circle, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, over } = drawing;
  const isRight = isRightToLeft(element);
  const centerY = box.y + box.h / 2;
  const startX = pickMirroredX(box, SWIPE_START_RATIO, isRight);
  const endX = pickMirroredX(box, SWIPE_END_RATIO, isRight);
  const headWidth = Math.min(box.w, box.h) * SWIPE_HEAD_RATIO;
  const headHalfHeight = box.h * SWIPE_HEAD_RATIO;
  const headX = isRight ? endX - headWidth : endX;
  const headDirection = isRight ? "right" : "left";
  const dotSide = Math.min(box.w, box.h) * SWIPE_DOT_RATIO;

  line(over, { x: startX, y: centerY }, { x: endX, y: centerY }, { tone: "blue", seed });
  chevron(over, { x: headX, y: centerY - headHalfHeight, w: headWidth, h: headHalfHeight * 2 }, headDirection, { tone: "blue", seed: seed + 1 });
  circle(over, pickSquareAround({ x: startX, y: centerY }, dotSide), { tone: "blue", fill: "blue", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-annotation-arrow", (drawing) => {
  const { path, polyline, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, over } = drawing;
  const isRight = isRightToLeft(element);
  const startPoint = { x: pickMirroredX(box, 0.08, isRight), y: box.y + box.h * 0.92 };
  const controlPoint = { x: pickMirroredX(box, 0.08, isRight), y: box.y + box.h * 0.2 };
  const endPoint = { x: pickMirroredX(box, 0.85, isRight), y: box.y + box.h * 0.2 };
  const pathData =
    "M " + startPoint.x + " " + startPoint.y + " Q " + controlPoint.x + " " + controlPoint.y + " " + endPoint.x + " " + endPoint.y;
  const headLength = Math.min(box.w, box.h) * ANNOTATION_HEAD_LENGTH_RATIO;
  const headAngle = Math.atan2(endPoint.y - controlPoint.y, endPoint.x - controlPoint.x);
  const headBackAngleA = headAngle + Math.PI - ANNOTATION_HEAD_ANGLE_RADIANS;
  const headBackAngleB = headAngle + Math.PI + ANNOTATION_HEAD_ANGLE_RADIANS;
  const headPointA = {
    x: endPoint.x + headLength * Math.cos(headBackAngleA),
    y: endPoint.y + headLength * Math.sin(headBackAngleA),
  };
  const headPointB = {
    x: endPoint.x + headLength * Math.cos(headBackAngleB),
    y: endPoint.y + headLength * Math.sin(headBackAngleB),
  };

  path(over, pathData, { tone: "blue", seed });
  polyline(over, [headPointA, endPoint, headPointB], { tone: "blue", seed: seed + 1 });
});

`;

export const MARKS_PART_STYLE = `:where(.sk-tap-marker, .sk-click-ripple, .sk-cursor, .sk-swipe-arrow, .sk-annotation-arrow) {
  display: block;
  min-width: 2.5rem;
  min-height: 2.5rem;
  border: 1.6px solid transparent;
}

:where(.sk-cursor) {
  min-width: 1.25rem;
  min-height: 1.75rem;
}

:where(.sk-tap-marker) {
  width: 2.4em;
  height: 2.4em;
  min-width: 0;
  min-height: 0;
}

:where(.sk-click-ripple) {
  width: 2.5em;
  height: 2.5em;
  min-width: 0;
  min-height: 0;
}

:where(.sk-annotation-arrow) {
  min-width: 6rem;
  min-height: 4rem;
}

:where(.sk-swipe-arrow) {
  min-width: 5rem;
}

:where(.sk-focus-ring) {
  display: block;
  border: 1.6px solid transparent;
  border-radius: 0.6rem;
}

:where(.sk-numbered-callout) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  min-height: 1.75rem;
  border: 1.6px solid transparent;
  border-radius: 999px;
  font-weight: 700;
}

:where(.sk-highlight-marker) {
  color: #1b1f23;
}

:where(.sk-highlight-marker, .sk-redline-strike) {
  display: inline-block;
  padding: 0 0.2rem;
  border: 1.6px solid transparent;
}

:where(.sk-error-outline) {
  display: block;
  border: 1.6px solid transparent;
  border-radius: 0.6rem;
}

:where(.sk-sticky-note) {
  display: block;
  min-width: 8rem;
  min-height: 6rem;
  padding: 0.75rem;
  font-size: 1.1rem;
  border: 1.6px solid transparent;
}

:where(.sk-taped-note) {
  display: block;
  min-width: 9rem;
  min-height: 6rem;
  padding: 1rem;
  border: 1.6px solid transparent;
  transform: rotate(-2deg);
}

:where(.sk-stamp) {
  display: inline-block;
  margin: 0.5rem;
  padding: 0.25rem 0.9rem;
  border: 1.6px solid transparent;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: inherit;
  transform: rotate(-6deg);
}

:where(.sk-measure) {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-width: 2rem;
  min-height: 2.25rem;
  padding-top: 0.25rem;
  border: 1.6px solid transparent;
  font-size: 0.95rem;
}
`;
