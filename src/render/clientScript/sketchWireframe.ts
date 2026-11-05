import { SKETCH_LOOK } from "./sketchLook";
import { CHARTS_PART_SCRIPT, CHARTS_PART_STYLE } from "./sketchParts/chartsPartScripts";
import { CONTENT_PART_SCRIPT, CONTENT_PART_STYLE } from "./sketchParts/contentPartScripts";
import { CONTROLS_PART_SCRIPT, CONTROLS_PART_STYLE } from "./sketchParts/controlsPartScripts";
import { FRAMES_PART_SCRIPT, FRAMES_PART_STYLE } from "./sketchParts/framesPartScripts";
import { ICONS_PART_SCRIPT, ICONS_PART_STYLE } from "./sketchParts/iconsPartScripts";
import { MARKS_PART_SCRIPT, MARKS_PART_STYLE } from "./sketchParts/marksPartScripts";
import { NAVIGATION_PART_SCRIPT, NAVIGATION_PART_STYLE } from "./sketchParts/navigationPartScripts";
import { OVERLAYS_PART_SCRIPT, OVERLAYS_PART_STYLE } from "./sketchParts/overlaysPartScripts";

const PART_SCRIPTS = [
  CONTROLS_PART_SCRIPT,
  NAVIGATION_PART_SCRIPT,
  OVERLAYS_PART_SCRIPT,
  CONTENT_PART_SCRIPT,
  CHARTS_PART_SCRIPT,
  FRAMES_PART_SCRIPT,
  MARKS_PART_SCRIPT,
  ICONS_PART_SCRIPT,
];

const PART_STYLES = [
  CONTROLS_PART_STYLE,
  NAVIGATION_PART_STYLE,
  OVERLAYS_PART_STYLE,
  CONTENT_PART_STYLE,
  CHARTS_PART_STYLE,
  FRAMES_PART_STYLE,
  MARKS_PART_STYLE,
  ICONS_PART_STYLE,
];

// Each part script runs in its own block so its helper names never clash with another group.
const PART_BLOCKS = PART_SCRIPTS.map((partScript) => `{\n${partScript}\n}`).join("\n");

