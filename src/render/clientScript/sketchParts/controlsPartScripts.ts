export const CONTROLS_PART_SCRIPT = `
const buttonToneOf = (element) => {
  const isDisabled = element.dataset.status === "disabled";
  const isError = element.dataset.status === "error";
  const isDanger = element.classList.contains("sk-danger");
  if (isDisabled) return "soft";
  if (isError || isDanger) return "red";
  return element.dataset.tone ?? "ink";
};

const insetBoxBy = (box, inset) => ({
  x: box.x + inset,
  y: box.y + inset,
  w: box.w - inset * 2,
  h: box.h - inset * 2,
});

window.SketchWireframe.definePart("sk-button", (drawing) => {
  const { roundedRectangle, line } = window.SketchWireframe;
  const { element, box, seed, under, over } = drawing;
  const isGhost = element.classList.contains("sk-ghost");
  const isMain = element.classList.contains("sk-main");
  const isDisabled = element.dataset.status === "disabled";
  const isFocused = element.dataset.status === "focus";
  const tone = buttonToneOf(element);

  if (isGhost) {
    const underlineY = box.y + box.h - 3;
    line(under, { x: box.x + box.w * 0.12, y: underlineY }, { x: box.x + box.w * 0.88, y: underlineY }, { tone, seed });
  }

  const isOutlined = !isGhost;
  if (isOutlined) {
    const fill = isMain ? "blue" : element.dataset.fill;
    roundedRectangle(under, box, { tone, fill, seed, dashed: isDisabled });
  }

  if (isFocused) {
    roundedRectangle(over, insetBoxBy(box, 4), { tone: "blue", seed, dashed: true });
  }
});

window.SketchWireframe.definePart("sk-checkbox", (drawing) => {
  const { roundedRectangle, tick } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const isChecked = element.dataset.checked !== undefined;
  const isDisabled = element.dataset.status === "disabled";
  const boxTone = isDisabled ? "soft" : "ink";

  roundedRectangle(under, box, { tone: boxTone, seed });
  if (isChecked) tick(under, insetBoxBy(box, box.w * 0.18), { tone: isDisabled ? "soft" : "blue", seed: seed + 1 });
});
`;

export const CONTROLS_PART_STYLE = `.sk-button {
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

.sk-button.sk-ghost {
  min-width: 0;
  border-color: transparent;
}

.sk-checkbox {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 1.6px solid transparent;
  vertical-align: middle;
}
`;
