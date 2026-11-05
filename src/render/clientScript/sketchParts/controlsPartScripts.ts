export const CONTROLS_PART_SCRIPT = `
const FOCUS_RING_INSET = 4;
const FILL_INSET = 3;
const SHADOW_OFFSET = 3;
const GHOST_UNDERLINE_GAP = 2;
const GHOST_UNDERLINE_TEXT_RATIO = 0.9;
const SELF_ICON_RATIO = 0.5;
const ARC_STEPS_PER_TURN = 36;
const ARC_START_ANGLE = -Math.PI / 2;
const FULL_TURN_RADIANS = 2 * Math.PI;
const PERCENT_SCALE = 100;
const SPINNER_ARC_PERCENT = 30;
const UNDO_RING_SIDE_RATIO = 0.6;
const UNDO_RING_INSET_RATIO = 0.2;
const SHUTTER_INNER_INSET_RATIO = 0.2;
const CHECKBOX_TICK_INSET_RATIO = 0.18;
const RADIO_DOT_INSET_RATIO = 0.28;
const SWITCH_KNOB_INSET_RATIO = 0.16;
const SLIDER_KNOB_RATIO = 0.8;
const COLOR_THUMB_SIDE_RATIO = 0.3;
const COLOR_AREA_THUMB_X_RATIO = 0.7;
const COLOR_AREA_THUMB_Y_RATIO = 0.3;
const COLOR_HUE_THUMB_RATIO = 0.4;
const COLOR_HUE_THUMB_SIDE_RATIO = 1.4;
const SIGNATURE_POINT_COUNT = 40;
const SIGNATURE_WAVE_RATIO = 0.3;
const SIGNATURE_WAVE_FREQUENCY = 0.9;
const SIGNATURE_SCRIBBLE_RATIO = 0.12;
const SIGNATURE_SCRIBBLE_FREQUENCY = 2.7;
const SIGNATURE_LEFT_RATIO = 0.08;
const SIGNATURE_WIDTH_RATIO = 0.84;
const SIGNATURE_CENTER_RATIO = 0.5;
const SIGNATURE_BASELINE_RATIO = 0.78;

const { rectangle, roundedRectangle, circle, line, polyline, tick, readStatus, isChecked, readPercent, readTone, readFill, isRightToLeft } = window.SketchWireframe;

const insetBoxBy = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

const measureRectInBox = (rect, elementRect, box) => {
  const scaleX = box.w / elementRect.width;
  const scaleY = box.h / elementRect.height;
  return {
    x: box.x + (rect.left - elementRect.left) * scaleX,
    y: box.y + (rect.top - elementRect.top) * scaleY,
    w: rect.width * scaleX,
    h: rect.height * scaleY,
  };
};

const readIconName = (element) => element.getAttribute("data-icon");

const drawSelfIcon = (layer, element, box, style) => {
  const iconName = readIconName(element);
  const isIconMissing = iconName === null;
  if (isIconMissing) return;

  const iconSide = Math.min(box.w, box.h) * SELF_ICON_RATIO;
  const iconBox = {
    x: box.x + (box.w - iconSide) / 2,
    y: box.y + (box.h - iconSide) / 2,
    w: iconSide,
    h: iconSide,
  };
  window.SketchWireframe.icon(layer, iconBox, iconName, style);
};

const drawChildIcons = (layer, element, box, style) => {
  const elementRect = element.getBoundingClientRect();
  const iconElements = [...element.querySelectorAll("[data-icon]")];
  for (const [index, iconElement] of iconElements.entries()) {
    const iconBox = measureRectInBox(iconElement.getBoundingClientRect(), elementRect, box);
    window.SketchWireframe.icon(layer, iconBox, readIconName(iconElement), { tone: style.tone, seed: style.seed + index + 1 });
  }
};

const pickArcPoints = (box, percent) => {
  const centerX = box.x + box.w / 2;
  const centerY = box.y + box.h / 2;
  const radius = Math.min(box.w, box.h) / 2;
  const stepCount = Math.max(2, Math.round((ARC_STEPS_PER_TURN * percent) / PERCENT_SCALE));
  const sweepRadians = (FULL_TURN_RADIANS * percent) / PERCENT_SCALE;
  return [...Array(stepCount + 1).keys()].map((step) => {
    const angle = ARC_START_ANGLE + sweepRadians * (step / stepCount);
    return { x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) };
  });
};

const drawArc = (layer, box, percent, style) => {
  polyline(layer, pickArcPoints(box, percent), style);
};

const drawProgressFill = (layer, box, percent, isFromEnd, style) => {
  const innerBox = insetBoxBy(box, FILL_INSET);
  const fillWidth = (innerBox.w * percent) / PERCENT_SCALE;
  const fillX = isFromEnd ? innerBox.x + innerBox.w - fillWidth : innerBox.x;
  rectangle(layer, { x: fillX, y: innerBox.y, w: fillWidth, h: innerBox.h }, style);
};

const pickButtonTone = (element) => {
  const isDisabled = readStatus(element) === "disabled";
  const isError = readStatus(element) === "error";
  const isDanger = element.classList.contains("sk-danger");
  const isLink = element.classList.contains("sk-link");
  if (isDisabled) return "soft";
  if (isError || isDanger) return "red";
  if (isLink) return "blue";
  return readTone(element);
};

const pickButtonFill = (element) => {
  const isMain = element.classList.contains("sk-main");
  const isSecondary = element.classList.contains("sk-secondary");
  if (isMain) return "blue";
  if (isSecondary) return "grey";
  return readFill(element);
};

const drawGhostUnderline = (layer, element, box, style) => {
  const elementRect = element.getBoundingClientRect();
  const textRange = document.createRange();
  textRange.selectNodeContents(element);
  const textBox = measureRectInBox(textRange.getBoundingClientRect(), elementRect, box);
  const underlineY = textBox.y + textBox.h * GHOST_UNDERLINE_TEXT_RATIO;
  const underlineStart = { x: textBox.x - GHOST_UNDERLINE_GAP, y: underlineY };
  const underlineEnd = { x: textBox.x + textBox.w + GHOST_UNDERLINE_GAP, y: underlineY };
  line(layer, underlineStart, underlineEnd, style);
};

const drawSpinners = (layer, element, box, style) => {
  const elementRect = element.getBoundingClientRect();
  for (const spinnerElement of element.querySelectorAll(".sk-button-spinner")) {
    const spinnerBox = measureRectInBox(spinnerElement.getBoundingClientRect(), elementRect, box);
    circle(layer, spinnerBox, { tone: "soft", seed: style.seed });
    drawArc(layer, spinnerBox, SPINNER_ARC_PERCENT, style);
  }
};

const drawFocusRing = (layer, box, focus) => {
  const ringBox = insetBoxBy(box, FOCUS_RING_INSET);
  const ringStyle = { tone: "blue", seed: focus.seed, dashed: true };
  if (focus.isRound) circle(layer, ringBox, ringStyle);
  if (!focus.isRound) roundedRectangle(layer, ringBox, ringStyle);
};

window.SketchWireframe.definePart("sk-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const status = readStatus(element);
  const isDisabled = status === "disabled";
  const isHovered = status === "hover";
  const isFocused = status === "focus";
  const isLoading = status === "loading";
  const isUnderlineOnly = element.classList.contains("sk-ghost") || element.classList.contains("sk-link");
  const tone = pickButtonTone(element);

  if (isUnderlineOnly) {
    drawGhostUnderline(under, element, box, { tone, seed });
  }

  if (!isUnderlineOnly) {
    const shadowBox = { ...box, x: box.x + SHADOW_OFFSET, y: box.y + SHADOW_OFFSET };
    if (isHovered) roundedRectangle(under, shadowBox, { tone: "soft", seed: seed + 2 });
    roundedRectangle(under, box, { tone, fill: pickButtonFill(element), seed, dashed: isDisabled });
  }

  if (isLoading) drawSpinners(under, element, box, { tone, seed: seed + 3 });
  drawChildIcons(under, element, box, { tone, seed });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: false });
});

window.SketchWireframe.definePart("sk-icon-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const tone = pickButtonTone(element);

  circle(under, box, { tone, fill: pickButtonFill(element), seed, dashed: isDisabled });
  drawSelfIcon(under, element, box, { tone, seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: true });
});

window.SketchWireframe.definePart("sk-button-group", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const tone = isDisabled ? "soft" : "ink";
  const elementRect = element.getBoundingClientRect();
  const segmentElements = [...element.children];

  roundedRectangle(under, box, { tone, seed, dashed: isDisabled });
  for (const [index, segmentElement] of segmentElements.entries()) {
    const segmentBox = measureRectInBox(segmentElement.getBoundingClientRect(), elementRect, box);
    const isSelected = readStatus(segmentElement) === "selected";
    const isFirstSegment = index === 0;

    if (isSelected) rectangle(under, insetBoxBy(segmentBox, FILL_INSET), { tone: "blue", fill: "blue", seed: seed + index + 1 });
    if (!isFirstSegment) {
      const dividerTop = { x: segmentBox.x, y: box.y + FILL_INSET };
      const dividerBottom = { x: segmentBox.x, y: box.y + box.h - FILL_INSET };
      line(under, dividerTop, dividerBottom, { tone, seed: seed + index + 10 });
    }
  }
});

window.SketchWireframe.definePart("sk-fab", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isExtended = element.classList.contains("sk-extended");
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const tone = readTone(element);
  const fill = readFill(element) ?? "blue";

  if (isExtended) roundedRectangle(under, box, { tone, fill, seed, dashed: isDisabled });
  if (!isExtended) circle(under, box, { tone, fill, seed, dashed: isDisabled });
  drawSelfIcon(under, element, box, { tone, seed: seed + 1 });
  drawChildIcons(under, element, box, { tone, seed: seed + 2 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: !isExtended });
});

window.SketchWireframe.definePart("sk-hold-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const percent = readPercent(element);
  const isHoldStarted = percent !== null && percent > 0;

  roundedRectangle(under, box, { tone: isDisabled ? "soft" : "ink", seed, dashed: isDisabled });
  if (isHoldStarted) drawProgressFill(under, box, percent, isRightToLeft(element), { tone: "blue", fill: "blue", seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: false });
});

const pickProgressTone = (element) => {
  const status = readStatus(element);
  if (status === "success") return "green";
  if (status === "error") return "red";
  return readTone(element);
};

const pickProgressFill = (element) => {
  const status = readStatus(element);
  if (status === "success") return "green";
  if (status === "error") return "red";
  return readFill(element) ?? "blue";
};

window.SketchWireframe.definePart("sk-progress-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const status = readStatus(element);
  const isSuccess = status === "success";
  const isFocused = status === "focus";
  const isDisabled = status === "disabled";
  const percent = isSuccess ? PERCENT_SCALE : readPercent(element);
  const isProgressStarted = percent !== null && percent > 0;

  roundedRectangle(under, box, { tone: isDisabled ? "soft" : pickProgressTone(element), seed, dashed: isDisabled });
  if (isProgressStarted) drawProgressFill(under, box, percent, isRightToLeft(element), { tone: pickProgressFill(element), fill: pickProgressFill(element), seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: false });
});

window.SketchWireframe.definePart("sk-social-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isIconOnly = element.classList.contains("sk-icon-only");
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const tone = isDisabled ? "soft" : readTone(element);
  const fill = readFill(element);

  if (isIconOnly) circle(under, box, { tone, fill, seed, dashed: isDisabled });
  if (!isIconOnly) roundedRectangle(under, box, { tone, fill, seed, dashed: isDisabled });
  const elementRect = element.getBoundingClientRect();
  for (const [index, markElement] of [...element.querySelectorAll(".sk-social-mark")].entries()) {
    const markBox = measureRectInBox(markElement.getBoundingClientRect(), elementRect, box);
    circle(under, markBox, { tone, seed: seed + index + 1 });
  }
  if (isFocused) drawFocusRing(over, box, { seed, isRound: isIconOnly });
});

window.SketchWireframe.definePart("sk-app-store-button", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const fill = readFill(element);

  roundedRectangle(under, box, { tone: isDisabled ? "soft" : "ink", fill, seed, dashed: isDisabled });
});

window.SketchWireframe.definePart("sk-undo-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const percent = readPercent(element) ?? 0;
  const isFromEnd = isRightToLeft(element);

  const ringSide = box.h * UNDO_RING_SIDE_RATIO;
  const ringInset = box.h * UNDO_RING_INSET_RATIO;
  const ringLeft = box.x + ringInset;
  const ringRight = box.x + box.w - ringInset - ringSide;
  const ringX = isFromEnd ? ringRight : ringLeft;
  const ringBox = { x: ringX, y: box.y + (box.h - ringSide) / 2, w: ringSide, h: ringSide };

  roundedRectangle(under, box, { tone: isDisabled ? "soft" : "ink", seed, dashed: isDisabled });
  circle(under, ringBox, { tone: "soft", seed: seed + 1 });
  drawArc(under, ringBox, percent, { tone: "blue", seed: seed + 2 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: false });
});

window.SketchWireframe.definePart("sk-shutter-button", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isBusy = readStatus(element) === "loading";
  const isFocused = readStatus(element) === "focus";
  const innerBox = insetBoxBy(box, box.w * SHUTTER_INNER_INSET_RATIO);

  circle(under, box, { tone: "ink", seed, dashed: isBusy });
  circle(under, innerBox, { tone: "red", fill: readFill(element) ?? "red", seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: true });
});

window.SketchWireframe.definePart("sk-checkbox", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isBoxChecked = isChecked(element);
  const isDisabled = readStatus(element) === "disabled";
  const boxTone = isDisabled ? "soft" : "ink";

  roundedRectangle(under, box, { tone: boxTone, seed });

  if (isBoxChecked) {
    const tickTone = isDisabled ? "soft" : "blue";
    const tickBox = insetBoxBy(box, box.w * CHECKBOX_TICK_INSET_RATIO);
    tick(under, tickBox, { tone: tickTone, seed: seed + 1 });
  }
});

const pickFieldTone = (element) => {
  const isDisabled = readStatus(element) === "disabled";
  const isError = readStatus(element) === "error";
  if (isDisabled) return "soft";
  if (isError) return "red";
  return "ink";
};

const isCellFilled = (cellElement) => cellElement.textContent.trim() !== "";

const drawFieldOutline = (drawing) => {
  const { element, box, seed, under } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const tone = isFocused ? "blue" : pickFieldTone(element);

  roundedRectangle(under, box, { tone, fill: readFill(element), seed, dashed: isDisabled });
};

const drawSegmentDividers = (layer, drawing, style) => {
  const { element, box } = drawing;
  const elementRect = element.getBoundingClientRect();
  const segmentElements = [...element.children];

  for (const [index, segmentElement] of segmentElements.entries()) {
    const isFirstSegment = index === 0;
    if (!isFirstSegment) {
      const segmentBox = measureRectInBox(segmentElement.getBoundingClientRect(), elementRect, box);
      const dividerTop = { x: segmentBox.x, y: box.y + FILL_INSET };
      const dividerBottom = { x: segmentBox.x, y: box.y + box.h - FILL_INSET };
      line(layer, dividerTop, dividerBottom, { tone: style.tone, seed: style.seed + index });
    }
  }
};

window.SketchWireframe.definePart("sk-input", (drawing) => {
  const { element, box, seed, under } = drawing;

  drawFieldOutline(drawing);
  drawChildIcons(under, element, box, { tone: "soft", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-textarea", (drawing) => {
  drawFieldOutline(drawing);
});

window.SketchWireframe.definePart("sk-number-input", (drawing) => {
  const { element, seed, under } = drawing;
  const tone = pickFieldTone(element);

  drawFieldOutline(drawing);
  drawSegmentDividers(under, drawing, { tone, seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-amount-pad", (drawing) => {
  const { element, box, seed, under } = drawing;
  const elementRect = element.getBoundingClientRect();
  const keyElements = [...element.querySelectorAll(".sk-key")];
  const displayElements = [...element.querySelectorAll(".sk-amount-display")];

  roundedRectangle(under, box, { tone: "ink", seed });
  for (const [index, keyElement] of keyElements.entries()) {
    const keyBox = measureRectInBox(keyElement.getBoundingClientRect(), elementRect, box);
    const isPressed = readStatus(keyElement) === "selected";
    const keyFill = isPressed ? "blue" : readFill(keyElement);
    roundedRectangle(under, keyBox, { tone: "ink", fill: keyFill, seed: seed + index + 1 });
  }
  for (const [index, displayElement] of displayElements.entries()) {
    const displayBox = measureRectInBox(displayElement.getBoundingClientRect(), elementRect, box);
    const underlineY = displayBox.y + displayBox.h;
    const underlineStart = { x: displayBox.x, y: underlineY };
    const underlineEnd = { x: displayBox.x + displayBox.w, y: underlineY };
    line(under, underlineStart, underlineEnd, { tone: "soft", seed: seed + index + 50 });
  }
});

window.SketchWireframe.definePart("sk-verification-code-input", (drawing) => {
  const { element, box, seed, under } = drawing;
  const elementRect = element.getBoundingClientRect();
  const cellElements = [...element.children];
  const filledCount = cellElements.filter(isCellFilled).length;
  const isFocused = readStatus(element) === "focus";
  const fieldTone = pickFieldTone(element);

  for (const [index, cellElement] of cellElements.entries()) {
    const cellBox = measureRectInBox(cellElement.getBoundingClientRect(), elementRect, box);
    const isNextCell = isFocused && index === filledCount;
    const cellTone = isNextCell ? "blue" : fieldTone;
    const cellFill = isCellFilled(cellElement) ? "grey" : readFill(cellElement);
    roundedRectangle(under, cellBox, { tone: cellTone, fill: cellFill, seed: seed + index + 1 });
  }
});

window.SketchWireframe.definePart("sk-prompt-input", (drawing) => {
  const { element, box, seed, under } = drawing;
  const elementRect = element.getBoundingClientRect();
  const sendElements = [...element.querySelectorAll(".sk-prompt-send")];

  drawFieldOutline(drawing);
  for (const [index, sendElement] of sendElements.entries()) {
    const sendBox = measureRectInBox(sendElement.getBoundingClientRect(), elementRect, box);
    circle(under, sendBox, { tone: "blue", fill: "blue", seed: seed + index + 1 });
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 5 });
});

window.SketchWireframe.definePart("sk-tag-input", (drawing) => {
  const { element, box, seed, under } = drawing;
  const elementRect = element.getBoundingClientRect();
  const chipElements = [...element.querySelectorAll(".sk-tag-input-chip")];

  drawFieldOutline(drawing);
  for (const [index, chipElement] of chipElements.entries()) {
    const chipBox = measureRectInBox(chipElement.getBoundingClientRect(), elementRect, box);
    roundedRectangle(under, chipBox, { tone: "ink", fill: "grey", seed: seed + index + 1 });
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 10 });
});

const measureMatchingBoxes = (drawing, selector) => {
  const elementRect = drawing.element.getBoundingClientRect();
  return [...drawing.element.querySelectorAll(selector)].map((matchingElement) => ({
    element: matchingElement,
    box: measureRectInBox(matchingElement.getBoundingClientRect(), elementRect, drawing.box),
  }));
};

window.SketchWireframe.definePart("sk-select", (drawing) => {
  const { element, box, seed, under } = drawing;

  drawFieldOutline(drawing);
  drawChildIcons(under, element, box, { tone: "soft", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-select-list", (drawing) => {
  const { element, box, seed, under } = drawing;
  const rows = measureMatchingBoxes(drawing, ".sk-select-row");

  roundedRectangle(under, box, { tone: "ink", fill: readFill(element), seed });
  for (const [index, row] of rows.entries()) {
    const isChosen = readStatus(row.element) === "selected";
    if (isChosen) {
      const chosenBox = insetBoxBy(row.box, FILL_INSET);
      roundedRectangle(under, chosenBox, { tone: "blue", fill: "blue", seed: seed + index + 1 });
    }
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 20 });
});

window.SketchWireframe.definePart("sk-combobox", (drawing) => {
  const { element, box, seed, under } = drawing;

  drawFieldOutline(drawing);
  drawChildIcons(under, element, box, { tone: "soft", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-multi-select", (drawing) => {
  const { element, box, seed, under } = drawing;
  const chips = measureMatchingBoxes(drawing, ".sk-tag-input-chip");

  drawFieldOutline(drawing);
  for (const [index, chip] of chips.entries()) {
    roundedRectangle(under, chip.box, { tone: "ink", fill: "grey", seed: seed + index + 1 });
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 10 });
});

window.SketchWireframe.definePart("sk-radio", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const isRadioChecked = isChecked(element);
  const tone = isDisabled ? "soft" : "ink";

  circle(under, box, { tone, seed, dashed: isDisabled });
  if (isRadioChecked) {
    const dotBox = insetBoxBy(box, box.w * RADIO_DOT_INSET_RATIO);
    circle(under, dotBox, { tone: isDisabled ? "soft" : "blue", fill: isDisabled ? "grey" : "blue", seed: seed + 1 });
  }
  if (isFocused) drawFocusRing(over, box, { seed, isRound: true });
});

window.SketchWireframe.definePart("sk-switch", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const isSwitchOn = isChecked(element);
  const isFromEnd = isRightToLeft(element);
  const tone = isDisabled ? "soft" : "ink";
  const knobInset = box.h * SWITCH_KNOB_INSET_RATIO;
  const knobSide = box.h - knobInset * 2;
  const isKnobOnRight = isFromEnd ? !isSwitchOn : isSwitchOn;
  const knobX = isKnobOnRight ? box.x + box.w - knobInset - knobSide : box.x + knobInset;
  const knobBox = { x: knobX, y: box.y + knobInset, w: knobSide, h: knobSide };

  roundedRectangle(under, box, { tone, fill: isSwitchOn ? "blue" : readFill(element), seed, dashed: isDisabled });
  circle(under, knobBox, { tone, seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: false });
});

window.SketchWireframe.definePart("sk-toggle", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const isPressed = readStatus(element) === "selected";
  const tone = isDisabled ? "soft" : "ink";

  roundedRectangle(under, box, { tone, fill: isPressed ? "blue" : readFill(element), seed, dashed: isDisabled });
  drawChildIcons(under, element, box, { tone, seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: false });
});

const pickThumbCenterX = (box, knobSide, fraction, isFromEnd) => {
  const startCenterX = box.x + knobSide / 2;
  const endCenterX = box.x + box.w - knobSide / 2;
  const travelWidth = endCenterX - startCenterX;
  if (isFromEnd) return endCenterX - travelWidth * fraction;
  return startCenterX + travelWidth * fraction;
};

const createThumbBox = (box, knobSide, thumbCenterX) => ({
  x: thumbCenterX - knobSide / 2,
  y: box.y + (box.h - knobSide) / 2,
  w: knobSide,
  h: knobSide,
});

const readRangeEndPercent = (element) => Number(element.getAttribute("data-percent-end"));

window.SketchWireframe.definePart("sk-slider", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const isFromEnd = isRightToLeft(element);
  const tone = isDisabled ? "soft" : "blue";
  const percent = readPercent(element) ?? 0;
  const knobSide = box.h * SLIDER_KNOB_RATIO;
  const trackY = box.y + box.h / 2;
  const trackStart = { x: box.x + knobSide / 2, y: trackY };
  const trackEnd = { x: box.x + box.w - knobSide / 2, y: trackY };
  const thumbCenterX = pickThumbCenterX(box, knobSide, percent / PERCENT_SCALE, isFromEnd);
  const thumbBox = createThumbBox(box, knobSide, thumbCenterX);
  const fillOrigin = isFromEnd ? trackEnd : trackStart;

  line(under, trackStart, trackEnd, { tone: "soft", seed });
  line(under, fillOrigin, { x: thumbCenterX, y: trackY }, { tone, seed: seed + 1 });
  circle(under, thumbBox, { tone, fill: "blue", seed: seed + 2 });
  if (isFocused) drawFocusRing(over, thumbBox, { seed, isRound: true });
});

window.SketchWireframe.definePart("sk-range-slider", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isFromEnd = isRightToLeft(element);
  const knobSide = box.h * SLIDER_KNOB_RATIO;
  const trackY = box.y + box.h / 2;
  const startPercent = readPercent(element) ?? 0;
  const endPercent = readRangeEndPercent(element);
  const startCenterX = pickThumbCenterX(box, knobSide, startPercent / PERCENT_SCALE, isFromEnd);
  const endCenterX = pickThumbCenterX(box, knobSide, endPercent / PERCENT_SCALE, isFromEnd);
  const thumbBoxes = [startCenterX, endCenterX].map((thumbCenterX) => createThumbBox(box, knobSide, thumbCenterX));

  line(under, { x: box.x + knobSide / 2, y: trackY }, { x: box.x + box.w - knobSide / 2, y: trackY }, { tone: "soft", seed });
  line(under, { x: startCenterX, y: trackY }, { x: endCenterX, y: trackY }, { tone: "blue", seed: seed + 1 });
  for (const [index, thumbBox] of thumbBoxes.entries()) {
    circle(under, thumbBox, { tone: "blue", fill: "blue", seed: seed + index + 2 });
  }
});

window.SketchWireframe.definePart("sk-rating-stars", (drawing) => {
  const { seed, under } = drawing;
  const filledCount = readCount(drawing.element, 0);
  const starBoxes = measureMatchingBoxes(drawing, ".sk-rating-star");

  for (const [index, star] of starBoxes.entries()) {
    const isFilled = index < filledCount;
    const starTone = isFilled ? "orange" : "soft";
    window.SketchWireframe.icon(under, star.box, "star", { tone: starTone, seed: seed + index + 1 });
  }
});

window.SketchWireframe.definePart("sk-color-swatch", (drawing) => {
  const { element, box, seed, under, over } = drawing;
  const isSelected = readStatus(element) === "selected";
  const isFocused = readStatus(element) === "focus";

  circle(under, box, { tone: "ink", fill: readFill(element), seed });
  if (isSelected) circle(under, insetBoxBy(box, FILL_INSET), { tone: "blue", seed: seed + 1 });
  if (isFocused) drawFocusRing(over, box, { seed, isRound: true });
});

window.SketchWireframe.definePart("sk-color-picker", (drawing) => {
  const { box, seed, under } = drawing;
  const areaBoxes = measureMatchingBoxes(drawing, ".sk-color-area");
  const hueBoxes = measureMatchingBoxes(drawing, ".sk-color-hue");
  const hexBoxes = measureMatchingBoxes(drawing, ".sk-color-hex");

  roundedRectangle(under, box, { tone: "ink", seed });
  for (const [index, area] of areaBoxes.entries()) {
    const thumbSide = area.box.h * COLOR_THUMB_SIDE_RATIO;
    const thumbCenterX = area.box.x + area.box.w * COLOR_AREA_THUMB_X_RATIO;
    const thumbCenterY = area.box.y + area.box.h * COLOR_AREA_THUMB_Y_RATIO;
    const thumbBox = { x: thumbCenterX - thumbSide / 2, y: thumbCenterY - thumbSide / 2, w: thumbSide, h: thumbSide };
    roundedRectangle(under, area.box, { tone: "ink", fill: "red", seed: seed + index + 1 });
    circle(under, thumbBox, { tone: "ink", fill: "grey", seed: seed + index + 10 });
  }
  for (const [index, hue] of hueBoxes.entries()) {
    const thumbSide = hue.box.h * COLOR_HUE_THUMB_SIDE_RATIO;
    const thumbCenterX = hue.box.x + hue.box.w * COLOR_HUE_THUMB_RATIO;
    const thumbBox = { x: thumbCenterX - thumbSide / 2, y: hue.box.y + hue.box.h / 2 - thumbSide / 2, w: thumbSide, h: thumbSide };
    roundedRectangle(under, hue.box, { tone: "ink", fill: "yellow", seed: seed + index + 20 });
    circle(under, thumbBox, { tone: "ink", fill: "grey", seed: seed + index + 30 });
  }
  for (const [index, hex] of hexBoxes.entries()) {
    roundedRectangle(under, hex.box, { tone: "ink", seed: seed + index + 40 });
  }
});

const drawFieldWithIcons = (drawing) => {
  const { element, box, seed, under } = drawing;

  drawFieldOutline(drawing);
  drawChildIcons(under, element, box, { tone: "soft", seed: seed + 1 });
};

for (const fieldClassName of ["sk-date-field", "sk-time-picker", "sk-search-bar"]) {
  window.SketchWireframe.definePart(fieldClassName, drawFieldWithIcons);
}

window.SketchWireframe.definePart("sk-wheel-picker", (drawing) => {
  const { box, seed, under } = drawing;
  const rows = measureMatchingBoxes(drawing, ".sk-wheel-row");

  roundedRectangle(under, box, { tone: "ink", seed });
  for (const [index, row] of rows.entries()) {
    const isChosen = readStatus(row.element) === "selected";
    if (isChosen) {
      roundedRectangle(under, insetBoxBy(row.box, FILL_INSET), { tone: "blue", fill: "blue", seed: seed + index + 1 });
    }
  }
});

window.SketchWireframe.definePart("sk-filter-bar", (drawing) => {
  const { element, box, seed, under } = drawing;
  const chips = measureMatchingBoxes(drawing, ".sk-filter-chip");

  for (const [index, chip] of chips.entries()) {
    const isChipSelected = readStatus(chip.element) === "selected";
    const chipTone = isChipSelected ? "blue" : "ink";
    const chipFill = isChipSelected ? "blue" : "grey";
    roundedRectangle(under, chip.box, { tone: chipTone, fill: chipFill, seed: seed + index + 1 });
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 10 });
});

window.SketchWireframe.definePart("sk-drop-zone", (drawing) => {
  const { element, box, seed, under } = drawing;
  const isHovered = readStatus(element) === "hover";
  const tone = isHovered ? "blue" : "soft";

  roundedRectangle(under, box, { tone, seed, dashed: true });
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-file-upload-item", (drawing) => {
  const { element, box, seed, under } = drawing;
  const progressBoxes = measureMatchingBoxes(drawing, ".sk-file-progress");

  roundedRectangle(under, box, { tone: "ink", seed });
  for (const [index, progress] of progressBoxes.entries()) {
    const progressPercent = readPercent(progress.element) ?? 0;
    roundedRectangle(under, progress.box, { tone: "soft", seed: seed + index + 1 });
    drawProgressFill(under, progress.box, progressPercent, isRightToLeft(element), { tone: "blue", fill: "blue", seed: seed + index + 2 });
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 10 });
});

const pickSignaturePoints = (box) => {
  const pointIndexes = [...Array(SIGNATURE_POINT_COUNT + 1).keys()];
  return pointIndexes.map((pointIndex) => {
    const progressRatio = pointIndex / SIGNATURE_POINT_COUNT;
    const broadWave = SIGNATURE_WAVE_RATIO * Math.sin(pointIndex * SIGNATURE_WAVE_FREQUENCY);
    const quickScribble = SIGNATURE_SCRIBBLE_RATIO * Math.sin(pointIndex * SIGNATURE_SCRIBBLE_FREQUENCY);
    const waveRatio = broadWave + quickScribble;
    const pointX = box.x + box.w * (SIGNATURE_LEFT_RATIO + SIGNATURE_WIDTH_RATIO * progressRatio);
    const pointY = box.y + box.h * (SIGNATURE_CENTER_RATIO + waveRatio);
    return { x: pointX, y: pointY };
  });
};

window.SketchWireframe.definePart("sk-signature-pad", (drawing) => {
  const { box, seed, under } = drawing;
  const baselineY = box.y + box.h * SIGNATURE_BASELINE_RATIO;
  const baselineStart = { x: box.x + box.w * SIGNATURE_LEFT_RATIO, y: baselineY };
  const baselineEnd = { x: box.x + box.w * (SIGNATURE_LEFT_RATIO + SIGNATURE_WIDTH_RATIO), y: baselineY };

  roundedRectangle(under, box, { tone: "ink", seed });
  line(under, baselineStart, baselineEnd, { tone: "soft", seed: seed + 1 });
  polyline(under, pickSignaturePoints(box), { tone: "blue", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-slide-to-confirm", (drawing) => {
  const { element, box, seed, under } = drawing;
  const knobBoxes = measureMatchingBoxes(drawing, ".sk-slide-knob");

  roundedRectangle(under, box, { tone: "ink", fill: readFill(element), seed });
  for (const [index, knob] of knobBoxes.entries()) {
    circle(under, knob.box, { tone: "blue", fill: "blue", seed: seed + index + 1 });
  }
  drawChildIcons(under, element, box, { tone: "ink", seed: seed + 10 });
});
`;

