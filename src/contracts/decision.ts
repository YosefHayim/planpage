/**
 * One in-place text edit the user made on the plan before sending feedback.
 * `id` is a stable path the client assigns (or a component `data-id` when present).
 */
export interface FeedbackEdit {
  readonly id: string;
  /** Short human label for the sidebar + agent (section title, step text, …). */
  readonly label: string;
  readonly original: string;
  readonly edited: string;
}

/**
 * A note pinned to an element or selection. Queued in the sidebar; not sent until
 * the user hits **Send to Agent**.
 */
export interface FeedbackAnnotation {
  readonly id: string;
  readonly label: string;
  /** Selected text range when the user highlighted text, else the element summary. */
  readonly selectedText?: string;
  readonly note: string;
}

/**
 * A screenshot the user attached in the feedback sidebar. `dataUrl` is a browser
 * `data:image/...;base64,...` string the agent can write to disk or describe.
 */
export interface FeedbackScreenshot {
  readonly id: string;
  readonly name: string;
  readonly mime: string;
  /** data URL (base64). Keep under the client size cap (~1.5 MB each). */
  readonly dataUrl: string;
}

/**
 * A diagram the user edited, dragged nodes on, or asked questions about.
 * `edited` is the Mermaid source to use going forward when it differs from `original`.
 */
export interface FeedbackDiagram {
  readonly id: string;
  readonly title: string;
  readonly look: string;
  readonly original: string;
  readonly edited: string;
  /** True when the user dragged nodes on the rendered SVG (layout hint for the agent). */
  readonly nodesMoved: boolean;
  /** Free-text questions / notes about this diagram for the agent. */
  readonly questions: readonly string[];
}

/**
 * A freehand whiteboard sketch (Excalidraw-like) the user queued for the agent.
 * `pngDataUrl` is a `data:image/png;base64,…` export of the canvas.
 */
export interface FeedbackWhiteboard {
  readonly id: string;
  readonly title: string;
  readonly pngDataUrl: string;
  readonly strokeCount: number;
  readonly note?: string;
  readonly stickies?: ReadonlyArray<{
    readonly text: string;
    readonly x: number;
    readonly y: number;
  }>;
}

/**
 * The single feedback object a plan's post-back returns. The serve server writes it
 * verbatim; the calling skill reads it and acts. Interactive components carry a stable
 * `data-id` when they participate in flips/revisit; in-place edits and annotations use
 * client-assigned ids.
 *
 * There is no Approve / Adjust button — the user stages edits, annotations, screenshots,
 * diagrams, and whiteboards in the fixed sidebar, then sends one batch. `approved` stays
 * for older consumers and is `true` only when the queue is empty and notes are empty.
 *
 * Queue contract (all arrays always present on a client-built payload):
 * `edits` · `annotations` · `screenshots` · `diagrams` · `whiteboards` · `flips` · `revisit`.
 */
export interface Decision {
  /** `true` only when there is no staged feedback (empty queue + empty notes). */
  readonly approved: boolean;
  /** `data-id`s of picks the user flipped (chosen ↔ rejected). */
  readonly flips: readonly string[];
  /** `data-id`s marked "revisit" without a firm decision. */
  readonly revisit: readonly string[];
  /** Free text from the sidebar composer. */
  readonly notes: string;
  /** In-place content edits (original → edited). */
  readonly edits: readonly FeedbackEdit[];
  /** Element/selection annotations describing what is wrong. */
  readonly annotations: readonly FeedbackAnnotation[];
  /** User-attached screenshots (data URLs). */
  readonly screenshots: readonly FeedbackScreenshot[];
  /** Diagram source edits, node drags, and questions from diagram boards. */
  readonly diagrams: readonly FeedbackDiagram[];
  /** Freehand whiteboard sketches (PNG data URLs + notes). */
  readonly whiteboards: readonly FeedbackWhiteboard[];
}

/** Empty Decision shell — useful for tests and defensive defaults. Not written by serve. */
export const EMPTY_DECISION: Decision = {
  approved: true,
  flips: [],
  revisit: [],
  notes: "",
  edits: [],
  annotations: [],
  screenshots: [],
  diagrams: [],
  whiteboards: [],
};
