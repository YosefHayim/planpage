import { codeMark } from "../render/codeMark";

export interface CodeBlockProps {
  /** Optional header, e.g. "Canonical example — src/orders/create-order.ts". */
  readonly label?: string;
  readonly code: string;
  /** Shiki language id (default "ts") — drives the syntax colours applied by the highlight pass. */
  readonly lang?: string;
}

/** A syntax-highlighted snippet, or the composed canonical-example block. */
export const CodeBlock = ({ label, code, lang = "ts" }: CodeBlockProps) => (
  <div class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
    {label ? (
      <div class="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-500 dark:border-slate-800">
        {label}
      </div>
    ) : null}
    <pre class="code bg-white p-4 text-xs leading-relaxed text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100">
      {codeMark(code, lang)}
    </pre>
  </div>
);
