export const CONTROLS_PART_SCRIPT = `
const FOCUS_RING_INSET = 4;
const GHOST_UNDERLINE_OFFSET = 3;
const GHOST_UNDERLINE_START_RATIO = 0.12;
const GHOST_UNDERLINE_END_RATIO = 0.88;
const CHECKBOX_TICK_INSET_RATIO = 0.18;

const pickButtonTone = (element) => {
  const { readStatus, readTone } = window.SketchWireframe;
  const status = readStatus(element);
  const isDisabled = status === "disabled";
  const isError = status === "error";
  const isDanger = element.classList.contains("sk-danger");
  if (isDisabled) return "soft";
  if (isError || isDanger) return "red";
  return readTone(element);
};

const insetBoxBy = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

window.SketchWireframe.definePart("sk-button", (drawing) => {
  const { roundedRectangle, line, readStatus, readFill } = window.SketchWireframe;
  const { element, box, seed, under, over } = drawing;
  const isGhost = element.classList.contains("sk-ghost");
  const isMain = element.classList.contains("sk-main");
  const isDisabled = readStatus(element) === "disabled";
  const isFocused = readStatus(element) === "focus";
  const tone = pickButtonTone(element);

  if (isGhost) {
    const underlineY = box.y + box.h - GHOST_UNDERLINE_OFFSET;
    const underlineStart = { x: box.x + box.w * GHOST_UNDERLINE_START_RATIO, y: underlineY };
    const underlineEnd = { x: box.x + box.w * GHOST_UNDERLINE_END_RATIO, y: underlineY };
    line(under, underlineStart, underlineEnd, { tone, seed });
  }

  const isOutlined = !isGhost;
  if (isOutlined) {
    const fill = isMain ? "blue" : readFill(element);
    roundedRectangle(under, box, { tone, fill, seed, dashed: isDisabled });
  }

  if (isFocused) {
    roundedRectangle(over, insetBoxBy(box, FOCUS_RING_INSET), { tone: "blue", seed, dashed: true });
  }
});

window.SketchWireframe.definePart("sk-checkbox", (drawing) => {
  const { roundedRectangle, tick, isChecked, readStatus } = window.SketchWireframe;
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
`;

export const CONTROLS_PART_STYLE = `:where(.sk-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 6rem;
  min-height: 2.5rem;
  padding: 0.5rem 1.25rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 1.125rem;
  cursor: default;
}

:where(.sk-button.sk-ghost) {
  min-width: 0;
  border-color: transparent;
}

:where(.sk-checkbox) {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 1.6px solid transparent;
  vertical-align: middle;
}
`;
