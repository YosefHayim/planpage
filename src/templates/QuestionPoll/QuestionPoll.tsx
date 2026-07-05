import { QuestionCard, type QuestionCardProps } from "../../components/QuestionCard";

/** Layout mode for questions on the page. `stack` = vertical list, `grid-N` = N columns. */
export type QuestionLayout = "stack" | "grid-2" | "grid-3" | "grid-4" | "grid-5";

export interface QuestionPollProps {
  readonly title: string;
  readonly questions: ReadonlyArray<QuestionCardProps>;
  /** Controls the question layout: stack (default, one below the other) or grid-N for columns. */
  readonly layout?: QuestionLayout;
}

/** Groups questions by their `group` field, preserving first-appearance order. */
const groupQuestions = (
  questions: ReadonlyArray<QuestionCardProps>,
): ReadonlyArray<{ group: string | null; items: ReadonlyArray<QuestionCardProps> }> => {
  const groups: Array<{ group: string | null; items: QuestionCardProps[] }> = [];
  const seen = new Map<string | null, number>();

  for (const q of questions) {
    const key = q.group ?? null;
    const idx = seen.get(key);
    if (idx !== undefined && groups[idx]) {
      groups[idx].items.push(q);
    } else {
      seen.set(key, groups.length);
      groups.push({ group: key, items: [q] });
    }
  }
  return groups;
};

const LAYOUT_CLASS: Record<QuestionLayout, string> = {
  stack: "space-y-4",
  "grid-2": "grid grid-cols-1 gap-4 md:grid-cols-2",
  "grid-3": "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
  "grid-4": "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
  "grid-5": "grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5",
};

/**
 * An interactive quiz/poll page — multiple-choice questions with auto-advance, a floating
 * sidebar rail, progress bar, and the full decision post-back loop. The template the
 * `grill-me-code-style` skill uses to collect style picks in the browser.
 */
export const QuestionPoll = ({ title, questions, layout = "stack" }: QuestionPollProps) => {
  if (questions.length === 0)
    throw new Error("QuestionPoll: questions[] is required and non-empty");

  const groups = groupQuestions(questions);

  return (
    <div class="relative">
      {/* Thin amber progress bar */}
      <div
        class="fixed inset-x-0 top-[57px] z-30 h-1 bg-slate-200 dark:bg-slate-800"
        data-progress-bar
      >
        <div
          class="h-full rounded-r bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 ease-out"
          data-progress-fill
          style="width:0%"
        />
      </div>

      {/* Floating left sidebar rail */}
      <nav
        class="nav-rail fixed left-2 top-1/2 z-20 -translate-y-1/2 flex flex-col gap-1.5 rounded-full bg-white/80 p-1.5 shadow-sm backdrop-blur transition-all duration-200 dark:bg-slate-900/80"
        aria-label="Question navigation"
      >
        {questions.map((q, i) => {
          const isGroupStart = i === 0 || questions[i - 1]?.group !== q.group;
          return (
            <div key={q.id}>
              {isGroupStart && i !== 0 ? (
                <div class="my-1 h-px bg-slate-200 dark:bg-slate-700" />
              ) : null}
              <button
                type="button"
                data-nav={q.id}
                data-nav-index={i}
                title={q.text}
                aria-label={`Jump to: ${q.text}`}
                class="nav-dot group relative flex h-3 w-3 items-center justify-center rounded-full bg-slate-300 transition-all duration-200 hover:scale-125 hover:bg-amber-400 dark:bg-slate-600 dark:hover:bg-amber-500"
              >
                <span class="pointer-events-none absolute left-5 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-slate-200 dark:text-slate-800">
                  {q.text.length > 30 ? `${q.text.slice(0, 30)}…` : q.text}
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Questions content */}
      <div class="space-y-6 pl-8" data-questions-container>
        {groups.map(({ group, items }) => (
          <div key={group ?? "_ungrouped"} data-group={group ?? undefined}>
            {group ? (
              <div class="mb-4 flex items-center gap-3">
                <h2 class="text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {group}
                </h2>
                <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
            ) : null}
            <div class={LAYOUT_CLASS[layout]}>
              {items.map((q) => (
                <QuestionCard key={q.id} {...q} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
