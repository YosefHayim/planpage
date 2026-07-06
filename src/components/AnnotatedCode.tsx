import { codeMark } from "../render/codeMark";

export interface Annotation {
  /** 1-based line number the note attaches to. */
  readonly line: number;
  readonly note: string;
}

export interface AnnotatedCodeProps {
  readonly code: string;
  readonly annotations: ReadonlyArray<Annotation>;
  readonly label?: string;
  /** Shiki language id (default "ts") — each line is highlighted in isolation. */
  readonly lang?: string;
}

/** A code snippet with inline numbered rationale — ties a plan's reasoning to the exact lines. */
export const AnnotatedCode = ({ code, annotations, label, lang = "ts" }: AnnotatedCodeProps) => {
  const noteAt = new Map(annotations.map((a) => [a.line, a.note] as const));
  return (
    <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      {label ? (
        <div class="border-slate-100 border-b px-3 py-2 font-mono text-slate-500 text-xs dark:border-slate-800">
          {label}
        </div>
      ) : null}
      <div class="code space-y-0.5 bg-white p-4 text-xs leading-relaxed text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100">
        {code.split("\n").map((ln, i) => renderLine(ln, i + 1, noteAt.get(i + 1), lang))}
      </div>
    </div>
  );
};

function renderLine(line: string, n: number, note: string | undefined, lang: string) {
  return (
    <div key={`${n}·${line}`} class="flex gap-x-3">
      <span class="w-8 shrink-0 select-none text-right text-slate-400 dark:text-slate-600">
        {n}
      </span>
      <div class="min-w-0 flex-1">
        {codeMark(line || " ", lang, true)}
        {note ? <div class="text-amber-600 dark:text-amber-400">↳ {note}</div> : null}
      </div>
    </div>
  );
}
