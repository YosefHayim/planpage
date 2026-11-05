import { SKETCH_LOOK } from "../sketchLook";

export const CONTENT_PART_SCRIPT = `
const SKETCH_TONE_COLORS = ${JSON.stringify(SKETCH_LOOK.tones)};
const SKETCH_SATURATED_FILL_COLORS = ${JSON.stringify(SKETCH_LOOK.saturatedFills)};
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const STREAK_TICK_INSET_RATIO = 0.2;
const WEEK_TODAY_INSET_RATIO = 0.04;
const COPY_BUTTON_EM = 2;
const COPY_BUTTON_INSET_EM = 0.5;
const COPY_ICON_EM = 1.15;
const ACTIVITY_AVATAR_EM = 2;
const ACTIVITY_ICON_INSET_RATIO = 0.22;
const TEXT_LINE_WIDTH_RATIOS = [1, 0.86, 0.6, 0.92];
const TEXT_LAST_LINE_WIDTH_RATIO = 0.45;
const TEXT_WAVE_RATIO = 0.08;
const HEADING_UNDERLINE_OFFSET = 4;
const HEADING_UNDERLINE_WIDTH_RATIO = 0.4;
const STATUS_DOT_DIAMETER_EM = 0.6;
const STATUS_DOT_CENTER_EM = 0.75;
const PILL_RADIUS_RATIO = 0.5;
const TAG_ICON_SIZE_RATIO = 0.5;
const TAG_ICON_INSET_RATIO = 0.3;

const pickLineWidthRatio = (lineIndex, lineCount) => {
  const isLastLine = lineIndex === lineCount - 1;
  if (isLastLine) return TEXT_LAST_LINE_WIDTH_RATIO;
  return TEXT_LINE_WIDTH_RATIOS[lineIndex % TEXT_LINE_WIDTH_RATIOS.length];
};

const createWavyLinePath = (startX, endX, rowY, waveHeight) => {
  const thirdWidth = (endX - startX) / 3;
  const firstControlX = startX + thirdWidth;
  const secondControlX = startX + thirdWidth * 2;
  return "M " + startX + " " + rowY + " C " + firstControlX + " " + (rowY - waveHeight) + " " + secondControlX + " " + (rowY + waveHeight) + " " + endX + " " + rowY;
};

const createPillPath = (box) => {
  const radius = box.h * PILL_RADIUS_RATIO;
  const right = box.x + box.w;
  const bottom = box.y + box.h;
  return [
    "M", box.x + radius, box.y,
    "H", right - radius,
    "A", radius, radius, 0, 0, 1, right - radius, bottom,
    "H", box.x + radius,
    "A", radius, radius, 0, 0, 1, box.x + radius, box.y,
    "Z",
  ].join(" ");
};

const readIconName = (element) => element.getAttribute("data-icon");

window.SketchWireframe.definePart("sk-card", (drawing) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-heading", (drawing) => {
  const { line, readTone, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const underlineY = box.y + box.h - HEADING_UNDERLINE_OFFSET;
  const underlineWidth = box.w * HEADING_UNDERLINE_WIDTH_RATIO;
  const isRtl = isRightToLeft(element);
  const underlineStartX = isRtl ? box.x + box.w : box.x;
  const underlineEndX = isRtl ? underlineStartX - underlineWidth : underlineStartX + underlineWidth;
  line(under, { x: underlineStartX, y: underlineY }, { x: underlineEndX, y: underlineY }, { tone: readTone(element), seed });
});

window.SketchWireframe.definePart("sk-text-lines", (drawing) => {
  const { path, readCount } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const rowHeight = Number.parseFloat(window.getComputedStyle(element).lineHeight);
  const rowsThatFit = Math.max(1, Math.floor(box.h / rowHeight));
  const lineCount = Math.min(readCount(element, Infinity), rowsThatFit);
  for (const lineIndex of [...Array(lineCount).keys()]) {
    const rowY = box.y + rowHeight * (lineIndex + 0.5);
    const rowEndX = box.x + box.w * pickLineWidthRatio(lineIndex, lineCount);
    const waveDirection = lineIndex % 2 === 0 ? 1 : -1;
    const waveHeight = rowHeight * TEXT_WAVE_RATIO * waveDirection;
    path(under, createWavyLinePath(box.x, rowEndX, rowY, waveHeight), { tone: "soft", seed: seed + lineIndex });
  }
});

window.SketchWireframe.definePart("sk-label", (drawing) => {
  const { line, readStatus } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isError = readStatus(element) === "error";
  if (!isError) return;

  const underlineY = box.y + box.h;
  line(under, { x: box.x, y: underlineY }, { x: box.x + box.w, y: underlineY }, { tone: "red", seed });
});

window.SketchWireframe.definePart("sk-separator", (drawing) => {
  const { line, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const middleY = box.y + box.h / 2;
  line(under, { x: box.x, y: middleY }, { x: box.x + box.w, y: middleY }, { tone: readTone(element), seed });
});

window.SketchWireframe.definePart("sk-avatar", (drawing) => {
  const { circle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  circle(under, box, { tone: readTone(element), fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-badge", (drawing) => {
  const { path, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  path(under, createPillPath(box), { tone: readTone(element), fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-tag", (drawing) => {
  const { path, icon, readTone, readFill, readStatus, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const isSelected = readStatus(element) === "selected";
  const fill = isSelected ? "blue" : readFill(element);
  path(under, createPillPath(box), { tone, fill, seed });

  const iconName = readIconName(element);
  const hasIcon = iconName !== null;
  if (!hasIcon) return;

  const iconSize = box.h * TAG_ICON_SIZE_RATIO;
  const iconInset = box.h * TAG_ICON_INSET_RATIO;
  const isRtl = isRightToLeft(element);
  const iconX = isRtl ? box.x + iconInset : box.x + box.w - iconInset - iconSize;
  const iconBox = { x: iconX, y: box.y + (box.h - iconSize) / 2, w: iconSize, h: iconSize };
  icon(under, iconBox, iconName, { tone, seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-status-light", (drawing) => {
  const { isRightToLeft } = window.SketchWireframe;
  const { element, box, under } = drawing;
  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  const dotDiameter = fontSize * STATUS_DOT_DIAMETER_EM;
  const dotCenterDistance = fontSize * STATUS_DOT_CENTER_EM;
  const isRtl = isRightToLeft(element);
  const dotCenterX = isRtl ? box.x + box.w - dotCenterDistance : box.x + dotCenterDistance;

  const dotBox = {
    x: dotCenterX - dotDiameter / 2,
    y: box.y + box.h / 2 - dotDiameter / 2,
    w: dotDiameter,
    h: dotDiameter,
  };
  appendSolidCircle(under, dotBox, pickSolidDotColor(element));
});

window.SketchWireframe.definePart("sk-dot", (drawing) => {
  const { element, box, under } = drawing;
  appendSolidCircle(under, box, pickSolidDotColor(element));
});

const CARD_STACK_STEP = 8;
const CARD_STACK_LAYER_NUMBERS = [1, 2];
const FOLDER_TAB_WIDTH_RATIO = 0.4;
const FOLDER_TAB_HEIGHT_RATIO = 0.16;
const FOLDER_TAB_SLOPE_RATIO = 1.15;
const ROW_CHEVRON_SIZE_RATIO = 0.35;
const ROW_CHEVRON_INSET_RATIO = 0.4;
const GRIP_DOT_RATIO = 0.08;
const GRIP_INSET_RATIO = 0.35;
const GRIP_SPACING_RATIO = 0.18;
const TREE_INDENT_EM = 1.25;
const TREE_CHEVRON_EM = 0.6;
const TREE_CHEVRON_INSET_EM = 0.25;
const TREE_CHEVRON_HALF_EM = 0.3;

const pickStartDistanceX = (box, distanceFromStart, isRtl) => {
  if (isRtl) return box.x + box.w - distanceFromStart;
  return box.x + distanceFromStart;
};

const pickEndDistanceX = (box, distanceFromEnd, isRtl) => pickStartDistanceX(box, distanceFromEnd, !isRtl);

const pickStartSideX = (box, distanceFromStart, shapeWidth, isRtl) => {
  if (isRtl) return box.x + box.w - distanceFromStart - shapeWidth;
  return box.x + distanceFromStart;
};

const pickDisclosureDirection = (isOpen, isRtl) => {
  if (isOpen) return "down";
  if (isRtl) return "left";
  return "right";
};

const measureChildBox = (ancestor, childSelector) => {
  const child = ancestor.querySelector(childSelector);
  const isChildMissing = child === null;
  if (isChildMissing) return null;

  const root = ancestor.closest(".sk-wireframe");
  const rootRect = root.getBoundingClientRect();
  const scale = rootRect.width / root.offsetWidth;
  const childRect = child.getBoundingClientRect();
  return {
    x: (childRect.left - rootRect.left) / scale,
    y: (childRect.top - rootRect.top) / scale,
    w: childRect.width / scale,
    h: childRect.height / scale,
  };
};

const drawDisclosureChevron = (drawing, triggerSelector) => {
  const { chevron, isChecked, isRightToLeft } = window.SketchWireframe;
  const { element, seed, under } = drawing;
  const triggerBox = measureChildBox(element, triggerSelector);
  const isTriggerMissing = triggerBox === null;
  if (isTriggerMissing) return;

  const chevronSize = triggerBox.h * ROW_CHEVRON_SIZE_RATIO;
  const chevronInset = triggerBox.h * ROW_CHEVRON_INSET_RATIO;
  const isRtl = isRightToLeft(element);
  const chevronX = pickEndDistanceX(triggerBox, chevronInset + chevronSize, isRtl);
  const chevronBox = { x: chevronX, y: triggerBox.y + (triggerBox.h - chevronSize) / 2, w: chevronSize, h: chevronSize };
  const direction = pickDisclosureDirection(isChecked(element), isRtl);
  chevron(under, chevronBox, direction, { tone: "ink", seed: seed + 1 });
};

const drawListOutline = (drawing) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
};

window.SketchWireframe.definePart("sk-card-stack", (drawing) => {
  const { polyline, isRightToLeft, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const style = window.getComputedStyle(element);
  const paddingEndX = Number.parseFloat(style.paddingInlineEnd);
  const paddingBottomY = Number.parseFloat(style.paddingBottom);
  const isRtl = isRightToLeft(element);
  const topCardWidth = box.w - paddingEndX;
  const topCardHeight = box.h - paddingBottomY;
  const topCardLeftX = isRtl ? box.x + paddingEndX : box.x;
  const topCardRightX = topCardLeftX + topCardWidth;
  const topCardBottomY = box.y + topCardHeight;
  const endEdgeX = isRtl ? topCardLeftX : topCardRightX;
  const startEdgeX = isRtl ? topCardRightX : topCardLeftX;
  const sideSign = isRtl ? -1 : 1;

  for (const layerNumber of CARD_STACK_LAYER_NUMBERS) {
    const offset = CARD_STACK_STEP * layerNumber;
    const layerPoints = [
      { x: endEdgeX + sideSign * offset, y: box.y + offset },
      { x: endEdgeX + sideSign * offset, y: topCardBottomY + offset },
      { x: startEdgeX + sideSign * offset, y: topCardBottomY + offset },
    ];
    polyline(under, layerPoints, { tone: readTone(element), seed: seed + layerNumber });
  }
});

window.SketchWireframe.definePart("sk-folder-card", (drawing) => {
  const { polygon, readTone, readFill, readStatus, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isSelected = readStatus(element) === "selected";
  const fill = isSelected ? "blue" : readFill(element);
  const isRtl = isRightToLeft(element);
  const tabWidth = box.w * FOLDER_TAB_WIDTH_RATIO;
  const tabHeight = box.h * FOLDER_TAB_HEIGHT_RATIO;
  const top = box.y;
  const bodyTop = box.y + tabHeight;
  const bottom = box.y + box.h;
  const pointAt = (distanceFromStart, pointY) => ({ x: pickStartDistanceX(box, distanceFromStart, isRtl), y: pointY });

  const folderPoints = [
    pointAt(0, bottom),
    pointAt(0, top),
    pointAt(tabWidth, top),
    pointAt(tabWidth * FOLDER_TAB_SLOPE_RATIO, bodyTop),
    pointAt(box.w, bodyTop),
    pointAt(box.w, bottom),
  ];
  polygon(under, folderPoints, { tone: readTone(element), fill, seed });
});

window.SketchWireframe.definePart("sk-option-card", (drawing) => {
  const { roundedRectangle, tick, readTone, readFill, readStatus, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isSelected = readStatus(element) === "selected";
  const tone = isSelected ? "blue" : readTone(element);
  roundedRectangle(under, box, { tone, fill: readFill(element), seed });

  if (!isSelected) return;

  const tickSize = Math.min(box.w, box.h) * 0.16;
  const tickInset = tickSize * 0.6;
  const isRtl = isRightToLeft(element);
  const tickX = pickEndDistanceX(box, tickInset + tickSize, isRtl);
  const tickBox = { x: tickX, y: box.y + tickInset, w: tickSize, h: tickSize };
  tick(under, tickBox, { tone: "blue", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-panel", (drawing) => {
  const { rectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  rectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-list", drawListOutline);
window.SketchWireframe.definePart("sk-sortable-list", drawListOutline);

window.SketchWireframe.definePart("sk-list-item", (drawing) => {
  const { line, rectangle, chevron, circle, readStatus, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isLastItem = element.nextElementSibling === null;
  const dividerY = box.y + box.h;
  if (!isLastItem) line(under, { x: box.x, y: dividerY }, { x: box.x + box.w, y: dividerY }, { tone: "soft", seed });

  const isSelected = readStatus(element) === "selected";
  if (isSelected) rectangle(under, box, { tone: "soft", fill: "blue", seed: seed + 1 });

  const isRtl = isRightToLeft(element);
  const hasChevron = element.classList.contains("sk-with-chevron");
  if (hasChevron) {
    const chevronSize = box.h * ROW_CHEVRON_SIZE_RATIO;
    const chevronInset = box.h * ROW_CHEVRON_INSET_RATIO;
    const chevronX = pickEndDistanceX(box, chevronInset + chevronSize, isRtl);
    const chevronBox = { x: chevronX, y: box.y + (box.h - chevronSize) / 2, w: chevronSize, h: chevronSize };
    const direction = isRtl ? "left" : "right";
    chevron(under, chevronBox, direction, { tone: "ink", seed: seed + 2 });
  }

  const isSortable = element.classList.contains("sk-sortable");
  if (!isSortable) return;

  const gripDiameter = box.h * GRIP_DOT_RATIO;
  const gripInset = box.h * GRIP_INSET_RATIO;
  const gripSpacing = box.h * GRIP_SPACING_RATIO;
  const middleY = box.y + box.h / 2;
  const gripColumnXs = [pickStartDistanceX(box, gripInset, isRtl), pickStartDistanceX(box, gripInset + gripSpacing, isRtl)];
  const gripRowYs = [middleY - gripSpacing, middleY, middleY + gripSpacing];
  for (const gripColumnX of gripColumnXs) {
    for (const gripRowY of gripRowYs) {
      const gripBox = { x: gripColumnX - gripDiameter / 2, y: gripRowY - gripDiameter / 2, w: gripDiameter, h: gripDiameter };
      circle(under, gripBox, { tone: "ink", seed: seed + 3 });
    }
  }
});

window.SketchWireframe.definePart("sk-table", (drawing) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-table-row", (drawing) => {
  const { line, rectangle, readStatus, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isHeadRow = element.classList.contains("sk-table-head");
  const isSelected = readStatus(element) === "selected";
  if (isHeadRow) rectangle(under, box, { tone: "soft", fill: "grey", seed });
  if (isSelected) rectangle(under, box, { tone: "blue", fill: "blue", seed: seed + 1 });

  const isLastRow = element.nextElementSibling === null;
  if (isLastRow) return;

  const dividerY = box.y + box.h;
  line(under, { x: box.x, y: dividerY }, { x: box.x + box.w, y: dividerY }, { tone: readTone(element), seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-accordion-item", (drawing) => {
  const { roundedRectangle, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), seed });
  drawDisclosureChevron(drawing, ".sk-accordion-trigger");
});

window.SketchWireframe.definePart("sk-collapsible", (drawing) => {
  const { roundedRectangle, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), seed, dashed: true });
  drawDisclosureChevron(drawing, ".sk-collapsible-trigger");
});

window.SketchWireframe.definePart("sk-swipe-row", (drawing) => {
  const { roundedRectangle, rectangle, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });

  const actionBox = measureChildBox(element, ".sk-swipe-action");
  const isActionMissing = actionBox === null;
  if (isActionMissing) return;

  rectangle(under, actionBox, { tone: "red", fill: "red", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-tree-row", (drawing) => {
  const { chevron, readCount, isChecked, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isFolder = element.classList.contains("sk-tree-folder");
  if (!isFolder) return;

  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  const depth = readCount(element, 0);
  const isRtl = isRightToLeft(element);
  const chevronSize = fontSize * TREE_CHEVRON_EM;
  const chevronDistance = depth * fontSize * TREE_INDENT_EM + fontSize * TREE_CHEVRON_INSET_EM;
  const chevronX = pickStartSideX(box, chevronDistance, chevronSize, isRtl);
  const chevronY = box.y + box.h / 2 - fontSize * TREE_CHEVRON_HALF_EM;
  const chevronBox = { x: chevronX, y: chevronY, w: chevronSize, h: chevronSize };
  const direction = pickDisclosureDirection(isChecked(element), isRtl);
  chevron(under, chevronBox, direction, { tone: "ink", seed });
});

const ARROW_SIZE_RATIO = 0.12;
const ARROW_INSET_RATIO = 0.04;
const DOT_SIZE_RATIO = 0.06;
const DOT_ROW_Y_RATIO = 0.92;
const DEFAULT_DOT_COUNT = 3;
const PERCENT_SCALE = 100;
const DEFAULT_BAR_FILL = "blue";
const MOUNTAIN_POINT_RATIOS = [[0, 0.85], [0.38, 0.42], [0.55, 0.62], [0.72, 0.3], [1, 0.85]];
const SUN_SIZE_RATIO = 0.18;
const PLAY_SIZE_RATIO = 0.22;
const VIDEO_TRACK_INSET_RATIO = 0.05;
const VIDEO_TRACK_Y_RATIO = 0.9;
const MAP_ROAD_RATIO_SETS = [
  [[0, 0.3], [0.4, 0.35], [0.6, 0.75], [1, 0.7]],
  [[0.25, 0], [0.3, 1]],
  [[0, 0.8], [1, 0.55]],
];
const MAP_PIN_SIZE_RATIO = 0.22;
const MAP_PIN_X_RATIO = 0.55;
const MAP_PIN_Y_RATIO = 0.42;
const PHOTO_FAN_WIDTH_RATIO = 0.5;
const PHOTO_FAN_HEIGHT_RATIO = 0.7;
const PHOTO_FAN_PHOTOS = [
  { angleDegrees: -12, fill: "blue" },
  { angleDegrees: 12, fill: "orange" },
  { angleDegrees: 0, fill: "green" },
];
const QR_GRID_SIZE = 21;
const QR_FINDER_SIZE = 7;
const QR_FINDER_INNER_SIZE = 3;
const QR_FINDER_INNER_OFFSET = 2;
const QR_DARK_CELL_PERCENT = 40;
const QR_PERCENT_RANGE = 100;
const QR_HASH_MIX = 0x5bd1e995;
const QR_HASH_SHIFT = 15;
const QR_MODULE_GAP_RATIO = 0.18;
const CALENDAR_CELL_INSET_RATIO = 0.12;
const TIMELINE_DOT_CENTER_EM = 0.6;
const TIMELINE_DOT_DIAMETER_EM = 0.8;
const TIMELINE_FIRST_LINE_CENTER_EM = 0.75;
const TIMELINE_ICON_INSET_RATIO = 0.2;
const BUBBLE_TAIL_SIZE_RATIO = 0.18;
const METRIC_TREND_SIZE_RATIO = 0.16;
const LEADERBOARD_RANK_CENTER_EM = 1.5;
const LEADERBOARD_RANK_DIAMETER_EM = 1.8;
const LEADERBOARD_RANK_FILLS = ["yellow", "grey", "orange"];
const FEATURE_ICON_EM = 1;
const RECEIPT_TOOTH_COUNT = 10;
const RECEIPT_TOOTH_RATIO = 0.03;
const TICKET_NOTCH_RATIO = 0.1;
const TICKET_PERFORATION_RATIO = 0.72;
const BARCODE_BAR_COUNT = 9;
const BARCODE_TOP_RATIO = 0.55;
const BARCODE_BOTTOM_RATIO = 0.92;
const CARD_CHIP_LEFT_RATIO = 0.08;
const CARD_CHIP_WIDTH_RATIO = 0.14;
const CARD_CHIP_HEIGHT_RATIO = 0.2;
const CARD_CHIP_TOP_RATIO = 0.3;
const STREAK_DAY_COUNT = 7;
const STREAK_DAY_DIAMETER_RATIO = 0.6;
const STREAK_DAY_SPACING_RATIO = 0.8;
const RATING_STAR_RATIO = 0.32;
const STAR_POINT_COUNT = 5;
const STAR_INNER_RATIO = 0.45;

const appendSolidCircle = (layer, box, color) => {
  const circleNode = document.createElementNS(SVG_NAMESPACE, "circle");
  circleNode.setAttribute("cx", box.x + box.w / 2);
  circleNode.setAttribute("cy", box.y + box.h / 2);
  circleNode.setAttribute("r", Math.min(box.w, box.h) / 2);
  circleNode.setAttribute("fill", color);
  circleNode.setAttribute("stroke", "none");
  layer.svg.append(circleNode);
};

const appendSolidSquare = (layer, box, color) => {
  const squareNode = document.createElementNS(SVG_NAMESPACE, "rect");
  squareNode.setAttribute("x", box.x);
  squareNode.setAttribute("y", box.y);
  squareNode.setAttribute("width", box.w);
  squareNode.setAttribute("height", box.h);
  squareNode.setAttribute("fill", color);
  squareNode.setAttribute("stroke", "none");
  layer.svg.append(squareNode);
};

const pickSolidDotColor = (element) => {
  const { readFill, readTone } = window.SketchWireframe;
  const fill = readFill(element);
  const hasFill = fill !== null;
  if (hasFill) return SKETCH_SATURATED_FILL_COLORS[fill];
  return SKETCH_TONE_COLORS[readTone(element)];
};

const shrinkBox = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

const createRotatedRectanglePoints = (centerX, centerY, width, height, angleDegrees) => {
  const angle = (angleDegrees * Math.PI) / 180;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const corners = [
    [-width / 2, -height / 2],
    [width / 2, -height / 2],
    [width / 2, height / 2],
    [-width / 2, height / 2],
  ];
  return corners.map(([cornerX, cornerY]) => ({
    x: centerX + cornerX * cosine - cornerY * sine,
    y: centerY + cornerX * sine + cornerY * cosine,
  }));
};

const createStarPoints = (centerX, centerY, outerRadius) => {
  const innerRadius = outerRadius * STAR_INNER_RATIO;
  const pointCount = STAR_POINT_COUNT * 2;
  return [...Array(pointCount).keys()].map((pointIndex) => {
    const isOuterPoint = pointIndex % 2 === 0;
    const radius = isOuterPoint ? outerRadius : innerRadius;
    const angle = (Math.PI * 2 * pointIndex) / pointCount - Math.PI / 2;
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
  });
};

const createTicketPath = (box, notchRadius) => {
  const right = box.x + box.w;
  const bottom = box.y + box.h;
  const middleY = box.y + box.h / 2;
  return [
    "M", box.x, box.y,
    "H", right,
    "V", middleY - notchRadius,
    "A", notchRadius, notchRadius, 0, 0, 0, right, middleY + notchRadius,
    "V", bottom,
    "H", box.x,
    "V", middleY + notchRadius,
    "A", notchRadius, notchRadius, 0, 0, 0, box.x, middleY - notchRadius,
    "Z",
  ].join(" ");
};

const drawMountainScene = (layer, box, seed) => {
  const { polyline, circle } = window.SketchWireframe;
  const mountainPoints = MOUNTAIN_POINT_RATIOS.map(([ratioX, ratioY]) => ({
    x: box.x + box.w * ratioX,
    y: box.y + box.h * ratioY,
  }));
  polyline(layer, mountainPoints, { tone: "soft", seed: seed + 1 });

  const sunSize = Math.min(box.w, box.h) * SUN_SIZE_RATIO;
  const sunBox = { x: box.x + box.w * 0.74, y: box.y + box.h * 0.14, w: sunSize, h: sunSize };
  circle(layer, sunBox, { tone: "orange", fill: "yellow", seed: seed + 2 });
};

const drawEdgeArrows = (layer, box, isRtl, tone, seed) => {
  const { chevron } = window.SketchWireframe;
  const arrowSize = Math.min(box.w, box.h) * ARROW_SIZE_RATIO;
  const arrowInset = Math.min(box.w, box.h) * ARROW_INSET_RATIO;
  const arrowY = box.y + box.h / 2 - arrowSize / 2;

  const startArrowBox = { x: pickStartSideX(box, arrowInset, arrowSize, isRtl), y: arrowY, w: arrowSize, h: arrowSize };
  const endArrowBox = { x: pickEndDistanceX(box, arrowInset + arrowSize, isRtl), y: arrowY, w: arrowSize, h: arrowSize };
  const startDirection = isRtl ? "right" : "left";
  const endDirection = isRtl ? "left" : "right";
  chevron(layer, startArrowBox, startDirection, { tone, seed: seed + 1 });
  chevron(layer, endArrowBox, endDirection, { tone, seed: seed + 2 });
};

const drawDotRow = (layer, box, dotCount, seed) => {
  const { circle } = window.SketchWireframe;
  const dotSize = Math.min(box.w, box.h) * DOT_SIZE_RATIO;
  const dotCenterY = box.y + box.h * DOT_ROW_Y_RATIO;
  for (const dotIndex of [...Array(dotCount).keys()]) {
    const dotCenterX = box.x + (box.w * (dotIndex + 1)) / (dotCount + 1);
    const dotBox = { x: dotCenterX - dotSize / 2, y: dotCenterY - dotSize / 2, w: dotSize, h: dotSize };
    const isFirstDot = dotIndex === 0;
    const fill = isFirstDot ? "blue" : null;
    circle(layer, dotBox, { tone: "ink", fill, seed: seed + dotIndex });
  }
};

const drawRoundedOutline = (drawing) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
};

const drawCalendarDay = (drawing) => {
  const { roundedRectangle, rectangle, circle, readStatus, readFill, isChecked } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isSelected = readStatus(element) === "selected";
  const rangeFill = readFill(element);
  const isRangeDay = rangeFill !== null;
  const isToday = isChecked(element);
  const dayBox = shrinkBox(box, Math.min(box.w, box.h) * CALENDAR_CELL_INSET_RATIO);

  if (isRangeDay) {
    const bandBox = { x: box.x, y: dayBox.y, w: box.w, h: dayBox.h };
    rectangle(under, bandBox, { tone: "soft", fill: rangeFill, seed });
  }

  if (isSelected) {
    roundedRectangle(under, dayBox, { tone: "blue", fill: "blue", seed: seed + 1 });
  }

  if (isToday) {
    circle(under, dayBox, { tone: "red", seed: seed + 2 });
  }
};

window.SketchWireframe.definePart("sk-calendar", drawRoundedOutline);
window.SketchWireframe.definePart("sk-date-range-calendar", drawRoundedOutline);
window.SketchWireframe.definePart("sk-week-strip", drawRoundedOutline);
window.SketchWireframe.definePart("sk-calendar-day", drawCalendarDay);
const drawWeekDay = (drawing) => {
  const { roundedRectangle, readStatus, isChecked } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isSelected = readStatus(element) === "selected";
  const isToday = isChecked(element);

  if (isSelected) roundedRectangle(under, box, { tone: "blue", fill: "blue", seed: seed + 1 });

  const todayBox = shrinkBox(box, Math.min(box.w, box.h) * WEEK_TODAY_INSET_RATIO);
  if (isToday) roundedRectangle(under, todayBox, { tone: "red", seed: seed + 2 });
};

window.SketchWireframe.definePart("sk-week-day", drawWeekDay);

window.SketchWireframe.definePart("sk-code-snippet", (drawing) => {
  const { roundedRectangle, icon, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });

  const buttonSize = fontSize * COPY_BUTTON_EM;
  const buttonInset = fontSize * COPY_BUTTON_INSET_EM;
  const buttonX = pickEndDistanceX(box, buttonInset + buttonSize, isRightToLeft(element));
  const buttonBox = { x: buttonX, y: box.y + buttonInset, w: buttonSize, h: buttonSize };
  roundedRectangle(under, buttonBox, { tone: "soft", seed: seed + 1 });

  const iconSize = fontSize * COPY_ICON_EM;
  const iconInset = (buttonSize - iconSize) / 2;
  icon(under, shrinkBox(buttonBox, iconInset), "copy", { tone: "ink", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-image", (drawing) => {
  const { rectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  rectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
  drawMountainScene(under, box, seed);
});

window.SketchWireframe.definePart("sk-cover-image", (drawing) => {
  const { roundedRectangle, rectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
  drawMountainScene(under, box, seed);

  const bandBox = { x: box.x, y: box.y + box.h * 0.72, w: box.w, h: box.h * 0.28 };
  rectangle(under, bandBox, { tone: "soft", fill: "grey", seed: seed + 5 });
});

window.SketchWireframe.definePart("sk-image-viewer", (drawing) => {
  const { roundedRectangle, readCount, readTone, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  roundedRectangle(under, box, { tone, seed });
  drawMountainScene(under, box, seed);
  drawEdgeArrows(under, box, isRightToLeft(element), tone, seed + 10);
  drawDotRow(under, box, readCount(element, DEFAULT_DOT_COUNT), seed + 20);
});

window.SketchWireframe.definePart("sk-carousel", (drawing) => {
  const { roundedRectangle, readCount, readTone, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  roundedRectangle(under, box, { tone, seed });
  drawEdgeArrows(under, box, isRightToLeft(element), tone, seed + 10);
  drawDotRow(under, box, readCount(element, DEFAULT_DOT_COUNT), seed + 20);
});

window.SketchWireframe.definePart("sk-video-player", (drawing) => {
  const { roundedRectangle, polygon, line, circle, readTone, readFill, readPercent, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });

  const playSize = Math.min(box.w, box.h) * PLAY_SIZE_RATIO;
  const playCenterX = box.x + box.w / 2;
  const playCenterY = box.y + box.h * 0.45;
  const playPoints = [
    { x: playCenterX - playSize * 0.35, y: playCenterY - playSize / 2 },
    { x: playCenterX - playSize * 0.35, y: playCenterY + playSize / 2 },
    { x: playCenterX + playSize / 2, y: playCenterY },
  ];
  polygon(under, playPoints, { tone: "ink", fill: "blue", seed: seed + 1 });

  const isRtl = isRightToLeft(element);
  const trackY = box.y + box.h * VIDEO_TRACK_Y_RATIO;
  const trackInset = box.w * VIDEO_TRACK_INSET_RATIO;
  const trackStartX = pickStartDistanceX(box, trackInset, isRtl);
  const trackEndX = pickEndDistanceX(box, trackInset, isRtl);
  line(under, { x: trackStartX, y: trackY }, { x: trackEndX, y: trackY }, { tone: "soft", seed: seed + 2 });

  const percent = readPercent(element);
  const hasPercent = percent !== null;
  if (!hasPercent) return;

  const progressX = trackStartX + ((trackEndX - trackStartX) * percent) / PERCENT_SCALE;
  line(under, { x: trackStartX, y: trackY }, { x: progressX, y: trackY }, { tone: "blue", seed: seed + 3 });
  const knobSize = Math.min(box.w, box.h) * 0.05;
  const knobBox = { x: progressX - knobSize / 2, y: trackY - knobSize / 2, w: knobSize, h: knobSize };
  circle(under, knobBox, { tone: "blue", fill: "blue", seed: seed + 4 });
});

window.SketchWireframe.definePart("sk-photo-fan", (drawing) => {
  const { polygon } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  const photoWidth = box.w * PHOTO_FAN_WIDTH_RATIO;
  const photoHeight = box.h * PHOTO_FAN_HEIGHT_RATIO;
  for (const [photoIndex, photo] of PHOTO_FAN_PHOTOS.entries()) {
    const photoPoints = createRotatedRectanglePoints(centerX, centerY, photoWidth, photoHeight, photo.angleDegrees);
    polygon(under, photoPoints, { tone: "ink", fill: photo.fill, seed: seed + photoIndex });
  }
});

window.SketchWireframe.definePart("sk-map", (drawing) => {
  const { roundedRectangle, polyline, polygon, circle, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), seed });

  for (const [roadIndex, roadRatios] of MAP_ROAD_RATIO_SETS.entries()) {
    const roadPoints = roadRatios.map(([ratioX, ratioY]) => ({ x: box.x + box.w * ratioX, y: box.y + box.h * ratioY }));
    polyline(under, roadPoints, { tone: "soft", seed: seed + 1 + roadIndex });
  }

  const pinSize = Math.min(box.w, box.h) * MAP_PIN_SIZE_RATIO;
  const pinCenterX = box.x + box.w * MAP_PIN_X_RATIO;
  const pinHeadY = box.y + box.h * MAP_PIN_Y_RATIO;
  const pinTipPoints = [
    { x: pinCenterX - pinSize * 0.4, y: pinHeadY + pinSize * 0.15 },
    { x: pinCenterX, y: pinHeadY + pinSize * 1.2 },
    { x: pinCenterX + pinSize * 0.4, y: pinHeadY + pinSize * 0.15 },
  ];
  polygon(under, pinTipPoints, { tone: "red", fill: "red", seed: seed + 5 });

  const pinHeadBox = { x: pinCenterX - pinSize / 2, y: pinHeadY - pinSize / 2, w: pinSize, h: pinSize };
  circle(under, pinHeadBox, { tone: "red", fill: "red", seed: seed + 6 });
});

const isQrFinderZone = (row, column) => {
  const finderEdge = QR_GRID_SIZE - QR_FINDER_SIZE;
  const isTopLeft = row < QR_FINDER_SIZE && column < QR_FINDER_SIZE;
  const isTopRight = row < QR_FINDER_SIZE && column >= finderEdge;
  const isBottomLeft = row >= finderEdge && column < QR_FINDER_SIZE;
  return isTopLeft || isTopRight || isBottomLeft;
};

const isQrDarkCell = (row, column, seed) => {
  const cellHash = Math.imul(row + 1, 73856093) ^ Math.imul(column + 1, 19349663) ^ Math.imul(seed, 83492791);
  const mixedHash = Math.imul(cellHash ^ (cellHash >>> QR_HASH_SHIFT), QR_HASH_MIX);
  const spreadHash = (mixedHash ^ (mixedHash >>> QR_HASH_SHIFT)) >>> 0;
  return spreadHash % QR_PERCENT_RANGE < QR_DARK_CELL_PERCENT;
};

const readQrModuleBox = (box, moduleSize, row, column, inset) => ({
  x: box.x + column * moduleSize + inset,
  y: box.y + row * moduleSize + inset,
  w: moduleSize - inset * 2,
  h: moduleSize - inset * 2,
});

window.SketchWireframe.definePart("sk-qr-code", (drawing) => {
  const { rectangle } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const moduleSize = Math.min(box.w, box.h) / QR_GRID_SIZE;
  const moduleInset = moduleSize * QR_MODULE_GAP_RATIO;

  const cellIndexes = [...Array(QR_GRID_SIZE * QR_GRID_SIZE).keys()];
  const darkCells = cellIndexes
    .map((cellIndex) => ({ row: Math.floor(cellIndex / QR_GRID_SIZE), column: cellIndex % QR_GRID_SIZE }))
    .filter((cell) => !isQrFinderZone(cell.row, cell.column) && isQrDarkCell(cell.row, cell.column, seed));
  for (const darkCell of darkCells) {
    const moduleBox = readQrModuleBox(box, moduleSize, darkCell.row, darkCell.column, moduleInset);
    appendSolidSquare(under, moduleBox, SKETCH_TONE_COLORS.ink);
  }

  const finderEdge = QR_GRID_SIZE - QR_FINDER_SIZE;
  const finderCorners = [
    { row: 0, column: 0 },
    { row: 0, column: finderEdge },
    { row: finderEdge, column: 0 },
  ];
  for (const [finderIndex, finderCorner] of finderCorners.entries()) {
    const finderBox = {
      x: box.x + finderCorner.column * moduleSize,
      y: box.y + finderCorner.row * moduleSize,
      w: QR_FINDER_SIZE * moduleSize,
      h: QR_FINDER_SIZE * moduleSize,
    };
    rectangle(under, finderBox, { tone: "ink", seed: seed + 900 + finderIndex });
    const innerBox = readQrModuleBox(box, moduleSize, finderCorner.row + QR_FINDER_INNER_OFFSET, finderCorner.column + QR_FINDER_INNER_OFFSET, 0);
    appendSolidSquare(under, { ...innerBox, w: QR_FINDER_INNER_SIZE * moduleSize, h: QR_FINDER_INNER_SIZE * moduleSize }, SKETCH_TONE_COLORS.ink);
  }
});

window.SketchWireframe.definePart("sk-timeline-item", (drawing) => {
  const { line, circle, icon, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  const isRtl = isRightToLeft(element);
  const tone = readTone(element);
  const dotDiameter = fontSize * TIMELINE_DOT_DIAMETER_EM;
  const dotCenterX = pickStartDistanceX(box, fontSize * TIMELINE_DOT_CENTER_EM, isRtl);
  const dotCenterY = box.y + fontSize * TIMELINE_FIRST_LINE_CENTER_EM;
  const dotBox = { x: dotCenterX - dotDiameter / 2, y: dotCenterY - dotDiameter / 2, w: dotDiameter, h: dotDiameter };
  circle(under, dotBox, { tone, fill: readFill(element), seed });

  const iconName = readIconName(element);
  const hasIcon = iconName !== null;
  if (hasIcon) icon(under, shrinkBox(dotBox, dotDiameter * TIMELINE_ICON_INSET_RATIO), iconName, { tone, seed: seed + 1 });

  const isLastItem = element.nextElementSibling === null;
  if (isLastItem) return;

  const lineTopY = dotCenterY + dotDiameter / 2;
  line(under, { x: dotCenterX, y: lineTopY }, { x: dotCenterX, y: box.y + box.h }, { tone: "soft", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-activity-feed", (drawing) => {
  const { circle, icon, line, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  const isRtl = isRightToLeft(element);
  const tone = readTone(element);
  const avatarDiameter = fontSize * ACTIVITY_AVATAR_EM;
  const avatarCenterX = pickStartDistanceX(box, avatarDiameter / 2, isRtl);
  const avatarCenterY = box.y + avatarDiameter / 2;
  const avatarBox = {
    x: avatarCenterX - avatarDiameter / 2,
    y: avatarCenterY - avatarDiameter / 2,
    w: avatarDiameter,
    h: avatarDiameter,
  };
  circle(under, avatarBox, { tone: "soft", fill: readFill(element), seed });
  icon(under, shrinkBox(avatarBox, avatarDiameter * ACTIVITY_ICON_INSET_RATIO), "user", { tone, seed: seed + 1 });

  const isLastRow = element.nextElementSibling === null;
  if (isLastRow) return;

  const lineTopY = avatarCenterY + avatarDiameter / 2;
  line(under, { x: avatarCenterX, y: lineTopY }, { x: avatarCenterX, y: box.y + box.h }, { tone: "soft", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-speech-bubble", (drawing) => {
  const { roundedRectangle, polygon, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element);
  roundedRectangle(under, box, { tone, fill, seed });

  const isOwnMessage = element.classList.contains("sk-from-me");
  const isRtl = isRightToLeft(element);
  const isTailAtEnd = isOwnMessage;
  const tailSideSign = isTailAtEnd ? 1 : -1;
  const tailOutwardSign = isRtl ? -tailSideSign : tailSideSign;
  const tailEdgeX = isTailAtEnd ? pickEndDistanceX(box, 0, isRtl) : pickStartDistanceX(box, 0, isRtl);
  const tailSize = Math.min(box.w, box.h) * BUBBLE_TAIL_SIZE_RATIO;
  const bottomY = box.y + box.h;
  const tailPoints = [
    { x: tailEdgeX - tailOutwardSign * tailSize, y: bottomY },
    { x: tailEdgeX + tailOutwardSign * tailSize * 0.3, y: bottomY + tailSize },
    { x: tailEdgeX, y: bottomY },
  ];
  polygon(under, tailPoints, { tone, fill, seed: seed + 1 });
});

const pickTrendDirection = (tone) => {
  if (tone === "green") return "up";
  if (tone === "red") return "down";
  return null;
};

window.SketchWireframe.definePart("sk-metric", (drawing) => {
  const { roundedRectangle, chevron, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  roundedRectangle(under, box, { tone, fill: readFill(element), seed });

  const trendDirection = pickTrendDirection(tone);
  const hasTrend = trendDirection !== null;
  if (!hasTrend) return;

  const trendSize = Math.min(box.w, box.h) * METRIC_TREND_SIZE_RATIO;
  const trendInset = trendSize;
  const trendX = pickEndDistanceX(box, trendInset + trendSize, isRightToLeft(element));
  const trendBox = { x: trendX, y: box.y + trendInset, w: trendSize, h: trendSize };
  chevron(under, trendBox, trendDirection, { tone, seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-stat-bar", (drawing) => {
  const { roundedRectangle, rectangle, readTone, readFill, readPercent, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), seed });

  const percent = readPercent(element);
  const hasPercent = percent !== null;
  if (!hasPercent) return;

  const fillWidth = (box.w * percent) / PERCENT_SCALE;
  const fillBox = { x: pickStartSideX(box, 0, fillWidth, isRightToLeft(element)), y: box.y, w: fillWidth, h: box.h };
  rectangle(under, fillBox, { tone: "blue", fill: readFill(element) ?? DEFAULT_BAR_FILL, seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-leaderboard-row", (drawing) => {
  const { circle, line, readCount, readTone, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  const rank = readCount(element, 0);
  const rankDiameter = fontSize * LEADERBOARD_RANK_DIAMETER_EM;
  const rankCenterX = pickStartDistanceX(box, fontSize * LEADERBOARD_RANK_CENTER_EM, isRightToLeft(element));
  const rankCenterY = box.y + box.h / 2;
  const rankBox = { x: rankCenterX - rankDiameter / 2, y: rankCenterY - rankDiameter / 2, w: rankDiameter, h: rankDiameter };
  const rankFill = LEADERBOARD_RANK_FILLS[rank - 1] ?? null;
  circle(under, rankBox, { tone: readTone(element), fill: rankFill, seed });

  const isLastRow = element.nextElementSibling === null;
  if (isLastRow) return;

  const dividerY = box.y + box.h;
  line(under, { x: box.x, y: dividerY }, { x: box.x + box.w, y: dividerY }, { tone: "soft", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-feature", (drawing) => {
  const { icon, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const fontSize = Number.parseFloat(window.getComputedStyle(element).fontSize);
  const iconSize = fontSize * FEATURE_ICON_EM;
  const iconBox = {
    x: pickStartSideX(box, 0, iconSize, isRightToLeft(element)),
    y: box.y + (box.h - iconSize) / 2,
    w: iconSize,
    h: iconSize,
  };
  icon(under, iconBox, "check", { tone: "green", seed });
});

window.SketchWireframe.definePart("sk-pricing-card", drawRoundedOutline);
window.SketchWireframe.definePart("sk-testimonial", drawRoundedOutline);

window.SketchWireframe.definePart("sk-receipt", (drawing) => {
  const { polygon, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const toothHeight = Math.min(box.w, box.h) * RECEIPT_TOOTH_RATIO;
  const toothWidth = box.w / RECEIPT_TOOTH_COUNT;
  const toothIndexes = [...Array(RECEIPT_TOOTH_COUNT + 1).keys()];
  const bottomY = box.y + box.h;
  const topPoints = toothIndexes.map((toothIndex) => {
    const isPeak = toothIndex % 2 === 0;
    return { x: box.x + toothWidth * toothIndex, y: box.y + (isPeak ? 0 : toothHeight) };
  });
  const bottomPoints = [...toothIndexes].reverse().map((toothIndex) => {
    const isPeak = toothIndex % 2 === 0;
    return { x: box.x + toothWidth * toothIndex, y: bottomY - (isPeak ? 0 : toothHeight) };
  });
  polygon(under, [...topPoints, ...bottomPoints], { tone: readTone(element), fill: readFill(element), seed });
});

const drawBarcode = (layer, box, stubStartX, isRtl, seed) => {
  const { line } = window.SketchWireframe;
  const stubEndX = pickEndDistanceX(box, box.w * 0.06, isRtl);
  const barTopY = box.y + box.h * BARCODE_TOP_RATIO;
  const barBottomY = box.y + box.h * BARCODE_BOTTOM_RATIO;
  for (const barIndex of [...Array(BARCODE_BAR_COUNT).keys()]) {
    const barX = stubStartX + ((stubEndX - stubStartX) * (barIndex + 1)) / (BARCODE_BAR_COUNT + 1);
    const isTallBar = barIndex % 3 === 0;
    const barTop = isTallBar ? barTopY : barTopY + (barBottomY - barTopY) * 0.15;
    line(layer, { x: barX, y: barTop }, { x: barX, y: barBottomY }, { tone: "ink", seed: seed + barIndex });
  }
};

const drawTicketShape = (drawing, hasBarcode) => {
  const { path, line, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const notchRadius = Math.min(box.w, box.h) * TICKET_NOTCH_RATIO;
  path(under, createTicketPath(box, notchRadius), { tone, fill: readFill(element), seed });

  const isRtl = isRightToLeft(element);
  const perforationX = pickStartDistanceX(box, box.w * TICKET_PERFORATION_RATIO, isRtl);
  line(under, { x: perforationX, y: box.y }, { x: perforationX, y: box.y + box.h }, { tone: "soft", dashed: true, seed: seed + 1 });
  if (hasBarcode) drawBarcode(under, box, perforationX, isRtl, seed + 20);
};

window.SketchWireframe.definePart("sk-ticket", (drawing) => drawTicketShape(drawing, false));
window.SketchWireframe.definePart("sk-boarding-pass", (drawing) => drawTicketShape(drawing, true));

window.SketchWireframe.definePart("sk-credit-card", (drawing) => {
  const { roundedRectangle, line, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  roundedRectangle(under, box, { tone, fill: readFill(element), seed });

  const chipWidth = box.w * CARD_CHIP_WIDTH_RATIO;
  const chipHeight = box.h * CARD_CHIP_HEIGHT_RATIO;
  const chipX = pickStartSideX(box, box.w * CARD_CHIP_LEFT_RATIO, chipWidth, isRightToLeft(element));
  const chipBox = { x: chipX, y: box.y + box.h * CARD_CHIP_TOP_RATIO, w: chipWidth, h: chipHeight };
  roundedRectangle(under, chipBox, { tone: "ink", fill: "yellow", seed: seed + 1 });

  const chipMiddleY = chipBox.y + chipBox.h / 2;
  line(under, { x: chipBox.x, y: chipMiddleY }, { x: chipBox.x + chipBox.w, y: chipMiddleY }, { tone: "soft", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-streak", (drawing) => {
  const { circle, readCount, readTone, isRightToLeft, tick } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const doneDayCount = readCount(element, 0);
  const isRtl = isRightToLeft(element);
  const daySpacing = box.w / STREAK_DAY_COUNT;
  const dayDiameter = Math.min(daySpacing * STREAK_DAY_SPACING_RATIO, box.h * STREAK_DAY_DIAMETER_RATIO);
  const dayCenterY = box.y + box.h / 2;
  for (const dayIndex of [...Array(STREAK_DAY_COUNT).keys()]) {
    const dayCenterX = pickStartDistanceX(box, daySpacing * (dayIndex + 0.5), isRtl);
    const dayBox = { x: dayCenterX - dayDiameter / 2, y: dayCenterY - dayDiameter / 2, w: dayDiameter, h: dayDiameter };
    const isDayDone = dayIndex < doneDayCount;
    const isDayEmpty = dayIndex >= doneDayCount;

    if (isDayDone) {
      appendSolidCircle(under, dayBox, SKETCH_SATURATED_FILL_COLORS.green);
      tick(under, shrinkBox(dayBox, dayDiameter * STREAK_TICK_INSET_RATIO), { tone: "ink", seed: seed + 20 + dayIndex });
    }

    if (isDayEmpty) circle(under, dayBox, { tone: readTone(element), seed: seed + dayIndex });
  }
});

window.SketchWireframe.definePart("sk-rating-badge", (drawing) => {
  const { path, polygon, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  path(under, createPillPath(box), { tone: readTone(element), fill: readFill(element), seed });

  const starRadius = box.h * RATING_STAR_RATIO;
  const starCenterX = pickStartDistanceX(box, box.h / 2, isRightToLeft(element));
  const starCenterY = box.y + box.h / 2;
  polygon(under, createStarPoints(starCenterX, starCenterY, starRadius), { tone: "orange", fill: "yellow", seed: seed + 1 });
});

const COUNTDOWN_UNIT_COUNT = 4;
const COUNTDOWN_UNIT_GAP_RATIO = 0.06;

window.SketchWireframe.definePart("sk-countdown", (drawing) => {
  const { roundedRectangle, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element);
  const isRtl = isRightToLeft(element);
  const unitWidth = box.w / COUNTDOWN_UNIT_COUNT;
  const unitGap = Math.min(box.w, box.h) * COUNTDOWN_UNIT_GAP_RATIO;
  for (const unitIndex of [...Array(COUNTDOWN_UNIT_COUNT).keys()]) {
    const unitX = pickStartSideX(box, unitWidth * unitIndex, unitWidth, isRtl);
    const unitBox = { x: unitX, y: box.y, w: unitWidth, h: box.h };
    roundedRectangle(under, shrinkBox(unitBox, unitGap), { tone, fill, seed: seed + unitIndex });
  }
});

window.SketchWireframe.definePart("sk-message-thread", drawRoundedOutline);
`;

