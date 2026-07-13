import { QuizCard, type QuizCardProps } from "../../components/QuizCard";
import { SubmitBar } from "../../components/SubmitBar";

export interface QuizProps {
  readonly title: string;
  readonly questions: ReadonlyArray<QuizCardProps>;
  /** A one-line lead-in shown under the title. */
  readonly intro?: string;
}

/**
 * A graded quiz page — a running score, a progress bar, and QuizCards grouped by topic, each of
 * which reveals ✓/✗ + its explanation on answer. Carries its own SubmitBar so the score posts back
 * to the coaching agent (the `quizzable` island owns submit — it does not use the `interactive`
 * post-back, so there is no double handler). The test half of the teach/coach flow.
 */
export const Quiz = ({ title, questions, intro }: QuizProps) => {
  if (questions.length === 0) throw new Error("Quiz: questions[] is required and non-empty");
  const groups = groupQuestions(questions);
  return (
    <div class="relative space-y-6 pb-40">
      <div class="fixed inset-x-0 top-[57px] z-30 h-1 bg-slate-200 dark:bg-slate-800">
        <div
          class="h-full rounded-r bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500 ease-out"
          data-progress-fill
          style="width:0%"
        />
      </div>

      <div class="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <h2 class="font-semibold text-lg text-slate-900 dark:text-white">{title}</h2>
          <span class="ml-auto rounded-lg bg-emerald-500/15 px-3 py-1 font-semibold text-emerald-600 text-sm dark:text-emerald-300">
            Score <span data-quiz-score>0</span> / {questions.length}
          </span>
        </div>
        {intro ? <p class="mt-2 text-slate-500 text-sm dark:text-slate-400">{intro}</p> : null}
      </div>

      {groups.map(({ group, items }) => (
        <div key={group ?? "_ungrouped"} data-group={group ?? undefined} class="space-y-4">
          {group ? (
            <div class="flex items-center gap-3">
              <h3 class="font-bold text-slate-500 text-sm uppercase tracking-wide dark:text-slate-400">
                {group}
              </h3>
              <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
          ) : null}
          {items.map((q) => (
            <QuizCard key={q.id} {...q} />
          ))}
        </div>
      ))}

      <SubmitBar approveLabel="Submit answers" adjustLabel="Ask a follow-up" />
    </div>
  );
};

/** Groups questions by their `group` field, preserving first-appearance order. */
function groupQuestions(
  questions: ReadonlyArray<QuizCardProps>,
): ReadonlyArray<{ readonly group: string | null; readonly items: ReadonlyArray<QuizCardProps> }> {
  const groups: Array<{ group: string | null; items: QuizCardProps[] }> = [];
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
}
