import { EMPTY_DECISION } from "../../contracts/decision";

const EMPTY_DECISION_JSON = JSON.stringify(EMPTY_DECISION);

export const SKETCH_PAGER_SCRIPT = `(function () {
  const sections = Array.from(document.querySelectorAll("[data-sketch-page]"));
  const hasNoPages = sections.length === 0;
  if (hasNoPages) return;

  const sketchEngine = window.SketchEngine;
  const navSteps = Array.from(document.querySelectorAll("[data-sketch-nav-step]"));
  const navLines = Array.from(document.querySelectorAll("[data-sketch-nav-line]"));
  const emptyDecision = ${EMPTY_DECISION_JSON};
  const DECISION_PATH = "/decision";

  const pageNumberOfHash = () => {
    const pageNumber = Number(location.hash.slice(1));
    const isPageNumber = Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= sections.length;
    return isPageNumber ? pageNumber : 1;
  };

  const sectionOf = (pageNumber) => sections[pageNumber - 1];

  const activeSection = () => sectionOf(pageNumberOfHash());

  const decisionOf = (section) => section.querySelector("[data-sketch-decision]");

  const choiceInputsOf = (section) => Array.from(section.querySelectorAll('input[name="sketch-choice"]'));

  const pickedLetterOf = (section) => choiceInputsOf(section).find((input) => input.checked).value;

  const decisionNotesOf = (section) => section.querySelector("[data-sketch-decision-notes]");

  const approveButtonOf = (section) => section.querySelector("[data-sketch-approve]");

  const askButtonOf = (section) => section.querySelector("[data-sketch-ask]");

  const statusLineOf = (section) => section.querySelector("[data-sketch-status]");

  const stepStateOf = (stepNumber, pageNumber) => {
    const isCurrentStep = stepNumber === pageNumber;
    if (isCurrentStep) return "active";

    const isPassedStep = stepNumber < pageNumber;
    if (isPassedStep) return "passed";
    return "upcoming";
  };

  const showNavState = (pageNumber) => {
    for (const [stepIndex, navStep] of navSteps.entries()) {
      const stepNumber = stepIndex + 1;
      navStep.dataset.state = stepStateOf(stepNumber, pageNumber);
      const isCurrentStep = stepNumber === pageNumber;
      if (isCurrentStep) {
        navStep.setAttribute("aria-current", "page");
        continue;
      }
      navStep.removeAttribute("aria-current");
    }
    for (const [lineIndex, navLine] of navLines.entries()) {
      navLine.dataset.state = stepStateOf(lineIndex + 1, pageNumber);
    }
  };

  const applyPressedMode = (section) => {
    const pressedButton = section.querySelector("[data-sketch-mode][aria-pressed='true']");
    const hasPressedMode = pressedButton !== null;
    if (!hasPressedMode) return;
    sketchEngine.setMode(section.querySelector(".sketch-frame"), pressedButton.dataset.sketchMode);
  };

  const showPage = async (pageNumber) => {
    const pageSection = sectionOf(pageNumber);
    for (const section of sections) section.hidden = section !== pageSection;
    showNavState(pageNumber);

    await sketchEngine.drawFramesIn(pageSection);
    const isStillShown = !pageSection.hidden;
    if (!isStillShown) return;

    applyPressedMode(pageSection);
    pageSection.querySelector("[data-sketch-title]").focus();
    window.scrollTo(0, 0);
  };

  const goToPage = async (pageNumber) => {
    const isPageNumberValid = pageNumber >= 1 && pageNumber <= sections.length;
    if (!isPageNumberValid) return;

    history.replaceState(null, "", \`#\${pageNumber}\`);
    await showPage(pageNumber);
  };

  const handleModeClick = (modeButton) => {
    const section = modeButton.closest("[data-sketch-page]");
    for (const button of section.querySelectorAll("[data-sketch-mode]")) {
      button.setAttribute("aria-pressed", String(button === modeButton));
    }
    sketchEngine.setMode(section.querySelector(".sketch-frame"), modeButton.dataset.sketchMode);
  };

  const selectCodeTab = (tabButton) => {
    const drawer = tabButton.closest("[data-sketch-code]");
    const selectedKey = tabButton.dataset.key;
    for (const tab of drawer.querySelectorAll("[data-sketch-code-tab]")) {
      tab.setAttribute("aria-selected", String(tab.dataset.key === selectedKey));
    }
    for (const body of drawer.querySelectorAll("[data-sketch-code-body]")) {
      body.hidden = body.dataset.key !== selectedKey;
    }
  };

  const refreshApproveLabel = (section) => {
    const approveButton = approveButtonOf(section);
    const hasApproveButton = approveButton !== null;
    if (!hasApproveButton) return;
    approveButton.textContent = \`Approve \${pickedLetterOf(section)}\`;
  };

  const pickOption = (section, optionIndex) => {
    const input = choiceInputsOf(section)[optionIndex];
    input.checked = true;
    input.focus();
    refreshApproveLabel(section);
  };

  const moveOption = (section, direction) => {
    const inputs = choiceInputsOf(section);
    const pickedIndex = inputs.findIndex((input) => input.checked);
    const nextIndex = (pickedIndex + direction + inputs.length) % inputs.length;
    pickOption(section, nextIndex);
  };

  const indexOfOptionKey = (section, pressedKey) => {
    const upperKey = pressedKey.toUpperCase();
    return choiceInputsOf(section).findIndex(
      (input, optionIndex) => input.value === upperKey || pressedKey === String(optionIndex + 1),
    );
  };

  const postDecision = async (decisionBody) => {
    const response = await fetch(DECISION_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(decisionBody),
    });
    return response.ok;
  };

  const tryPostDecision = async (decisionBody) => {
    try {
      return await postDecision(decisionBody);
    } catch (error) {
      console.error({ error });
      return false;
    }
  };

  const copyDecision = async (decisionBody) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(decisionBody, null, 2));
      return true;
    } catch (error) {
      console.error({ error });
      return false;
    }
  };

  const lockDecision = (section) => {
    approveButtonOf(section).disabled = true;
    askButtonOf(section).disabled = true;
  };

  const sendDecision = async (section, decisionBody) => {
    const isSent = await tryPostDecision(decisionBody);
    if (isSent) {
      statusLineOf(section).textContent = "Sent. Back to your terminal.";
      lockDecision(section);
      return;
    }

    const isCopied = await copyDecision(decisionBody);
    const copyNote = isCopied ? "Copied. Paste it back in your terminal." : "Could not copy.";
    statusLineOf(section).textContent = \`No server reached. \${copyNote}\`;
  };

  const sendApprove = (section) =>
    sendDecision(section, { ...emptyDecision, approved: true, choice: pickedLetterOf(section), notes: "" });

  const sendAskForChanges = (section) =>
    sendDecision(section, {
      ...emptyDecision,
      approved: false,
      choice: pickedLetterOf(section),
      notes: decisionNotesOf(section).value,
    });

  const isEditableTarget = (target) =>
    target instanceof Element && target.matches("textarea, input:not([type=radio]), [contenteditable]");

  const isDecisionNotesTarget = (target) => target instanceof Element && target.matches("[data-sketch-decision-notes]");

  const isButtonOrLinkTarget = (target) => target instanceof Element && target.matches("button, a[href]");

  const handleNotesKey = async (event, section) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.target.blur();
      return;
    }

    const isSendShortcut = event.key === "Enter" && (event.metaKey || event.ctrlKey);
    if (isSendShortcut) {
      event.preventDefault();
      await sendAskForChanges(section);
    }
  };

  const handleEscape = async (section, pageNumber) => {
    const openDrawer = section.querySelector("[data-sketch-code]:not([hidden])");
    const isDrawerOpen = openDrawer !== null;
    if (isDrawerOpen) {
      section.querySelector("[data-sketch-code-toggle]").click();
      return;
    }
    await goToPage(pageNumber - 1);
  };

  const handleKeydown = async (event) => {
    const section = activeSection();
    const pageNumber = pageNumberOfHash();

    const isNotesTyping = isDecisionNotesTarget(event.target);
    if (isNotesTyping) {
      await handleNotesKey(event, section);
      return;
    }

    const hasSystemModifier = event.metaKey || event.ctrlKey || event.altKey;
    const isFormTyping = isEditableTarget(event.target);
    if (hasSystemModifier || isFormTyping) return;

    const isDecisionPage = decisionOf(section) !== null;
    const isEnterKey = event.key === "Enter";
    const isOnButtonOrLink = isButtonOrLinkTarget(event.target);
    const optionIndex = isDecisionPage ? indexOfOptionKey(section, event.key) : -1;
    const isOptionKey = optionIndex !== -1;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      await goToPage(pageNumber - 1);
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      await goToPage(pageNumber + 1);
      return;
    }
    if (isDecisionPage && event.key === "ArrowUp") {
      event.preventDefault();
      moveOption(section, -1);
      return;
    }
    if (isDecisionPage && event.key === "ArrowDown") {
      event.preventDefault();
      moveOption(section, 1);
      return;
    }
    if (isOptionKey) {
      event.preventDefault();
      pickOption(section, optionIndex);
      return;
    }
    if (isEnterKey && isOnButtonOrLink) return;
    if (isEnterKey && isDecisionPage) {
      event.preventDefault();
      await sendApprove(section);
      return;
    }
    if (isEnterKey) {
      await goToPage(pageNumber + 1);
      return;
    }
    if (event.key === "Escape") {
      await handleEscape(section, pageNumber);
    }
  };

  for (const modeButton of document.querySelectorAll("[data-sketch-mode]")) {
    modeButton.addEventListener("click", () => handleModeClick(modeButton));
  }
  for (const tab of document.querySelectorAll("[data-sketch-code-tab]")) {
    tab.addEventListener("click", () => selectCodeTab(tab));
  }
  for (const notesButton of document.querySelectorAll("[data-sketch-notes-toggle]")) {
    sketchEngine.bindNotesToggle(notesButton);
  }
  for (const codeButton of document.querySelectorAll("[data-sketch-code-toggle]")) {
    const drawer = codeButton.closest("[data-sketch-page]").querySelector("[data-sketch-code]");
    sketchEngine.bindCodeToggle(codeButton, drawer);
  }
  for (const approveButton of document.querySelectorAll("[data-sketch-approve]")) {
    approveButton.addEventListener("click", () => sendApprove(approveButton.closest("[data-sketch-page]")));
  }
  for (const askButton of document.querySelectorAll("[data-sketch-ask]")) {
    askButton.addEventListener("click", () => sendAskForChanges(askButton.closest("[data-sketch-page]")));
  }
  document.addEventListener("change", (event) => {
    const isChoiceChange = event.target.name === "sketch-choice";
    if (!isChoiceChange) return;
    refreshApproveLabel(event.target.closest("[data-sketch-page]"));
  });
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("hashchange", async () => {
    await showPage(pageNumberOfHash());
  });

  const startPager = async () => {
    for (const section of sections) {
      if (decisionOf(section) !== null) refreshApproveLabel(section);
    }
    await showPage(pageNumberOfHash());
  };
  startPager();
})();
`;
