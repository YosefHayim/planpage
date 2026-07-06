import { codeMark } from "../render/codeMark";

export interface DiffBlockProps {
  readonly file: string;
  readonly before: string;
  readonly after: string;
  /** Shiki language id (default "ts") for both panes. */
  readonly lang?: string;
}

/** Green/red before→after for one file or snippet. Not interactive — it shows an exact change. */
export const DiffBlock = ({ file, before, after, lang = "ts" }: DiffBlockProps) => (
  <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
    <div class="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-500 dark:border-slate-800">
      {file}
    </div>
    <div class="grid md:grid-cols-2">
      <pre class="code bg-rose-50 p-3 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
        {codeMark(before, lang)}
      </pre>
      <pre class="code bg-emerald-50 p-3 text-xs text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        {codeMark(after, lang)}
      </pre>
    </div>
  </div>
);
