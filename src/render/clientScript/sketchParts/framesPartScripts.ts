export const FRAMES_PART_SCRIPT = `
const APP_WINDOW_DOT_FILLS = ["red", "yellow", "green"];
const APP_WINDOW_DOT_SIDE_RATIO = 0.4;
const APP_WINDOW_DOT_LEFT_RATIO = 0.4;
const APP_WINDOW_DOT_STEP_RATIO = 0.6;
const TERMINAL_TITLE_BAR_COLOR = "#343a40";
const EXTENSION_ARROW_HALF_WIDTH_RATIO = 0.06;
const EXTENSION_ARROW_EDGE_RATIO = 0.2;
const LAPTOP_NOTCH_LEFT_RATIO = 0.4;
const LAPTOP_NOTCH_WIDTH_RATIO = 0.2;
const WATCH_STRAP_WIDTH_RATIO = 0.6;

const measureChildren = (drawing, selector) => {
  const { element, box } = drawing;
  const parentRect = element.getBoundingClientRect();
  const scale = parentRect.width / element.offsetWidth;
  const childElements = [...element.querySelectorAll(selector)];

  return childElements.map((childElement) => {
    const childRect = childElement.getBoundingClientRect();
    const childBox = {
      x: box.x + (childRect.left - parentRect.left) / scale,
      y: box.y + (childRect.top - parentRect.top) / scale,
      w: childRect.width / scale,
      h: childRect.height / scale,
    };
    return { element: childElement, box: childBox };
  });
};

window.SketchWireframe.definePart("sk-browser-window", (drawing) => {
  const { roundedRectangle, line, readStatus } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [tabRowChild] = measureChildren(drawing, ".sk-browser-tabs");
  const [urlChild] = measureChildren(drawing, ".sk-browser-url");
  const tabRowBottomY = tabRowChild.box.y + tabRowChild.box.h;

  roundedRectangle(under, box, { tone: "ink", seed });
  line(under, { x: box.x, y: tabRowBottomY }, { x: box.x + box.w, y: tabRowBottomY }, { tone: "soft", seed: seed + 1 });
  roundedRectangle(under, urlChild.box, { tone: "soft", seed: seed + 2 });

  for (const [tabIndex, tabChild] of measureChildren(drawing, ".sk-browser-tab").entries()) {
    const isSelectedTab = readStatus(tabChild.element) === "selected";
    const tabFill = isSelectedTab ? "grey" : undefined;
    roundedRectangle(under, tabChild.box, { tone: "ink", fill: tabFill, seed: seed + 10 + tabIndex });
  }
});

window.SketchWireframe.definePart("sk-laptop", (drawing) => {
  const { roundedRectangle, rectangle } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [screenChild] = measureChildren(drawing, ".sk-laptop-screen");
  const [baseChild] = measureChildren(drawing, ".sk-laptop-base");
  const base = baseChild.box;
  const notchBox = {
    x: base.x + base.w * LAPTOP_NOTCH_LEFT_RATIO,
    y: base.y,
    w: base.w * LAPTOP_NOTCH_WIDTH_RATIO,
    h: base.h * 0.5,
  };

  roundedRectangle(under, screenChild.box, { tone: "ink", seed });
  roundedRectangle(under, base, { tone: "ink", seed: seed + 1 });
  rectangle(under, notchBox, { tone: "ink", fill: "grey", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-app-window", (drawing) => {
  const { roundedRectangle, line, circle, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const [titleChild] = measureChildren(drawing, ".sk-app-window-title");
  const titleBar = titleChild.box;
  const titleBottomY = titleBar.y + titleBar.h;
  const dotSide = titleBar.h * APP_WINDOW_DOT_SIDE_RATIO;
  const dotTopY = titleBar.y + (titleBar.h - dotSide) / 2;
  const isRight = isRightToLeft(element);

  roundedRectangle(under, box, { tone: "ink", seed });
  line(under, { x: box.x, y: titleBottomY }, { x: box.x + box.w, y: titleBottomY }, { tone: "ink", seed: seed + 1 });

  for (const [dotIndex, dotFill] of APP_WINDOW_DOT_FILLS.entries()) {
    const dotOffsetX = titleBar.h * APP_WINDOW_DOT_LEFT_RATIO + titleBar.h * APP_WINDOW_DOT_STEP_RATIO * dotIndex;
    const dotLeftX = isRight ? titleBar.x + titleBar.w - dotOffsetX - dotSide : titleBar.x + dotOffsetX;
    const dotBox = { x: dotLeftX, y: dotTopY, w: dotSide, h: dotSide };
    circle(under, dotBox, { tone: "ink", fill: dotFill, seed: seed + 10 + dotIndex });
  }
});

window.SketchWireframe.definePart("sk-tablet", (drawing) => {
  const { roundedRectangle, circle } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [screenChild] = measureChildren(drawing, ".sk-tablet-screen");
  const [cameraChild] = measureChildren(drawing, ".sk-tablet-camera");

  roundedRectangle(under, box, { tone: "ink", seed });
  roundedRectangle(under, screenChild.box, { tone: "soft", seed: seed + 1 });
  circle(under, cameraChild.box, { tone: "ink", fill: "grey", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-phone", (drawing) => {
  const { roundedRectangle } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [notchChild] = measureChildren(drawing, ".sk-phone-notch");
  const [homeChild] = measureChildren(drawing, ".sk-phone-home");

  roundedRectangle(under, box, { tone: "ink", seed });
  roundedRectangle(under, notchChild.box, { tone: "ink", fill: "grey", seed: seed + 1 });
  roundedRectangle(under, homeChild.box, { tone: "ink", fill: "grey", seed: seed + 2 });
});

window.SketchWireframe.definePart("sk-watch", (drawing) => {
  const { roundedRectangle, rectangle } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [faceChild] = measureChildren(drawing, ".sk-watch-face");
  const [crownChild] = measureChildren(drawing, ".sk-watch-crown");
  const face = faceChild.box;
  const strapWidth = face.w * WATCH_STRAP_WIDTH_RATIO;
  const strapLeftX = face.x + (face.w - strapWidth) / 2;
  const faceBottomY = face.y + face.h;
  const topStrapBox = { x: strapLeftX, y: box.y, w: strapWidth, h: face.y - box.y };
  const bottomStrapBox = { x: strapLeftX, y: faceBottomY, w: strapWidth, h: box.y + box.h - faceBottomY };

  rectangle(under, topStrapBox, { tone: "ink", fill: "grey", seed: seed + 1 });
  rectangle(under, bottomStrapBox, { tone: "ink", fill: "grey", seed: seed + 2 });
  roundedRectangle(under, face, { tone: "ink", seed: seed + 3 });
  rectangle(under, crownChild.box, { tone: "ink", fill: "grey", seed: seed + 4 });
});

window.SketchWireframe.definePart("sk-terminal-window", (drawing) => {
  const { roundedRectangle, solidFill } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [titleChild] = measureChildren(drawing, ".sk-terminal-title");

  roundedRectangle(under, box, { tone: "ink", seed });
  solidFill(under, titleChild.box, { color: TERMINAL_TITLE_BAR_COLOR });
});

window.SketchWireframe.definePart("sk-extension-popup", (drawing) => {
  const { roundedRectangle, polygon, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const [bodyChild] = measureChildren(drawing, ".sk-extension-popup-body");
  const body = bodyChild.box;
  const isRight = isRightToLeft(element);
  const arrowInsetX = body.w * EXTENSION_ARROW_EDGE_RATIO;
  const arrowCenterX = isRight ? body.x + arrowInsetX : body.x + body.w - arrowInsetX;
  const arrowHalfWidth = body.w * EXTENSION_ARROW_HALF_WIDTH_RATIO;
  const arrowPoints = [
    { x: arrowCenterX - arrowHalfWidth, y: body.y },
    { x: arrowCenterX, y: box.y },
    { x: arrowCenterX + arrowHalfWidth, y: body.y },
  ];

  roundedRectangle(under, body, { tone: "ink", seed });
  polygon(under, arrowPoints, { tone: "ink", fill: "grey", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-email-frame", (drawing) => {
  const { roundedRectangle, line } = window.SketchWireframe;
  const { box, seed, under } = drawing;
  const [headerChild] = measureChildren(drawing, ".sk-email-header");
  const headerBottomY = headerChild.box.y + headerChild.box.h;

  roundedRectangle(under, box, { tone: "ink", seed });
  line(under, { x: box.x, y: headerBottomY }, { x: box.x + box.w, y: headerBottomY }, { tone: "soft", seed: seed + 1 });
});

window.SketchWireframe.definePart("sk-app-shell", (drawing) => {
  const { roundedRectangle, line, readStatus, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const [headerChild] = measureChildren(drawing, ".sk-app-shell-header");
  const [sidebarChild] = measureChildren(drawing, ".sk-app-shell-sidebar");
  const sidebar = sidebarChild.box;
  const headerBottomY = headerChild.box.y + headerChild.box.h;
  const isRight = isRightToLeft(element);
  const dividerX = isRight ? sidebar.x : sidebar.x + sidebar.w;
  const linkChildren = measureChildren(drawing, ".sk-app-shell-link");
  const selectedLinkChildren = linkChildren.filter(
    (linkChild) => readStatus(linkChild.element) === "selected",
  );

  roundedRectangle(under, box, { tone: "ink", seed });
  line(under, { x: box.x, y: headerBottomY }, { x: box.x + box.w, y: headerBottomY }, { tone: "soft", seed: seed + 1 });
  line(under, { x: dividerX, y: headerBottomY }, { x: dividerX, y: box.y + box.h }, { tone: "soft", seed: seed + 2 });

  for (const [linkIndex, linkChild] of selectedLinkChildren.entries()) {
    roundedRectangle(under, linkChild.box, { tone: "ink", fill: "blue", seed: seed + 10 + linkIndex });
  }
});

window.SketchWireframe.definePart("sk-split-view", (drawing) => {
  const { rectangle, line, isRightToLeft } = window.SketchWireframe;
  const { element, box, seed, under } = drawing;
  const paneChildren = measureChildren(drawing, ".sk-split-pane");
  const [firstPane] = paneChildren.map((paneChild) => paneChild.box);
  const isRight = isRightToLeft(element);
  const dividerX = isRight ? firstPane.x : firstPane.x + firstPane.w;

  for (const [paneIndex, paneChild] of paneChildren.entries()) {
    rectangle(under, paneChild.box, { tone: "soft", dashed: true, seed: seed + 1 + paneIndex });
  }

  line(under, { x: dividerX, y: box.y }, { x: dividerX, y: box.y + box.h }, { tone: "ink", dashed: true, seed: seed + 5 });
});

window.SketchWireframe.definePart("sk-column-grid", (drawing) => {
  const { rectangle } = window.SketchWireframe;
  const { seed, under } = drawing;

  for (const [cellIndex, cellChild] of measureChildren(drawing, ".sk-column-grid-cell").entries()) {
    rectangle(under, cellChild.box, { tone: "soft", dashed: true, seed: seed + 1 + cellIndex });
  }
});
`;