export const CONTROLS_PART_STYLE = `.sk-button, .sk-icon-button, .sk-button-group, .sk-fab, .sk-hold-button, .sk-progress-button, .sk-social-button, .sk-app-store-button, .sk-undo-button, .sk-shutter-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 1.6px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 1.125rem;
  cursor: default;
}

.sk-button {
  min-width: 6rem;
  min-height: 2.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
}

.sk-button.sk-small {
  min-width: 4.5rem;
  min-height: 2rem;
  padding: 0.25rem 0.75rem;
  font-size: 1rem;
}

.sk-button.sk-large {
  min-height: 3rem;
  padding: 0.625rem 1.75rem;
  font-size: 1.25rem;
}

.sk-button.sk-ghost, .sk-button.sk-link {
  min-width: 0;
  border-color: transparent;
}

.sk-button [data-icon] {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: none;
}

.sk-button-spinner {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: none;
}

.sk-icon-button {
  min-width: 2.5rem;
  min-height: 2.5rem;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
}

.sk-button-group {
  min-height: 2.5rem;
  padding: 0;
  border-radius: 0.5rem;
}

.sk-button-group > * {
  display: inline-flex;
  align-items: center;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
}

.sk-fab {
  min-width: 3.5rem;
  min-height: 3.5rem;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
}

.sk-fab.sk-extended {
  aspect-ratio: auto;
  min-width: 0;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
}

.sk-fab [data-icon] {
  display: inline-block;
  width: 1.4em;
  height: 1.4em;
  flex: none;
}

.sk-hold-button {
  min-width: 8rem;
  min-height: 2.75rem;
  padding: 0.5rem 1.5rem;
  border-radius: 999px;
}

.sk-progress-button {
  min-width: 8rem;
  min-height: 2.75rem;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
}

.sk-social-button {
  min-width: 12rem;
  min-height: 2.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}

.sk-social-button.sk-icon-only {
  min-width: 2.75rem;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
}

.sk-social-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em;
  height: 1.5em;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
}

.sk-app-store-button {
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 10rem;
  min-height: 3rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.2;
}

.sk-undo-button {
  min-width: 9rem;
  min-height: 2.5rem;
  padding-inline-start: 2.75rem;
  padding-inline-end: 1.25rem;
  border-radius: 999px;
}

.sk-shutter-button {
  min-width: 4rem;
  min-height: 4rem;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
}

.sk-checkbox {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 1.6px solid transparent;
  vertical-align: middle;
}

.sk-input, .sk-textarea, .sk-number-input, .sk-amount-pad, .sk-verification-code-input, .sk-prompt-input, .sk-tag-input {
  border: 1.6px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
}

.sk-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 12rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-input [data-icon], .sk-prompt-input [data-icon], .sk-tag-input [data-icon], .sk-prompt-send [data-icon] {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: none;
}

.sk-textarea {
  display: block;
  min-width: 14rem;
  min-height: 5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.sk-number-input {
  display: inline-flex;
  align-items: stretch;
  min-width: 9rem;
  min-height: 2.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-number-input > * {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
}

.sk-amount-pad {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  min-width: 12rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.sk-amount-display {
  grid-column: 1 / -1;
  min-height: 2.5rem;
  padding: 0.25rem 0.5rem;
  font-size: 1.5rem;
  text-align: end;
}

.sk-key {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
  font-size: 1.25rem;
}

.sk-verification-code-input {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 0.5rem;
  min-width: 14rem;
}

.sk-verification-code-input > * {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  font-size: 1.5rem;
}

.sk-prompt-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 16rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 1rem;
}

.sk-prompt-tools {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sk-prompt-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  min-height: 2.25rem;
  border-radius: 999px;
}

.sk-tag-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  min-width: 14rem;
  min-height: 2.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-tag-input-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  border-radius: 0.5rem;
}

.sk-select, .sk-select-list, .sk-combobox, .sk-multi-select {
  border: 1.6px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
}

.sk-select, .sk-combobox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-width: 12rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-select [data-icon], .sk-combobox [data-icon], .sk-multi-select [data-icon], .sk-select-row [data-icon] {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: none;
}

.sk-select-list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 12rem;
  padding: 0.375rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-select-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 2.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.sk-multi-select {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  min-width: 14rem;
  min-height: 2.5rem;
  padding: 0.375rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-multi-select.sk-small {
  min-height: 2rem;
  font-size: 0.875rem;
}

.sk-multi-select.sk-large {
  min-height: 3rem;
  font-size: 1.125rem;
}

.sk-radio, .sk-switch, .sk-toggle {
  border: 1.6px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
}

.sk-radio {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  vertical-align: middle;
  border-radius: 999px;
}

.sk-radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  font-size: 1rem;
}

.sk-radio-group > * {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sk-switch {
  display: inline-block;
  width: 2.75rem;
  height: 1.5rem;
  vertical-align: middle;
  border-radius: 999px;
}

.sk-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 2.5rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.sk-toggle [data-icon] {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: none;
}

.sk-toggle-group {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.sk-slider,
.sk-range-slider,
.sk-rating-stars,
.sk-color-swatch,
.sk-color-picker,
.sk-date-field,
.sk-time-picker,
.sk-search-bar,
.sk-wheel-picker,
.sk-filter-bar,
.sk-drop-zone,
.sk-file-upload-item,
.sk-signature-pad,
.sk-slide-to-confirm {
  border: 1.6px solid transparent;
  background: none;
  color: inherit;
  font: inherit;
}

.sk-slider,
.sk-range-slider {
  display: block;
  width: 16rem;
  height: 1.5rem;
}

.sk-rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 2rem;
}

.sk-rating-star {
  display: inline-block;
  width: 1.75rem;
  height: 1.75rem;
}

.sk-color-swatch {
  display: inline-block;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
}

.sk-color-picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 16rem;
  padding: 0.75rem;
  border-radius: 0.75rem;
}

.sk-color-area {
  display: block;
  height: 8rem;
  border-radius: 0.5rem;
}

.sk-color-hue {
  display: block;
  height: 1.25rem;
  border-radius: 999px;
}

.sk-color-hex {
  display: block;
  height: 2.25rem;
  border-radius: 0.5rem;
}

.sk-date-field,
.sk-time-picker,
.sk-search-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 16rem;
  height: 2.5rem;
  padding: 0 0.75rem;
  font-size: 1rem;
}

.sk-date-field [data-icon],
.sk-time-picker [data-icon],
.sk-search-bar [data-icon],
.sk-filter-bar [data-icon],
.sk-file-upload-item [data-icon] {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  flex: none;
}

.sk-wheel-picker {
  display: flex;
  flex-direction: column;
  width: 10rem;
  height: 9rem;
  overflow: hidden;
  text-align: center;
  font-size: 1rem;
  border-radius: 0.75rem;
}

.sk-wheel-row {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  height: 3rem;
  border-radius: 0.5rem;
}

.sk-wheel-row:not([data-status="selected"]) {
  opacity: 0.4;
}

.sk-filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  width: 22rem;
  padding: 0.5rem;
  font-size: 0.875rem;
}

.sk-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  height: 2rem;
  padding: 0 0.75rem;
  border-radius: 999px;
}

.sk-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 20rem;
  min-height: 9rem;
  padding: 1.5rem;
  text-align: center;
  border-radius: 0.75rem;
}

.sk-drop-zone [data-icon] {
  display: inline-block;
  width: 2rem;
  height: 2rem;
}

.sk-file-upload-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 20rem;
  min-height: 3.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.5rem;
}

.sk-file-progress {
  flex: 1 1 auto;
  min-width: 5rem;
  height: 0.5rem;
  border-radius: 999px;
}

.sk-signature-pad {
  display: block;
  width: 20rem;
  height: 8rem;
  border-radius: 0.75rem;
}

.sk-slide-to-confirm {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18rem;
  height: 3.5rem;
  padding-inline: 3.5rem;
  border-radius: 999px;
  font-size: 1rem;
}

.sk-slide-knob {
  position: absolute;
  inset-block-start: 0.25rem;
  inset-inline-start: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
}

.sk-slide-knob [data-icon] {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
}
`;
