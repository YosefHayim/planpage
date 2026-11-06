// Every socket frame is one JSON object on one line. Pages are 1-based sketch page numbers (the same #N the pager uses).
// A part is a scene node id ("loginBox"), a wireframe part as "<screenNodeId>#<data-part>" ("signIn#email"), or null for the whole page.

import type { Decision } from "./decision";

export type LiveCommentStatus = "sent" | "working" | "done";

// Browser -> server, on the /page socket.
export interface LiveCommentFromPage {
  readonly kind: "comment";
  // Made by the tab, so it can match the saved comment to its draft pin.
  readonly draftId: string;
  readonly page: number;
  readonly part: string | null;
  readonly words: string;
}

export interface LiveComment {
  readonly commentId: number;
  readonly draftId: string;
  readonly page: number;
  readonly pageTitle: string;
  readonly part: string | null;
  readonly words: string;
  readonly status: LiveCommentStatus;
}

// Server -> every browser tab, on the /page socket.
export interface LiveCommentSaved {
  readonly kind: "comment-saved";
  readonly comment: LiveComment;
}

export interface LiveCommentStatusChanged {
  readonly kind: "comment-status";
  readonly commentId: number;
  readonly status: LiveCommentStatus;
}

export interface LiveCursorMoved {
  readonly kind: "cursor";
  readonly page: number;
  readonly part: string | null;
  readonly say: string;
}

export interface LivePageChange {
  readonly page: number;
  readonly pageTitle: string;
  // Node ids (and edge ids) that are new or differ from the last version; empty when only page text changed.
  readonly changedParts: readonly string[];
}

export interface LivePlanChanged {
  readonly kind: "plan-changed";
  // The whole new document; the tab takes the changed <section data-sketch-page> elements out of it with DOMParser.
  readonly html: string;
  readonly changes: readonly LivePageChange[];
}

// Sent instead of plan-changed when the number of pages changed: the tab reloads and keeps its #N.
export interface LivePlanReshaped {
  readonly kind: "plan-reshaped";
}

// Sent once to a tab right after it connects, so a reload keeps every pin.
export interface LiveCommentsSoFar {
  readonly kind: "comments-so-far";
  readonly comments: readonly LiveComment[];
}

export type LiveMessageToPage =
  | LiveCommentSaved
  | LiveCommentStatusChanged
  | LiveCursorMoved
  | LivePlanChanged
  | LivePlanReshaped
  | LiveCommentsSoFar;

// Server -> Claude, on the /agent socket. Each frame is one Monitor notification.
export interface LiveCommentForAgent {
  readonly kind: "comment";
  readonly commentId: number;
  readonly page: number;
  readonly pageTitle: string;
  readonly part: string | null;
  readonly words: string;
}

export interface LivePlanBroken {
  readonly kind: "plan-error";
  readonly message: string;
}

export interface LiveDecisionForAgent {
  readonly kind: "decision";
  readonly decision: Decision;
}

export type LiveMessageToAgent = LiveCommentForAgent | LivePlanBroken | LiveDecisionForAgent;

// Claude -> server: POST /cursor?token=<token> with this JSON body.
// With commentId only, the cursor goes to that comment's page and part, and the comment turns "working".
export interface LiveCursorRequest {
  readonly commentId: number | null;
  readonly page: number | null;
  readonly part: string | null;
  readonly say: string;
}
