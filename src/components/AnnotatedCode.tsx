export interface Annotation {
  /** 1-based line number the note attaches to. */
  readonly line: number;
  readonly note: string;
}

export interface AnnotatedCodeProps {
  readonly code: string;
  readonly annotations: ReadonlyArray<Annotation>;
  readonly label?: string;
}

/** A code snippet with inline numbered rationale — ties a plan's reasoning to the exact lines. */
export const AnnotatedCode = ({ code, annotations, label }: AnnotatedCodeProps) => {
  const noteAt = new Map(annotations.map((a) => [a.line, a.note] as const));
  return (
    <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      {label ? (
        <div class="border-slate-100 border-b px-3 py-2 font-mono text-slate-500 text-xs dark:border-slate-800">
          {label}
        </div>
      ) : null}
      <div class="code space-y-0.5 bg-slate-900 p-4 text-xs leading-relaxed">
        {code.split("\n").map((ln, i) => renderLine(ln, i + 1, noteAt.get(i + 1)))}
      </div>
    </div>
  );
};

function renderLine(line: string, n: number, note: string | undefined) {
  return (
    <div key={`${n}·${line}`} class="flex gap-x-3">
      <span class="w-8 shrink-0 select-none text-right text-slate-600">{n}</span>
      <div class="min-w-0 flex-1">
        <code class="text-slate-100">{line || " "}</code>
        {note ? <div class="text-amber-400">↳ {note}</div> : null}
      </div>
    </div>
  );
}
