import type { SketchIconShape } from "../../../contracts/sketchScene";
import { WIREFRAME_ICONS } from "../../../sketchParts/wireframeIcons";

const NAVIGATION_ICON_NAMES = [
  "bell",
  "calendar",
  "check",
  "file-text",
  "home",
  "inbox",
  "life-buoy",
  "plus",
  "printer",
  "search",
  "settings",
  "trash-2",
  "user",
  "users",
  "x",
];

const pickIconShapes = (
  iconNames: readonly string[],
): Record<string, readonly SketchIconShape[]> => {
  const iconShapesByName: Record<string, readonly SketchIconShape[]> = {};
  for (const iconName of iconNames) {
    const iconShapes = WIREFRAME_ICONS[iconName];
    const isIconInSet = iconShapes != null;
    if (isIconInSet) iconShapesByName[iconName] = iconShapes;
  }
  return iconShapesByName;
};

const NAVIGATION_ICON_SHAPES_JSON = JSON.stringify(pickIconShapes(NAVIGATION_ICON_NAMES));

export const NAVIGATION_PART_SCRIPT = `
const ICON_GRID_SIZE = 24;
const PLACEHOLDER_INSET_RATIO = 0.2;
const CHILD_SEED_STRIDE = 17;
const FOCUS_INSET_RATIO = 0.06;
const DOCK_DOT_RATIO = 0.12;
const SLASH_NEAR_RATIO = 0.3;
const SLASH_FAR_RATIO = 0.7;
const ICON_SHAPES = ${NAVIGATION_ICON_SHAPES_JSON};

const {
  definePart,
  line,
  roundedRectangle,
  circle,
  ellipse,
  rectangle,
  path,
  polyline,
  polygon,
  chevron,
  cross,
  createScaledLayer,
  readStatus,
  readTone,
  isRightToLeft,
  isChecked,
  tick,
} = window.SketchWireframe;

const pickChildSeed = (drawing, index) => drawing.seed * CHILD_SEED_STRIDE + index + 1;

const measureChildBox = (parentElement, parentBox, child) => {
  const parentRect = parentElement.getBoundingClientRect();
  const childRect = child.getBoundingClientRect();
  const scale = parentRect.width / parentElement.offsetWidth;
  return {
    x: parentBox.x + (childRect.left - parentRect.left) / scale,
    y: parentBox.y + (childRect.top - parentRect.top) / scale,
    w: childRect.width / scale,
    h: childRect.height / scale,
  };
};

const listChildBoxes = (drawing, selector) => {
  const { element, box } = drawing;
  const children = [...element.querySelectorAll(selector)];
  return children.map((child) => ({ child, box: measureChildBox(element, box, child) }));
};

const createInsetBox = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

const fitSquareInBox = (box) => {
  const side = Math.min(box.w, box.h);
  return {
    x: box.x + (box.w - side) / 2,
    y: box.y + (box.h - side) / 2,
    w: side,
    h: side,
  };
};

const createBoxFromCenter = (centerX, centerY, radiusX, radiusY) => ({
  x: centerX - radiusX,
  y: centerY - radiusY,
  w: radiusX * 2,
  h: radiusY * 2,
});

const parsePointPairs = (pointsText) => {
  const pairTexts = pointsText.trim().split(" ");
  return pairTexts.map((pairText) => {
    const [xText, yText] = pairText.split(",");
    return { x: Number(xText), y: Number(yText) };
  });
};

const drawShape = (layer, shape, style) => {
  const { tag, attributes } = shape;
  const isPath = tag === "path";
  if (isPath) return path(layer, attributes.d, style);

  const isLine = tag === "line";
  if (isLine) {
    return line(layer, { x: attributes.x1, y: attributes.y1 }, { x: attributes.x2, y: attributes.y2 }, style);
  }

  const isCircle = tag === "circle";
  if (isCircle) return circle(layer, createBoxFromCenter(attributes.cx, attributes.cy, attributes.r, attributes.r), style);

  const isEllipse = tag === "ellipse";
  if (isEllipse) {
    return ellipse(layer, createBoxFromCenter(attributes.cx, attributes.cy, attributes.rx, attributes.ry), style);
  }

  const isRect = tag === "rect";
  if (isRect) {
    return rectangle(layer, { x: attributes.x, y: attributes.y, w: attributes.width, h: attributes.height }, style);
  }

  const isPolyline = tag === "polyline";
  if (isPolyline) return polyline(layer, parsePointPairs(attributes.points), style);

  return polygon(layer, parsePointPairs(attributes.points), style);
};

const drawPlaceholder = (layer, box, style) => {
  const placeholderInset = Math.min(box.w, box.h) * PLACEHOLDER_INSET_RATIO;
  circle(layer, createInsetBox(fitSquareInBox(box), placeholderInset), style);
};

const drawIcon = (layer, box, iconName, style) => {
  const iconShapes = ICON_SHAPES[iconName];
  const isIconMissing = iconShapes == null;
  if (isIconMissing) {
    drawPlaceholder(layer, box, style);
    return;
  }

  const iconLayer = createScaledLayer(layer, fitSquareInBox(box), ICON_GRID_SIZE);
  for (const shape of iconShapes) drawShape(iconLayer, shape, style);
};

const readIconName = (element) => element.dataset.icon;

const drawIconChildren = (drawing) => {
  for (const [index, { child, box }] of listChildBoxes(drawing, "[data-icon]").entries()) {
    const iconStyle = { tone: readTone(child), seed: pickChildSeed(drawing, index) };
    drawIcon(drawing.under, box, readIconName(child), iconStyle);
  }
};

const pickItemFill = (status) => {
  const isSelected = status === "selected";
  if (isSelected) return "yellow";

  const isHovered = status === "hover";
  if (isHovered) return "grey";

  return null;
};

const drawItemStates = (drawing, selector) => {
  const { under, over } = drawing;
  for (const [index, { child, box }] of listChildBoxes(drawing, selector).entries()) {
    const status = readStatus(child);
    const itemFill = pickItemFill(status);
    const hasItemFill = itemFill !== null;
    const itemSeed = pickChildSeed(drawing, index);
    if (hasItemFill) roundedRectangle(under, box, { tone: "soft", fill: itemFill, seed: itemSeed });

    const isFocused = status === "focus";
    if (!isFocused) continue;

    const focusInset = Math.min(box.w, box.h) * FOCUS_INSET_RATIO;
    roundedRectangle(over, createInsetBox(box, focusInset), { tone: "blue", dashed: true, seed: itemSeed + 1 });
  }
};

const drawIconAndItems = (drawing, itemSelector) => {
  drawItemStates(drawing, itemSelector);
  drawIconChildren(drawing);
};

definePart("sk-top-bar", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isRtl = isRightToLeft(element);
  const isCloseBar = element.classList.contains("sk-close");
  const isBackBar = !isCloseBar;
  const ruleY = box.y + box.h;
  line(under, { x: box.x, y: ruleY }, { x: box.x + box.w, y: ruleY }, { tone: "ink", seed });

  const [startMark] = listChildBoxes(drawing, ".sk-top-bar-start");
  const hasStartMark = startMark != null;
  if (!hasStartMark) {
    drawIconChildren(drawing);
    return;
  }

  const markStyle = { tone: "ink", seed: pickChildSeed(drawing, 0) };
  const backDirection = isRtl ? "right" : "left";
  if (isCloseBar) cross(under, startMark.box, markStyle);
  if (isBackBar) chevron(under, startMark.box, backDirection, markStyle);
  drawIconChildren(drawing);
});

definePart("sk-header-navigation", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", seed });
  drawItemStates(drawing, ".sk-header-navigation-link");

  for (const [index, { box: toggleBox }] of listChildBoxes(drawing, ".sk-header-navigation-menu").entries()) {
    drawMenuLines(under, toggleBox, pickChildSeed(drawing, index));
  }
  drawIconChildren(drawing);
});

const MENU_LINE_RATIOS = [0.25, 0.5, 0.75];
const drawMenuLines = (layer, box, seed) => {
  for (const [index, lineRatio] of MENU_LINE_RATIOS.entries()) {
    const lineY = box.y + box.h * lineRatio;
    line(layer, { x: box.x, y: lineY }, { x: box.x + box.w, y: lineY }, { tone: "ink", seed: seed + index });
  }
};

definePart("sk-sidebar-navigation", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", seed });
  drawIconAndItems(drawing, ".sk-sidebar-row");
});

definePart("sk-bottom-tab-bar", (drawing) => {
  const { box, seed, under } = drawing;
  line(under, { x: box.x, y: box.y }, { x: box.x + box.w, y: box.y }, { tone: "ink", seed });
  drawIconAndItems(drawing, ".sk-bottom-tab-item");
});

definePart("sk-floating-tab-bar", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", seed });

  for (const [index, { child, box: itemBox }] of listChildBoxes(drawing, ".sk-floating-tab-item").entries()) {
    const isSelected = readStatus(child) === "selected";
    if (isSelected) ellipse(under, itemBox, { tone: "soft", fill: "yellow", seed: pickChildSeed(drawing, index) });
  }

  for (const [index, { box: actionBox }] of listChildBoxes(drawing, ".sk-floating-tab-action").entries()) {
    circle(under, fitSquareInBox(actionBox), { tone: "ink", fill: "blue", seed: pickChildSeed(drawing, index) });
  }
  drawIconChildren(drawing);
});

const drawDockDot = (layer, itemBox, seed) => {
  const dotSide = itemBox.w * DOCK_DOT_RATIO;
  const dotBox = {
    x: itemBox.x + (itemBox.w - dotSide) / 2,
    y: itemBox.y + itemBox.h + dotSide,
    w: dotSide,
    h: dotSide,
  };
  circle(layer, dotBox, { tone: "blue", fill: "blue", seed });
};

definePart("sk-glass-dock", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", fill: "grey", seed });

  for (const [index, { child, box: itemBox }] of listChildBoxes(drawing, ".sk-glass-dock-item").entries()) {
    const isSelected = readStatus(child) === "selected";
    if (isSelected) drawDockDot(under, itemBox, pickChildSeed(drawing, index));
  }
  drawIconChildren(drawing);
});

const drawSlash = (layer, box, isRtl, seed) => {
  const nearX = box.x + box.w * SLASH_NEAR_RATIO;
  const farX = box.x + box.w * SLASH_FAR_RATIO;
  const fromX = isRtl ? farX : nearX;
  const toX = isRtl ? nearX : farX;
  line(layer, { x: fromX, y: box.y + box.h }, { x: toX, y: box.y }, { tone: "soft", seed });
};

definePart("sk-breadcrumbs", (drawing) => {
  const { element, under } = drawing;
  const isRtl = isRightToLeft(element);
  const isSlashSeparated = element.classList.contains("sk-slash");
  const forwardDirection = isRtl ? "left" : "right";
  drawItemStates(drawing, ".sk-breadcrumb-item");

  for (const [index, { box: separatorBox }] of listChildBoxes(drawing, ".sk-breadcrumb-separator").entries()) {
    const separatorSeed = pickChildSeed(drawing, index);
    if (isSlashSeparated) drawSlash(under, separatorBox, isRtl, separatorSeed);
    if (!isSlashSeparated) chevron(under, separatorBox, forwardDirection, { tone: "soft", seed: separatorSeed });
  }
});

const drawArrowChildren = (drawing, selector, direction) => {
  for (const [index, { child, box }] of listChildBoxes(drawing, selector).entries()) {
    const isDisabled = readStatus(child) === "disabled";
    const arrowTone = isDisabled ? "soft" : "ink";
    chevron(drawing.under, box, direction, { tone: arrowTone, seed: pickChildSeed(drawing, index) });
  }
};

definePart("sk-pagination", (drawing) => {
  const { element } = drawing;
  const isRtl = isRightToLeft(element);
  const previousDirection = isRtl ? "right" : "left";
  const nextDirection = isRtl ? "left" : "right";
  drawArrowChildren(drawing, ".sk-pagination-previous", previousDirection);
  drawArrowChildren(drawing, ".sk-pagination-next", nextDirection);
  drawItemStates(drawing, ".sk-pagination-page");
});

const TAB_UNDERLINE_THICKNESS_RATIO = 0.05;
const drawTabUnderline = (drawing) => {
  const { box, seed, under } = drawing;
  const baseY = box.y + box.h;
  line(under, { x: box.x, y: baseY }, { x: box.x + box.w, y: baseY }, { tone: "soft", seed });

  for (const [index, { child, box: tabBox }] of listChildBoxes(drawing, ".sk-tabs-tab").entries()) {
    const isSelected = readStatus(child) === "selected";
    if (!isSelected) continue;

    const underlineY = tabBox.y + tabBox.h;
    const thickness = tabBox.h * TAB_UNDERLINE_THICKNESS_RATIO;
    const underlineSeed = pickChildSeed(drawing, index);
    line(under, { x: tabBox.x, y: underlineY }, { x: tabBox.x + tabBox.w, y: underlineY }, { tone: "blue", seed: underlineSeed });
    line(under, { x: tabBox.x, y: underlineY - thickness }, { x: tabBox.x + tabBox.w, y: underlineY - thickness }, { tone: "blue", seed: underlineSeed + 1 });
  }
};

definePart("sk-tabs", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isSegmented = element.classList.contains("sk-segmented");
  const isPill = element.classList.contains("sk-pill");
  const isUnderlineTabs = !isSegmented && !isPill;
  if (isUnderlineTabs) {
    drawTabUnderline(drawing);
    return;
  }

  if (isSegmented) roundedRectangle(under, box, { tone: "ink", seed });
  drawItemStates(drawing, ".sk-tabs-tab");
});

const STEPPER_CHECK_INSET_RATIO = 0.22;
const readBoxCenter = (box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

const drawStepperDot = (layer, child, box, seed) => {
  const dotBox = fitSquareInBox(box);
  const isDone = isChecked(child);
  if (isDone) {
    circle(layer, dotBox, { tone: "green", fill: "green", seed });
    const checkBox = createInsetBox(dotBox, dotBox.w * STEPPER_CHECK_INSET_RATIO);
    tick(layer, checkBox, { tone: "ink", seed: seed + 1 });
    return;
  }

  const isCurrent = readStatus(child) === "selected";
  if (isCurrent) {
    circle(layer, dotBox, { tone: "blue", fill: "blue", seed });
    return;
  }

  circle(layer, dotBox, { tone: "soft", seed });
};

const drawStepperConnectors = (drawing, dotEntries) => {
  for (const [index, { child, box }] of dotEntries.entries()) {
    const nextEntry = dotEntries[index + 1];
    const hasNextDot = nextEntry != null;
    if (!hasNextDot) continue;

    const connectorTone = isChecked(child) ? "green" : "soft";
    const connectorSeed = pickChildSeed(drawing, index + dotEntries.length);
    const from = readBoxCenter(box);
    const to = readBoxCenter(nextEntry.box);
    line(drawing.under, from, to, { tone: connectorTone, seed: connectorSeed });
  }
};

definePart("sk-stepper", (drawing) => {
  const dotEntries = listChildBoxes(drawing, ".sk-stepper-dot");
  drawStepperConnectors(drawing, dotEntries);

  for (const [index, { child, box }] of dotEntries.entries()) {
    drawStepperDot(drawing.under, child, box, pickChildSeed(drawing, index));
  }
});

const drawOutlineChildren = (drawing, selector, tone) => {
  for (const [index, { box }] of listChildBoxes(drawing, selector).entries()) {
    roundedRectangle(drawing.under, box, { tone, seed: pickChildSeed(drawing, index) });
  }
};

const CHECK_MARK_SIDE_RATIO = 0.5;
const CHECK_MARK_START_RATIO = 0.2;
const drawMenuCheckMarks = (drawing) => {
  for (const [index, { child, box }] of listChildBoxes(drawing, ".sk-menubar-item").entries()) {
    const isItemChecked = isChecked(child);
    if (!isItemChecked) continue;

    const markSide = box.h * CHECK_MARK_SIDE_RATIO;
    const markBox = {
      x: box.x + box.h * CHECK_MARK_START_RATIO,
      y: box.y + (box.h - markSide) / 2,
      w: markSide,
      h: markSide,
    };
    tick(drawing.under, markBox, { tone: "blue", seed: pickChildSeed(drawing, index) });
  }
};

definePart("sk-menubar", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", seed });
  drawItemStates(drawing, ".sk-menubar-menu");
  drawOutlineChildren(drawing, ".sk-menubar-panel", "ink");
  drawItemStates(drawing, ".sk-menubar-item");
  drawMenuCheckMarks(drawing);
  drawIconChildren(drawing);
});

definePart("sk-command-menu", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", seed });
  drawOutlineChildren(drawing, ".sk-command-menu-search", "soft");
  drawItemStates(drawing, ".sk-command-menu-row");
  drawOutlineChildren(drawing, ".sk-command-menu-key", "soft");
  drawIconChildren(drawing);
});

const TOC_MARKER_WIDTH_RATIO = 0.06;
definePart("sk-table-of-contents", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isRtl = isRightToLeft(element);
  const railX = isRtl ? box.x + box.w : box.x;
  line(under, { x: railX, y: box.y }, { x: railX, y: box.y + box.h }, { tone: "soft", seed });

  for (const [index, { child, box: entryBox }] of listChildBoxes(drawing, ".sk-toc-item").entries()) {
    const isCurrent = readStatus(child) === "selected";
    if (!isCurrent) continue;

    const markerWidth = box.h * TOC_MARKER_WIDTH_RATIO;
    const markerBox = {
      x: railX - markerWidth / 2,
      y: entryBox.y,
      w: markerWidth,
      h: entryBox.h,
    };
    rectangle(under, markerBox, { tone: "blue", fill: "blue", seed: pickChildSeed(drawing, index) });
  }
});

definePart("sk-scroll-index", (drawing) => {
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "ink", seed });

  for (const [index, { child, box: letterBox }] of listChildBoxes(drawing, ".sk-scroll-index-letter").entries()) {
    const isCurrent = readStatus(child) === "selected";
    if (!isCurrent) continue;

    circle(under, fitSquareInBox(letterBox), { tone: "soft", fill: "yellow", seed: pickChildSeed(drawing, index) });
  }
});

const LINK_UNDERLINE_RATIO = 0.92;
const drawLinkUnderline = (layer, box, seed) => {
  const underlineY = box.y + box.h * LINK_UNDERLINE_RATIO;
  line(layer, { x: box.x, y: underlineY }, { x: box.x + box.w, y: underlineY }, { tone: "blue", seed });
};

definePart("sk-link", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isQuiet = element.classList.contains("sk-quiet");
  const isHovered = readStatus(element) === "hover";
  const isDisabled = readStatus(element) === "disabled";
  const isUnderlined = (!isQuiet || isHovered) && !isDisabled;
  if (!isUnderlined) return;

  drawLinkUnderline(under, box, seed);
});

const BACK_LINK_CHEVRON_RATIO = 0.6;
definePart("sk-back-link", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isRtl = isRightToLeft(element);
  const chevronSide = box.h * BACK_LINK_CHEVRON_RATIO;
  const chevronX = isRtl ? box.x + box.w - chevronSide : box.x;
  const chevronBox = {
    x: chevronX,
    y: box.y + (box.h - chevronSide) / 2,
    w: chevronSide,
    h: chevronSide,
  };
  const backDirection = isRtl ? "right" : "left";
  chevron(under, chevronBox, backDirection, { tone: "ink", seed });

  const isHovered = readStatus(element) === "hover";
  if (isHovered) drawLinkUnderline(under, box, seed + 1);
});
`;

