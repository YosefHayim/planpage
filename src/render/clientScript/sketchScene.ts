import { SKETCH_LOOK } from "./sketchLook";

export const SKETCH_SCENE_SCRIPT = `(() => {
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const FILLS = ${JSON.stringify(SKETCH_LOOK.pastelFills)};
  const SATURATED_FILLS = ${JSON.stringify(SKETCH_LOOK.saturatedFills)};
  const TONES = ${JSON.stringify(SKETCH_LOOK.tones)};
  const HATCH_COLOR = "#8a8a94";
  const PAPER_LINE_COLOR = "#d4d4d8";
  const PAPER_PATTERN_SIZE = 20;
  const PAPER_PATTERN_IDS = { dots: "sketch-paper-dots", lined: "sketch-paper-lined" };
  const DEFAULT_LOOK = {
    roughness: null,
    fill: "solid",
    palette: "pastel",
    route: null,
    notePlacement: "beside",
    font: "kalam",
    density: "airy",
    paper: "plain",
  };
  const ROUGHNESS_SHAPE = ${SKETCH_LOOK.roughnessShape};
  const ROUGHNESS_EDGE = ${SKETCH_LOOK.roughnessEdge};
  const BOWING = ${SKETCH_LOOK.bowing};
  const HACHURE_GAP = 5;
  const STROKE_WIDTH = ${SKETCH_LOOK.strokeWidth};
  const THICK_STROKE_WIDTH = 3.4;
  const DASH_PATTERN = ${JSON.stringify(SKETCH_LOOK.dashPattern)};
  const SEED_FIRST = 7;
  const SEED_STEP = 13;
  const CORNER_RADIUS = 6;
  const ARROW_LENGTH = 11;
  const ARROW_SPREAD = 0.45;
  const CURVE_BEND = 40;
  const TEXT_LINE_HEIGHT = 22;
  const ROW_TEXT_INSET = 14;
  const ROW_INDENT_STEP = 18;
  const TREE_STEM_OFFSET = 5;
  const TREE_TEXT_GAP = 5;
  const TREE_LINE_OPACITY = 0.45;
  const TITLE_OFFSET = 16;
  const STRIKE_OVERHANG = 4;
  const STRIKE_TONE = "red";
  const STICKY_TILT_LIMIT = 4;
  const DEFAULT_FILL_BY_KIND = { sticky: "yellow" };
  const PHONE_CORNER_RADIUS_RATIO = 0.12;
  const PHONE_NOTCH_WIDTH_RATIO = 0.3;
  const PHONE_NOTCH_TOP = 10;
  const PHONE_NOTCH_HEIGHT = 6;
  const CYLINDER_CAP_RADIUS_Y = 12;
  const LABEL_CLEARANCE = 8;
  const NOTE_DEFAULT_WIDTH = 200;
  const NOTE_UNDER_GAP = 8;
  const NOTE_UNDER_SHIFT = 60;
  const LINK_GAP = 6;
  const BADGE_RADIUS = 11;
  const MIN_SCENE_SCALE = 0.6;

  const createSvgElement = (tagName) => document.createElementNS(SVG_NAMESPACE, tagName);

  const setAttributes = (element, attributes) => {
    for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, String(value));
    return element;
  };

  const normalizeLook = (look) => ({ ...DEFAULT_LOOK, ...look });

  const fillColorOf = (style) => {
    const isNoFill = style.fill === "none" || style.palette === "ink";
    if (isNoFill) return null;

    const fillTable = style.palette === "saturated" ? SATURATED_FILLS : FILLS;
    const fillColor = fillTable[style.fill];
    if (fillColor === undefined) {
      throw new Error(\`Unknown fill "\${style.fill}". Use one of: \${Object.keys(FILLS).join(", ")}, none\`);
    }
    return fillColor;
  };

  const strokeColorOf = (style) => TONES[style.tone ?? "ink"];

  const toRoughStyle = (style, seed) => {
    const fillColor = fillColorOf(style);
    const isFilled = fillColor !== null;
    const fillStyle = style.fillStyle ?? "solid";
    const isHatched = fillStyle !== "solid";
    const isDashed = style.dashed === true;
    return {
      roughness: style.roughness,
      bowing: BOWING,
      seed,
      stroke: strokeColorOf(style),
      strokeWidth: style.strokeWidth ?? STROKE_WIDTH,
      fillStyle,
      hachureGap: HACHURE_GAP,
      ...(isFilled ? { fill: isHatched ? HATCH_COLOR : fillColor } : {}),
      ...(isDashed ? { strokeLineDash: DASH_PATTERN } : {}),
    };
  };

  const createPlainShape = (tagName, geometry, style) => {
    const shape = createSvgElement(tagName);
    const fillColor = fillColorOf(style);
    const isDashed = style.dashed === true;
    const dashAttributes = isDashed ? { "stroke-dasharray": DASH_PATTERN.join(" ") } : {};
    return setAttributes(shape, {
      ...geometry,
      stroke: strokeColorOf(style),
      "stroke-width": style.strokeWidth ?? STROKE_WIDTH,
      fill: fillColor ?? "none",
      ...dashAttributes,
    });
  };

  const createDrawingContext = ({ svg, look, offsetX = 0, pendingDrawings }) => {
    const roughLibrary = window.rough;
    const seedState = { next: SEED_FIRST };
    return {
      look,
      offsetX,
      pendingDrawings,
      generator: roughLibrary ? roughLibrary.svg(svg) : null,
      nextSeed: () => {
        const seed = seedState.next;
        seedState.next += SEED_STEP;
        return seed;
      },
    };
  };

  const drawRectangle = (context, box, style) => {
    if (context.generator) {
      return context.generator.rectangle(box.x, box.y, box.w, box.h, toRoughStyle(style, context.nextSeed()));
    }
    return createPlainShape("rect", { x: box.x, y: box.y, width: box.w, height: box.h, rx: CORNER_RADIUS }, style);
  };

  const drawPolygon = (context, points, style) => {
    if (context.generator) {
      const roughPoints = points.map((point) => [point.x, point.y]);
      return context.generator.polygon(roughPoints, toRoughStyle(style, context.nextSeed()));
    }
    const pointsAttribute = points.map((point) => \`\${point.x},\${point.y}\`).join(" ");
    return createPlainShape("polygon", { points: pointsAttribute }, style);
  };

  const drawLine = (context, from, to, style) => {
    if (context.generator) {
      return context.generator.line(from.x, from.y, to.x, to.y, toRoughStyle(style, context.nextSeed()));
    }
    return createPlainShape("line", { x1: from.x, y1: from.y, x2: to.x, y2: to.y }, style);
  };

  const drawPath = (context, pathData, style) => {
    if (context.generator) return context.generator.path(pathData, toRoughStyle(style, context.nextSeed()));
    return createPlainShape("path", { d: pathData }, style);
  };

  const addTextLines = (group, words, placement) => {
    const lines = words.split("\\n");
    const firstLineY = placement.y - ((lines.length - 1) * TEXT_LINE_HEIGHT) / 2;
    const textElement = createSvgElement("text");
    setAttributes(textElement, {
      class: "sketch-text",
      "text-anchor": placement.anchor ?? "middle",
      "dominant-baseline": "central",
    });
    textElement.dataset.font = placement.font ?? "hand";
    textElement.dataset.weight = placement.weight ?? "regular";
    textElement.dataset.tone = placement.tone ?? "ink";
    textElement.dataset.size = placement.size ?? "normal";

    for (const [lineIndex, line] of lines.entries()) {
      const lineElement = createSvgElement("tspan");
      setAttributes(lineElement, { x: placement.x, y: firstLineY + lineIndex * TEXT_LINE_HEIGHT });
      lineElement.textContent = line;
      textElement.append(lineElement);
    }
    group.append(textElement);
    return textElement;
  };

  const addSceneText = (context, group, words, placement) => {
    const textElement = addTextLines(group, words, placement);
    const isStruck = placement.struck === true;
    if (isStruck) context.pendingDrawings.strikes.push({ context, group, textElement });
    return textElement;
  };

  const createGroup = (parent, path) => {
    const group = createSvgElement("g");
    if (path) group.dataset.path = path;
    parent.append(group);
    return group;
  };

  const createPaperRect = (parent, box, paper) => {
    const isPlainPaper = paper === "plain";
    if (isPlainPaper) return;

    const paperRect = createSvgElement("rect");
    setAttributes(paperRect, {
      x: box.x,
      y: box.y,
      width: box.w,
      height: box.h,
      fill: \`url(#\${PAPER_PATTERN_IDS[paper]})\`,
    });
    parent.append(paperRect);
  };

  const createPaperDefs = () => {
    const defs = createSvgElement("defs");
    const dotsPattern = createSvgElement("pattern");
    setAttributes(dotsPattern, {
      id: PAPER_PATTERN_IDS.dots,
      width: PAPER_PATTERN_SIZE,
      height: PAPER_PATTERN_SIZE,
      patternUnits: "userSpaceOnUse",
    });
    dotsPattern.append(setAttributes(createSvgElement("circle"), { cx: 1, cy: 1, r: 1, fill: PAPER_LINE_COLOR }));

    const linedPattern = createSvgElement("pattern");
    setAttributes(linedPattern, {
      id: PAPER_PATTERN_IDS.lined,
      width: PAPER_PATTERN_SIZE,
      height: PAPER_PATTERN_SIZE,
      patternUnits: "userSpaceOnUse",
    });
    const lineY = PAPER_PATTERN_SIZE - 0.5;
    const ruleLine = setAttributes(createSvgElement("line"), {
      x1: 0,
      y1: lineY,
      x2: PAPER_PATTERN_SIZE,
      y2: lineY,
      stroke: PAPER_LINE_COLOR,
      "stroke-width": 1,
    });
    linedPattern.append(ruleLine);
    defs.append(dotsPattern, linedPattern);
    return defs;
  };

  const nodeCenter = (node) => ({ x: node.x + node.w / 2, y: node.y + node.h / 2 });

  const reachOfShape = ({ isDiamond, isEllipse, normalizedX, normalizedY }) => {
    if (isDiamond) return normalizedX + normalizedY;
    if (isEllipse) return Math.hypot(normalizedX, normalizedY);
    return Math.max(normalizedX, normalizedY);
  };

  const boundaryPoint = (node, towardPoint) => {
    const center = nodeCenter(node);
    const deltaX = towardPoint.x - center.x;
    const deltaY = towardPoint.y - center.y;
    const isSameSpot = deltaX === 0 && deltaY === 0;
    if (isSameSpot) return center;

    const halfWidth = node.w / 2;
    const halfHeight = node.h / 2;
    const normalizedX = Math.abs(deltaX) / halfWidth;
    const normalizedY = Math.abs(deltaY) / halfHeight;
    const isDiamond = node.kind === "diamond";
    const isEllipse = node.kind === "ellipse";
    const reach = reachOfShape({ isDiamond, isEllipse, normalizedX, normalizedY });
    return { x: center.x + deltaX / reach, y: center.y + deltaY / reach };
  };

  const sideAnchor = (node, side) => {
    const center = nodeCenter(node);
    const anchors = {
      top: { x: center.x, y: node.y },
      bottom: { x: center.x, y: node.y + node.h },
      left: { x: node.x, y: center.y },
      right: { x: node.x + node.w, y: center.y },
    };
    return anchors[side];
  };

  const findNodeForEndpoint = (endpoint, nodesById) => {
    const isNodeId = typeof endpoint === "string";
    if (!isNodeId) return undefined;

    const node = nodesById.get(endpoint);
    if (node === undefined) throw new Error(\`Edge endpoint "\${endpoint}" is not a node id\`);
    return node;
  };

  const drawNodeText = (context, group, node) => {
    const center = nodeCenter(node);
    addSceneText(context, group, node.words, {
      x: center.x,
      y: center.y,
      font: node.font,
      weight: node.weight,
      tone: node.tone,
      size: node.size,
      struck: node.struck,
    });
  };

  const drawBox = (context, group, node, style) => {
    group.append(drawRectangle(context, node, style));
    drawNodeText(context, group, node);
  };

  const drawDiamond = (context, group, node, style) => {
    const center = nodeCenter(node);
    const corners = [
      { x: center.x, y: node.y },
      { x: node.x + node.w, y: center.y },
      { x: center.x, y: node.y + node.h },
      { x: node.x, y: center.y },
    ];
    group.append(drawPolygon(context, corners, style));
    drawNodeText(context, group, node);
  };

  const rowOfItem = (rowItem) => {
    const isPlainText = typeof rowItem === "string";
    if (isPlainText) return { words: rowItem, indent: 0 };

    return { words: rowItem.words, indent: rowItem.indent ?? 0, struck: rowItem.struck };
  };

  const rowTextX = (node, rowIndent) => node.x + ROW_TEXT_INSET + rowIndent * ROW_INDENT_STEP;

  const drawTreeLine = (context, group, from, to) => {
    const treeLine = drawLine(context, from, to, {
      fill: "none",
      tone: "soft",
      roughness: context.look.roughness ?? ROUGHNESS_EDGE,
    });
    setAttributes(treeLine, { opacity: TREE_LINE_OPACITY });
    group.append(treeLine);
  };

  const drawRows = (context, group, node, style) => {
    const rowHeight = node.h / node.rows.length;
    const rows = node.rows.map(rowOfItem);
    group.append(drawRectangle(context, node, style));

    for (const [rowIndex, row] of rows.entries()) {
      const isFirstRow = rowIndex === 0;
      const rowTopY = node.y + rowIndex * rowHeight;
      const rowMiddleY = rowTopY + rowHeight / 2;
      if (!isFirstRow) {
        const dividerFrom = { x: node.x, y: rowTopY };
        const dividerTo = { x: node.x + node.w, y: rowTopY };
        group.append(drawLine(context, dividerFrom, dividerTo, style));
      }

      addSceneText(context, group, row.words, {
        x: rowTextX(node, row.indent),
        y: rowMiddleY,
        anchor: "start",
        font: node.font,
        struck: row.struck,
      });

      const parentIndex = rows.slice(0, rowIndex).findLastIndex((earlierRow) => earlierRow.indent < row.indent);
      const hasParentRow = parentIndex >= 0;
      if (hasParentRow) {
        const stemX = rowTextX(node, rows[parentIndex].indent) + TREE_STEM_OFFSET;
        const parentMiddleY = node.y + parentIndex * rowHeight + rowHeight / 2;
        const childTextX = rowTextX(node, row.indent) - TREE_TEXT_GAP;
        drawTreeLine(context, group, { x: stemX, y: parentMiddleY }, { x: stemX, y: rowMiddleY });
        drawTreeLine(context, group, { x: stemX, y: rowMiddleY }, { x: childTextX, y: rowMiddleY });
      }
    }
  };

  const drawLane = (context, group, node, style) => {
    group.append(drawRectangle(context, node, style));
    addSceneText(context, group, node.words, {
      x: node.x + node.w / 2,
      y: node.y + TITLE_OFFSET,
      font: node.font,
      weight: "bold",
      size: node.size,
      struck: node.struck,
    });
  };

  const drawBare = (context, group, node) => {
    drawNodeText(context, group, node);
  };

  const drawEllipseOutline = (context, node, style) => {
    const center = nodeCenter(node);
    if (context.generator) {
      return context.generator.ellipse(center.x, center.y, node.w, node.h, toRoughStyle(style, context.nextSeed()));
    }
    return createPlainShape("ellipse", { cx: center.x, cy: center.y, rx: node.w / 2, ry: node.h / 2 }, style);
  };

  const drawEllipse = (context, group, node, style) => {
    group.append(drawEllipseOutline(context, node, style));
    drawNodeText(context, group, node);
  };

  const drawCircle = (context, group, node, style) => {
    const squareBox = { ...node, h: node.w };
    drawEllipse(context, group, squareBox, style);
  };

  const roundedRectanglePathOf = (box, radius) => {
    const right = box.x + box.w;
    const bottom = box.y + box.h;
    return [
      \`M \${box.x + radius} \${box.y}\`,
      \`H \${right - radius}\`,
      \`A \${radius} \${radius} 0 0 1 \${right} \${box.y + radius}\`,
      \`V \${bottom - radius}\`,
      \`A \${radius} \${radius} 0 0 1 \${right - radius} \${bottom}\`,
      \`H \${box.x + radius}\`,
      \`A \${radius} \${radius} 0 0 1 \${box.x} \${bottom - radius}\`,
      \`V \${box.y + radius}\`,
      \`A \${radius} \${radius} 0 0 1 \${box.x + radius} \${box.y}\`,
      "Z",
    ].join(" ");
  };

  const drawPhone = (context, group, node, style) => {
    const cornerRadius = node.w * PHONE_CORNER_RADIUS_RATIO;
    group.append(drawPath(context, roundedRectanglePathOf(node, cornerRadius), style));

    const notchWidth = node.w * PHONE_NOTCH_WIDTH_RATIO;
    const notchBox = {
      x: node.x + (node.w - notchWidth) / 2,
      y: node.y + PHONE_NOTCH_TOP,
      w: notchWidth,
      h: PHONE_NOTCH_HEIGHT,
    };
    group.append(drawRectangle(context, notchBox, { ...style, fill: "none" }));
  };

  const drawCylinder = (context, group, node, style) => {
    const rightX = node.x + node.w;
    const topCenterY = node.y + CYLINDER_CAP_RADIUS_Y;
    const bottomCenterY = node.y + node.h - CYLINDER_CAP_RADIUS_Y;
    const radiusX = node.w / 2;
    const bodyPathData = [
      \`M \${node.x} \${topCenterY}\`,
      \`L \${node.x} \${bottomCenterY}\`,
      \`A \${radiusX} \${CYLINDER_CAP_RADIUS_Y} 0 0 0 \${rightX} \${bottomCenterY}\`,
      \`L \${rightX} \${topCenterY}\`,
      \`A \${radiusX} \${CYLINDER_CAP_RADIUS_Y} 0 0 0 \${node.x} \${topCenterY}\`,
      "Z",
    ].join(" ");
    group.append(drawPath(context, bodyPathData, style));

    const capBox = { x: node.x, y: node.y, w: node.w, h: 2 * CYLINDER_CAP_RADIUS_Y };
    group.append(drawEllipseOutline(context, capBox, style));
    drawNodeText(context, group, node);
  };

  const drawSticky = (context, group, node, style) => {
    const center = nodeCenter(node);
    const tilt = clampNumber(node.tilt ?? 0, -STICKY_TILT_LIMIT, STICKY_TILT_LIMIT);
    setAttributes(group, { transform: \`rotate(\${tilt} \${center.x} \${center.y})\` });
    group.append(drawRectangle(context, node, style));
    drawNodeText(context, group, node);
  };

  const NODE_DRAWERS = {
    box: drawBox,
    circle: drawCircle,
    cylinder: drawCylinder,
    diamond: drawDiamond,
    ellipse: drawEllipse,
    phone: drawPhone,
    rows: drawRows,
    lane: drawLane,
    bare: drawBare,
    sticky: drawSticky,
  };

  const drawNode = (context, parent, node) => {
    const drawNodeShape = NODE_DRAWERS[node.kind];
    const isKindUnknown = drawNodeShape === undefined;
    if (isKindUnknown) throw new Error(\`Unknown node kind "\${node.kind}" on node "\${node.id}"\`);

    const group = createGroup(parent, node.path);
    const isThickBorder = node.border === "thick";
    const style = {
      fill: node.fill ?? DEFAULT_FILL_BY_KIND[node.kind] ?? "none",
      dashed: node.dashed === true,
      tone: node.tone,
      strokeWidth: isThickBorder ? THICK_STROKE_WIDTH : STROKE_WIDTH,
      roughness: context.look.roughness ?? ROUGHNESS_SHAPE,
      fillStyle: context.look.fill,
      palette: context.look.palette,
    };
    drawNodeShape(context, group, node, style);
  };

  const drawRule = (context, parent, rule) => {
    const group = createGroup(parent, rule.path);
    const style = {
      fill: "none",
      dashed: rule.dashed === true,
      tone: rule.tone,
      roughness: context.look.roughness ?? ROUGHNESS_EDGE,
    };
    group.append(drawLine(context, { x: rule.x1, y: rule.y1 }, { x: rule.x2, y: rule.y2 }, style));
  };

  const drawLabel = (context, parent, label) => {
    const group = createGroup(parent, label.path);
    addSceneText(context, group, label.words, {
      x: label.x,
      y: label.y,
      anchor: label.anchor,
      font: label.font,
      weight: label.weight,
      tone: label.tone,
      size: label.size,
      struck: label.struck,
    });
  };

  const straightGeometry = (start, end) => ({ points: [start, end] });

  const isVerticalSide = (side) => side === "top" || side === "bottom";

  const elbowGeometry = (start, end, sides) => {
    const isStartVertical = isVerticalSide(sides[0]);
    const isEndVertical = isVerticalSide(sides[1]);
    const isBothVertical = isStartVertical && isEndVertical;
    const isBothHorizontal = !isStartVertical && !isEndVertical;
    const middleY = (start.y + end.y) / 2;
    const middleX = (start.x + end.x) / 2;
    if (isBothVertical) return { points: [start, { x: start.x, y: middleY }, { x: end.x, y: middleY }, end] };
    if (isBothHorizontal) return { points: [start, { x: middleX, y: start.y }, { x: middleX, y: end.y }, end] };
    if (isStartVertical) return { points: [start, { x: start.x, y: end.y }, end] };
    return { points: [start, { x: end.x, y: start.y }, end] };
  };

  const pickElbowSides = (fromPoint, toPoint) => {
    const deltaX = toPoint.x - fromPoint.x;
    const deltaY = toPoint.y - fromPoint.y;
    const isMostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    const isToTheRight = deltaX > 0;
    const isBelow = deltaY > 0;
    if (isMostlyHorizontal) return isToTheRight ? ["right", "left"] : ["left", "right"];
    return isBelow ? ["bottom", "top"] : ["top", "bottom"];
  };

  const curveGeometry = (start, end) => {
    const middlePoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const length = Math.hypot(deltaX, deltaY) || 1;
    const control = {
      x: middlePoint.x - (deltaY / length) * CURVE_BEND,
      y: middlePoint.y + (deltaX / length) * CURVE_BEND,
    };
    return { points: [start, end], control };
  };

  const EDGE_GEOMETRY_BY_ROUTE = {
    straight: straightGeometry,
    elbow: elbowGeometry,
    curve: curveGeometry,
  };

  const edgeEndpointPoint = (endpoint, node, otherCenter, side) => {
    const isPointEndpoint = node === undefined;
    if (isPointEndpoint) return endpoint;

    const isSideRoute = side !== undefined;
    if (isSideRoute) return sideAnchor(node, side);

    return boundaryPoint(node, otherCenter);
  };

  const edgeGeometry = (edge, nodesById, look) => {
    const route = look.route ?? edge.route ?? "straight";
    const buildGeometry = EDGE_GEOMETRY_BY_ROUTE[route];
    if (!buildGeometry) throw new Error(\`Unknown edge route "\${route}"\`);

    const fromNode = findNodeForEndpoint(edge.from, nodesById);
    const toNode = findNodeForEndpoint(edge.to, nodesById);
    const fromCenter = fromNode ? nodeCenter(fromNode) : edge.from;
    const toCenter = toNode ? nodeCenter(toNode) : edge.to;
    const sides = edge.sides ?? pickElbowSides(fromCenter, toCenter);
    const isElbow = route === "elbow";

    const start = edgeEndpointPoint(edge.from, fromNode, toCenter, isElbow ? sides[0] : undefined);
    const end = edgeEndpointPoint(edge.to, toNode, fromCenter, isElbow ? sides[1] : undefined);
    return buildGeometry(start, end, sides);
  };

  const averagePoint = (firstPoint, secondPoint) => ({
    x: (firstPoint.x + secondPoint.x) / 2,
    y: (firstPoint.y + secondPoint.y) / 2,
  });

  const edgeMidpoint = (geometry) => {
    const isCurve = geometry.control !== undefined;
    if (isCurve) {
      const [start, end] = geometry.points;
      const control = geometry.control;
      return {
        x: 0.25 * start.x + 0.5 * control.x + 0.25 * end.x,
        y: 0.25 * start.y + 0.5 * control.y + 0.25 * end.y,
      };
    }
    const lastIndex = geometry.points.length - 1;
    const firstHalfPoint = geometry.points[Math.floor(lastIndex / 2)];
    const secondHalfPoint = geometry.points[Math.ceil(lastIndex / 2)];
    return averagePoint(firstHalfPoint, secondHalfPoint);
  };

  const pathDataOf = (geometry) => {
    const isCurve = geometry.control !== undefined;
    if (isCurve) {
      const [start, end] = geometry.points;
      return \`M \${start.x} \${start.y} Q \${geometry.control.x} \${geometry.control.y} \${end.x} \${end.y}\`;
    }
    return geometry.points.map((point, pointIndex) => \`\${pointIndex === 0 ? "M" : "L"} \${point.x} \${point.y}\`).join(" ");
  };

  const arrowWingPoints = (fromPoint, tipPoint) => {
    const angle = Math.atan2(tipPoint.y - fromPoint.y, tipPoint.x - fromPoint.x);
    return [angle - ARROW_SPREAD, angle + ARROW_SPREAD].map((wingAngle) => ({
      x: tipPoint.x - ARROW_LENGTH * Math.cos(wingAngle),
      y: tipPoint.y - ARROW_LENGTH * Math.sin(wingAngle),
    }));
  };

  const labelPlacementOf = (geometry, middlePoint) => {
    const firstPoint = geometry.points[0];
    const lastPoint = geometry.points[geometry.points.length - 1];
    const isMostlyHorizontal = Math.abs(lastPoint.x - firstPoint.x) > Math.abs(lastPoint.y - firstPoint.y);
    const halfLineHeight = TEXT_LINE_HEIGHT / 2;
    if (isMostlyHorizontal) {
      return { x: middlePoint.x, y: middlePoint.y - LABEL_CLEARANCE - halfLineHeight, anchor: "middle" };
    }
    return { x: middlePoint.x + LABEL_CLEARANCE, y: middlePoint.y, anchor: "start" };
  };

  const drawEdge = (context, group, edge, geometry, style) => {
    group.append(drawPath(context, pathDataOf(geometry), style));

    const isArrowShown = edge.arrow !== false;
    if (isArrowShown) {
      const tipPoint = geometry.points[geometry.points.length - 1];
      const previousPoint = geometry.control ?? geometry.points[geometry.points.length - 2];
      for (const wingPoint of arrowWingPoints(previousPoint, tipPoint)) {
        group.append(drawLine(context, tipPoint, wingPoint, style));
      }
    }

    const isLabelShown = edge.label !== undefined;
    if (isLabelShown) {
      const middlePoint = edgeMidpoint(geometry);
      const labelElement = addTextLines(group, edge.label, labelPlacementOf(geometry, middlePoint));
      labelElement.classList.add("sketch-edge-label");
    }
  };

  const drawEdgeGroup = (context, parent, edge, geometry) => {
    const group = createGroup(parent, edge.path);
    const style = {
      fill: "none",
      dashed: edge.dashed === true,
      tone: edge.tone,
      roughness: context.look.roughness ?? ROUGHNESS_EDGE,
    };
    drawEdge(context, group, edge, geometry, style);
    return group;
  };

  const targetOfNode = (node) => ({ node, anchorPoint: nodeCenter(node) });

  const targetOfEdge = (geometry) => ({ node: undefined, anchorPoint: edgeMidpoint(geometry) });

  const placeNoteLink = (context, parent, note, target) => {
    const group = createGroup(parent, note.path);
    group.classList.add("sketch-note-link");
    return { group, context, target };
  };

  const boxOfTarget = (target) => {
    const isNodeTarget = target.node !== undefined;
    if (isNodeTarget) {
      const { node } = target;
      return { left: node.x, top: node.y, right: node.x + node.w, bottom: node.y + node.h };
    }
    const { anchorPoint } = target;
    return { left: anchorPoint.x, top: anchorPoint.y, right: anchorPoint.x, bottom: anchorPoint.y };
  };

  const clampNumber = (value, lowest, highest) => Math.min(Math.max(value, lowest), highest);

  const closestEndsOf = (noteBox, targetBox) => {
    const targetCenterX = (targetBox.left + targetBox.right) / 2;
    const targetCenterY = (targetBox.top + targetBox.bottom) / 2;
    const noteEnd = {
      x: clampNumber(targetCenterX, noteBox.left, noteBox.right),
      y: clampNumber(targetCenterY, noteBox.top, noteBox.bottom),
    };
    const targetEnd = {
      x: clampNumber(noteEnd.x, targetBox.left, targetBox.right),
      y: clampNumber(noteEnd.y, targetBox.top, targetBox.bottom),
    };
    return { noteEnd, targetEnd };
  };

  const shortenSegment = (fromPoint, toPoint) => {
    const deltaX = toPoint.x - fromPoint.x;
    const deltaY = toPoint.y - fromPoint.y;
    const length = Math.hypot(deltaX, deltaY);
    const isTooShort = length <= 2 * LINK_GAP;
    if (isTooShort) return { from: fromPoint, to: toPoint };

    const gapShare = LINK_GAP / length;
    return {
      from: { x: fromPoint.x + deltaX * gapShare, y: fromPoint.y + deltaY * gapShare },
      to: { x: toPoint.x - deltaX * gapShare, y: toPoint.y - deltaY * gapShare },
    };
  };

  const convertToSceneBox = (domRect, sceneRect, sceneWidth, offsetX) => {
    const scale = sceneRect.width / sceneWidth;
    return {
      left: (domRect.left - sceneRect.left) / scale - offsetX,
      right: (domRect.right - sceneRect.left) / scale - offsetX,
      top: (domRect.top - sceneRect.top) / scale,
      bottom: (domRect.bottom - sceneRect.top) / scale,
    };
  };

  const measureNoteTextBox = (noteElement, sceneRect, sceneWidth, offsetX) => {
    const textRange = document.createRange();
    textRange.selectNodeContents(noteElement);
    return convertToSceneBox(textRange.getBoundingClientRect(), sceneRect, sceneWidth, offsetX);
  };

  const isPartEndpoint = (endpoint) => typeof endpoint === "string" && endpoint.includes("#");

  const isPartEdge = (edge) => isPartEndpoint(edge.from) || isPartEndpoint(edge.to);

  const measurePartBox = (partId, sceneElement, sceneRect, sceneWidth, offsetX) => {
    const [screenId, partName] = partId.split("#");
    const partSelector = \`[data-screen-id="\${CSS.escape(screenId)}"] [data-part="\${CSS.escape(partName)}"]\`;
    const partElement = sceneElement.querySelector(partSelector);
    const isPartMissing = partElement === null;
    if (isPartMissing) throw new Error(\`Link points at unknown screen part "\${partId}"\`);

    return convertToSceneBox(partElement.getBoundingClientRect(), sceneRect, sceneWidth, offsetX);
  };

  const findLinkTargetBox = (target, sceneElement, sceneRect, sceneWidth, offsetX) => {
    const isPartTarget = target.partId !== undefined;
    if (isPartTarget) return measurePartBox(target.partId, sceneElement, sceneRect, sceneWidth, offsetX);

    return boxOfTarget(target);
  };

  const drawPendingNoteLink = (pendingLink, noteElement, sceneElement, sceneRect, sceneWidth) => {
    const { context } = pendingLink;
    const noteBox = measureNoteTextBox(noteElement, sceneRect, sceneWidth, context.offsetX);
    const targetBox = findLinkTargetBox(pendingLink.target, sceneElement, sceneRect, sceneWidth, context.offsetX);
    const { noteEnd, targetEnd } = closestEndsOf(noteBox, targetBox);
    const { from, to } = shortenSegment(noteEnd, targetEnd);
    const style = {
      fill: "none",
      dashed: true,
      tone: "soft",
      roughness: pendingLink.context.look.roughness ?? ROUGHNESS_EDGE,
    };
    pendingLink.group.append(drawLine(pendingLink.context, from, to, style));
  };

  const drawPendingNoteLinks = (sceneElement, sceneWidth, pendingLinks) => {
    const sceneRect = sceneElement.getBoundingClientRect();
    for (const { pendingLink, noteElement } of pendingLinks) {
      drawPendingNoteLink(pendingLink, noteElement, sceneElement, sceneRect, sceneWidth);
    }
  };

  const boxToNode = (box) => ({ x: box.left, y: box.top, w: box.right - box.left, h: box.bottom - box.top });

  const drawPendingPartEdge = (pendingEdge, sceneElement, sceneRect, sceneWidth) => {
    const { edge, context, parent, nodesById } = pendingEdge;
    const nodesWithParts = new Map(nodesById);
    for (const endpoint of [edge.from, edge.to]) {
      const isEndpointAPart = isPartEndpoint(endpoint);
      if (!isEndpointAPart) continue;

      const partBox = measurePartBox(endpoint, sceneElement, sceneRect, sceneWidth, context.offsetX);
      nodesWithParts.set(endpoint, boxToNode(partBox));
    }
    const geometry = edgeGeometry(edge, nodesWithParts, context.look);
    drawEdgeGroup(context, parent, edge, geometry);
  };

  const drawPendingPartEdges = (sceneElement, sceneWidth, pendingEdges) => {
    const sceneRect = sceneElement.getBoundingClientRect();
    for (const pendingEdge of pendingEdges) drawPendingPartEdge(pendingEdge, sceneElement, sceneRect, sceneWidth);
  };

  const drawPartEdgesOnceFontsLoad = (sceneElement, sceneWidth, pendingEdges) => {
    const isNoEdgePending = pendingEdges.length === 0;
    if (isNoEdgePending) return;

    runOnceFontsLoad(() => drawPendingPartEdges(sceneElement, sceneWidth, pendingEdges));
  };

  const runOnceFontsLoad = (drawWhenReady) => {
    const isFontsReady = document.fonts.status === "loaded";
    if (isFontsReady) {
      drawWhenReady();
      return;
    }
    document.fonts.addEventListener("loadingdone", drawWhenReady, { once: true });
  };

  const linkNotesOnceFontsLoad = (sceneElement, sceneWidth, pendingLinks) => {
    const isNoLinkPending = pendingLinks.length === 0;
    if (isNoLinkPending) return;

    runOnceFontsLoad(() => drawPendingNoteLinks(sceneElement, sceneWidth, pendingLinks));
  };

  const drawStrike = ({ context, group, textElement }) => {
    const textBox = textElement.getBBox();
    const lineY = textBox.y + textBox.height / 2;
    const strikeFrom = { x: textBox.x - STRIKE_OVERHANG, y: lineY };
    const strikeTo = { x: textBox.x + textBox.width + STRIKE_OVERHANG, y: lineY };
    group.append(
      drawLine(context, strikeFrom, strikeTo, {
        fill: "none",
        tone: STRIKE_TONE,
        roughness: context.look.roughness ?? ROUGHNESS_EDGE,
      }),
    );
  };

  const strikeTextsOnceFontsLoad = (pendingStrikes) => {
    const isNoStrikePending = pendingStrikes.length === 0;
    if (isNoStrikePending) return;

    runOnceFontsLoad(() => {
      for (const pendingStrike of pendingStrikes) drawStrike(pendingStrike);
    });
  };

  const pairPendingLinks = (placedNotes, noteElements) =>
    placedNotes.flatMap((placedNote, noteIndex) => {
      const isLinkPending = placedNote.pendingLink !== undefined;
      if (!isLinkPending) return [];
      return [{ pendingLink: placedNote.pendingLink, noteElement: noteElements[noteIndex] }];
    });

  const drawBadge = (parent, note, target, badgeNumber) => {
    const isNodeTarget = target.node !== undefined;
    const badgeCenter = isNodeTarget
      ? { x: target.node.x + target.node.w, y: target.node.y }
      : target.anchorPoint;

    const group = createGroup(parent, note.path);
    group.classList.add("sketch-note-link");
    const circle = setAttributes(createSvgElement("circle"), {
      cx: badgeCenter.x,
      cy: badgeCenter.y,
      r: BADGE_RADIUS,
      fill: "#fbfaf6",
      stroke: TONES.ink,
      "stroke-width": STROKE_WIDTH,
    });
    group.append(circle);
    addTextLines(group, String(badgeNumber), { x: badgeCenter.x, y: badgeCenter.y, font: "mono", weight: "bold" });
  };

  const placeNoteUnder = (note, target) => {
    const isNodeTarget = target.node !== undefined;
    const noteX = isNodeTarget ? target.node.x : target.anchorPoint.x - NOTE_UNDER_SHIFT;
    const noteY = isNodeTarget
      ? target.node.y + target.node.h + NOTE_UNDER_GAP
      : target.anchorPoint.y + NOTE_UNDER_GAP;
    return { ...note, x: noteX, y: noteY, w: note.w ?? NOTE_DEFAULT_WIDTH };
  };

  const placePartNote = (context, parent, note, beside) => {
    const isBesideLook = context.look.notePlacement === "beside";
    if (!isBesideLook) throw new Error(\`A note linked to a screen part needs notePlacement "beside": "\${note.link}"\`);

    const pendingLink = placeNoteLink(context, parent, note, { partId: note.link });
    return { ...beside, pendingLink };
  };

  const placeNote = (context, parent, note, targets, badgeNumber) => {
    const isLinked = note.link !== undefined;
    const beside = { ...note, w: note.w ?? NOTE_DEFAULT_WIDTH };
    if (!isLinked) return beside;

    const isPartLink = isPartEndpoint(note.link);
    if (isPartLink) return placePartNote(context, parent, note, beside);

    const target = targets.get(note.link);
    if (target === undefined) throw new Error(\`Note links to unknown id "\${note.link}"\`);

    const placement = context.look.notePlacement;
    const isUnder = placement === "under";
    const isBadge = placement === "badge";
    if (isUnder) return placeNoteUnder(note, target);
    if (isBadge) {
      drawBadge(parent, note, target, badgeNumber);
      return { ...beside, words: \`\${badgeNumber}  \${note.words}\` };
    }
    const pendingLink = placeNoteLink(context, parent, note, target);
    return { ...beside, pendingLink };
  };

  const placeNotes = (context, parent, notes, targets) => {
    const linkedNotes = notes.filter((note) => note.link !== undefined);
    return notes.map((note) => {
      const badgeNumber = linkedNotes.indexOf(note) + 1;
      return placeNote(context, parent, note, targets, badgeNumber);
    });
  };

  const addCircleHeight = (node) => {
    const isCircle = node.kind === "circle";
    if (!isCircle) return node;

    return { ...node, h: node.w };
  };

  const drawSceneGraphics = (parent, scene, context) => {
    const nodes = (scene.nodes ?? []).map(addCircleHeight);
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const targets = new Map(nodes.map((node) => [node.id, targetOfNode(node)]));

    for (const rule of scene.rules ?? []) drawRule(context, parent, rule);
    const svgNodes = nodes.filter((node) => !isScreenNode(node));
    for (const node of svgNodes) drawNode(context, parent, node);

    for (const edge of scene.edges ?? []) {
      const isEdgeToPart = isPartEdge(edge);
      if (isEdgeToPart) {
        context.pendingDrawings.partEdges.push({ edge, context, parent, nodesById });
        continue;
      }
      const geometry = edgeGeometry(edge, nodesById, context.look);
      targets.set(edge.id, targetOfEdge(geometry));
      drawEdgeGroup(context, parent, edge, geometry);
    }

    for (const label of scene.labels ?? []) drawLabel(context, parent, label);
    return placeNotes(context, parent, scene.notes ?? [], targets);
  };

  const isScreenNode = (node) => node.kind === "screen";

  const findScreenNodes = (scene) => {
    const isPanelScene = scene.panels !== undefined;
    if (!isPanelScene) return screenNodesAt(scene.nodes, 0);

    return scene.panels.flatMap((panel) => screenNodesAt(panel.scene.nodes, panel.offsetX));
  };

  const screenNodesAt = (nodes, offsetX) => nodes.filter(isScreenNode).map((node) => ({ node, offsetX }));

  const addScreenNode = (sceneElement, node, offsetX) => {
    const isHtmlMissing = node.html === undefined;
    if (isHtmlMissing) throw new Error(\`Screen node "\${node.id}" needs html\`);

    const screenElement = document.createElement("div");
    screenElement.className = "sketch-screen";
    screenElement.dataset.screenId = node.id;
    screenElement.style.left = \`\${node.x + offsetX}px\`;
    screenElement.style.top = \`\${node.y}px\`;
    screenElement.style.width = \`\${node.w}px\`;
    screenElement.style.height = \`\${node.h}px\`;
    screenElement.innerHTML = \`<div class="sk-wireframe">\${node.html}</div>\`;
    sceneElement.append(screenElement);
  };

  const addNoteText = (sceneElement, placedNote) => {
    const noteElement = document.createElement("p");
    noteElement.className = "sketch-note";
    noteElement.style.left = \`\${placedNote.x}px\`;
    noteElement.style.top = \`\${placedNote.y}px\`;
    noteElement.style.width = \`\${placedNote.w}px\`;
    noteElement.textContent = placedNote.words;
    noteElement.dataset.density = placedNote.density;
    if (placedNote.path) noteElement.dataset.path = placedNote.path;
    sceneElement.append(noteElement);
    return noteElement;
  };

  const drawPanel = (svg, panel, pendingDrawings) => {
    const look = normalizeLook(panel.scene.look);
    const panelGroup = createSvgElement("g");
    setAttributes(panelGroup, { transform: \`translate(\${panel.offsetX} 0)\` });
    panelGroup.dataset.handFont = look.font;
    panelGroup.dataset.density = look.density;
    svg.append(panelGroup);

    createPaperRect(panelGroup, { x: 0, y: 0, w: panel.width, h: panel.height }, look.paper);
    const context = createDrawingContext({ svg, look, offsetX: panel.offsetX, pendingDrawings });
    const placedNotes = drawSceneGraphics(panelGroup, panel.scene, context);
    return placedNotes.map((placedNote) => ({
      ...placedNote,
      x: placedNote.x + panel.offsetX,
      density: look.density,
    }));
  };

  const drawSceneBody = (svg, scene, pendingDrawings) => {
    const isPanelScene = scene.panels !== undefined;
    if (!isPanelScene) {
      return drawPanel(svg, { offsetX: 0, width: scene.width, height: scene.height, scene }, pendingDrawings);
    }

    const outerContext = createDrawingContext({ svg, look: normalizeLook(), pendingDrawings });
    drawSceneGraphics(svg, { rules: scene.rules, labels: scene.labels }, outerContext);
    return scene.panels.flatMap((panel) => drawPanel(svg, panel, pendingDrawings));
  };

  const createSceneSvg = (scene) => {
    const svg = createSvgElement("svg");
    setAttributes(svg, {
      width: scene.width,
      height: scene.height,
      viewBox: \`0 0 \${scene.width} \${scene.height}\`,
    });
    svg.append(createPaperDefs());
    return svg;
  };

  const fitScene = (frame) => {
    const sceneElement = frame.querySelector(".sketch-scene");
    const isSceneMissing = sceneElement === null;
    if (isSceneMissing) return;

    const sceneWidth = Number(frame.dataset.sceneWidth);
    const sceneHeight = Number(frame.dataset.sceneHeight);
    const scale = Math.max(frame.clientWidth / sceneWidth, MIN_SCENE_SCALE);
    sceneElement.style.transform = \`scale(\${scale})\`;
    frame.style.height = \`\${sceneHeight * scale}px\`;
  };

  const drawScene = (frame, scene) => {
    frame.replaceChildren();
    const sceneElement = document.createElement("div");
    sceneElement.className = "sketch-scene";
    sceneElement.style.width = \`\${scene.width}px\`;
    sceneElement.style.height = \`\${scene.height}px\`;

    const svg = createSceneSvg(scene);
    sceneElement.append(svg);
    const pendingDrawings = { strikes: [], partEdges: [] };
    const placedNotes = drawSceneBody(svg, scene, pendingDrawings);
    const noteElements = placedNotes.map((placedNote) => addNoteText(sceneElement, placedNote));
    for (const { node, offsetX } of findScreenNodes(scene)) addScreenNode(sceneElement, node, offsetX);

    frame.dataset.sceneWidth = scene.width;
    frame.dataset.sceneHeight = scene.height;
    frame.append(sceneElement);
    fitScene(frame);
    linkNotesOnceFontsLoad(sceneElement, scene.width, pairPendingLinks(placedNotes, noteElements));
    drawPartEdgesOnceFontsLoad(sceneElement, scene.width, pendingDrawings.partEdges);
    strikeTextsOnceFontsLoad(pendingDrawings.strikes);
  };

  const fitScenes = (root) => {
    for (const frame of root.querySelectorAll(".sketch-frame")) fitScene(frame);
  };

  const isFrameShown = (frame) => frame.getClientRects().length > 0;

  const isFrameDrawn = (frame) => frame.dataset.sketchDrawn === "true";

  const readSceneOf = (frame) => {
    const sceneScript = frame.querySelector("script[data-sketch-scene]");
    return JSON.parse(sceneScript.textContent);
  };

  const drawFrame = (frame) => {
    const scene = readSceneOf(frame);
    drawScene(frame, scene);
    frame.dataset.sketchDrawn = "true";
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

  const drawFramesIn = async (root) => {
    await document.fonts.ready;
    await waitForRough();
    for (const frame of root.querySelectorAll(".sketch-frame")) {
      const isHiddenFrame = !isFrameShown(frame);
      if (isHiddenFrame) continue;

      const isFrameWaiting = !isFrameDrawn(frame);
      if (isFrameWaiting) {
        drawFrame(frame);
        continue;
      }
      fitScene(frame);
    }
  };

  const setMode = (frame, choice) => {
    for (const element of frame.querySelectorAll("[data-path]")) {
      const paths = element.dataset.path.split(" ");
      const isOnChoice = paths.includes(choice);
      element.classList.toggle("is-dim", !isOnChoice);
    }
  };

  const bindCodeToggle = (button, drawer) => {
    const applyDrawerState = () => {
      button.textContent = drawer.hidden ? "View code" : "Hide code";
      button.setAttribute("aria-expanded", String(!drawer.hidden));
    };
    button.addEventListener("click", () => {
      drawer.hidden = !drawer.hidden;
      applyDrawerState();
    });
    applyDrawerState();
  };

  const bindNotesToggle = (button) => {
    const applyNotesState = () => {
      const isNotesOn = !document.documentElement.classList.contains("notes-off");
      button.textContent = isNotesOn ? "Notes on" : "Notes off";
      button.setAttribute("aria-pressed", String(isNotesOn));
    };
    button.addEventListener("click", () => {
      document.documentElement.classList.toggle("notes-off");
      applyNotesState();
    });
    applyNotesState();
  };

  window.addEventListener("resize", () => fitScenes(document));

  window.SketchEngine = {
    drawFramesIn,
    setMode,
    bindCodeToggle,
    bindNotesToggle,
  };
})();
`;

