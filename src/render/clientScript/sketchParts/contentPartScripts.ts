export const CONTENT_PART_SCRIPT = `
const TEXT_LINE_WIDTH_RATIOS = [1, 0.86, 0.6, 0.92];
const TEXT_LAST_LINE_WIDTH_RATIO = 0.45;
const TEXT_WAVE_RATIO = 0.08;
const DEFAULT_TEXT_LINE_COUNT = 3;

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

window.SketchWireframe.definePart("sk-card", (drawing) => {
  const { roundedRectangle, readTone, readFill } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  roundedRectangle(under, box, { tone: readTone(element), fill: readFill(element), seed });
});

window.SketchWireframe.definePart("sk-text-lines", (drawing) => {
  const { path, readCount } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const lineCount = readCount(element, DEFAULT_TEXT_LINE_COUNT);
  const rowHeight = box.h / lineCount;
  for (const lineIndex of [...Array(lineCount).keys()]) {
    const rowY = box.y + rowHeight * (lineIndex + 0.5);
    const rowEndX = box.x + box.w * pickLineWidthRatio(lineIndex, lineCount);
    const waveDirection = lineIndex % 2 === 0 ? 1 : -1;
    const waveHeight = rowHeight * TEXT_WAVE_RATIO * waveDirection;
    path(under, createWavyLinePath(box.x, rowEndX, rowY, waveHeight), { tone: "soft", seed: seed + lineIndex });
  }
});
`;

export const CONTENT_PART_STYLE = `:where(.sk-card) {
  display: block;
  min-width: 8rem;
  height: 6rem;
  padding: 1rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-text-lines) {
  display: block;
  min-width: 6rem;
  min-height: 3rem;
}
`;
