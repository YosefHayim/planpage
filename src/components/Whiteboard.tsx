export interface WhiteboardProps {
  /** Stable id for agent feedback. */
  readonly id?: string;
  /** Header label. */
  readonly title?: string;
  /** Canvas height in px. Default 320. Clamped to a sane range. */
  readonly height?: number;
  /**
   * When true (default), tool chrome + “Queue for agent” are shown.
   * Needs Shell `sketchable` or `interactive` so the island runs.
   */
  readonly editable?: boolean;
}

const TOOLS = [
  ["pen", "Pen"],
  ["highlight", "Hi"],
  ["rect", "□"],
  ["ellipse", "○"],
  ["arrow", "→"],
  ["sticky", "Sticky"],
  ["eraser", "Eraser"],
] as const;

const COLORS = ["#1e293b", "#4f46e5", "#059669", "#d97706", "#e11d48", "#0ea5e9"] as const;

/** Clamp canvas height so zero / huge values never break layout. */
const clampHeight = (height: number): number => {
  if (!Number.isFinite(height)) return 320;
  return Math.min(1200, Math.max(120, Math.round(height)));
};

/**
 * Freehand sketch board with an Excalidraw-like rough pen — pen, highlighter, shapes,
 * sticky notes, eraser. Queues a PNG + note for the agent feedback batch.
 */
export const Whiteboard = ({
  id = "whiteboard",
  title = "Whiteboard",
  height = 320,
  editable = true,
}: WhiteboardProps) => {
  const h = clampHeight(height);
  return (
    <div
      class="pp-wb min-w-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
      data-whiteboard
      data-wb-id={id}
      data-wb-title={title}
      data-wb-editable={editable ? "true" : "false"}
      data-wb-height={h}
    >
      <div class="flex flex-wrap items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-2 py-2 dark:border-slate-800 dark:bg-slate-900/50">
        <span class="mr-auto px-1 font-medium text-slate-700 text-xs dark:text-slate-200">
          {title}
        </span>
        {editable ? (
          <>
            <div
              class="flex flex-wrap items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900"
              role="toolbar"
              aria-label="Draw tools"
            >
              {TOOLS.map(([tool, label]) => (
                <button
                  key={tool}
                  type="button"
                  data-wb-tool={tool}
                  aria-pressed={tool === "pen" ? "true" : "false"}
                  class={`pp-wb-tool rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800${
                    tool === "pen" ? " pp-wb-tool-on" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div class="flex items-center gap-1" role="group" aria-label="Stroke colour">
              {COLORS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  data-wb-color={c}
                  title={c}
                  aria-label={`Colour ${c}`}
                  aria-pressed={i === 0 ? "true" : "false"}
                  class={`pp-wb-swatch h-5 w-5 rounded-full border border-white shadow ring-1 ring-slate-200 dark:ring-slate-700${
                    i === 0 ? " pp-wb-swatch-on" : ""
                  }`}
                  style={`background:${c}`}
                />
              ))}
            </div>
            <button
              type="button"
              data-wb-undo
              class="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Undo
            </button>
            <button
              type="button"
              data-wb-clear
              class="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Clear
            </button>
          </>
        ) : null}
      </div>

      <div
        data-wb-stage
        class="relative w-full overflow-hidden bg-[#faf9f6] dark:bg-[#1a1a1a]"
        style={`height:${h}px`}
      >
        <canvas
          data-wb-canvas
          class="absolute inset-0 h-full w-full touch-none"
          aria-label={title}
        />
        <div data-wb-stickies class="pointer-events-none absolute inset-0" />
      </div>

      {editable ? (
        <div class="flex flex-wrap items-center gap-2 border-t border-slate-100 p-2 dark:border-slate-800">
          <input
            type="text"
            data-wb-note
            placeholder="What should the agent do with this sketch?"
            aria-label="Note for the agent"
            class="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <button
            type="button"
            data-action="wb-queue"
            class="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Queue sketch for agent
          </button>
          <p
            data-wb-status
            class="hidden w-full text-[11px] text-emerald-600 dark:text-emerald-400"
          />
        </div>
      ) : null}
    </div>
  );
};
