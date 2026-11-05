export const OVERLAYS_PART_SCRIPT = `
const HATCH_LINE_COLOR = "#adb5bd";
const HATCH_GAP = 6;
const HATCH_ANGLE = -41;
const DRAWN_ROUGHNESS = 1.1;
const DEFAULT_PANEL_FILL = "grey";
const DEFAULT_BANNER_FILL = "yellow";
const NOTICE_ICON_NAME_BY_TONE = { blue: "info", green: "check", orange: "triangle-alert", red: "circle-alert" };
const NOTICE_DEFAULT_ICON_NAME = "bell";
const ALERT_FILL_BY_TONE = { blue: "blue", green: "green", orange: "orange", red: "red" };
const NOTICE_ICON_SLOT_RATIO = 0.5;
const NOTICE_ICON_INSET_RATIO = 0.25;
const POINTER_HALF_WIDTH_RATIO = 0.04;
const POINTER_HEIGHT_RATIO = 0.06;
const SHEET_HANDLE_OFFSET_RATIO = 0.05;
const SHEET_HANDLE_HALF_WIDTH_RATIO = 0.06;
const DRAWER_EDGE_OFFSET_RATIO = 0.03;
const MENU_ROW_INSET_RATIO = 0.08;
const MENU_DIVIDER_INSET_RATIO = 0.05;
const EMPTY_ICON_INSET_RATIO = 0.25;
const PROGRESS_INSET_RATIO = 0.2;
const RING_RADIUS_RATIO = 0.42;
const SPINNER_SWEEP_ANGLE = Math.PI * 1.5;
const HALF_TURN = Math.PI;
const TOP_ANGLE = -Math.PI / 2;
const FULL_TURN = Math.PI * 2;
const PERCENT_MAX = 100;

const insetBoxBy = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

const createHatchStyle = (seed) => ({
  stroke: "none",
  fill: HATCH_LINE_COLOR,
  fillStyle: "hachure",
  hachureGap: HATCH_GAP,
  hachureAngle: HATCH_ANGLE,
  roughness: DRAWN_ROUGHNESS,
  seed,
});

const drawHatchRectangle = (layer, box, seed) => {
  const hatchStyle = createHatchStyle(seed);
  const hatchRectangle = layer.rough.rectangle(box.x, box.y, box.w, box.h, hatchStyle);

  layer.svg.append(hatchRectangle);
};

const drawHatchCircle = (layer, box, seed) => {
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  const diameter = Math.min(box.w, box.h);
  const hatchStyle = createHatchStyle(seed);
  const hatchCircle = layer.rough.circle(centerX, centerY, diameter, hatchStyle);

  layer.svg.append(hatchCircle);
};

const pickNoticeIconBox = (box, isRightToLeftLayout) => {
  const iconSide = box.h * NOTICE_ICON_SLOT_RATIO;
  const iconInset = box.h * NOTICE_ICON_INSET_RATIO;
  const iconTop = box.y + (box.h - iconSide) / 2;
  const iconStartX = isRightToLeftLayout ? box.x + box.w - iconInset - iconSide : box.x + iconInset;

  return { x: iconStartX, y: iconTop, w: iconSide, h: iconSide };
};

const drawNoticeIcon = (layer, box, iconName, style) => {
  const { icon } = window.SketchWireframe;
  icon(layer, box, iconName, style);
};

const drawNoticeCard = (drawing, defaultFillName) => {
  const { roundedRectangle, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? defaultFillName;
  roundedRectangle(under, box, { tone, fill, seed });

  const iconName = NOTICE_ICON_NAME_BY_TONE[tone] ?? NOTICE_DEFAULT_ICON_NAME;
  const isRightToLeftLayout = isRightToLeft(element);
  const iconBox = pickNoticeIconBox(box, isRightToLeftLayout);
  drawNoticeIcon(under, iconBox, iconName, { tone, seed: seed + 1 });
};

const drawAlert = (drawing) => {
  const { readTone } = window.SketchWireframe;
  const tone = readTone(drawing.element);
  const toneFillName = ALERT_FILL_BY_TONE[tone] ?? DEFAULT_PANEL_FILL;
  drawNoticeCard(drawing, toneFillName);
};

const drawBanner = (drawing) => {
  const { rectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? DEFAULT_BANNER_FILL;
  rectangle(under, box, { tone, fill, seed });
};

const drawScrim = (drawing) => {
  const { box, seed, under } = drawing;
  drawHatchRectangle(under, box, seed);
};

const drawPanelOutline = (drawing) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? DEFAULT_PANEL_FILL;
  roundedRectangle(under, box, { tone, fill, seed });
};

const drawSquarePanel = (drawing) => {
  const { rectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? DEFAULT_PANEL_FILL;
  rectangle(under, box, { tone, fill, seed });
};

const drawPointer = (layer, box, direction, style) => {
  const { polyline } = window.SketchWireframe;
  const pointerHalfWidth = box.w * POINTER_HALF_WIDTH_RATIO;
  const pointerHeight = box.w * POINTER_HEIGHT_RATIO;
  const centerX = box.x + box.w / 2;

  const isPointingUp = direction === "up";
  const baseY = isPointingUp ? box.y : box.y + box.h;
  const tipY = isPointingUp ? baseY - pointerHeight : baseY + pointerHeight;
  const pointerPoints = [
    { x: centerX - pointerHalfWidth, y: baseY },
    { x: centerX, y: tipY },
    { x: centerX + pointerHalfWidth, y: baseY },
  ];

  polyline(layer, pointerPoints, style);
};

const drawPointedPanel = (drawing, direction) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? DEFAULT_PANEL_FILL;
  roundedRectangle(under, box, { tone, fill, seed });

  drawPointer(under, box, direction, { tone, seed: seed + 1 });
};

const drawBottomSheet = (drawing) => {
  const { roundedRectangle, line, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? DEFAULT_PANEL_FILL;
  roundedRectangle(under, box, { tone, fill, seed });

  const handleY = box.y + box.h * SHEET_HANDLE_OFFSET_RATIO;
  const handleHalfWidth = box.w * SHEET_HANDLE_HALF_WIDTH_RATIO;
  const handleCenterX = box.x + box.w / 2;
  const handleStart = { x: handleCenterX - handleHalfWidth, y: handleY };
  const handleEnd = { x: handleCenterX + handleHalfWidth, y: handleY };
  line(under, handleStart, handleEnd, { tone: "soft", seed: seed + 1 });
};

const drawDrawerPanel = (drawing) => {
  const { rectangle, line, readTone, readFill, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  const fill = readFill(element) ?? DEFAULT_PANEL_FILL;
  rectangle(under, box, { tone, fill, seed });

  const edgeOffset = box.w * DRAWER_EDGE_OFFSET_RATIO;
  const isRightToLeftLayout = isRightToLeft(element);
  const innerEdgeX = isRightToLeftLayout ? box.x + edgeOffset : box.x + box.w - edgeOffset;
  const innerEdgeTop = { x: innerEdgeX, y: box.y };
  const innerEdgeBottom = { x: innerEdgeX, y: box.y + box.h };
  line(under, innerEdgeTop, innerEdgeBottom, { tone: "soft", seed: seed + 1 });
};

const drawMenuRow = (drawing) => {
  const { roundedRectangle, readStatus } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;

  const isHovered = readStatus(element) === "hover";
  if (isHovered) {
    const highlightBox = insetBoxBy(box, box.h * MENU_ROW_INSET_RATIO);
    roundedRectangle(under, highlightBox, { tone: "blue", fill: "blue", seed });
  }
};

const drawMenuDivider = (drawing) => {
  const { line } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const dividerY = box.y + box.h / 2;
  const insetX = box.w * MENU_DIVIDER_INSET_RATIO;
  const dividerStart = { x: box.x + insetX, y: dividerY };
  const dividerEnd = { x: box.x + box.w - insetX, y: dividerY };
  line(under, dividerStart, dividerEnd, { tone: "soft", seed });
};

const drawProgressBar = (drawing) => {
  const { rectangle, roundedRectangle, readPercent, readTone, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = readTone(element);
  roundedRectangle(under, box, { tone, seed });

  const percent = readPercent(element);
  const isPercentMissing = percent === null;
  if (isPercentMissing) return;

  const trackInside = insetBoxBy(box, box.h * PROGRESS_INSET_RATIO);
  const fillWidth = trackInside.w * (percent / PERCENT_MAX);

  const isFillEmpty = fillWidth === 0;
  if (isFillEmpty) return;

  const isRightToLeftLayout = isRightToLeft(element);
  const fillX = isRightToLeftLayout ? trackInside.x + trackInside.w - fillWidth : trackInside.x;
  const fillBox = { x: fillX, y: trackInside.y, w: fillWidth, h: trackInside.h };
  rectangle(under, fillBox, { tone: "blue", fill: "blue", seed: seed + 1 });
};

const pickRingBox = (box) => {
  const radius = Math.min(box.w, box.h) * RING_RADIUS_RATIO;
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  return { x: centerX - radius, y: centerY - radius, w: radius * 2, h: radius * 2 };
};

const createRingArcPath = (ringBox, sweepAngle) => {
  const radius = ringBox.w / 2;
  const centerX = ringBox.x + radius;
  const centerY = ringBox.y + radius;
  const endAngle = TOP_ANGLE + sweepAngle;
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);
  const isLargeArc = sweepAngle > HALF_TURN ? 1 : 0;

  return ["M", centerX, centerY - radius, "A", radius, radius, 0, isLargeArc, 1, endX, endY].join(" ");
};

const drawSpinnerArc = (drawing) => {
  const { circle, path, readTone } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const ringBox = pickRingBox(box);
  circle(under, ringBox, { tone: "soft", seed, dashed: true });

  const tone = readTone(element);
  const arcPath = createRingArcPath(ringBox, SPINNER_SWEEP_ANGLE);
  path(under, arcPath, { tone, seed: seed + 1 });
};

const drawProgressRing = (drawing) => {
  const { circle, path, readPercent } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const ringBox = pickRingBox(box);
  circle(under, ringBox, { tone: "soft", seed });

  const percent = readPercent(element);
  const isNoRingProgress = percent === null || percent === 0;
  if (isNoRingProgress) return;

  const isRingFull = percent >= PERCENT_MAX;
  if (isRingFull) {
    circle(under, ringBox, { tone: "blue", seed: seed + 1 });
    return;
  }

  const sweepAngle = (FULL_TURN * percent) / PERCENT_MAX;
  const arcPath = createRingArcPath(ringBox, sweepAngle);
  path(under, arcPath, { tone: "blue", seed: seed + 1 });
};

const drawSkeletonShape = (drawing) => {
  const { element, box, seed, under } = drawing;
  const isAvatar = element.classList.contains("sk-skeleton-avatar");
  if (isAvatar) {
    drawHatchCircle(under, box, seed);
    return;
  }

  drawHatchRectangle(under, box, seed);
};

const drawEmptyDrawing = (drawing) => {
  const { roundedRectangle, icon } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: "soft", seed, dashed: true });

  const iconBox = insetBoxBy(box, box.w * EMPTY_ICON_INSET_RATIO);
  icon(under, iconBox, "plus", { tone: "soft", seed: seed + 1 });
};

window.SketchWireframe.definePart("sk-scrim", drawScrim);
window.SketchWireframe.definePart("sk-dialog", drawPanelOutline);
window.SketchWireframe.definePart("sk-alert-dialog", drawPanelOutline);
window.SketchWireframe.definePart("sk-full-screen-modal", drawSquarePanel);
window.SketchWireframe.definePart("sk-bottom-sheet", drawBottomSheet);
window.SketchWireframe.definePart("sk-drawer", drawDrawerPanel);
window.SketchWireframe.definePart("sk-action-sheet", drawPanelOutline);
window.SketchWireframe.definePart("sk-popover", (drawing) => drawPointedPanel(drawing, "up"));
window.SketchWireframe.definePart("sk-tooltip", (drawing) => drawPointedPanel(drawing, "down"));
window.SketchWireframe.definePart("sk-hover-card", (drawing) => drawPointedPanel(drawing, "up"));
window.SketchWireframe.definePart("sk-tour-step", (drawing) => drawPointedPanel(drawing, "up"));
window.SketchWireframe.definePart("sk-dropdown-menu", drawPanelOutline);
window.SketchWireframe.definePart("sk-context-menu", drawPanelOutline);
window.SketchWireframe.definePart("sk-menu-row", drawMenuRow);
window.SketchWireframe.definePart("sk-menu-divider", drawMenuDivider);
window.SketchWireframe.definePart("sk-toast", (drawing) => drawNoticeCard(drawing, DEFAULT_PANEL_FILL));
window.SketchWireframe.definePart("sk-notification", (drawing) => drawNoticeCard(drawing, DEFAULT_PANEL_FILL));
window.SketchWireframe.definePart("sk-alert", drawAlert);
window.SketchWireframe.definePart("sk-banner", drawBanner);
window.SketchWireframe.definePart("sk-cookie-notice", drawPanelOutline);
window.SketchWireframe.definePart("sk-permission-prompt", drawPanelOutline);
window.SketchWireframe.definePart("sk-spinner", drawSpinnerArc);
window.SketchWireframe.definePart("sk-progress-bar", drawProgressBar);
window.SketchWireframe.definePart("sk-progress-circle", drawProgressRing);
window.SketchWireframe.definePart("sk-skeleton", drawSkeletonShape);
window.SketchWireframe.definePart("sk-empty-drawing", drawEmptyDrawing);
`;

