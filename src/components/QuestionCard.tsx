import { codeMark } from "../render/codeMark";

export interface QuestionOption {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly code?: string;
  readonly codeLang?: string;
  readonly recommended?: boolean;
}

export interface QuestionCardProps {
  readonly id: string;
  readonly text: string;
  readonly group?: string;
  readonly options: ReadonlyArray<QuestionOption>;
  /** When true, the "Other" escape hatch renders as a full dashed card in the grid instead of a link. */
  readonly expandOther?: boolean;
  /** Optional Mermaid diagram source — renders above the options as an architecture/flow context. */
  readonly diagram?: string;
}

/** Inline SVG sparkle star — tiny, used 3× around the "Recommended" badge. */
const Sparkle = ({ cls }: { readonly cls: string }) => (
  <svg class={`absolute h-3 w-3 ${cls}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0l3.09 6.26L22 7.27l-5 4.87L18.18 19 12 15.77 5.82 19 7 12.14l-5-4.87 6.91-1.01z" />
  </svg>
);

/**
 * A multiple-choice question card — options in a responsive grid, one optionally marked as
 * recommended (amber bg + sparkles). Renders the initial DOM structure; all interactivity
 * (selection, auto-advance, collapse) is handled by the client-side QUESTION_POLL_SCRIPT.
 */
export const QuestionCard = ({
  id,
  text,
  options,
  expandOther = false,
  diagram,
}: QuestionCardProps) => {
  if (options.length === 0)
    throw new Error(`QuestionCard "${id}": options[] is required and non-empty`);
  return (
    <div
      class="question-card rounded-xl border border-slate-200 p-5 transition-all duration-300 dark:border-slate-800"
      data-question
      data-id={id}
    >
      {/* Collapsed summary (hidden initially, shown when answered+collapsed) */}
      <div class="question-summary hidden cursor-pointer items-center gap-2 text-sm" data-summary>
        <span class="status-dot inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
        <span class="font-medium text-slate-700 dark:text-slate-200">{text}</span>
        <span class="ml-1 text-slate-400" data-chosen-label>
          →
        </span>
      </div>

      {/* Full question (visible initially) */}
      <div class="question-body" data-body>
        <div class="mb-4 flex items-center gap-2">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">{text}</h3>
          <button
            type="button"
            data-action="refine"
            data-target={id}
            title="Ask the agent to refine this question"
            aria-label="Refine this question"
            class="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600 dark:border-slate-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5" aria-hidden="true">
              <path d="M15.312 4.688a2.25 2.25 0 00-3.182 0L4.688 12.13a.75.75 0 00-.195.335l-1.125 4.5a.75.75 0 00.92.92l4.5-1.125a.75.75 0 00.335-.195l7.441-7.442a2.25 2.25 0 000-3.182z" />
            </svg>
          </button>
        </div>

        {/* Refine note input (hidden initially) */}
        <div class="mb-3 hidden" data-refine-input>
          <textarea
            placeholder="What's unclear? How should this question be rephrased?"
            class="w-full rounded-lg border border-amber-300 bg-amber-50/50 p-2 text-sm text-slate-700 placeholder:text-amber-400 dark:border-amber-700 dark:bg-amber-900/20 dark:text-slate-200"
            rows={2}
          />
        </div>

        {/* Optional Mermaid diagram — architecture/flow context for the question */}
        {diagram ? (
          <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <pre class="mermaid">{diagram}</pre>
          </div>
        ) : null}

        {/* Options grid — flex-wrap adapts to content; code-heavy options stretch wider */}
        <div class="flex flex-wrap gap-3" role="radiogroup" aria-label={text}>
          {options.map((opt, i) => (
            <div
              key={opt.id}
              data-option={opt.id}
              data-question-id={id}
              role="radio"
              aria-checked="false"
              aria-label={opt.label}
              tabIndex={i === 0 ? 0 : -1}
              class={`relative min-w-0 cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${
                opt.code ? "grow basis-64" : "grow basis-44"
              } ${
                opt.recommended
                  ? "border-amber-400/60 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-900/20"
                  : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              }`}
            >
              {opt.recommended ? (
                <div class="mb-2 flex items-center gap-1">
                  <span class="relative inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-800/40 dark:text-amber-300">
                    <Sparkle cls="sparkle-1 -left-2 -top-1 text-amber-400" />
                    <Sparkle cls="sparkle-2 -right-2 -top-0.5 text-amber-500" />
                    <Sparkle cls="sparkle-3 -right-1 -bottom-1.5 text-amber-400" />✨ Recommended
                  </span>
                </div>
              ) : null}
              <div class="mb-1 flex items-center gap-2">
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {opt.label}
                </span>
                {/* Checkmark (hidden until selected) */}
                <svg
                  class="check-icon hidden h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L7 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              {opt.description ? (
                <p class="mb-2 text-xs text-slate-500 dark:text-slate-400">{opt.description}</p>
              ) : null}
              {opt.code ? (
                <pre class="code mt-2 max-w-full overflow-x-auto rounded-lg bg-slate-100 p-2 text-xs text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100">
                  {codeMark(opt.code, opt.codeLang ?? "ts")}
                </pre>
              ) : null}
            </div>
          ))}

          {/* "Other" option — dashed card when expandOther, otherwise rendered below */}
          {expandOther ? (
            <div
              data-option="other"
              data-question-id={id}
              role="radio"
              aria-checked="false"
              aria-label="Other — provide your own answer"
              tabIndex={-1}
              class="relative min-w-0 grow basis-44 cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:border-slate-600 dark:hover:border-amber-500"
            >
              <span class="text-sm font-medium text-slate-500 dark:text-slate-400">+ Other</span>
            </div>
          ) : null}
        </div>

        {/* "+ Other / Refine" link (when not expandOther) */}
        {!expandOther ? (
          <button
            type="button"
            data-action="show-other"
            data-target={id}
            class="mt-3 text-xs text-slate-400 transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            + Other / Refine
          </button>
        ) : null}

        {/* Other input area (hidden initially) */}
        <div class="mt-3 hidden space-y-2" data-other-input>
          <textarea
            placeholder="Explain your preference..."
            class="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            rows={3}
            data-other-text
          />
          <button
            type="button"
            data-action="show-code"
            data-target={id}
            class="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400"
          >
            + Add code example
          </button>
          <div class="hidden" data-code-input>
            <textarea
              placeholder="// code example"
              class="w-full rounded-lg border border-slate-300 bg-slate-900 p-3 font-mono text-xs text-slate-200 placeholder:text-slate-500 dark:border-slate-700"
              rows={4}
              data-other-code
            />
          </div>
          {/* Drop zone */}
          <div
            data-dropzone
            data-target={id}
            class="flex min-h-[60px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-3 text-center text-xs text-slate-400 transition-colors hover:border-amber-400 hover:text-amber-500 dark:border-slate-600"
          >
            📎 Drop files/images here
          </div>
          <div class="flex flex-wrap gap-2" data-attachments />
        </div>
      </div>
    </div>
  );
};
