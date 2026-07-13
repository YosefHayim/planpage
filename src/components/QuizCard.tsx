import { codeMark } from "../render/codeMark";

export interface QuizOption {
  readonly id: string;
  readonly label: string;
  /** Exactly one option per question must set this. The grade island reveals it on answer. */
  readonly correct?: boolean;
  readonly code?: string;
  readonly codeLang?: string;
}

export interface QuizCardProps {
  readonly id: string;
  readonly question: string;
  readonly options: ReadonlyArray<QuizOption>;
  /** Shown after the reader answers — the teaching moment (why the right answer is right). */
  readonly explanation?: string;
  /** Optional section this question belongs to — the Quiz template groups by it. */
  readonly group?: string;
}

/** Inline ✓ / ✗ badge revealed on the picked + correct options once the card is answered. */
const Mark = ({ kind }: { readonly kind: "correct" | "wrong" }) => (
  <svg
    class={`mark-icon mark-${kind} hidden h-4 w-4`}
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    {kind === "correct" ? (
      <path
        fill-rule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L7 12.586l7.293-7.293a1 1 0 011.414 0z"
        clip-rule="evenodd"
      />
    ) : (
      <path
        fill-rule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    )}
  </svg>
);

/** Answer keys A · B · C · D … drawn beside each option. */
const LETTERS: ReadonlyArray<string> = ["A", "B", "C", "D", "E", "F", "G", "H"];

/**
 * A graded multiple-choice question — one option is `correct`, the rest are distractors. Renders
 * the neutral (unanswered) DOM; all grading (reveal ✓/✗, colour the picked + correct options,
 * unhide the explanation, lock the card) is done by the client-side QUIZ_SCRIPT. The teach/coach
 * counterpart to the preference-only QuestionCard.
 */
export const QuizCard = ({ id, question, options, explanation, group }: QuizCardProps) => {
  if (options.length === 0)
    throw new Error(`QuizCard "${id}": options[] is required and non-empty`);
  const correctCount = options.filter((opt) => opt.correct).length;
  if (correctCount !== 1)
    throw new Error(
      `QuizCard "${id}": exactly one option must be { correct: true } (found ${correctCount})`,
    );

  return (
    <div
      class="quiz-card rounded-xl border border-slate-200 p-5 transition-colors duration-300 dark:border-slate-800"
      data-quiz-card
      data-id={id}
      data-group={group ?? undefined}
    >
      <h3 class="quiz-question mb-4 text-base font-semibold text-slate-900 dark:text-white">
        {question}
      </h3>

      <div class="flex flex-wrap gap-3" role="radiogroup" aria-label={question}>
        {options.map((opt, i) => (
          <div
            key={opt.id}
            data-quiz-option
            data-id={opt.id}
            data-correct={opt.correct ? "true" : "false"}
            role="radio"
            aria-checked="false"
            aria-label={opt.label}
            tabIndex={i === 0 ? 0 : -1}
            class={`relative min-w-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 ${
              opt.code ? "grow basis-64" : "grow basis-44"
            }`}
          >
            <div class="flex items-center gap-2">
              <span class="quiz-key grid h-6 w-6 shrink-0 place-items-center rounded-md border border-slate-300 text-xs font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-400">
                {LETTERS[i] ?? "•"}
              </span>
              <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {opt.label}
              </span>
              <span class="ml-auto flex items-center">
                <Mark kind="correct" />
                <Mark kind="wrong" />
              </span>
            </div>
            {opt.code ? (
              <pre class="code mt-2 max-w-full overflow-x-auto rounded-lg bg-slate-100 p-2 text-xs text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100">
                {codeMark(opt.code, opt.codeLang ?? "ts")}
              </pre>
            ) : null}
          </div>
        ))}
      </div>

      {/* Teaching reveal — unhidden by the grade island once answered. */}
      <div
        class="quiz-explanation mt-4 hidden gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm"
        data-explanation
      >
        <span class="text-lg leading-none text-emerald-500" aria-hidden="true">
          ✓
        </span>
        <div class="text-slate-600 dark:text-slate-300">
          {explanation ?? "Correct answer highlighted above."}
        </div>
      </div>
    </div>
  );
};
