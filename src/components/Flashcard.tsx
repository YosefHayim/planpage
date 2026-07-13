import { codeMark } from "../render/codeMark";

export interface FlashcardProps {
  /** The prompt side — a term or question. */
  readonly front: string;
  /** The reveal side — the definition or answer. */
  readonly back: string;
  readonly code?: string;
  readonly codeLang?: string;
  /** A small category tag shown on the front (e.g. "runtime", "type"). */
  readonly label?: string;
}

/**
 * A flip card — front is a term/question, the back reveals the definition (+ optional code). Flips
 * on click via a pure-CSS `:has(input:checked)` rotate baked into the Shell (no client JS, no Shell
 * flag). The learn-side companion to QuizCard; renders grill-me-stack / teach glossary terms.
 */
export const Flashcard = ({ front, back, code, codeLang, label }: FlashcardProps) => {
  if (!front || !back) throw new Error("Flashcard: both `front` and `back` are required");
  return (
    <label class="flip-card block h-full min-h-40 cursor-pointer">
      <input type="checkbox" class="sr-only" aria-label={`Flip card: ${front}`} />
      <div class="flip-inner h-full min-h-40 w-full">
        <div class="flip-face flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
          {label ? (
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 text-xs uppercase tracking-wide dark:bg-slate-800 dark:text-slate-400">
              {label}
            </span>
          ) : null}
          <span class="font-semibold text-base text-slate-900 dark:text-white">{front}</span>
          <span class="mt-1 text-slate-400 text-xs">tap to flip ↻</span>
        </div>
        <div class="flip-face flip-back flex flex-col justify-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950/40">
          <p class="text-slate-700 text-sm dark:text-slate-200">{back}</p>
          {code ? (
            <pre class="code max-w-full overflow-x-auto rounded-lg bg-slate-100 p-2 text-slate-800 text-xs dark:bg-[#1e1e1e] dark:text-slate-100">
              {codeMark(code, codeLang ?? "ts")}
            </pre>
          ) : null}
        </div>
      </div>
    </label>
  );
};
