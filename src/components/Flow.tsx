/** Mermaid "look" — classic boxes vs hand-drawn (excalidraw-like sketch). */
export type FlowLook = "classic" | "handDrawn";

/** Mermaid theme id passed via diagram init. */
export type FlowTheme = "default" | "neutral" | "dark" | "forest" | "base";

/** Built-in diagram kind used by the type switcher / gallery. */
export type FlowKind =
  | "flowchart"
  | "sequence"
  | "class"
  | "state"
  | "er"
  | "mindmap"
  | "pie"
  | "timeline";

export interface FlowProps {
  /** Raw Mermaid source (e.g. a `flowchart LR …`). Rendered as text — Mermaid reads it client-side. */
  readonly source: string;
  /**
   * Visual style. `handDrawn` uses Mermaid's sketch/excalidraw-like look (v11+).
   * Default `classic`.
   */
  readonly look?: FlowLook;
  /** Mermaid theme for this diagram only. Default follows the page (shell init). */
  readonly theme?: FlowTheme;
  /** Stable id for feedback (edits / questions). Defaults to a slug of title or "diagram". */
  readonly id?: string;
  /** Label shown in the board chrome + agent feedback. */
  readonly title?: string;
  /**
   * When true, shows source editor, type presets, look toggle, drag handles on nodes,
   * and queues changes/questions for the agent (needs Shell `diagramable` or `interactive`).
   */
  readonly editable?: boolean;
}

/** Sample Mermaid sources for each supported kind — gallery + type switcher. */
export const FLOW_PRESETS: Record<FlowKind, { readonly label: string; readonly source: string }> = {
  flowchart: {
    label: "Flowchart",
    source:
      "flowchart LR\n  plan[Plan] --> review[Review]\n  review --> ship[Ship]\n  review --> revise[Revise]\n  revise --> plan",
  },
  sequence: {
    label: "Sequence",
    source:
      "sequenceDiagram\n  participant U as User\n  participant A as Agent\n  participant P as planpage\n  U->>A: request plan\n  A->>P: render + serve\n  U->>P: edit / annotate / send\n  P-->>A: feedback JSON",
  },
  class: {
    label: "Class",
    source:
      "classDiagram\n  class Decision {\n    +boolean approved\n    +edits[]\n    +annotations[]\n    +diagrams[]\n  }\n  class Flow {\n    +source\n    +look\n    +editable\n  }\n  Decision <-- Flow : feedback",
  },
  state: {
    label: "State",
    source:
      "stateDiagram-v2\n  [*] --> Draft\n  Draft --> Review: serve\n  Review --> Draft: feedback\n  Review --> Done: approved\n  Done --> [*]",
  },
  er: {
    label: "ER",
    source:
      "erDiagram\n  PLAN ||--o{ STEP : has\n  PLAN ||--o{ RISK : has\n  STEP {\n    string label\n    string status\n  }\n  RISK {\n    string severity\n  }",
  },
  mindmap: {
    label: "Mindmap",
    source:
      "mindmap\n  root((planpage))\n    Render\n      Preact\n      Shiki\n    Feedback\n      Edit\n      Annotate\n      Diagrams\n    Serve\n      decision.json",
  },
  pie: {
    label: "Pie",
    source: 'pie title Work split\n  "Render" : 40\n  "Feedback UX" : 35\n  "CLI" : 25',
  },
  timeline: {
    label: "Timeline",
    source:
      "timeline\n  title Plan gate\n  section Write\n    Shape JSON : agent\n  section Review\n    Edit / annotate : human\n    Send to Agent : human\n  section Act\n    Apply batch : agent",
  },
};

export const FLOW_KINDS = Object.keys(FLOW_PRESETS) as ReadonlyArray<FlowKind>;

/**
 * Infer diagram kind from Mermaid source for the type-switcher default selection.
 * Returns undefined when the source does not match a known header.
 */
export function detectKind(source: string): FlowKind | undefined {
  const head = stripInit(source).trim();
  if (/^(flowchart|graph)\b/i.test(head)) return "flowchart";
  if (/^sequenceDiagram\b/i.test(head)) return "sequence";
  if (/^classDiagram\b/i.test(head)) return "class";
  if (/^stateDiagram(-v2)?\b/i.test(head)) return "state";
  if (/^erDiagram\b/i.test(head)) return "er";
  if (/^mindmap\b/i.test(head)) return "mindmap";
  if (/^pie\b/i.test(head)) return "pie";
  if (/^timeline\b/i.test(head)) return "timeline";
  return undefined;
}