export const FRAMES_PART_STYLE = `:where(.sk-browser-window) {
  display: block;
  min-width: 16rem;
  min-height: 10rem;
  border: 1.6px solid transparent;
  border-radius: 0.75rem;
}

:where(.sk-browser-tab) {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  font-size: 1rem;
}

:where(.sk-browser-url) {
  margin: 0.5rem 0.75rem;
  padding: 0.25rem 0.75rem;
  font-family: "IBM Plex Mono", monospace;
  font-size: 0.875rem;
}

:where(.sk-laptop) {
  display: block;
  min-width: 14rem;
  border: 1.6px solid transparent;
}

:where(.sk-laptop-screen) {
  display: block;
  min-height: 8rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-laptop-base) {
  display: block;
  min-height: 0.75rem;
  margin: 0 -1rem;
  border: 1.6px solid transparent;
  border-radius: 0 0 0.75rem 0.75rem;
}

:where(.sk-app-window) {
  display: block;
  min-width: 16rem;
  min-height: 8rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-app-window-title) {
  display: block;
  padding-block: 0.375rem;
  padding-inline: 0.75rem;
  padding-inline-start: 5.5rem;
  font-size: 0.95rem;
}

:where(.sk-tablet) {
  display: block;
  min-width: 12rem;
  min-height: 12rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 1.25rem;
}

:where(.sk-tablet-camera) {
  display: block;
  min-width: 0.5rem;
  min-height: 0.5rem;
  margin: 0 auto 0.5rem;
}

:where(.sk-tablet-screen) {
  display: block;
  min-height: 8rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-phone) {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 13rem;
  min-height: 24rem;
  padding: 0 0.5rem 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 2rem;
}

:where(.sk-phone-notch) {
  position: absolute;
  top: 0.4rem;
  left: 50%;
  width: 30%;
  min-height: 1.1rem;
  transform: translateX(-50%);
  border-radius: 999px;
}

:where(.sk-phone-status) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2.25rem;
  padding: 0 0.75rem;
  font-size: 0.9rem;
}

:where(.sk-phone-screen) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
}

:where(.sk-phone-home) {
  display: block;
  width: 35%;
  min-height: 0.35rem;
  margin: 0 auto;
  border-radius: 999px;
}

:where(.sk-watch) {
  position: relative;
  display: block;
  min-width: 9rem;
  padding: 1.25rem 0;
  border: 1.6px solid transparent;
}

:where(.sk-watch-face) {
  display: block;
  min-height: 7rem;
  margin: 0 0.75rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 1.5rem;
}

:where(.sk-watch-crown) {
  position: absolute;
  top: 40%;
  right: 0.25rem;
  min-width: 0.5rem;
  min-height: 1.25rem;
}

:where(.sk-terminal-window) {
  display: block;
  min-width: 16rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
  font-family: "IBM Plex Mono", monospace;
}

:where(.sk-terminal-title) {
  display: block;
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
  color: #f8f9fa;
}

:where(.sk-terminal-body) {
  display: block;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
}

:where(.sk-extension-popup) {
  display: block;
  min-width: 13rem;
  padding-top: 0.9rem;
  border: 1.6px solid transparent;
}

:where(.sk-extension-popup-body) {
  display: block;
  padding: 0.75rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-email-frame) {
  display: block;
  min-width: 16rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-email-header) {
  display: block;
  padding: 0.75rem 1rem;
}

:where(.sk-email-body) {
  display: block;
  padding: 1rem;
}

:where(.sk-app-shell) {
  display: block;
  min-width: 18rem;
  min-height: 12rem;
  border: 1.6px solid transparent;
  border-radius: 0.5rem;
}

:where(.sk-app-shell-header) {
  display: flex;
  min-height: 2.5rem;
}

:where(.sk-app-shell-body) {
  display: flex;
  min-height: 8rem;
}

:where(.sk-app-shell-sidebar) {
  flex: none;
  width: 30%;
  min-width: 6rem;
}

:where(.sk-app-shell-content) {
  flex: 1;
  min-width: 0;
}

:where(.sk-app-shell-link) {
  display: block;
  padding: 0.25rem 0.5rem;
}

:where(.sk-split-view) {
  display: flex;
  min-height: 8rem;
  border: 1.6px solid transparent;
}

:where(.sk-split-pane) {
  flex: 1;
  min-width: 0;
  min-height: 8rem;
  padding: 0.75rem;
  border: 1.6px solid transparent;
}

:where(.sk-column-grid-cell) {
  display: block;
  min-height: 3rem;
  padding: 0.5rem;
  border: 1.6px solid transparent;
}
`;
