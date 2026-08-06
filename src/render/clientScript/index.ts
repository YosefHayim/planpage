// Client-side scripts inlined into the rendered document. They are constant infra
// strings (never skill data), injected by the Shell. One module per island; this
// barrel is what Shell imports. Kept tiny and dependency-free.

export { THEME_TOGGLE } from "./theme";
export { CLIENT_SCRIPT } from "./postback";
export { GALLERY_FILTER } from "./galleryFilter";
export { QUESTION_POLL_SCRIPT } from "./questionPoll";
export { CODE_EXPLORER_SCRIPT } from "./codeExplorer";
export { QUIZ_SCRIPT } from "./quiz";
export { CAROUSEL_SCRIPT } from "./carousel";
export { DIAGRAM_SCRIPT } from "./diagram";
export { WHITEBOARD_SCRIPT } from "./whiteboard";