export const SKETCH_SCENE_STYLE = `:root {
  --paper: #fbfaf6;
  --ink: #2b2b30;
  --ink-soft: #6b6b75;
  --rule: #d4d4d8;
  --active: #27272a;
  --passed: #a1a1aa;
  --upcoming: #e4e4e7;
  --blue: #d0ebff;
  --grey: #e9ecef;
  --orange: #ffe8cc;
  --green: #d3f9d8;
  --red: #ffe3e3;
  --yellow: #fff3bf;
  --text-red: #a61e1e;
  --text-green: #246b2f;
  --text-blue: #17569a;
  --text-orange: #9c4a00;
  --text-size-big: 26px;
  --text-size-big-mono: 18px;
  --gutter: 40px;
  --dim-opacity: 0.22;
}

@layer base {
  html {
    color: var(--ink);
    font-family: "Kalam", cursive;
    font-size: 16px;
  }

  body {
    margin: 0;
    overflow-x: hidden;
  }
}

@layer components {
  .sketch-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 28px var(--gutter) 40px;
  }

  .sketch-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px 24px;
  }

  .sketch-title {
    margin: 0;
    font-size: 34px;
    font-weight: 700;
    font-style: italic;
    line-height: 1.1;
  }

  .sketch-subtitle {
    margin: 4px 0 0;
    color: var(--ink-soft);
    font-size: 19px;
    font-weight: 300;
  }

  .sketch-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .sketch-button {
    font: inherit;
    font-size: 15px;
    padding: 6px 14px;
    border: 1.5px solid var(--ink);
    border-radius: 999px;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
  }

  .sketch-button[aria-pressed="true"],
  .sketch-button--solid {
    background: var(--active);
    color: #fff;
    border-color: var(--active);
  }

  .sketch-legend {
    margin: 10px 0 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 12px;
    color: var(--ink-soft);
  }

  .sketch-screen {
    position: absolute;
  }

  .sketch-screen > .sk-wireframe {
    width: 100%;
    height: 100%;
  }

  .sketch-frame {
    position: relative;
    width: 100%;
    margin-top: 18px;
    overflow-x: auto;
  }

  .sketch-scene {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
  }

  .sketch-scene svg {
    position: absolute;
    top: 0;
    left: 0;
    overflow: visible;
  }

  .sketch-text {
    font-family: "Kalam", cursive;
    font-size: 18px;
    fill: var(--ink);
  }

  .sketch-text[data-weight="bold"] {
    font-weight: 700;
  }

  .sketch-text[data-font="mono"] {
    font-family: "IBM Plex Mono", monospace;
    font-size: 14px;
  }

  .sketch-text[data-tone="soft"] {
    fill: var(--ink-soft);
  }

  .sketch-text[data-tone="red"] {
    fill: var(--text-red);
  }

  .sketch-text[data-tone="green"] {
    fill: var(--text-green);
  }

  .sketch-text[data-tone="blue"] {
    fill: var(--text-blue);
  }

  .sketch-text[data-tone="orange"] {
    fill: var(--text-orange);
  }

  .sketch-edge-label {
    stroke: var(--paper);
    stroke-width: 6px;
    stroke-linejoin: round;
    paint-order: stroke;
  }

  .sketch-note {
    position: absolute;
    margin: 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 13px;
    line-height: 1.45;
    white-space: pre-line;
    color: var(--ink-soft);
  }

  html.notes-off .sketch-note,
  html.notes-off .sketch-note-link {
    display: none;
  }

  .sketch-scene [data-path].is-dim {
    opacity: var(--dim-opacity);
  }

  .sketch-scene [data-path] {
    transition: opacity 0.2s ease;
  }

  .sketch-code {
    margin-top: 16px;
    border: 1.5px solid var(--ink);
    border-radius: 10px;
    background: #fff;
    padding: 14px 16px;
  }

  .sketch-code[hidden] {
    display: none;
  }

  .sketch-code-tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 10px;
  }

  .sketch-code-tab {
    font: inherit;
    font-size: 14px;
    padding: 4px 12px;
    border: 1.5px solid var(--ink);
    border-radius: 6px;
    background: #fff;
    color: var(--ink);
    cursor: pointer;
  }

  .sketch-code-tab[aria-selected="true"] {
    background: var(--active);
    border-color: var(--active);
    color: #fff;
  }

  .sketch-code-body {
    margin: 0;
    overflow-x: auto;
    font-family: "IBM Plex Mono", monospace;
    font-size: 13px;
    line-height: 1.55;
    white-space: pre;
  }

  .sketch-code-body[hidden] {
    display: none;
  }

  .sketch-nav {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 28px;
    flex-wrap: wrap;
  }

  .sketch-nav-step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1.5px solid var(--ink);
    font-family: "IBM Plex Mono", monospace;
    font-size: 13px;
    text-decoration: none;
    color: var(--ink);
    background: var(--paper);
  }

  .sketch-nav-step[data-state="active"] {
    background: var(--active);
    border-color: var(--active);
    color: #fff;
  }

  .sketch-nav-step[data-state="passed"] {
    border-color: var(--passed);
    color: var(--passed);
  }

  .sketch-nav-step[data-state="upcoming"] {
    border-color: var(--upcoming);
    color: var(--passed);
  }

  .sketch-nav-line {
    flex: 1 1 24px;
    height: 2px;
    min-width: 12px;
    background: var(--upcoming);
  }

  .sketch-nav-line[data-state="passed"] {
    background: var(--passed);
  }

  .sketch-nav-line[data-state="active"] {
    background: var(--active);
  }

  .sketch-decision {
    margin-top: 28px;
    display: grid;
    gap: 14px;
  }

  .sketch-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .sketch-option {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border: 1.5px solid var(--ink);
    border-radius: 10px;
    padding: 10px 12px;
    background: #fff;
    cursor: pointer;
  }

  .sketch-option:has(input:checked) {
    background: var(--blue);
  }

  .sketch-option input {
    accent-color: var(--active);
  }

  .sketch-option-frame {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .sketch-decision-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .sketch-textarea {
    font: inherit;
    font-size: 15px;
    width: 100%;
    min-height: 90px;
    box-sizing: border-box;
    padding: 8px 10px;
    border: 1.5px solid var(--ink);
    border-radius: 8px;
    background: #fff;
    color: var(--ink);
  }

  .sketch-status {
    margin: 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 13px;
    color: var(--ink-soft);
  }

  .sketch-fallback[hidden] {
    display: none;
  }

  .sketch-fallback {
    border: 1.5px dashed var(--ink);
    border-radius: 8px;
    padding: 10px 12px;
    background: var(--yellow);
  }

  .sketch-fallback-json {
    margin: 8px 0 0;
    max-height: 160px;
    overflow: auto;
    font-family: "IBM Plex Mono", monospace;
    font-size: 12px;
    white-space: pre-wrap;
  }

  .gallery-groups {
    max-width: 1100px;
    margin: 0 auto;
    padding: 16px var(--gutter) 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 13px;
  }

  .gallery-groups summary {
    cursor: pointer;
  }

  .gallery-group-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    margin: 8px 0 0;
  }

  .gallery-group-link {
    color: var(--ink-soft);
    text-decoration: none;
  }

  .gallery-group-link[data-state="active"] {
    color: var(--ink);
    font-weight: 700;
    text-decoration: underline;
  }

  .gallery-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-top: 18px;
  }

  .gallery-progress {
    margin: 0 0 0 auto;
    font-size: 15px;
    color: var(--ink-soft);
  }

  .gallery-note {
    margin-top: 12px;
    min-height: 64px;
  }

  .gallery-pager {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 24px;
    font-size: 16px;
  }

  .gallery-pager a {
    color: var(--ink);
  }

  .gallery-summary-list {
    margin: 18px 0 0;
    padding-left: 1.4em;
    font-size: 16px;
    line-height: 1.6;
  }

  .gallery-summary .sketch-textarea {
    margin-top: 18px;
    min-height: 70px;
  }
}

@media (max-width: 600px) {
  :root {
    --gutter: 16px;
  }

  .sketch-title {
    font-size: 28px;
  }

  .sketch-options {
    grid-template-columns: 1fr;
  }
}

/* Look knobs. Defaults (kalam, airy) come from the base rules above. */
[data-hand-font="caveat"] .sketch-text[data-font="hand"] {
  font-family: "Caveat", cursive;
  font-size: 22px;
}

[data-hand-font="patrick"] .sketch-text[data-font="hand"] {
  font-family: "Patrick Hand", cursive;
}

[data-density="compact"] .sketch-text[data-font="hand"] {
  font-size: 16px;
}

[data-density="very-compact"] .sketch-text[data-font="hand"] {
  font-size: 14px;
}

.sketch-note[data-density="compact"] {
  font-size: 12px;
}

.sketch-note[data-density="very-compact"] {
  font-size: 11px;
}

/* Size "big" comes last so it beats the look knobs' hand font sizes. */
.sketch-scene .sketch-text[data-size="big"] {
  font-size: var(--text-size-big);
}

.sketch-scene .sketch-text[data-size="big"][data-font="mono"] {
  font-size: var(--text-size-big-mono);
}

@layer components {
  .sketch-plan-title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .sketch-keys {
    margin: 0;
    font-family: "IBM Plex Mono", monospace;
    font-size: 12px;
    color: var(--ink-soft);
  }

  .sketch-title:focus {
    outline: 3px solid var(--active);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .sketch-option:focus-within {
    outline: 4px solid var(--active);
    outline-offset: 3px;
  }

  html.dark .sketch-frame {
    filter: invert(93%) hue-rotate(180deg);
  }
}
`;