/**
 * Drop a leading Mermaid `%%{init}%%` directive so look/theme can be re-applied cleanly
 * on re-render (look toggle, theme props, client Apply).
 */
export function stripInit(source: string): string {
  return source.replace(/^\s*%%\s*\{\s*init[\s\S]*?\}%%\s*/i, "").replace(/^\n+/, "");
}

/**
 * A Mermaid diagram board — flowchart, sequence, class, state, ER, mindmap, pie, timeline.
 * With `editable`, the user can switch kinds, toggle sketch look, edit source, drag nodes,
 * and queue questions/edits for the agent (Shell `diagramable` / `interactive` injects the island).
 */
export const Flow = ({
  source,
  look = "classic",
  theme,
  id,
  title,
  editable = false,
}: FlowProps) => {
  if (!source.trim()) throw new Error("Flow: source is required");
  const raw = source.trim();
  const body = withInit(raw, look, theme);
  const boardId = id ?? "diagram";
  const kind = detectKind(raw);
  return (
    <div
      class="pp-diagram min-w-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
      data-diagram-board
      data-diagram-id={boardId}
      data-diagram-editable={editable ? "true" : "false"}
      data-diagram-look={look}
      data-diagram-original-look={look}
      data-diagram-theme={theme ?? ""}
      data-diagram-title={title ?? boardId}
    >
      {/*
        Hidden textarea (not input) so multiline Mermaid source survives HTML parse.
        Preact escapes text content; the client island reads `.value` as the original.
      */}
      <textarea
        hidden
        readOnly
        aria-hidden="true"
        data-diagram-original-field
        class="hidden"
        tabIndex={-1}
      >
        {raw}
      </textarea>
      <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/50">
        {title ? (
          <span class="mr-auto font-medium text-slate-700 text-xs dark:text-slate-200">
            {title}
          </span>
        ) : (
          <span class="mr-auto font-medium text-slate-500 text-xs">Diagram</span>
        )}
        {editable ? (
          <>
            <label class="flex items-center gap-1 text-[11px] text-slate-500">
              <span class="sr-only">Diagram type</span>
              <select
                data-diagram-preset
                class="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-900"
              >
                {FLOW_KINDS.map((k) => (
                  <option key={k} value={k} selected={kind === k}>
                    {FLOW_PRESETS[k].label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              data-diagram-look-toggle
              class="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {look === "handDrawn" ? "Sketch" : "Classic"}
            </button>
            <button
              type="button"
              data-diagram-apply
              class="rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500"
            >
              Apply
            </button>
          </>
        ) : null}
      </div>

      <div
        data-diagram-stage
        class="relative min-h-36 overflow-auto bg-white p-4 dark:bg-slate-950"
      >
        <pre class="mermaid max-w-full" data-diagram-render>
          {body}
        </pre>
      </div>

      {editable ? (
        <div class="space-y-2 border-t border-slate-100 p-3 dark:border-slate-800">
          <label class="block text-[11px] font-medium text-slate-500" for={`pp-dsrc-${boardId}`}>
            Mermaid source — edit inline, then Apply (or blur). Drag nodes on the canvas.
          </label>
          <textarea
            id={`pp-dsrc-${boardId}`}
            data-diagram-source
            rows={6}
            class="w-full resize-y rounded-lg border border-slate-300 bg-white px-2.5 py-2 font-mono text-[11px] leading-relaxed text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {raw}
          </textarea>
          <div class="flex flex-wrap items-center gap-2">
            <input
              type="text"
              data-diagram-question
              placeholder="Question or note for the agent about this diagram…"
              class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <button
              type="button"
              data-action="diagram-queue"
              class="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-500/20 dark:text-amber-200"
            >
              Queue for agent
            </button>
          </div>
          <p
            data-diagram-status
            class="hidden text-[11px] text-emerald-600 dark:text-emerald-400"
          />
        </div>
      ) : null}
    </div>
  );
};

/**
 * Prepend a Mermaid `%%{init}%%` block when look/theme need per-diagram overrides.
 * When injecting, any prior leading init is stripped so look toggle / re-Apply is idempotent.
 * Author-only init (classic look, no theme prop) is left intact.
 */
export function withInit(source: string, look: FlowLook, theme: FlowTheme | undefined): string {
  const needsLook = look === "handDrawn";
  const needsTheme = Boolean(theme);
  if (!needsLook && !needsTheme) return source;
  const body = stripInit(source);
  const init: Record<string, unknown> = {};
  if (needsLook) init.look = "handDrawn";
  if (theme) init.theme = theme;
  return `%%{init: ${JSON.stringify(init)}}%%\n${body}`;
}