export const OVERLAYS_PART_STYLE = `:where(.sk-scrim) {
  position: absolute;
  inset: 0;
  border: 1.6px solid transparent;
}

:where(.sk-dialog, .sk-alert-dialog, .sk-full-screen-modal, .sk-bottom-sheet, .sk-drawer, .sk-action-sheet, .sk-cookie-notice, .sk-permission-prompt, .sk-dropdown-menu, .sk-context-menu) {
  display: block;
  min-width: 10rem;
  padding: 1rem 1.25rem;
  border: 1.6px solid transparent;
  font-size: 1.125rem;
}

:where(.sk-popover, .sk-hover-card, .sk-tour-step) {
  display: block;
  min-width: 12rem;
  padding: 0.875rem 1.125rem;
  border: 1.6px solid transparent;
  font-size: 1.125rem;
}

:where(.sk-tooltip) {
  display: block;
  padding: 0.375rem 0.75rem;
  border: 1.6px solid transparent;
  font-size: 1rem;
}

:where(.sk-menu-row) {
  display: block;
  padding: 0.5rem 0.75rem;
  border: 1.6px solid transparent;
}

:where(.sk-menu-divider) {
  display: block;
  min-height: 0.75rem;
  border: 1.6px solid transparent;
}

:where(.sk-toast, .sk-notification, .sk-alert) {
  display: block;
  min-width: 12rem;
  padding-block: 0.75rem;
  padding-inline: 1rem;
  padding-inline-start: 3.25rem;
  border: 1.6px solid transparent;
}

:where(.sk-banner) {
  display: block;
  min-height: 3rem;
  padding: 0.75rem 1rem;
  border: 1.6px solid transparent;
}

:where(.sk-toast-stack, .sk-notification-stack) {
  display: grid;
  padding-block-end: 0.75rem;
  padding-inline-end: 0.75rem;
}

:where(.sk-toast-stack, .sk-notification-stack) > * {
  grid-area: 1 / 1;
}

:where(.sk-toast-stack, .sk-notification-stack) > *:nth-last-child(2) {
  transform: translate(0.5rem, 0.5rem);
}

:where(.sk-toast-stack, .sk-notification-stack) > *:nth-last-child(3) {
  transform: translate(1rem, 1rem);
}

:where(.sk-spinner) {
  display: inline-block;
  min-width: 2rem;
  min-height: 2rem;
  vertical-align: middle;
  border: 1.6px solid transparent;
}

:where(.sk-progress-bar) {
  display: block;
  min-width: 8rem;
  min-height: 1rem;
  border: 1.6px solid transparent;
}

:where(.sk-progress-circle) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  min-height: 4rem;
  font-size: 0.875rem;
  border: 1.6px solid transparent;
}

:where(.sk-skeleton) {
  display: block;
  min-width: 3rem;
  min-height: 1rem;
  border: 1.6px solid transparent;
}

:where(.sk-skeleton.sk-skeleton-line) {
  min-height: 0.75rem;
}

:where(.sk-skeleton.sk-skeleton-block) {
  min-height: 4rem;
}

:where(.sk-skeleton.sk-skeleton-avatar) {
  display: inline-block;
  min-width: 3rem;
  min-height: 3rem;
  aspect-ratio: 1 / 1;
}

:where(.sk-skeleton.sk-skeleton-card) {
  min-height: 7rem;
}

:where(.sk-empty-state) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  border: 1.6px solid transparent;
}

:where(.sk-empty-drawing) {
  display: block;
  min-width: 5rem;
  min-height: 5rem;
  border: 1.6px solid transparent;
}
`;