const WIREFRAME_CORE_SCRIPT = `
const SKETCH_TONES = ${JSON.stringify(SKETCH_LOOK.tones)};
const SKETCH_FILLS = ${JSON.stringify(SKETCH_LOOK.pastelFills)};
const ROUGHNESS_SHAPE = ${SKETCH_LOOK.roughnessShape};
const BOWING = ${SKETCH_LOOK.bowing};
const STROKE_WIDTH = ${SKETCH_LOOK.strokeWidth};
const DASH_PATTERN = ${JSON.stringify(SKETCH_LOOK.dashPattern)};
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const WIREFRAME_SELECTOR = ".sk-wireframe";
const LAYER_CLASS = "sk-wireframe-layer";
const DEFAULT_TONE = "ink";
const ROUNDED_CORNER_RATIO = 0.12;
const PERCENT_MAX = 100;
const drawers = new Map();
const watchedRoots = new WeakSet();
const pendingRoots = new Set();
const drawSchedule = { isReady: false, isFrameQueued: false };

const readRoughStyle = (style) => {
  const fillName = style.fill ?? "none";
  const isFilled = fillName !== "none";
  const isDashed = style.dashed === true;
  return {
    stroke: SKETCH_TONES[style.tone ?? DEFAULT_TONE],
    strokeWidth: STROKE_WIDTH,
    roughness: ROUGHNESS_SHAPE,
    bowing: BOWING,
    seed: style.seed,
    fill: isFilled ? SKETCH_FILLS[fillName] : undefined,
    fillStyle: "solid",
    strokeLineDash: isDashed ? DASH_PATTERN : undefined,
  };
};

const appendToLayer = (layer, shape) => {
  layer.svg.append(shape);
};

const createRoundedRectanglePath = (box, cornerRatio) => {
  const radius = Math.min(box.w, box.h) * cornerRatio;
  const right = box.x + box.w;
  const bottom = box.y + box.h;
  return [
    "M", box.x + radius, box.y,
    "H", right - radius,
    "Q", right, box.y, right, box.y + radius,
    "V", bottom - radius,
    "Q", right, bottom, right - radius, bottom,
    "H", box.x + radius,
    "Q", box.x, bottom, box.x, bottom - radius,
    "V", box.y + radius,
    "Q", box.x, box.y, box.x + radius, box.y,
    "Z",
  ].join(" ");
};

const CHEVRON_POINTS = {
  down: (box) => [
    { x: box.x, y: box.y },
    { x: box.x + box.w / 2, y: box.y + box.h },
    { x: box.x + box.w, y: box.y },
  ],
  up: (box) => [
    { x: box.x, y: box.y + box.h },
    { x: box.x + box.w / 2, y: box.y },
    { x: box.x + box.w, y: box.y + box.h },
  ],
  left: (box) => [
    { x: box.x + box.w, y: box.y },
    { x: box.x, y: box.y + box.h / 2 },
    { x: box.x + box.w, y: box.y + box.h },
  ],
  right: (box) => [
    { x: box.x, y: box.y },
    { x: box.x + box.w, y: box.y + box.h / 2 },
    { x: box.x, y: box.y + box.h },
  ],
};

const TICK_POINT_RATIOS = [
  { x: 0, y: 0.55 },
  { x: 0.38, y: 0.9 },
  { x: 1, y: 0.1 },
];

const rectangle = (layer, box, style) => {
  appendToLayer(layer, layer.rough.rectangle(box.x, box.y, box.w, box.h, readRoughStyle(style)));
};

const roundedRectangle = (layer, box, style) => {
  appendToLayer(layer, layer.rough.path(createRoundedRectanglePath(box, ROUNDED_CORNER_RATIO), readRoughStyle(style)));
};

const solidFill = (layer, box, style) => {
  const fillPath = createRoundedRectanglePath(box, style.cornerRatio ?? 0);
  const solidShape = layer.rough.path(fillPath, {
    fill: style.color,
    fillStyle: "solid",
    stroke: "none",
    roughness: 0,
    bowing: 0,
  });

  appendToLayer(layer, solidShape);
};

const line = (layer, from, to, style) => {
  appendToLayer(layer, layer.rough.line(from.x, from.y, to.x, to.y, readRoughStyle(style)));
};

const circle = (layer, box, style) => {
  const diameter = Math.min(box.w, box.h);
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  appendToLayer(layer, layer.rough.circle(centerX, centerY, diameter, readRoughStyle(style)));
};

const ellipse = (layer, box, style) => {
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  appendToLayer(layer, layer.rough.ellipse(centerX, centerY, box.w, box.h, readRoughStyle(style)));
};

const path = (layer, pathData, style) => {
  appendToLayer(layer, layer.rough.path(pathData, readRoughStyle(style)));
};

const toPointPairs = (points) => points.map((point) => [point.x, point.y]);

const polyline = (layer, points, style) => {
  appendToLayer(layer, layer.rough.linearPath(toPointPairs(points), readRoughStyle(style)));
};

const polygon = (layer, points, style) => {
  appendToLayer(layer, layer.rough.polygon(toPointPairs(points), readRoughStyle(style)));
};

const chevron = (layer, box, direction, style) => {
  const chevronPoints = CHEVRON_POINTS[direction](box);
  polyline(layer, chevronPoints, style);
};

const tick = (layer, box, style) => {
  const tickPoints = TICK_POINT_RATIOS.map((ratio) => ({
    x: box.x + box.w * ratio.x,
    y: box.y + box.h * ratio.y,
  }));
  polyline(layer, tickPoints, style);
};

const cross = (layer, box, style) => {
  line(layer, { x: box.x, y: box.y }, { x: box.x + box.w, y: box.y + box.h }, style);
  line(layer, { x: box.x + box.w, y: box.y }, { x: box.x, y: box.y + box.h }, style);
};

const createScaledLayer = (layer, box, gridSize) => {
  const scale = Math.min(box.w, box.h) / gridSize;
  const group = document.createElementNS(SVG_NAMESPACE, "g");
  group.setAttribute("transform", "translate(" + box.x + " " + box.y + ") scale(" + scale + ")");
  appendToLayer(layer, group);
  return { svg: group, rough: layer.rough };
};

const readStatus = (element) => element.dataset.status ?? null;

const isChecked = (element) => element.hasAttribute("data-checked");

const readPercent = (element) => {
  const percentText = element.dataset.percent;
  const isPercentMissing = percentText === undefined || percentText === "";
  if (isPercentMissing) return null;

  const percent = Number(percentText);
  const isPercentNumber = Number.isFinite(percent);
  if (!isPercentNumber) return null;

  return Math.min(PERCENT_MAX, Math.max(0, percent));
};

const readCount = (element, fallbackCount) => {
  const countText = element.dataset.count;
  const isCountMissing = countText === undefined || countText === "";
  if (isCountMissing) return fallbackCount;

  const count = Number(countText);
  const isCountNumber = Number.isFinite(count);
  return isCountNumber ? count : fallbackCount;
};

const readTone = (element) => element.dataset.tone ?? DEFAULT_TONE;

const readFill = (element) => element.dataset.fill ?? null;

const isRightToLeft = (element) => {
  const direction = window.getComputedStyle(element).direction;
  return direction === "rtl";
};

window.SketchWireframe = {
  definePart: (className, drawPart) => {
    drawers.set(className, drawPart);
  },
  rectangle,
  roundedRectangle,
  solidFill,
  line,
  circle,
  ellipse,
  path,
  polyline,
  polygon,
  chevron,
  tick,
  cross,
  createScaledLayer,
  readStatus,
  isChecked,
  readPercent,
  readCount,
  readTone,
  readFill,
  isRightToLeft,
};

const removeLayers = (root) => {
  for (const layer of root.querySelectorAll(":scope > ." + LAYER_CLASS)) layer.remove();
};

const placeLayer = (root, svg, isUnder) => {
  if (isUnder) {
    root.prepend(svg);
    return;
  }

  root.append(svg);
};

const createLayer = (root, isUnder) => {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  const layerRole = isUnder ? "sk-wireframe-under" : "sk-wireframe-over";
  svg.setAttribute("class", LAYER_CLASS + " " + layerRole);
  svg.setAttribute("viewBox", "0 0 " + root.offsetWidth + " " + root.offsetHeight);
  svg.setAttribute("aria-hidden", "true");
  placeLayer(root, svg, isUnder);
  return { svg, rough: window.rough.svg(svg) };
};

const measureBox = (element, rootRect, scale) => {
  const elementRect = element.getBoundingClientRect();
  return {
    x: (elementRect.left - rootRect.left) / scale,
    y: (elementRect.top - rootRect.top) / scale,
    w: elementRect.width / scale,
    h: elementRect.height / scale,
  };
};

const findPartElements = (root) => {
  const partClassNames = [...drawers.keys()];
  const selector = partClassNames.map((className) => "." + className).join(", ");
  const candidates = [...root.querySelectorAll(selector)];
  const ownElements = candidates.filter((element) => element.closest(WIREFRAME_SELECTOR) === root);
  return ownElements.map((element) => ({
    element,
    className: partClassNames.find((className) => element.classList.contains(className)),
  }));
};

const drawRoot = (root) => {
  const isRootHidden = root.offsetWidth === 0;
  if (isRootHidden) {
    delete root.dataset.drawn;
    return;
  }

  removeLayers(root);
  const under = createLayer(root, true);
  const over = createLayer(root, false);
  const rootRect = root.getBoundingClientRect();
  const scale = rootRect.width / root.offsetWidth;

  const partElements = findPartElements(root);
  for (const [index, { element, className }] of partElements.entries()) {
    const drawing = {
      element,
      box: measureBox(element, rootRect, scale),
      seed: index + 1,
      under,
      over,
    };
    drawers.get(className)(drawing);
  }
  root.dataset.drawn = "true";
};

const drawPendingRoots = () => {
  drawSchedule.isFrameQueued = false;
  const isWireframeReady = drawSchedule.isReady;
  if (!isWireframeReady) return;

  for (const root of pendingRoots) drawRoot(root);
  pendingRoots.clear();
};

const queueRoot = (root) => {
  pendingRoots.add(root);
  const isFrameAlreadyQueued = drawSchedule.isFrameQueued;
  if (isFrameAlreadyQueued) return;

  drawSchedule.isFrameQueued = true;
  requestAnimationFrame(drawPendingRoots);
};

const queueAllRoots = () => {
  for (const root of document.querySelectorAll(WIREFRAME_SELECTOR)) queueRoot(root);
};

const resizeObserver = new ResizeObserver((resizeReports) => {
  for (const report of resizeReports) queueRoot(report.target);
});

const watchRoot = (root) => {
  const isAlreadyWatched = watchedRoots.has(root);
  if (isAlreadyWatched) return;

  watchedRoots.add(root);
  resizeObserver.observe(root);
};

const watchNewRoots = (node) => {
  const isElement = node.nodeType === Node.ELEMENT_NODE;
  if (!isElement) return;

  const isWireframeNode = node.matches(WIREFRAME_SELECTOR);
  if (isWireframeNode) watchRoot(node);
  for (const root of node.querySelectorAll(WIREFRAME_SELECTOR)) watchRoot(root);
};

const waitForRough = () =>
  new Promise((roughLoaded) => {
    const isRoughReady = window.rough !== undefined;
    if (isRoughReady) {
      roughLoaded();
      return;
    }
    document.addEventListener("pp-rough-ready", () => roughLoaded(), { once: true });
  });

const startSketchWireframes = async () => {
  await document.fonts.ready;
  await waitForRough();
  drawSchedule.isReady = true;
  document.fonts.addEventListener("loadingdone", queueAllRoots);
  queueAllRoots();
};

new MutationObserver((mutationList) => {
  for (const mutation of mutationList) {
    for (const addedNode of mutation.addedNodes) watchNewRoots(addedNode);
  }
}).observe(document.body, { childList: true, subtree: true });
watchNewRoots(document.body);
`;
export const SKETCH_WIREFRAME_SCRIPT = `(() => {${WIREFRAME_CORE_SCRIPT}\n${PART_BLOCKS}\nstartSketchWireframes();\n})();`;

const WIREFRAME_CORE_STYLE = `.sk-wireframe {
  position: relative;
  isolation: isolate;
  font-family: "Kalam", cursive;
  color: var(--ink);
}

.sk-wireframe > .sk-wireframe-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.sk-wireframe > .sk-wireframe-under {
  z-index: -1;
}

html.dark .sk-wireframe {
  filter: invert(93%) hue-rotate(180deg);
}

html.dark .sketch-frame .sk-wireframe {
  filter: none;
}
`;

export const SKETCH_WIREFRAME_STYLE = [WIREFRAME_CORE_STYLE, ...PART_STYLES].join("\n");
