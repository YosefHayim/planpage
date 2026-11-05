export const CONTENT_PART_SCRIPT = `
const TEXT_LINE_WIDTH_RATIOS = [1, 0.86, 0.6, 0.92];

window.SketchWireframe.definePart("sk-card", (drawing) => {
  const { roundedRectangle } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const tone = element.dataset.tone ?? "ink";
  roundedRectangle(under, box, { tone, fill: element.dataset.fill, seed });
});

window.SketchWireframe.definePart("sk-text-lines", (drawing) => {
  const { line } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const lineCount = Number(element.dataset.count ?? 3);
  const rowGap = box.h / (lineCount + 1);
  const lineIndexes = [...Array(lineCount).keys()];
  lineIndexes.forEach((lineIndex) => {
    const rowY = box.y + rowGap * (lineIndex + 1);
    const widthRatio = TEXT_LINE_WIDTH_RATIOS[lineIndex % TEXT_LINE_WIDTH_RATIOS.length];
    const rowEndX = box.x + box.w * widthRatio;
    line(under, { x: box.x, y: rowY }, { x: rowEndX, y: rowY }, { tone: "soft", seed: seed + lineIndex });
  });
});
`;

export const CONTENT_PART_STYLE = `.sk-card {
  display: block;
  min-width: 8rem;
  min-height: 6rem;
  padding: 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

.sk-text-lines {
  display: block;
  min-width: 6rem;
  min-height: 3rem;
}
`;
