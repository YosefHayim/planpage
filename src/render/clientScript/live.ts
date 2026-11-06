const LIVE_STYLE_CSS = `:root {
  --live-ink: #2b2b30;
  --live-paper: #ffffff;
  --live-accent: #17569a;
}

html.dark {
  --live-ink: #e2e8f0;
  --live-paper: #0f172a;
  --live-accent: #93c5fd;
}

.live-layer [hidden] {
  display: none;
}

.live-layer {
  position: fixed;
  inset: 0;
  z-index: 50;
  pointer-events: none;
  font-family: "Kalam", cursive;
  color: var(--live-ink);
}

.live-pin-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.live-pin {
  position: fixed;
  width: 24px;
  height: 24px;
  padding: 0;
  pointer-events: auto;
  border: 1.5px solid var(--live-ink);
  border-radius: 50%;
  background: var(--live-paper);
  color: var(--live-ink);
  font: inherit;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}

.live-pin.is-sending {
  border-style: dashed;
  opacity: 0.7;
}

.live-pin.is-working {
  border-color: var(--live-accent);
  color: var(--live-accent);
}

.live-pin.is-done {
  opacity: 0.5;
}

.live-box {
  position: fixed;
  display: grid;
  gap: 6px;
  width: 260px;
  max-width: calc(100vw - 16px);
  padding: 8px;
  pointer-events: auto;
  border: 1.5px solid var(--live-ink);
  border-radius: 10px;
  background: var(--live-paper);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.live-field {
  box-sizing: border-box;
  width: 100%;
  padding: 6px;
  resize: vertical;
  border: 1px dashed var(--live-ink);
  border-radius: 6px;
  background: transparent;
  color: var(--live-ink);
  font: inherit;
  font-size: 18px;
}

.live-popover-words {
  margin: 0;
  font-size: 18px;
}

.live-popover-status {
  margin: 0;
  color: var(--live-accent);
  font-size: 15px;
}

.live-page-box {
  display: grid;
  gap: 6px;
  margin-top: 16px;
}

.live-page-box .live-field {
  max-width: 420px;
}

.live-glow {
  filter: drop-shadow(0 0 4px var(--live-accent)) drop-shadow(0 0 4px var(--live-accent));
}

.live-cursor {
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  pointer-events: none;
  color: var(--live-accent);
  transition: transform 0.6s ease, opacity 0.6s ease;
}

.live-cursor.is-fading {
  opacity: 0;
}

.live-cursor-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--live-accent);
}

.live-cursor-label {
  padding: 2px 8px;
  white-space: nowrap;
  border-radius: 10px;
  background: var(--live-accent);
  color: var(--live-paper);
  font-size: 16px;
}

.live-toast-list {
  position: fixed;
  left: 50%;
  bottom: 16px;
  display: grid;
  gap: 8px;
  width: min(360px, calc(100vw - 24px));
  transform: translateX(-50%);
  pointer-events: auto;
}

.live-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border: 1.5px solid var(--live-ink);
  border-radius: 10px;
  background: var(--live-paper);
  font-size: 18px;
}

.live-badge {
  position: fixed;
  top: 12px;
  right: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--live-ink);
  color: var(--live-paper);
  font-size: 16px;
}
`;

const LIVE_STYLE_JSON = JSON.stringify(LIVE_STYLE_CSS);

