import type { LiveCommentFromPage, LiveCursorRequest } from "../contracts/live";

export const isJsonObject = (candidate: unknown): candidate is Record<string, unknown> =>
  typeof candidate === "object" && candidate !== null;

const isWholeNumber = (candidate: unknown): candidate is number =>
  typeof candidate === "number" && Number.isInteger(candidate);

export const isPageNumberInPlan = (page: unknown, pageCount: number): page is number => {
  const isNumberPage = isWholeNumber(page);
  if (!isNumberPage) return false;

  return page >= 1 && page <= pageCount;
};

export const isCommentFrame = (frame: unknown, pageCount: number): frame is LiveCommentFromPage => {
  const isObject = isJsonObject(frame);
  if (!isObject) return false;

  const isCommentKind = frame.kind === "comment";
  const isDraftIdText = typeof frame.draftId === "string";
  const isPageInPlan = isPageNumberInPlan(frame.page, pageCount);
  const isPartValid = frame.part === null || typeof frame.part === "string";
  const hasWords = typeof frame.words === "string" && frame.words.trim() !== "";
  return isCommentKind && isDraftIdText && isPageInPlan && isPartValid && hasWords;
};

export const isCursorBody = (cursorRequest: unknown): cursorRequest is LiveCursorRequest => {
  const isObject = isJsonObject(cursorRequest);
  if (!isObject) return false;

  const isSayText = typeof cursorRequest.say === "string";
  const isCommentIdValid =
    cursorRequest.commentId === null || isWholeNumber(cursorRequest.commentId);
  const isPageValid = cursorRequest.page === null || isWholeNumber(cursorRequest.page);
  const isPartValid = cursorRequest.part === null || typeof cursorRequest.part === "string";
  return isSayText && isCommentIdValid && isPageValid && isPartValid;
};