export const CONTENT_PART_STYLE = `:where(.sk-card) {
  display: block;
  min-width: 8rem;
  min-height: 6rem;
  padding: 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-heading) {
  display: block;
  min-width: 6rem;
  padding-bottom: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
}

:where(.sk-text-lines) {
  display: block;
  min-width: 6rem;
  min-height: 3rem;
  line-height: 1.75;
}

:where(.sk-paragraph) {
  display: block;
  min-width: 6rem;
  font-size: 1rem;
  line-height: 1.75;
}

:where(.sk-label) {
  display: inline-block;
  padding-bottom: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.5;
}

:where(.sk-separator) {
  display: block;
  min-width: 4rem;
  height: 1rem;
}

:where(.sk-avatar) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1.6px solid transparent;
  font-weight: 700;
}

:where(.sk-avatar.sk-large) {
  width: 3.5rem;
  height: 3.5rem;
}

:where(.sk-avatar-group) {
  display: inline-flex;
  align-items: center;
}

:where(.sk-avatar-group > .sk-avatar + .sk-avatar) {
  margin-inline-start: -0.6rem;
}

:where(.sk-avatar-label) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

:where(.sk-badge) {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding: 0.125rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 700;
}

:where(.sk-badge-group) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

:where(.sk-tag) {
  display: inline-flex;
  align-items: center;
  min-height: 1.75rem;
  padding: 0.125rem 0.75rem;
  font-size: 0.9375rem;
}

:where(.sk-tag[data-icon]) {
  padding-inline-end: 2rem;
}

:where(.sk-chip-row) {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

:where(.sk-status-light) {
  display: inline-flex;
  align-items: center;
  min-height: 1.5rem;
  padding-inline-start: 1.5em;
  font-size: 0.9375rem;
}

:where(.sk-dot) {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
}

:where(.sk-card-stack) {
  display: block;
  min-width: 8rem;
  padding-inline-end: 1rem;
  padding-bottom: 1rem;
}

:where(.sk-folder-card) {
  display: block;
  min-width: 8rem;
  min-height: 6rem;
  padding: 1.75rem 1rem 1rem;
}

:where(.sk-option-card) {
  display: block;
  min-width: 8rem;
  min-height: 4rem;
  padding: 0.75rem 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-panel) {
  display: block;
  min-width: 8rem;
  min-height: 5rem;
  padding: 1rem;
  border: 1.6px solid transparent;
}

:where(.sk-list, .sk-sortable-list) {
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  padding: 0.25rem 0;
}

:where(.sk-list-item) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
}

:where(.sk-list-item.sk-with-chevron) {
  padding-inline-end: 2.25rem;
}

:where(.sk-list-item.sk-sortable) {
  padding-inline-start: 2.25rem;
}

:where(.sk-swipe-row) {
  display: flex;
  align-items: center;
  min-height: 3rem;
  overflow: hidden;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-table) {
  display: block;
  min-width: 14rem;
  padding: 0.25rem 0;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-table-row) {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
}

:where(.sk-table-row.sk-table-head) {
  min-height: 2.75rem;
  font-weight: 700;
}

:where(.sk-description-list) {
  display: flex;
  flex-direction: column;
  min-width: 12rem;
}

:where(.sk-accordion) {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 12rem;
}

:where(.sk-accordion-item, .sk-collapsible) {
  display: block;
  min-width: 12rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-accordion-trigger, .sk-collapsible-trigger) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 2.75rem;
  padding: 0.5rem 2rem 0.5rem 1rem;
}

:where(.sk-accordion-content) {
  padding: 0 1rem 0.75rem;
}

:where(.sk-tree-view) {
  display: flex;
  flex-direction: column;
  min-width: 12rem;
}

:where(.sk-tree-row) {
  display: flex;
  align-items: center;
  min-height: 2rem;
  padding-inline-start: calc(var(--depth, 0) * 1.25em + 1.5em);
  padding-inline-end: 0.5rem;
}

:where(.sk-calendar, .sk-date-range-calendar) {
  display: grid;
  grid-template-columns: repeat(7, minmax(2rem, 1fr));
  gap: 0.25rem;
  min-width: 14rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-calendar-day, .sk-week-day) {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  min-height: 2rem;
  font-size: 1rem;
  line-height: 1;
}

:where(.sk-week-strip) {
  display: flex;
  gap: 0.25rem;
  min-width: 16rem;
  padding: 0.5rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-week-day) {
  flex-direction: column;
  flex: 1 1 0;
  min-height: 3rem;
}

:where(.sk-code-snippet) {
  display: block;
  min-width: 12rem;
  padding: 1rem;
  padding-inline-end: 2.5rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre;
}

:where(.sk-image, .sk-cover-image) {
  display: block;
  min-width: 6rem;
  min-height: 4rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-image-viewer, .sk-carousel, .sk-video-player) {
  display: block;
  position: relative;
  min-width: 10rem;
  min-height: 8rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-photo-fan) {
  display: block;
  min-width: 8rem;
  min-height: 8rem;
}

:where(.sk-map) {
  display: block;
  min-width: 10rem;
  min-height: 8rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-qr-code) {
  display: block;
  min-width: 6rem;
  aspect-ratio: 1;
}

:where(.sk-timeline-item) {
  display: block;
  position: relative;
  min-height: 2.5rem;
  padding-inline-start: 2em;
  padding-bottom: 1rem;
  font-size: 1rem;
}

:where(.sk-activity-feed) {
  display: block;
  min-height: 3rem;
  padding-inline-start: 2.75em;
  padding-inline-end: 0.5rem;
  padding-bottom: 1rem;
  font-size: 1rem;
}

:where(.sk-speech-bubble) {
  display: block;
  position: relative;
  min-width: 4rem;
  max-width: 70%;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
}

:where(.sk-metric, .sk-pricing-card, .sk-testimonial, .sk-message-thread) {
  display: block;
  min-width: 8rem;
  min-height: 6rem;
  padding: 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-metric) {
  padding-inline-end: 2.5rem;
}

:where(.sk-message-thread) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 14rem;
}

:where(.sk-stat-bar) {
  display: block;
  min-width: 8rem;
  min-height: 1.25rem;
  border: 1.6px solid transparent;
  border-radius: 999px;
}

:where(.sk-leaderboard-row) {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 3rem;
  padding-inline-start: 3em;
  padding-inline-end: 0.75rem;
  font-size: 1rem;
}

:where(.sk-leaderboard-rank) {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0.6em;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.8em;
  font-weight: 700;
}

:where(.sk-speech-bubble.sk-from-me) {
  align-self: flex-end;
}

:where(.sk-feature) {
  display: flex;
  align-items: flex-start;
  min-width: 8rem;
  padding-inline-start: 1.5em;
  font-size: 1rem;
}

:where(.sk-receipt) {
  display: block;
  min-width: 10rem;
  padding: 1rem 1rem 1.5rem;
  font-family: "IBM Plex Mono", ui-monospace, monospace;
}

:where(.sk-ticket, .sk-boarding-pass) {
  display: flex;
  min-width: 14rem;
  min-height: 6rem;
  padding: 1rem;
  padding-inline-start: 1.25rem;
  border: 1.6px solid transparent;
}

:where(.sk-credit-card) {
  display: block;
  min-width: 14rem;
  aspect-ratio: 1.586;
  padding: 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
}

:where(.sk-streak) {
  display: flex;
  align-items: center;
  min-width: 14rem;
  min-height: 2.5rem;
}

:where(.sk-rating-badge) {
  display: inline-flex;
  align-items: center;
  min-width: 4rem;
  min-height: 2rem;
  padding-inline-start: 2em;
  padding-inline-end: 0.75rem;
  border: 1.6px solid transparent;
}

:where(.sk-countdown) {
  display: flex;
  gap: 0;
  min-width: 14rem;
  min-height: 4.5rem;
  border: 1.6px solid transparent;
}
`;