export const LIVE_CLIENT_SCRIPT = `(function () {
  if (typeof WebSocket !== "function") return;

  const LIVE_PAGE_PATH = "/page";
  const LIVE_STYLE_CSS = ${LIVE_STYLE_JSON};
  const RECONNECT_FIRST_WAIT_MS = 500;
  const RECONNECT_MAX_WAIT_MS = 8000;
  const GLOW_MS = 4000;
  const CURSOR_IDLE_MS = 8000;
  const VIEWPORT_MARGIN_PX = 8;
  const ANCHOR_GAP_PX = 10;
  const PIN_SIZE_PX = 24;
  const STATUS_LABELS = { sending: "Sending...", sent: "Sent", working: "Claude is on it", done: "Done" };

  let pageSocket = null;
  let hasConnectedOnce = false;
  let hasStartedPage = false;
  let reconnectAttempts = 0;
  let glowTimerId = null;
  let cursorIdleTimerId = null;
  let cursorTarget = null;
  let openComposerTarget = null;
  let openPinDraftId = null;
  const unsentFrames = [];
  const pinsByDraftId = new Map();
  const pendingGlowsByPage = new Map();
  const keptSectionByPage = new Map();
  const toastsByPage = new Map();

  const createLiveElement = (tagName, className) => {
    const element = document.createElement(tagName);
    element.className = className;
    return element;
  };

  const pixelsOf = (distance) => String(distance) + "px";

  const layerElement = createLiveElement("div", "live-layer");
  const pinLayerElement = createLiveElement("div", "live-pin-layer");
  const composerElement = createLiveElement("div", "live-box live-composer");
  const composerField = createLiveElement("textarea", "live-field");
  const pinPopoverElement = createLiveElement("div", "live-box");
  const pinPopoverWordsElement = createLiveElement("p", "live-popover-words");
  const pinPopoverStatusElement = createLiveElement("p", "live-popover-status");
  const cursorElement = createLiveElement("div", "live-cursor");
  const cursorLabelElement = createLiveElement("div", "live-cursor-label");
  const cursorNameElement = createLiveElement("span", "live-cursor-name");
  const cursorSayElement = createLiveElement("span", "live-cursor-say");
  const toastListElement = createLiveElement("div", "live-toast-list");
  const reconnectBadgeElement = createLiveElement("div", "live-badge");
  const styleElement = createLiveElement("style", "");

  composerElement.hidden = true;
  composerField.rows = 2;
  composerField.placeholder = "Comment on this part";
  composerField.setAttribute("aria-label", "Comment on this part");
  composerElement.append(composerField);

  pinPopoverElement.hidden = true;
  pinPopoverElement.append(pinPopoverWordsElement, pinPopoverStatusElement);

  cursorNameElement.textContent = "Claude";
  cursorLabelElement.append(cursorNameElement, cursorSayElement);
  cursorElement.append(createLiveElement("span", "live-cursor-dot"), cursorLabelElement);
  cursorElement.hidden = true;

  reconnectBadgeElement.textContent = "Reconnecting...";
  reconnectBadgeElement.hidden = true;

  styleElement.textContent = LIVE_STYLE_CSS;
  layerElement.append(
    pinLayerElement,
    composerElement,
    pinPopoverElement,
    cursorElement,
    toastListElement,
    reconnectBadgeElement,
  );

  const pageSections = () => Array.from(document.querySelectorAll("[data-sketch-page]"));

  const sectionOfPage = (page) => pageSections()[page - 1];

  const pageOfSection = (section) => pageSections().indexOf(section) + 1;

  const isPageShowing = (page) => {
    const section = sectionOfPage(page);
    const isSectionMissing = section == null;
    if (isSectionMissing) return false;

    return !section.hidden;
  };

  const titleOfPage = (page) => sectionOfPage(page).querySelector("[data-sketch-title]").textContent;

  const findPartElement = (section, part) => {
    const isWholePage = part == null;
    if (isWholePage) return section.querySelector("[data-sketch-title]");

    const isWireframePart = part.includes("#");
    if (isWireframePart) {
      const [screenId, partName] = part.split("#");
      const wireframeSelector =
        '[data-screen-id="' + CSS.escape(screenId) + '"] [data-part="' + CSS.escape(partName) + '"]';
      return section.querySelector(wireframeSelector);
    }

    const sceneSelector =
      '[data-node-id="' + CSS.escape(part) + '"], [data-edge-id="' + CSS.escape(part) + '"]';
    return section.querySelector(sceneSelector);
  };

  const readVisiblePartRect = (page, part) => {
    const isPageHidden = !isPageShowing(page);
    if (isPageHidden) return null;

    const partElement = findPartElement(sectionOfPage(page), part);
    const isPartMissing = partElement == null;
    if (isPartMissing) return null;

    const partRect = partElement.getBoundingClientRect();
    const isRectEmpty = partRect.width === 0 && partRect.height === 0;
    if (isRectEmpty) return null;

    return partRect;
  };

  const keepInViewport = (wantedStart, boxSize, viewportSize) => {
    const latestStart = viewportSize - boxSize - VIEWPORT_MARGIN_PX;
    return Math.max(VIEWPORT_MARGIN_PX, Math.min(wantedStart, latestStart));
  };

  const partKeyOfTarget = (target) => {
    const wireframePart = target.closest("[data-part]");
    const screenElement = wireframePart == null ? null : wireframePart.closest("[data-screen-id]");
    const isWireframePart = screenElement != null;
    if (isWireframePart) return screenElement.dataset.screenId + "#" + wireframePart.dataset.part;

    const sceneItem = target.closest("[data-node-id], [data-edge-id]");
    const isSceneItemMissing = sceneItem == null;
    if (isSceneItemMissing) return null;

    return sceneItem.dataset.nodeId ?? sceneItem.dataset.edgeId;
  };

  const createPinElement = (pin) => {
    const pinElement = createLiveElement("button", "live-pin is-" + pin.status);
    const isCommentSaved = pin.commentId != null;
    pinElement.type = "button";
    pinElement.dataset.draftId = pin.draftId;
    pinElement.textContent = isCommentSaved ? String(pin.commentId) : "...";
    pinElement.addEventListener("click", () => togglePinPopover(pin.draftId));
    return pinElement;
  };

  const placePinElement = (pinElement) => {
    const pin = pinsByDraftId.get(pinElement.dataset.draftId);
    const pinRect = readVisiblePartRect(pin.page, pin.part);
    const isPinTargetGone = pinRect == null;
    pinElement.hidden = isPinTargetGone;
    if (isPinTargetGone) return;

    pinElement.style.left = pixelsOf(pinRect.left - PIN_SIZE_PX / 2);
    pinElement.style.top = pixelsOf(pinRect.top - PIN_SIZE_PX / 2);
  };

  const placePins = () => {
    for (const pinElement of pinLayerElement.children) placePinElement(pinElement);
  };

  const drawPinPopover = () => {
    const pin = openPinDraftId == null ? null : pinsByDraftId.get(openPinDraftId);
    const isPopoverClosed = pin == null;
    pinPopoverElement.hidden = isPopoverClosed;
    if (isPopoverClosed) return;

    pinPopoverWordsElement.textContent = pin.words;
    pinPopoverStatusElement.textContent = STATUS_LABELS[pin.status];
  };

  const placePinPopover = () => {
    const isPopoverClosed = pinPopoverElement.hidden;
    if (isPopoverClosed) return;

    const pinElement = pinLayerElement.querySelector('[data-draft-id="' + openPinDraftId + '"]');
    const isPinHidden = pinElement == null || pinElement.hidden;
    pinPopoverElement.hidden = isPinHidden;
    if (isPinHidden) return;

    const pinRect = pinElement.getBoundingClientRect();
    const wantedLeft = pinRect.right + ANCHOR_GAP_PX;
    const latestLeft = keepInViewport(wantedLeft, pinPopoverElement.offsetWidth, window.innerWidth);
    const latestTop = keepInViewport(pinRect.top, pinPopoverElement.offsetHeight, window.innerHeight);
    pinPopoverElement.style.left = pixelsOf(latestLeft);
    pinPopoverElement.style.top = pixelsOf(latestTop);
  };

  const drawPins = () => {
    const pinElements = Array.from(pinsByDraftId.values(), createPinElement);
    pinLayerElement.replaceChildren(...pinElements);
    drawPinPopover();
    placeLiveLayer();
  };

  const togglePinPopover = (draftId) => {
    const isSameOpen = openPinDraftId === draftId;
    openPinDraftId = isSameOpen ? null : draftId;
    drawPinPopover();
    placePinPopover();
  };

  const upsertPin = (comment) => {
    pinsByDraftId.set(comment.draftId, {
      draftId: comment.draftId,
      commentId: comment.commentId,
      page: comment.page,
      part: comment.part,
      words: comment.words,
      status: comment.status,
    });
  };

  const setPinStatus = (commentId, status) => {
    for (const pin of pinsByDraftId.values()) {
      const isThisComment = pin.commentId === commentId;
      if (isThisComment) pinsByDraftId.set(pin.draftId, { ...pin, status });
    }
  };

  const sendFrame = (frame) => {
    const isSocketOpen = pageSocket != null && pageSocket.readyState === WebSocket.OPEN;
    if (!isSocketOpen) {
      unsentFrames.push(frame);
      return;
    }

    pageSocket.send(JSON.stringify(frame));
  };

  const sendComment = (page, part, words) => {
    const isWordsEmpty = words === "";
    if (isWordsEmpty) return false;

    const draftId = crypto.randomUUID();
    pinsByDraftId.set(draftId, { draftId, commentId: null, page, part, words, status: "sending" });
    sendFrame({ kind: "comment", draftId, page, part, words });
    drawPins();
    return true;
  };

  const placeComposer = () => {
    const isComposerClosed = openComposerTarget == null;
    if (isComposerClosed) return;

    const targetRect = readVisiblePartRect(openComposerTarget.page, openComposerTarget.part);
    const isTargetGone = targetRect == null;
    composerElement.hidden = isTargetGone;
    if (isTargetGone) return;

    const composerHeight = composerElement.offsetHeight;
    const belowTop = targetRect.bottom + ANCHOR_GAP_PX;
    const aboveTop = targetRect.top - ANCHOR_GAP_PX - composerHeight;
    const isNoRoomBelow = belowTop + composerHeight > window.innerHeight - VIEWPORT_MARGIN_PX;
    const wantedTop = isNoRoomBelow ? aboveTop : belowTop;
    const latestLeft = keepInViewport(targetRect.left, composerElement.offsetWidth, window.innerWidth);
    const latestTop = keepInViewport(wantedTop, composerHeight, window.innerHeight);
    composerElement.style.left = pixelsOf(latestLeft);
    composerElement.style.top = pixelsOf(latestTop);
  };

  const openComposerFor = (page, part) => {
    openComposerTarget = { page, part };
    composerElement.hidden = false;
    placeComposer();
    composerField.focus({ preventScroll: true });
  };

  const closeComposer = () => {
    openComposerTarget = null;
    composerElement.hidden = true;
    composerField.blur();
  };

  const sendComposerWords = () => {
    const isComposerClosed = openComposerTarget == null;
    if (isComposerClosed) return;

    const composerWords = composerField.value.trim();
    const isSent = sendComment(openComposerTarget.page, openComposerTarget.part, composerWords);
    if (isSent) {
      composerField.value = "";
      closeComposer();
    }
  };

  const bindFieldKeys = (field, sendField, closeField) => {
    field.addEventListener("keydown", (keyEvent) => {
      keyEvent.stopPropagation();
      const isTypingWithIme = keyEvent.isComposing;
      if (isTypingWithIme) return;

      const isSendKey = keyEvent.key === "Enter" && !keyEvent.shiftKey;
      if (isSendKey) {
        keyEvent.preventDefault();
        sendField();
        return;
      }

      const isCloseKey = keyEvent.key === "Escape";
      if (isCloseKey) closeField();
    });
  };

  const addPageBox = (section) => {
    const pageBox = createLiveElement("div", "live-page-box");
    const pageField = createLiveElement("textarea", "live-field");
    pageField.rows = 1;
    pageField.placeholder = "Comment on this page";
    pageField.setAttribute("aria-label", "Comment on this page");
    pageBox.append(pageField);
    section.append(pageBox);

    const sendPageWords = () => {
      const sectionPage = pageOfSection(section);
      const pageWords = pageField.value.trim();
      const isSent = sendComment(sectionPage, null, pageWords);
      if (isSent) pageField.value = "";
    };
    bindFieldKeys(pageField, sendPageWords, () => pageField.blur());
  };

  const fadeCursor = () => {
    cursorElement.classList.add("is-fading");
  };

  const placeCursor = () => {
    const isCursorUnset = cursorTarget == null;
    if (isCursorUnset) return;

    const cursorRect = readVisiblePartRect(cursorTarget.page, cursorTarget.part);
    const isCursorTargetGone = cursorRect == null;
    cursorElement.hidden = isCursorTargetGone;
    if (isCursorTargetGone) return;

    cursorElement.style.transform = "translate(" + pixelsOf(cursorRect.left) + ", " + pixelsOf(cursorRect.top) + ")";
  };

  const dismissToast = (page) => {
    toastsByPage.delete(page);
    drawToasts();
  };

  const setPendingGlow = (page, parts) => {
    pendingGlowsByPage.set(page, parts);
    window.clearTimeout(glowTimerId);
    glowTimerId = window.setTimeout(clearGlows, GLOW_MS);
    applyPendingGlow(sectionOfPage(page));
  };

  const clearGlows = () => {
    pendingGlowsByPage.clear();
    for (const glowingElement of document.querySelectorAll(".live-glow")) {
      glowingElement.classList.remove("live-glow");
    }
  };

  const applyPendingGlow = (section) => {
    const page = pageOfSection(section);
    const glowParts = pendingGlowsByPage.get(page);
    const isNothingToGlow = glowParts == null;
    if (isNothingToGlow) return;

    for (const part of glowParts) {
      const partElement = findPartElement(section, part);
      const isPartFound = partElement != null;
      if (isPartFound) partElement.classList.add("live-glow");
    }
  };

  const partsToGlow = (changedParts) => {
    const isNoPartChanged = changedParts.length === 0;
    if (isNoPartChanged) return [null];

    return changedParts;
  };

  const goToToastPage = (toast) => {
    dismissToast(toast.page);
    setPendingGlow(toast.page, toast.parts);
    window.SketchPager.goToPage(toast.page);
  };

  const createToastElement = (toast) => {
    const toastElement = createLiveElement("div", "live-toast");
    const wordsElement = createLiveElement("span", "live-toast-words");
    const showMeButton = createLiveElement("button", "sketch-button");
    const closeButton = createLiveElement("button", "sketch-button");
    wordsElement.textContent = toast.words;
    showMeButton.type = "button";
    showMeButton.textContent = "Show me";
    showMeButton.addEventListener("click", () => goToToastPage(toast));
    closeButton.type = "button";
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => dismissToast(toast.page));
    toastElement.append(wordsElement, showMeButton, closeButton);
    return toastElement;
  };

  const drawToasts = () => {
    const toastElements = Array.from(toastsByPage.values(), createToastElement);
    toastListElement.replaceChildren(...toastElements);
  };

  const addEditingToast = (page, part) => {
    const editingWords = "Claude is editing page " + page + ": " + titleOfPage(page);
    toastsByPage.set(page, { page, words: editingWords, parts: [part] });
    drawToasts();
  };

  const addChangeToast = (change) => {
    const changedWords = "Claude changed page " + change.page + ": " + change.pageTitle;
    toastsByPage.set(change.page, { page: change.page, words: changedWords, parts: partsToGlow(change.changedParts) });
    drawToasts();
  };

  const moveClaudeCursor = (cursorMessage) => {
    cursorTarget = { page: cursorMessage.page, part: cursorMessage.part };
    cursorSayElement.textContent = cursorMessage.say;
    cursorElement.classList.remove("is-fading");
    window.clearTimeout(cursorIdleTimerId);
    cursorIdleTimerId = window.setTimeout(fadeCursor, CURSOR_IDLE_MS);

    const isPageHidden = !isPageShowing(cursorMessage.page);
    if (isPageHidden) {
      addEditingToast(cursorMessage.page, cursorMessage.part);
      cursorElement.hidden = true;
      return;
    }

    placeCursor();
  };

  const toggleVersion = (page) => {
    const shownSection = sectionOfPage(page);
    const keptSection = keptSectionByPage.get(page);
    keptSection.hidden = shownSection.hidden;
    shownSection.replaceWith(keptSection);
    keptSectionByPage.set(page, shownSection);
    refreshVersionToggle(page);
    window.SketchEngine.drawFramesIn(keptSection);
    applyPendingGlow(keptSection);
  };

  const refreshVersionToggle = (page) => {
    const shownSection = sectionOfPage(page);
    for (const oldToggle of shownSection.querySelectorAll("[data-live-version-toggle]")) oldToggle.remove();

    const keptSection = keptSectionByPage.get(page);
    const isNoKeptVersion = keptSection == null;
    if (isNoKeptVersion) return;

    const isShowingBefore = shownSection.dataset.liveVersion === "before";
    const toggleButton = createLiveElement("button", "sketch-button");
    toggleButton.type = "button";
    toggleButton.dataset.liveVersionToggle = "";
    toggleButton.textContent = isShowingBefore ? "After" : "Before";
    toggleButton.addEventListener("click", () => toggleVersion(page));
    shownSection.querySelector(".sketch-tools").append(toggleButton);
  };

  const replacePage = (change, nextSection) => {
    const isBeforeShowing = sectionOfPage(change.page).dataset.liveVersion === "before";
    if (isBeforeShowing) toggleVersion(change.page);

    const currentSection = sectionOfPage(change.page);
    const importedSection = document.importNode(nextSection, true);
    importedSection.hidden = currentSection.hidden;
    importedSection.dataset.liveVersion = "current";
    currentSection.dataset.liveVersion = "before";
    currentSection.replaceWith(importedSection);
    keptSectionByPage.set(change.page, currentSection);
    toastsByPage.delete(change.page);

    window.SketchPager.bindControlsIn(importedSection);
    addPageBox(importedSection);
    refreshVersionToggle(change.page);
    setPendingGlow(change.page, partsToGlow(change.changedParts));
    window.SketchEngine.drawFramesIn(importedSection);

    const isPageHidden = !isPageShowing(change.page);
    if (isPageHidden) addChangeToast(change);
  };

  const showPlanChanges = (planMessage) => {
    const parsedPlan = new DOMParser().parseFromString(planMessage.html, "text/html");
    const nextSections = Array.from(parsedPlan.querySelectorAll("[data-sketch-page]"));
    const isPageCountChanged = nextSections.length !== pageSections().length;
    if (isPageCountChanged) {
      console.error({ message: "plan-changed page count differs", pageCount: nextSections.length });
      location.reload();
      return;
    }

    for (const change of planMessage.changes) replacePage(change, nextSections[change.page - 1]);
    fadeCursor();
    placeLiveLayer();
  };

  const placeLiveLayer = () => {
    placePins();
    placePinPopover();
    placeComposer();
    placeCursor();
  };

  const showServerMessage = (message) => {
    switch (message.kind) {
      case "comments-so-far":
        for (const comment of message.comments) upsertPin(comment);
        drawPins();
        break;
      case "comment-saved":
        upsertPin(message.comment);
        drawPins();
        break;
      case "comment-status":
        setPinStatus(message.commentId, message.status);
        drawPins();
        break;
      case "cursor":
        moveClaudeCursor(message);
        break;
      case "plan-changed":
        showPlanChanges(message);
        break;
      case "plan-reshaped":
        location.reload();
        break;
    }
  };

  const parseFrame = (frameText) => {
    try {
      return JSON.parse(frameText);
    } catch (parseError) {
      console.error({ parseError });
      return null;
    }
  };

  const readSocketFrame = (messageEvent) => {
    const message = parseFrame(messageEvent.data);
    const isFrameUnreadable = message == null;
    if (isFrameUnreadable) return;

    showServerMessage(message);
  };

  const onDocumentClick = (clickEvent) => {
    const partKey = partKeyOfTarget(clickEvent.target);
    const isPartClicked = partKey != null;
    if (!isPartClicked) return;

    clickEvent.preventDefault();
    const clickedSection = clickEvent.target.closest("[data-sketch-page]");
    const clickedPage = pageOfSection(clickedSection);
    openComposerFor(clickedPage, partKey);
  };

  const onSketchAsk = (askEvent) => {
    askEvent.preventDefault();
    const askedSection = askEvent.detail.section;
    const notesField = askedSection.querySelector("[data-sketch-decision-notes]");
    const notesWords = notesField.value.trim();
    const askedPage = pageOfSection(askedSection);
    const isSent = sendComment(askedPage, null, notesWords);
    if (isSent) {
      notesField.value = "";
      askedSection.querySelector("[data-sketch-status]").textContent = "Sent to Claude.";
    }
  };

  const onSketchDrawn = (drawnEvent) => {
    const drawnSection = drawnEvent.target.closest("[data-sketch-page]");
    applyPendingGlow(drawnSection);
    placeLiveLayer();
  };

  const startLivePage = () => {
    hasStartedPage = true;
    document.head.append(styleElement);
    document.body.append(layerElement);
    for (const section of pageSections()) addPageBox(section);
    document.addEventListener("click", onDocumentClick);
    document.addEventListener("pp-sketch-ask", onSketchAsk);
    document.addEventListener("pp-sketch-drawn", onSketchDrawn);
    document.addEventListener("scroll", placeLiveLayer, { capture: true, passive: true });
    window.addEventListener("resize", placeLiveLayer);
  };

  const scheduleReconnect = () => {
    const waitMs = Math.min(RECONNECT_MAX_WAIT_MS, RECONNECT_FIRST_WAIT_MS * 2 ** reconnectAttempts);
    reconnectAttempts += 1;
    window.setTimeout(openPageSocket, waitMs);
  };

  const onSocketOpen = () => {
    hasConnectedOnce = true;
    reconnectAttempts = 0;
    reconnectBadgeElement.hidden = true;
    const isFirstOpen = !hasStartedPage;
    if (isFirstOpen) startLivePage();

    for (const frame of unsentFrames.splice(0)) sendFrame(frame);
  };

  const onSocketClose = () => {
    reconnectBadgeElement.hidden = !hasConnectedOnce;
    scheduleReconnect();
  };

  const openPageSocket = () => {
    pageSocket = new WebSocket("ws://" + location.host + LIVE_PAGE_PATH);
    pageSocket.addEventListener("open", onSocketOpen);
    pageSocket.addEventListener("message", readSocketFrame);
    pageSocket.addEventListener("close", onSocketClose);
  };

  bindFieldKeys(composerField, sendComposerWords, closeComposer);
  openPageSocket();
})();
`;
