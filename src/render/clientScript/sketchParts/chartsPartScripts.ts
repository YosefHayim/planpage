export const CHARTS_PART_SCRIPT = `
const { definePart, rectangle, roundedRectangle, line, polyline, polygon, circle, readStatus, readFill, readTone, readCount, readPercent, isRightToLeft } = window.SketchWireframe;

const CHART_SAMPLE_NUMBERS = [12, 30, 18, 40, 26, 34];
const CHART_SAMPLE_SECOND_NUMBERS = [20, 14, 28, 22, 30, 16];
const CHART_SAMPLE_CANDLE_NUMBERS = [20, 28, 18, 26, 26, 30, 24, 28, 28, 29, 20, 22, 22, 26, 21, 25];
const CHART_SAMPLE_BUMP_RANKS = [1, 2, 3, 2];
const CHART_SAMPLE_BUMP_SECOND_RANKS = [3, 1, 2, 1];
const CHART_SAMPLE_PIE_NUMBERS = [30, 45, 15, 10];
const CHART_SAMPLE_SCATTER_NUMBERS = [10, 20, 25, 40, 40, 28, 55, 62, 70, 50, 80, 80];
const CHART_SAMPLE_BUBBLE_SIZES = [4, 9, 6, 12, 7, 3];
const CHART_SAMPLE_RADAR_NUMBERS = [60, 80, 45, 70, 50];
const CHART_SAMPLE_POLAR_NUMBERS = [30, 45, 20, 60, 35];
const CHART_SAMPLE_FUNNEL_NUMBERS = [100, 70, 45, 20];
const CHART_SAMPLE_HEATMAP_NUMBERS = [2, 5, 9, 4, 7, 3, 8, 6, 1, 3, 9, 10, 4, 2, 6, 8, 7, 3];
const CHART_SAMPLE_TREEMAP_NUMBERS = [30, 20, 14, 10, 8, 6];
const CHART_SAMPLE_WATERFALL_NUMBERS = [60, 30, -20, 15, -10];
const CHART_SAMPLE_SANKEY_NUMBERS = [40, 30, 20];
const CHART_SAMPLE_RING_PERCENTS = [72, 48, 88];
const CHART_SAMPLE_UPTIME_NUMBERS = [100, 100, 100, 99.9, 100, 96.5, 100, 100, 100, 100, 92.1, 100, 100, 100];
const CHART_SAMPLE_SPARK_NUMBERS = [4, 7, 5, 9, 8, 12, 11, 15];
const CHART_SAMPLE_PERCENT = 60;
const CHART_SAMPLE_SEGMENT_COUNT = 5;

const PERCENT_SCALE = 100;
const PLOT_PADDING_RATIO = 0.06;
const GRID_RATIOS = [0.25, 0.5, 0.75, 1];
const CIRCLE_RING_RATIOS = [1 / 3, 2 / 3, 1];
const ARC_STEP_COUNT = 24;
const TOP_ANGLE = -Math.PI / 2;
const FULL_TURN = Math.PI * 2;
const BAR_GAP_RATIO = 0.3;
const DOT_SIZE_RATIO = 0.035;
const SCATTER_DOT_SIZE_RATIO = 0.06;
const DONUT_HOLE_RATIO = 0.55;
const SERIES_TONES = ["blue", "orange"];
const SERIES_FILLS = ["blue", "orange"];
const SLICE_FILLS = ["blue", "orange", "green", "yellow", "red", "grey"];
const RING_FILLS = ["red", "green", "blue"];
const RING_TONES = ["red", "green", "blue"];
const RING_THICKNESS_RATIO = 0.7;
const HEAT_FILLS = ["yellow", "orange", "red"];
const CALENDAR_ROW_COUNT = 7;
const DEFAULT_HEATMAP_COLUMN_COUNT = 6;
const HEAT_CELL_GAP_RATIO = 0.12;
const UPTIME_GAP_RATIO = 0.25;
const UPTIME_GREEN_FROM = 99.5;
const UPTIME_ORANGE_FROM = 95;
const TREEMAP_TILE_INSET_RATIO = 0.03;
const CANDLE_NUMBER_COUNT = 4;
const CANDLE_BODY_WIDTH_RATIO = 0.5;
const BUBBLE_MIN_RATIO = 0.06;
const BUBBLE_GROWTH_RATIO = 0.14;
const FUNNEL_GAP_RATIO = 0.12;
const FUNNEL_MIN_WIDTH_RATIO = 0.2;
const SANKEY_SOURCE_LEFT_RATIO = 0.1;
const SANKEY_TARGET_LEFT_RATIO = 0.82;
const SANKEY_NODE_WIDTH_RATIO = 0.08;
const SANKEY_NODE_FILL_RATIO = 0.7;
const SANKEY_STEP_COUNT = 16;
const LIQUID_STEP_COUNT = 32;
const LIQUID_WAVE_HEIGHT_RATIO = 0.04;
const LIQUID_WAVE_CYCLE_COUNT = 2;
const SEGMENT_GAP_RATIO = 0.12;
const PROGRESS_TRACK_TOP_RATIO = 0.4;
const PROGRESS_TRACK_BOTTOM_RATIO = 0.6;
const PROGRESS_TICK_BOTTOM_RATIO = 0.72;
const PROGRESS_TICK_PERCENTS = [0, 25, 50, 75, 100];
const PROGRESS_MARKER_TOP_RATIO = 0.08;
const PROGRESS_MARKER_TIP_RATIO = 0.36;
const PROGRESS_MARKER_HALF_WIDTH_RATIO = 0.03;
const WATERFALL_FILLS = { total: "blue", increase: "green", decrease: "red" };

const readNumberList = (element, attributeName) => {
  const numberListAttribute = element.getAttribute(attributeName);
  const isAttributeMissing = numberListAttribute === null;
  if (isAttributeMissing) return null;

  return numberListAttribute.split(",").map(parseListedNumber);
};

const parseListedNumber = (listedNumber) => {
  const trimmedNumber = listedNumber.trim();
  const isNumberBlank = trimmedNumber === "";
  if (isNumberBlank) return null;

  const parsedNumber = Number(trimmedNumber);
  const isParsedNumberFinite = Number.isFinite(parsedNumber);
  return isParsedNumberFinite ? parsedNumber : null;
};

const hasAnyNumber = (numbers) => numbers.some((amount) => amount !== null);

const readChartNumbers = (element, sampleNumbers) => {
  const numbers = readNumberList(element, "data-numbers");
  const isNumbersGiven = numbers !== null && hasAnyNumber(numbers);
  if (isNumbersGiven) return numbers;

  return sampleNumbers;
};

const readSecondNumbers = (element) => {
  const secondNumbers = readNumberList(element, "data-second-numbers");
  const isSecondNumbersGiven = secondNumbers !== null && hasAnyNumber(secondNumbers);
  if (isSecondNumbersGiven) return secondNumbers;

  return null;
};

const listPresentNumbers = (numbers) => numbers.filter((amount) => amount !== null);

const fillGapsWithZero = (numbers) => numbers.map((amount) => amount ?? 0);

const addUp = (amounts) => amounts.reduce((sum, amount) => sum + amount, 0);

const createValueRange = (amounts, isZeroIncluded) => {
  const presentAmounts = listPresentNumbers(amounts);
  const lowestAmount = Math.min(...presentAmounts);
  const highestAmount = Math.max(...presentAmounts);
  const low = isZeroIncluded ? Math.min(0, lowestAmount) : lowestAmount;
  const high = isZeroIncluded ? Math.max(0, highestAmount) : highestAmount;
  const spreadAmount = high - low;
  const isSpreadEmpty = spreadAmount === 0;
  const span = isSpreadEmpty ? 1 : spreadAmount;
  return { low, span };
};

const findAmountRatio = (range, amount) => (amount - range.low) / range.span;

const insetBox = (box, ratio) => {
  const insetX = box.w * ratio;
  const insetY = box.h * ratio;
  return { x: box.x + insetX, y: box.y + insetY, w: box.w - insetX * 2, h: box.h - insetY * 2 };
};

const boxBetween = (cornerA, cornerB) => ({
  x: Math.min(cornerA.x, cornerB.x),
  y: Math.min(cornerA.y, cornerB.y),
  w: Math.abs(cornerB.x - cornerA.x),
  h: Math.abs(cornerB.y - cornerA.y),
});

const boxAround = (point, size) => ({ x: point.x - size / 2, y: point.y - size / 2, w: size, h: size });

const boxCenter = (box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

const plotRadius = (box) => (Math.min(box.w, box.h) / 2) * (1 - PLOT_PADDING_RATIO);

const drawCircleAround = (layer, center, radius, style) => {
  circle(layer, { x: center.x - radius, y: center.y - radius, w: radius * 2, h: radius * 2 }, style);
};

const pointOnCircle = (center, radius, angle) => ({
  x: center.x + radius * Math.cos(angle),
  y: center.y + radius * Math.sin(angle),
});

const arcPoints = (center, radius, startAngle, endAngle) => {
  const sweep = endAngle - startAngle;
  const stepIndexes = Array.from({ length: ARC_STEP_COUNT + 1 }, (_, index) => index);
  return stepIndexes.map((index) => pointOnCircle(center, radius, startAngle + (sweep * index) / ARC_STEP_COUNT));
};

const sectorPoints = (center, radius, startAngle, endAngle) => [center, ...arcPoints(center, radius, startAngle, endAngle)];

const annularSectorPoints = (center, outerRadius, innerRadius, startAngle, endAngle) => {
  const outerEdge = arcPoints(center, outerRadius, startAngle, endAngle);
  const innerEdge = arcPoints(center, innerRadius, startAngle, endAngle).reverse();
  return [...outerEdge, ...innerEdge];
};

const createChartFrame = (element, box, isHorizontal) => {
  const isMirrored = isRightToLeft(element);
  const plotBox = insetBox(box, PLOT_PADDING_RATIO);
  const xAt = (ratio) => plotBox.x + plotBox.w * (isMirrored ? 1 - ratio : ratio);
  const yAt = (ratio) => plotBox.y + plotBox.h * ratio;
  const pointAt = (alongRatio, valueRatio) => {
    if (isHorizontal) return { x: xAt(valueRatio), y: yAt(alongRatio) };

    return { x: xAt(alongRatio), y: yAt(1 - valueRatio) };
  };
  return { plotBox, xAt, yAt, pointAt };
};

const findAlongRatio = (index, count) => {
  const isSingleSlot = count === 1;
  if (isSingleSlot) return 0.5;

  return index / (count - 1);
};

const planSeriesPoints = (frame, series, range) =>
  series.map((amount, index) => {
    const alongRatio = findAlongRatio(index, series.length);
    const valueRatio = findAmountRatio(range, amount);
    return frame.pointAt(alongRatio, valueRatio);
  });

const drawGrid = (under, frame, seed) => {
  for (const [gridIndex, gridRatio] of GRID_RATIOS.entries()) {
    const gridStart = frame.pointAt(0, gridRatio);
    const gridEnd = frame.pointAt(1, gridRatio);
    line(under, gridStart, gridEnd, { tone: "soft", seed: seed + gridIndex, dashed: true });
  }

  const baselineStart = frame.pointAt(0, 0);
  const baselineEnd = frame.pointAt(1, 0);
  line(under, baselineStart, baselineEnd, { tone: "soft", seed: seed + GRID_RATIOS.length });
};

const planBars = (firstNumbers, seriesNumbers, isStacked) => {
  const slotRatio = 1 / firstNumbers.length;
  const gapRatio = slotRatio * BAR_GAP_RATIO;
  const laneCount = isStacked ? 1 : seriesNumbers.length;
  const laneRatio = (slotRatio - gapRatio) / laneCount;
  return firstNumbers.flatMap((_, categoryIndex) =>
    seriesNumbers.map((series, seriesIndex) => {
      const slotStart = categoryIndex * slotRatio + gapRatio / 2;
      const alongFrom = isStacked ? slotStart : slotStart + seriesIndex * laneRatio;
      const baseAmount = isStacked ? sumBelow(seriesNumbers, seriesIndex, categoryIndex) : 0;
      return {
        alongFrom,
        alongTo: alongFrom + laneRatio,
        valueFrom: baseAmount,
        valueTo: baseAmount + series[categoryIndex],
        seriesIndex,
      };
    }),
  );
};

const sumBelow = (seriesNumbers, seriesIndex, categoryIndex) =>
  seriesNumbers.slice(0, seriesIndex).reduce((sum, series) => sum + series[categoryIndex], 0);

const drawBarChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const isHorizontal = element.classList.contains("sk-horizontal");
  const isStacked = element.classList.contains("sk-stacked");
  const firstNumbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_NUMBERS));
  const secondNumbers = readSecondNumbers(element);
  const hasSecondSeries = secondNumbers !== null;
  const seriesNumbers = hasSecondSeries ? [firstNumbers, fillGapsWithZero(secondNumbers)] : [firstNumbers];
  const stackedTotals = firstNumbers.map((_, index) => sumBelow(seriesNumbers, seriesNumbers.length, index));
  const rangeAmounts = isStacked ? stackedTotals : seriesNumbers.flat();
  const range = createValueRange(rangeAmounts, true);
  const frame = createChartFrame(element, box, isHorizontal);
  drawGrid(under, frame, seed);

  const bars = planBars(firstNumbers, seriesNumbers, isStacked);
  for (const [barIndex, bar] of bars.entries()) {
    const startPoint = frame.pointAt(bar.alongFrom, findAmountRatio(range, bar.valueFrom));
    const endPoint = frame.pointAt(bar.alongTo, findAmountRatio(range, bar.valueTo));
    const tone = SERIES_TONES[bar.seriesIndex];
    const fill = SERIES_FILLS[bar.seriesIndex];
    rectangle(under, boxBetween(startPoint, endPoint), { tone, fill, seed: seed + barIndex });
  }
};

const drawSeriesLines = (drawing, isAreaFilled) => {
  const { element, box, seed, under } = drawing;
  const firstNumbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_NUMBERS));
  const secondNumbers = readSecondNumbers(element);
  const hasSecondSeries = secondNumbers !== null;
  const seriesNumbers = hasSecondSeries ? [firstNumbers, fillGapsWithZero(secondNumbers)] : [firstNumbers];
  const range = createValueRange(seriesNumbers.flat(), true);
  const frame = createChartFrame(element, box, false);
  const dotSize = Math.min(frame.plotBox.w, frame.plotBox.h) * DOT_SIZE_RATIO;
  drawGrid(under, frame, seed);

  for (const [seriesIndex, series] of seriesNumbers.entries()) {
    const tone = SERIES_TONES[seriesIndex];
    const points = planSeriesPoints(frame, series, range);
    if (isAreaFilled) {
      const areaEdge = [...points, frame.pointAt(1, 0), frame.pointAt(0, 0)];
      polygon(under, areaEdge, { tone, fill: SERIES_FILLS[seriesIndex], seed: seed + seriesIndex });
    }

    polyline(under, points, { tone, seed: seed + seriesIndex + GRID_RATIOS.length });
    for (const [pointIndex, point] of points.entries()) {
      circle(under, boxAround(point, dotSize), { tone, seed: seed + pointIndex });
    }
  }
};

const planSliceAngles = (numbers) => {
  const total = addUp(numbers);
  return numbers.reduce((slices, amount) => {
    const isFirstSlice = slices.length === 0;
    const previousSlice = slices.at(-1);
    const startAngle = isFirstSlice ? TOP_ANGLE : previousSlice.endAngle;
    const sweep = (amount / total) * FULL_TURN;
    return [...slices, { startAngle, endAngle: startAngle + sweep }];
  }, []);
};

const drawSlices = (drawing, hasCenterHole) => {
  const { element, box, seed, under } = drawing;
  const numbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_PIE_NUMBERS));
  const isNothingToDraw = addUp(numbers) <= 0;
  if (isNothingToDraw) return;

  const center = boxCenter(box);
  const radius = plotRadius(box);
  const slices = planSliceAngles(numbers);
  for (const [sliceIndex, slice] of slices.entries()) {
    const fill = SLICE_FILLS[sliceIndex % SLICE_FILLS.length];
    const holeRadius = radius * DONUT_HOLE_RATIO;
    const slicePoints = hasCenterHole
      ? annularSectorPoints(center, radius, holeRadius, slice.startAngle, slice.endAngle)
      : sectorPoints(center, radius, slice.startAngle, slice.endAngle);
    polygon(under, slicePoints, { tone: "ink", fill, seed: seed + sliceIndex });
  }
};

const planScatterPairs = (numbers) =>
  Array.from({ length: Math.floor(numbers.length / 2) }, (_, pairIndex) => ({
    x: numbers[pairIndex * 2],
    y: numbers[pairIndex * 2 + 1],
  }));

const drawScatterChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const isBubble = element.classList.contains("sk-bubble");
  const pairs = planScatterPairs(fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_SCATTER_NUMBERS)));
  const sizeNumbers = fillGapsWithZero(readSecondNumbers(element) ?? CHART_SAMPLE_BUBBLE_SIZES);
  const xRange = createValueRange(pairs.map((pair) => pair.x), true);
  const yRange = createValueRange(pairs.map((pair) => pair.y), true);
  const sizeRange = createValueRange(sizeNumbers, false);
  const frame = createChartFrame(element, box, false);
  const dotSize = Math.min(frame.plotBox.w, frame.plotBox.h) * SCATTER_DOT_SIZE_RATIO;
  const bubbleRange = Math.min(frame.plotBox.w, frame.plotBox.h);
  drawGrid(under, frame, seed);

  for (const [pairIndex, pair] of pairs.entries()) {
    const point = frame.pointAt(findAmountRatio(xRange, pair.x), findAmountRatio(yRange, pair.y));
    const sizeRatio = findAmountRatio(sizeRange, sizeNumbers[pairIndex] ?? 0);
    const bubbleDiameter = bubbleRange * (BUBBLE_MIN_RATIO + BUBBLE_GROWTH_RATIO * sizeRatio);
    const diameter = isBubble ? bubbleDiameter : dotSize;
    const fill = isBubble ? "blue" : undefined;
    circle(under, boxAround(point, diameter), { tone: "blue", fill, seed: seed + pairIndex });
  }
};

const planCandles = (numbers) => {
  const candleCount = Math.floor(numbers.length / CANDLE_NUMBER_COUNT);
  return Array.from({ length: candleCount }, (_, candleIndex) => {
    const start = candleIndex * CANDLE_NUMBER_COUNT;
    return {
      open: numbers[start],
      high: numbers[start + 1],
      low: numbers[start + 2],
      close: numbers[start + 3],
    };
  });
};

const drawCandlestickChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const numbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_CANDLE_NUMBERS));
  const candles = planCandles(numbers);
  const range = createValueRange(numbers, false);
  const frame = createChartFrame(element, box, false);
  const slotRatio = 1 / candles.length;
  drawGrid(under, frame, seed);

  for (const [candleIndex, candle] of candles.entries()) {
    const centerRatio = (candleIndex + 0.5) * slotRatio;
    const isUpCandle = candle.close >= candle.open;
    const color = isUpCandle ? "green" : "red";
    const wickStart = frame.pointAt(centerRatio, findAmountRatio(range, candle.low));
    const wickEnd = frame.pointAt(centerRatio, findAmountRatio(range, candle.high));
    line(under, wickStart, wickEnd, { tone: color, seed: seed + candleIndex });

    const bodyHalfWidth = (slotRatio * CANDLE_BODY_WIDTH_RATIO) / 2;
    const bodyCornerA = frame.pointAt(centerRatio - bodyHalfWidth, findAmountRatio(range, candle.open));
    const bodyCornerB = frame.pointAt(centerRatio + bodyHalfWidth, findAmountRatio(range, candle.close));
    rectangle(under, boxBetween(bodyCornerA, bodyCornerB), { tone: color, fill: color, seed: seed + candleIndex + 1 });
  }
};

const planWaterfallSteps = (numbers) => {
  const [startAmount, ...changeAmounts] = numbers;
  const startStep = { from: 0, to: startAmount, kind: "total" };
  const changeSteps = changeAmounts.reduce((steps, change) => {
    const previousTotal = steps.at(-1).to;
    const isIncrease = change >= 0;
    const kind = isIncrease ? "increase" : "decrease";
    return [...steps, { from: previousTotal, to: previousTotal + change, kind }];
  }, [startStep]);
  const endTotal = changeSteps.at(-1).to;
  return [...changeSteps, { from: 0, to: endTotal, kind: "total" }];
};

const drawWaterfallChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const numbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_WATERFALL_NUMBERS));
  const steps = planWaterfallSteps(numbers);
  const range = createValueRange(steps.flatMap((step) => [step.from, step.to]), true);
  const frame = createChartFrame(element, box, false);
  const slotRatio = 1 / steps.length;
  const gapRatio = slotRatio * BAR_GAP_RATIO;
  drawGrid(under, frame, seed);

  for (const [stepIndex, step] of steps.entries()) {
    const slotStart = stepIndex * slotRatio + gapRatio / 2;
    const slotEnd = slotStart + slotRatio - gapRatio;
    const barCornerA = frame.pointAt(slotStart, findAmountRatio(range, step.from));
    const barCornerB = frame.pointAt(slotEnd, findAmountRatio(range, step.to));
    const color = WATERFALL_FILLS[step.kind];
    rectangle(under, boxBetween(barCornerA, barCornerB), { tone: color, fill: color, seed: seed + stepIndex });

    const isLastStep = stepIndex === steps.length - 1;
    if (isLastStep) return;

    const nextSlotStart = (stepIndex + 1) * slotRatio + gapRatio / 2;
    const connectorStart = frame.pointAt(slotEnd, findAmountRatio(range, step.to));
    const connectorEnd = frame.pointAt(nextSlotStart, findAmountRatio(range, step.to));
    line(under, connectorStart, connectorEnd, { tone: "soft", seed: seed + stepIndex + 20, dashed: true });
  }
};

const planFunnelWidthRatios = (numbers, isPyramid) => {
  const largestAmount = Math.max(...numbers);
  return numbers.map((amount, levelIndex) => {
    if (isPyramid) return (levelIndex + 1) / numbers.length;

    return Math.max(amount / largestAmount, FUNNEL_MIN_WIDTH_RATIO);
  });
};

const drawFunnelChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const isPyramid = element.classList.contains("sk-pyramid");
  const numbers = listPresentNumbers(readChartNumbers(element, CHART_SAMPLE_FUNNEL_NUMBERS));
  const widthRatios = planFunnelWidthRatios(numbers, isPyramid);
  const plotBox = insetBox(box, PLOT_PADDING_RATIO);
  const centerX = plotBox.x + plotBox.w / 2;
  const levelHeight = plotBox.h / widthRatios.length;
  const levelGap = levelHeight * FUNNEL_GAP_RATIO;

  for (const [levelIndex, widthRatio] of widthRatios.entries()) {
    const nextWidthRatio = widthRatios[levelIndex + 1] ?? widthRatio;
    const topY = plotBox.y + levelIndex * levelHeight + levelGap / 2;
    const bottomY = topY + levelHeight - levelGap;
    const topHalfWidth = (plotBox.w * widthRatio) / 2;
    const bottomHalfWidth = (plotBox.w * nextWidthRatio) / 2;
    const isLastLevel = levelIndex === widthRatios.length - 1;
    const fill = isLastLevel ? "green" : "blue";
    const levelEdge = [
      { x: centerX - topHalfWidth, y: topY },
      { x: centerX + topHalfWidth, y: topY },
      { x: centerX + bottomHalfWidth, y: bottomY },
      { x: centerX - bottomHalfWidth, y: bottomY },
    ];
    polygon(under, levelEdge, { tone: "ink", fill, seed: seed + levelIndex });
  }
};

const planHeatmapCells = (numbers, columnCount, rowCount, isCalendar) => {
  const rowIndexes = Array.from({ length: rowCount }, (_, index) => index);
  const columnIndexes = Array.from({ length: columnCount }, (_, index) => index);
  return rowIndexes.flatMap((row) =>
    columnIndexes.map((column) => {
      const cellNumberIndex = isCalendar ? column * CALENDAR_ROW_COUNT + row : row * columnCount + column;
      return { row, column, amount: numbers[cellNumberIndex] ?? null };
    }),
  );
};

const pickHeatFill = (range, amount) => {
  const levelIndex = Math.min(HEAT_FILLS.length - 1, Math.floor(findAmountRatio(range, amount) * HEAT_FILLS.length));
  return HEAT_FILLS[levelIndex];
};

const drawHeatmapChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const isCalendar = element.classList.contains("sk-calendar");
  const numbers = readChartNumbers(element, CHART_SAMPLE_HEATMAP_NUMBERS);
  const columnCount = isCalendar
    ? Math.ceil(numbers.length / CALENDAR_ROW_COUNT)
    : DEFAULT_HEATMAP_COLUMN_COUNT;
  const rowCount = isCalendar ? CALENDAR_ROW_COUNT : Math.ceil(numbers.length / columnCount);
  const cells = planHeatmapCells(numbers, columnCount, rowCount, isCalendar);
  const range = createValueRange(numbers, false);
  const plotBox = insetBox(box, PLOT_PADDING_RATIO);
  const cellSide = Math.min(plotBox.w / columnCount, plotBox.h / rowCount);
  const gridLeft = plotBox.x + (plotBox.w - cellSide * columnCount) / 2;
  const gridTop = plotBox.y + (plotBox.h - cellSide * rowCount) / 2;
  const cellGap = cellSide * HEAT_CELL_GAP_RATIO;

  for (const [cellIndex, cell] of cells.entries()) {
    const cellBox = {
      x: gridLeft + cell.column * cellSide + cellGap / 2,
      y: gridTop + cell.row * cellSide + cellGap / 2,
      w: cellSide - cellGap,
      h: cellSide - cellGap,
    };
    const isEmptyCell = cell.amount === null;
    if (isEmptyCell) {
      rectangle(under, cellBox, { tone: "soft", dashed: true, seed: seed + cellIndex });
    } else {
      const fill = pickHeatFill(range, cell.amount);
      rectangle(under, cellBox, { tone: "ink", fill, seed: seed + cellIndex });
    }
  }
};

const findHalfSplitIndex = (amounts, total) => {
  const halfTotal = total / 2;
  const runningSums = amounts.map((_, index) => addUp(amounts.slice(0, index + 1)));
  const crossingIndex = runningSums.findIndex((runningSum) => runningSum >= halfTotal);
  const atLeastOne = Math.max(crossingIndex + 1, 1);
  return Math.min(atLeastOne, amounts.length - 1);
};

const layoutTreemap = (box, amounts) => {
  const isNoTile = amounts.length === 0;
  if (isNoTile) return [];

  const isSingleTile = amounts.length === 1;
  if (isSingleTile) return [box];

  const total = addUp(amounts);
  const splitIndex = findHalfSplitIndex(amounts, total);
  const firstAmounts = amounts.slice(0, splitIndex);
  const restAmounts = amounts.slice(splitIndex);
  const firstShare = addUp(firstAmounts) / total;
  const isWide = box.w >= box.h;
  const firstBox = isWide
    ? { x: box.x, y: box.y, w: box.w * firstShare, h: box.h }
    : { x: box.x, y: box.y, w: box.w, h: box.h * firstShare };
  const restBox = isWide
    ? { x: box.x + firstBox.w, y: box.y, w: box.w - firstBox.w, h: box.h }
    : { x: box.x, y: box.y + firstBox.h, w: box.w, h: box.h - firstBox.h };
  return [...layoutTreemap(firstBox, firstAmounts), ...layoutTreemap(restBox, restAmounts)];
};

const drawTreemapChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const amounts = listPresentNumbers(readChartNumbers(element, CHART_SAMPLE_TREEMAP_NUMBERS)).filter((amount) => amount > 0);
  const tileBoxes = layoutTreemap(insetBox(box, PLOT_PADDING_RATIO), amounts);
  for (const [tileIndex, tileBox] of tileBoxes.entries()) {
    const fill = SLICE_FILLS[tileIndex % SLICE_FILLS.length];
    rectangle(under, insetBox(tileBox, TREEMAP_TILE_INSET_RATIO), { tone: "ink", fill, seed: seed + tileIndex });
  }
};

const pickUptimeColor = (uptimePercent) => {
  const isNoData = uptimePercent === null;
  if (isNoData) return null;

  const isHealthy = uptimePercent >= UPTIME_GREEN_FROM;
  if (isHealthy) return "green";

  const isDegraded = uptimePercent >= UPTIME_ORANGE_FROM;
  if (isDegraded) return "orange";

  return "red";
};

const drawUptimeBars = (drawing) => {
  const { element, box, seed, under } = drawing;
  const uptimeNumbers = readChartNumbers(element, CHART_SAMPLE_UPTIME_NUMBERS);
  const frame = createChartFrame(element, box, false);
  const slotRatio = 1 / uptimeNumbers.length;
  const gapRatio = slotRatio * UPTIME_GAP_RATIO;

  for (const [dayIndex, uptimePercent] of uptimeNumbers.entries()) {
    const slotStart = dayIndex * slotRatio + gapRatio / 2;
    const slotEnd = slotStart + slotRatio - gapRatio;
    const barCornerA = frame.pointAt(slotStart, 0);
    const barCornerB = frame.pointAt(slotEnd, 1);
    const barBox = boxBetween(barCornerA, barCornerB);
    const color = pickUptimeColor(uptimePercent);
    const isNoData = color === null;
    if (isNoData) {
      rectangle(under, barBox, { tone: "soft", dashed: true, seed: seed + dayIndex });
    } else {
      rectangle(under, barBox, { tone: color, fill: color, seed: seed + dayIndex });
    }
  }
};

const drawSparkline = (drawing) => {
  const { element, box, seed, under } = drawing;
  const numbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_SPARK_NUMBERS));
  const range = createValueRange(numbers, false);
  const frame = createChartFrame(element, box, false);
  const points = planSeriesPoints(frame, numbers, range);
  const dotSize = Math.min(frame.plotBox.w, frame.plotBox.h) * DOT_SIZE_RATIO * 2;
  const lastPoint = points.at(-1);
  polyline(under, points, { tone: "blue", seed });
  circle(under, boxAround(lastPoint, dotSize), { tone: "blue", fill: "blue", seed: seed + 1 });
};

const planSankeyNodes = (amounts, box) => {
  const slotHeight = box.h / amounts.length;
  const largestAmount = Math.max(1, ...amounts);
  return amounts.map((amount, index) => {
    const nodeHeight = slotHeight * SANKEY_NODE_FILL_RATIO * (amount / largestAmount);
    const slotTop = box.y + slotHeight * index;
    const topY = slotTop + (slotHeight - nodeHeight) / 2;
    return { topY, bottomY: topY + nodeHeight };
  });
};

const easeSankeyProgress = (progress) => progress * progress * (3 - 2 * progress);

const planSankeyRibbon = (frame, sourceNode, targetNode) => {
  const stepIndexes = Array.from({ length: SANKEY_STEP_COUNT + 1 }, (_, index) => index);
  const startRatio = SANKEY_SOURCE_LEFT_RATIO + SANKEY_NODE_WIDTH_RATIO;
  const endRatio = SANKEY_TARGET_LEFT_RATIO;
  const topEdge = stepIndexes.map((stepIndex) => {
    const progress = stepIndex / SANKEY_STEP_COUNT;
    const eased = easeSankeyProgress(progress);
    const x = frame.xAt(startRatio + (endRatio - startRatio) * progress);
    const y = sourceNode.topY + (targetNode.topY - sourceNode.topY) * eased;
    return { x, y };
  });
  const bottomEdge = stepIndexes.map((stepIndex) => {
    const progress = stepIndex / SANKEY_STEP_COUNT;
    const eased = easeSankeyProgress(progress);
    const x = frame.xAt(startRatio + (endRatio - startRatio) * progress);
    const y = sourceNode.bottomY + (targetNode.bottomY - sourceNode.bottomY) * eased;
    return { x, y };
  });
  return [...topEdge, ...bottomEdge.reverse()];
};

const drawSankeyChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const flows = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_SANKEY_NUMBERS));
  const frame = createChartFrame(element, box, false);
  const sourceNodes = planSankeyNodes(flows, box);
  const targetNodesInReverse = planSankeyNodes([...flows].reverse(), box);
  const targetNodes = [...targetNodesInReverse].reverse();

  for (const flowIndex of flows.keys()) {
    const sourceNode = sourceNodes[flowIndex];
    const targetNode = targetNodes[flowIndex];
    const ribbon = planSankeyRibbon(frame, sourceNode, targetNode);
    polygon(under, ribbon, { tone: "soft", fill: SLICE_FILLS[flowIndex % SLICE_FILLS.length], seed: seed + flowIndex });

    const sourceBox = boxBetween(
      { x: frame.xAt(SANKEY_SOURCE_LEFT_RATIO), y: sourceNode.topY },
      { x: frame.xAt(SANKEY_SOURCE_LEFT_RATIO + SANKEY_NODE_WIDTH_RATIO), y: sourceNode.bottomY },
    );
    rectangle(under, sourceBox, { tone: "ink", fill: "grey", seed: seed + flowIndex + 20 });

    const targetBox = boxBetween(
      { x: frame.xAt(SANKEY_TARGET_LEFT_RATIO), y: targetNode.topY },
      { x: frame.xAt(SANKEY_TARGET_LEFT_RATIO + SANKEY_NODE_WIDTH_RATIO), y: targetNode.bottomY },
    );
    rectangle(under, targetBox, { tone: "ink", fill: "grey", seed: seed + flowIndex + 10 });
  }
};

const planBumpPoints = (frame, ranks, teamCount) => {
  const rankSpan = Math.max(teamCount - 1, 1);
  return ranks.map((rank, index) => {
    const alongRatio = findAlongRatio(index, ranks.length);
    const valueRatio = 1 - (rank - 1) / rankSpan;
    return frame.pointAt(alongRatio, valueRatio);
  });
};

const drawBumpChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const secondRanks = readSecondNumbers(element);
  const hasSecondSeries = secondRanks !== null;
  const firstRanks = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_BUMP_RANKS));
  const seriesRanks = hasSecondSeries ? [firstRanks, fillGapsWithZero(secondRanks)] : [firstRanks];
  const teamCount = Math.max(...seriesRanks.flat());
  const frame = createChartFrame(element, box, false);
  const dotSize = Math.min(frame.plotBox.w, frame.plotBox.h) * DOT_SIZE_RATIO;

  for (const [seriesIndex, ranks] of seriesRanks.entries()) {
    const tone = SERIES_TONES[seriesIndex];
    const points = planBumpPoints(frame, ranks, teamCount);
    polyline(under, points, { tone, seed: seed + seriesIndex });
    for (const [pointIndex, point] of points.entries()) {
      circle(under, boxAround(point, dotSize * 2), { tone, fill: SERIES_FILLS[seriesIndex], seed: seed + pointIndex });
    }
  }
};

const drawRadarChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const numbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_RADAR_NUMBERS));
  const range = createValueRange(numbers, true);
  const center = boxCenter(box);
  const outerRadius = plotRadius(box);
  const axisIndexes = numbers.map((_, index) => index);
  const angleAt = (axisIndex) => TOP_ANGLE + (FULL_TURN * axisIndex) / numbers.length;

  for (const [ringIndex, ringRatio] of CIRCLE_RING_RATIOS.entries()) {
    const ringPoints = axisIndexes.map((axisIndex) => pointOnCircle(center, outerRadius * ringRatio, angleAt(axisIndex)));
    polygon(under, ringPoints, { tone: "soft", dashed: true, seed: seed + ringIndex });
  }

  for (const axisIndex of axisIndexes) {
    const axisEnd = pointOnCircle(center, outerRadius, angleAt(axisIndex));
    line(under, center, axisEnd, { tone: "soft", seed: seed + 10 + axisIndex });
  }

  const valuePoints = numbers.map((amount, axisIndex) =>
    pointOnCircle(center, outerRadius * findAmountRatio(range, amount), angleAt(axisIndex)),
  );
  polygon(under, valuePoints, { tone: "blue", fill: "blue", seed: seed + 20 });
};

const drawPolarAreaChart = (drawing) => {
  const { element, box, seed, under } = drawing;
  const numbers = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_POLAR_NUMBERS));
  const range = createValueRange(numbers, true);
  const center = boxCenter(box);
  const outerRadius = plotRadius(box);
  const sectorSweep = FULL_TURN / numbers.length;

  for (const [sectorIndex, amount] of numbers.entries()) {
    const startAngle = TOP_ANGLE + sectorSweep * sectorIndex;
    const endAngle = startAngle + sectorSweep;
    const sectorRadius = outerRadius * Math.sqrt(findAmountRatio(range, amount));
    const fill = SLICE_FILLS[sectorIndex % SLICE_FILLS.length];
    polygon(under, sectorPoints(center, sectorRadius, startAngle, endAngle), { tone: "ink", fill, seed: seed + sectorIndex });
  }

  drawCircleAround(under, center, outerRadius, { tone: "soft", dashed: true, seed: seed + 20 });
};

const drawActivityGauge = (drawing) => {
  const { element, box, seed, under } = drawing;
  const percents = fillGapsWithZero(readChartNumbers(element, CHART_SAMPLE_RING_PERCENTS));
  const center = boxCenter(box);
  const outerRadius = plotRadius(box);
  const ringStep = outerRadius / percents.length;

  for (const [ringIndex, percent] of percents.entries()) {
    const outerRing = outerRadius - ringIndex * ringStep;
    const innerRing = outerRing - ringStep * RING_THICKNESS_RATIO;
    const trackEdge = annularSectorPoints(center, outerRing, innerRing, TOP_ANGLE, TOP_ANGLE + FULL_TURN);
    polygon(under, trackEdge, { tone: "soft", fill: "grey", seed: seed + ringIndex });

    const shownPercent = Math.min(Math.max(percent, 0), PERCENT_SCALE);
    const hasRingProgress = shownPercent > 0;
    if (hasRingProgress) {
      const sweep = (FULL_TURN * shownPercent) / PERCENT_SCALE;
      const progressEdge = annularSectorPoints(center, outerRing, innerRing, TOP_ANGLE, TOP_ANGLE + sweep);
      const ringColorIndex = ringIndex % RING_FILLS.length;
      polygon(under, progressEdge, {
        tone: RING_TONES[ringColorIndex],
        fill: RING_FILLS[ringColorIndex],
        seed: seed + ringIndex + 30,
      });
    }
  }
};

const planLiquidPoints = (center, radius, percent) => {
  const levelY = center.y + radius - (percent / PERCENT_SCALE) * radius * 2;
  const waveHeight = radius * LIQUID_WAVE_HEIGHT_RATIO;
  const stepWidth = (radius * 2) / LIQUID_STEP_COUNT;
  const columnIndexes = Array.from({ length: LIQUID_STEP_COUNT + 1 }, (_, index) => index);
  const columns = columnIndexes.map((index) => {
    const x = center.x - radius + index * stepWidth;
    const offsetX = x - center.x;
    const chordHalfHeight = Math.sqrt(Math.max(0, radius * radius - offsetX * offsetX));
    const wavePhase = (offsetX / radius) * Math.PI * LIQUID_WAVE_CYCLE_COUNT;
    const waveY = levelY + waveHeight * Math.sin(wavePhase);
    const topY = Math.min(Math.max(waveY, center.y - chordHalfHeight), center.y + chordHalfHeight);
    const bottomY = center.y + chordHalfHeight;
    return { x, topY, bottomY };
  });
  const topEdge = columns.map((column) => ({ x: column.x, y: column.topY }));
  const bottomEdge = columns.map((column) => ({ x: column.x, y: column.bottomY })).reverse();
  return [...topEdge, ...bottomEdge];
};

const drawLiquidGauge = (drawing) => {
  const { element, box, seed, under } = drawing;
  const percent = readPercent(element) ?? CHART_SAMPLE_PERCENT;
  const isError = readStatus(element) === "error";
  const tone = isError ? "red" : readTone(element);
  const fill = isError ? "red" : readFill(element) ?? "blue";
  const center = boxCenter(box);
  const radius = Math.min(box.w, box.h) / 2;
  const liquidPoints = planLiquidPoints(center, radius, percent);
  polygon(under, liquidPoints, { tone, fill, seed });
  circle(under, box, { tone, seed: seed + 1 });
};

const drawSegmentMeter = (drawing) => {
  const { element, box, seed, under } = drawing;
  const segmentCount = readCount(element, CHART_SAMPLE_SEGMENT_COUNT);
  const percent = readPercent(element) ?? CHART_SAMPLE_PERCENT;
  const filledCount = Math.round((percent / PERCENT_SCALE) * segmentCount);
  const frame = createChartFrame(element, box, true);
  const slotRatio = 1 / segmentCount;
  const gapRatio = slotRatio * SEGMENT_GAP_RATIO;
  const segmentIndexes = Array.from({ length: segmentCount }, (_, index) => index);

  for (const segmentIndex of segmentIndexes) {
    const segmentStart = segmentIndex * slotRatio + gapRatio / 2;
    const segmentEnd = segmentStart + slotRatio - gapRatio;
    const segmentBox = boxBetween(frame.pointAt(0, segmentStart), frame.pointAt(1, segmentEnd));
    const isSegmentFilled = segmentIndex < filledCount;
    if (isSegmentFilled) {
      roundedRectangle(under, segmentBox, { tone: "blue", fill: "blue", seed: seed + segmentIndex });
    } else {
      roundedRectangle(under, segmentBox, { tone: "soft", dashed: true, seed: seed + segmentIndex });
    }
  }
};

const drawProgressMeter = (drawing) => {
  const { element, box, seed, under } = drawing;
  const percent = readPercent(element) ?? CHART_SAMPLE_PERCENT;
  const isError = readStatus(element) === "error";
  const color = isError ? "red" : "blue";
  const frame = createChartFrame(element, box, true);
  const fillRatio = percent / PERCENT_SCALE;
  const trackCornerA = frame.pointAt(PROGRESS_TRACK_TOP_RATIO, 0);
  const trackCornerB = frame.pointAt(PROGRESS_TRACK_BOTTOM_RATIO, 1);
  roundedRectangle(under, boxBetween(trackCornerA, trackCornerB), { tone: "soft", seed });

  const fillCornerB = frame.pointAt(PROGRESS_TRACK_BOTTOM_RATIO, fillRatio);
  rectangle(under, boxBetween(trackCornerA, fillCornerB), { tone: color, fill: color, seed: seed + 1 });

  for (const [tickIndex, tickPercent] of PROGRESS_TICK_PERCENTS.entries()) {
    const tickRatio = tickPercent / PERCENT_SCALE;
    const tickStart = frame.pointAt(PROGRESS_TRACK_BOTTOM_RATIO, tickRatio);
    const tickEnd = frame.pointAt(PROGRESS_TICK_BOTTOM_RATIO, tickRatio);
    line(under, tickStart, tickEnd, { tone: "soft", seed: seed + tickIndex + 2 });
  }

  const markerLeft = frame.pointAt(PROGRESS_MARKER_TOP_RATIO, fillRatio - PROGRESS_MARKER_HALF_WIDTH_RATIO);
  const markerRight = frame.pointAt(PROGRESS_MARKER_TOP_RATIO, fillRatio + PROGRESS_MARKER_HALF_WIDTH_RATIO);
  const markerTip = frame.pointAt(PROGRESS_MARKER_TIP_RATIO, fillRatio);
  polygon(under, [markerLeft, markerRight, markerTip], { tone: "ink", fill: color, seed: seed + 9 });
};

definePart("sk-bar-chart", drawBarChart);
definePart("sk-line-chart", (drawing) => drawSeriesLines(drawing, false));
definePart("sk-area-chart", (drawing) => drawSeriesLines(drawing, true));
definePart("sk-pie-chart", (drawing) => drawSlices(drawing, false));
definePart("sk-donut-chart", (drawing) => drawSlices(drawing, true));
definePart("sk-scatter-chart", drawScatterChart);
definePart("sk-radar-chart", drawRadarChart);
definePart("sk-polar-area-chart", drawPolarAreaChart);
definePart("sk-funnel-chart", drawFunnelChart);
definePart("sk-heatmap-chart", drawHeatmapChart);
definePart("sk-treemap-chart", drawTreemapChart);
definePart("sk-waterfall-chart", drawWaterfallChart);
definePart("sk-candlestick-chart", drawCandlestickChart);
definePart("sk-sankey-chart", drawSankeyChart);
definePart("sk-bump-chart", drawBumpChart);
definePart("sk-activity-gauge", drawActivityGauge);
definePart("sk-liquid-gauge", drawLiquidGauge);
definePart("sk-segment-meter", drawSegmentMeter);
definePart("sk-uptime-bars", drawUptimeBars);
definePart("sk-sparkline", drawSparkline);
definePart("sk-progress-meter", drawProgressMeter);
`;

export const CHARTS_PART_STYLE = `:where(
  .sk-bar-chart,
  .sk-line-chart,
  .sk-area-chart,
  .sk-scatter-chart,
  .sk-funnel-chart,
  .sk-heatmap-chart,
  .sk-treemap-chart,
  .sk-waterfall-chart,
  .sk-candlestick-chart,
  .sk-sankey-chart,
  .sk-bump-chart,
  .sk-uptime-bars,
  .sk-segment-meter
) {
  display: block;
  width: 100%;
  min-height: 8rem;
  border: 1.6px solid transparent;
}

:where(.sk-sparkline, .sk-progress-meter) {
  display: block;
  width: 100%;
  min-height: 3rem;
  border: 1.6px solid transparent;
}

:where(.sk-pie-chart, .sk-donut-chart, .sk-polar-area-chart, .sk-radar-chart, .sk-activity-gauge, .sk-liquid-gauge) {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  min-height: 8rem;
  border: 1.6px solid transparent;
}
`;
