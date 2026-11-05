import { CHARTS_PART_SCRIPT, CHARTS_PART_STYLE } from "./sketchParts/chartsPartScripts";
import { CONTROLS_PART_SCRIPT, CONTROLS_PART_STYLE } from "./sketchParts/controlsPartScripts";
import { CONTENT_PART_SCRIPT, CONTENT_PART_STYLE } from "./sketchParts/contentPartScripts";
import { FRAMES_PART_SCRIPT, FRAMES_PART_STYLE } from "./sketchParts/framesPartScripts";
import { ICONS_PART_SCRIPT, ICONS_PART_STYLE } from "./sketchParts/iconsPartScripts";
import { MARKS_PART_SCRIPT, MARKS_PART_STYLE } from "./sketchParts/marksPartScripts";
import { NAVIGATION_PART_SCRIPT, NAVIGATION_PART_STYLE } from "./sketchParts/navigationPartScripts";
import { OVERLAYS_PART_SCRIPT, OVERLAYS_PART_STYLE } from "./sketchParts/overlaysPartScripts";
import { SKETCH_LOOK } from "./sketchLook";

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
const ROUNDED_CORNER_RATIO = 0.12;
const drawers = new Map();
const watchedRoots = new WeakSet();
const pendingRoots = new Set();
let isWireframeReady = false;
let isFrameQueued = false;

const styleOf = (style) => {
  const isFilled = style.fill !== undefined && style.fill !== "none";
  const isDashed = style.dashed === true;
  return {
    stroke: SKETCH_TONES[style.tone ?? "ink"],
    strokeWidth: STROKE_WIDTH,
    roughness: ROUGHNESS_SHAPE,
    bowing: BOWING,
    seed: style.seed,
    fill: isFilled ? SKETCH_FILLS[style.fill] : undefined,
    fillStyle: "solid",
    strokeLineDash: isDashed ? DASH_PATTERN : undefined,
  };
};

const appendToLayer = (layer, shape) => {
  layer.svg.append(shape);
};

const roundedRectanglePath = (box) => {
  const radius = Math.min(box.w, box.h) * ROUNDED_CORNER_RATIO;
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

const rectangle = (layer, box, style) => {
  appendToLayer(layer, layer.rough.rectangle(box.x, box.y, box.w, box.h, styleOf(style)));
};

const roundedRectangle = (layer, box, style) => {
  appendToLayer(layer, layer.rough.path(roundedRectanglePath(box), styleOf(style)));
};

const line = (layer, from, to, style) => {
  appendToLayer(layer, layer.rough.line(from.x, from.y, to.x, to.y, styleOf(style)));
};

const circle = (layer, box, style) => {
  const diameter = Math.min(box.w, box.h);
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  appendToLayer(layer, layer.rough.circle(centerX, centerY, diameter, styleOf(style)));
};

const ellipse = (layer, box, style) => {
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  appendToLayer(layer, layer.rough.ellipse(centerX, centerY, box.w, box.h, styleOf(style)));
};

const path = (layer, pathData, style) => {
  appendToLayer(layer, layer.rough.path(pathData, styleOf(style)));
};

const polyline = (layer, points, style) => {
  const pointPairs = points.map((point) => [point.x, point.y]);
  appendToLayer(layer, layer.rough.linearPath(pointPairs, styleOf(style)));
};

const chevron = (layer, box, direction, style) => {
  const pointsOf = CHEVRON_POINTS[direction];
  polyline(layer, pointsOf(box), style);
};

const tick = (layer, box, style) => {
  const points = [
    { x: box.x, y: box.y + box.h * 0.55 },
    { x: box.x + box.w * 0.38, y: box.y + box.h * 0.9 },
    { x: box.x + box.w, y: box.y + box.h * 0.1 },
  ];
  polyline(layer, points, style);
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

window.SketchWireframe = {
  definePart: (className, drawPart) => {
    drawers.set(className, drawPart);
  },
  rectangle,
  roundedRectangle,
  line,
  circle,
  ellipse,
  path,
  polyline,
  chevron,
  tick,
  cross,
  createScaledLayer,
};

const removeLayers = (root) => {
  for (const layer of root.querySelectorAll(":scope > ." + LAYER_CLASS)) layer.remove();
};

const createLayer = (root, isUnder, rootWidth, rootHeight) => {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  const layerRole = isUnder ? "sk-wireframe-under" : "sk-wireframe-over";
  svg.setAttribute("class", LAYER_CLASS + " " + layerRole);
  svg.setAttribute("viewBox", "0 0 " + rootWidth + " " + rootHeight);
  svg.setAttribute("aria-hidden", "true");
  if (isUnder) root.prepend(svg);
  if (!isUnder) root.append(svg);
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

const partElementsOf = (root) => {
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
  const under = createLayer(root, true, root.offsetWidth, root.offsetHeight);
  const over = createLayer(root, false, root.offsetWidth, root.offsetHeight);
  const rootRect = root.getBoundingClientRect();
  const scale = rootRect.width / root.offsetWidth;

  const partElements = partElementsOf(root);
  partElements.forEach(({ element, className }, index) => {
    const drawing = {
      element,
      box: measureBox(element, rootRect, scale),
      seed: index + 1,
      under,
      over,
    };
    drawers.get(className)(drawing);
  });
  root.dataset.drawn = "true";
};

const drawPendingRoots = () => {
  isFrameQueued = false;
  if (!isWireframeReady) return;

  for (const root of pendingRoots) drawRoot(root);
  pendingRoots.clear();
};

const queueRoot = (root) => {
  pendingRoots.add(root);
  if (isFrameQueued) return;

  isFrameQueued = true;
  requestAnimationFrame(drawPendingRoots);
};

const queueAllRoots = () => {
  for (const root of document.querySelectorAll(WIREFRAME_SELECTOR)) queueRoot(root);
};

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) queueRoot(entry.target);
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

  if (node.matches(WIREFRAME_SELECTOR)) watchRoot(node);
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
  isWireframeReady = true;
  document.fonts.addEventListener("loadingdone", queueAllRoots);
  queueAllRoots();
};

new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) watchNewRoots(node);
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