export const NAVIGATION_PART_STYLE = `:where(.sk-wireframe [data-icon]) {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
}

:where(.sk-top-bar) {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 0.75rem;
  min-height: 3rem;
  padding: 0.5rem 0.75rem;
  border: 1.6px solid transparent;
  font-size: 1.125rem;
}

:where(.sk-top-bar.sk-compact) {
  min-height: 2.5rem;
  font-size: 1rem;
}

:where(.sk-top-bar-start, .sk-top-bar-end) {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
}

:where(.sk-top-bar-start) {
  grid-column: 1;
}

:where(.sk-top-bar-title) {
  grid-column: 2;
  text-align: center;
  font-weight: 700;
}

:where(.sk-top-bar-end) {
  grid-column: 3;
}

:where(.sk-header-navigation) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 3rem;
  padding: 0.5rem 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
  font-size: 1rem;
}

:where(.sk-header-navigation-link) {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 0.5rem;
}

:where(.sk-header-navigation-menu) {
  display: inline-block;
  width: 1.5rem;
  height: 1.25rem;
}

:where(.sk-sidebar-navigation) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 12rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
  font-size: 1rem;
}

:where(.sk-sidebar-row) {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 2.25rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
}

:where(.sk-sidebar-navigation .sk-sidebar-heading) {
  padding: 0.5rem 0.625rem 0.25rem;
  font-size: 0.875rem;
  opacity: 0.6;
}

:where(.sk-bottom-tab-bar) {
  display: flex;
  justify-content: space-around;
  min-height: 4rem;
  padding: 0.5rem 0.25rem;
  border: 1.6px solid transparent;
  font-size: 0.875rem;
}

:where(.sk-bottom-tab-item) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 3.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
}

:where(.sk-floating-tab-bar) {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1.6px solid transparent;
  border-radius: 1rem;
  font-size: 0.75rem;
}

:where(.sk-floating-tab-item) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
}

:where(.sk-floating-tab-action) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
}

:where(.sk-glass-dock) {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem 1.25rem;
  border: 1.6px solid transparent;
  border-radius: 1rem;
}

:where(.sk-glass-dock-item) {
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
}

:where(.sk-breadcrumbs) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border: 1.6px solid transparent;
  font-size: 1rem;
}

:where(.sk-breadcrumb-item) {
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
}

:where(.sk-breadcrumb-separator) {
  display: inline-block;
  width: 0.875rem;
  height: 0.875rem;
}

:where(.sk-pagination) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border: 1.6px solid transparent;
  font-size: 1rem;
}

:where(.sk-pagination-previous, .sk-pagination-next) {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
}

:where(.sk-pagination-page) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  min-height: 2rem;
  border-radius: 0.5rem;
}

:where(.sk-tabs) {
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1.6px solid transparent;
  font-size: 1rem;
}

:where(.sk-tabs-tab) {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
}

:where(.sk-stepper) {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  border: 1.6px solid transparent;
  font-size: 0.875rem;
}

:where(.sk-stepper-step) {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

:where(.sk-stepper.sk-vertical) {
  flex-direction: column;
  align-items: stretch;
}

:where(.sk-stepper.sk-vertical .sk-stepper-step) {
  flex: none;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

:where(.sk-stepper-dot) {
  display: inline-block;
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
}

:where(.sk-menubar) {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
  font-size: 1rem;
}

:where(.sk-menubar-menu) {
  position: relative;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
}

:where(.sk-menubar-panel) {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  margin-top: 0.25rem;
  padding: 0.375rem;
  border: 1.6px solid transparent;
  font-size: 0.875rem;
}

:where(.sk-menubar-item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 1.25rem;
  border-radius: 0.375rem;
}

:where(.sk-command-menu) {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 16rem;
  padding: 0.5rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
  font-size: 1rem;
}

:where(.sk-command-menu-search) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
}

:where(.sk-command-menu-heading) {
  padding: 0.5rem 0.625rem 0.125rem;
  font-size: 0.75rem;
  opacity: 0.6;
}

:where(.sk-command-menu-row) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
}

:where(.sk-command-menu-key) {
  display: inline-block;
  padding: 0 0.375rem;
  border-radius: 0.25rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.75rem;
}

:where(.sk-table-of-contents) {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.25rem 0.875rem;
  border: 1.6px solid transparent;
  font-size: 0.9375rem;
}

:where(.sk-toc-item) {
  padding: 0.25rem 0;
}

:where(.sk-toc-item[data-status="selected"]) {
  font-weight: 700;
}

:where(.sk-scroll-index) {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.5rem 0.375rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
  font-size: 0.875rem;
}

:where(.sk-scroll-index-letter) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.5rem;
}

:where(.sk-scroll-index-letter[data-status="disabled"]) {
  opacity: 0.35;
}

:where(.sk-link) {
  display: inline-block;
  padding-bottom: 0.125rem;
  font-size: 1rem;
}

:where(.sk-link[data-status="disabled"]) {
  opacity: 0.4;
}

:where(.sk-back-link) {
  position: relative;
  display: inline-block;
  padding-inline-start: 1.25rem;
  font-size: 1rem;
}
`;
