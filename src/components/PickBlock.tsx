export interface PickBlockProps {
  /** Stable, meaningful id (e.g. "rule.function-form") — this is what comes back in flips/revisit. */
  readonly id: string;
  readonly rule: string;
  readonly chosen: string;
  readonly rejected: string;
  readonly why?: string;
  /** Enforcement tag, e.g. "[lint: noNestedTernary]" or "[taste]". */
  readonly tag?: string;
}

/**
 * A ✓ chosen / ✗ rejected pair — the result of one style pick. Flippable and revisit-able at
 * review time; both feed the decision contract via the stable `data-id`.
 */
export const PickBlock = ({ id, rule, chosen, rejected, why, tag }: PickBlockProps) => (
  <div
    class="pick grid gap-3 md:grid-cols-2"
    data-pick
    data-id={id}
    data-flipped="false"
    data-revisit="false"
  >
    <div class="chosen rounded-xl border border-emerald-600/50 p-3">
      <div class="mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
        ✓ {rule} — chosen
      </div>
      <pre class="code text-xs">
        <code>{chosen}</code>
      </pre>
    </div>
    <div class="rejected rounded-xl border border-rose-700/40 p-3 opacity-60">
      <div class="mb-2 text-xs font-semibold text-rose-500 dark:text-rose-300">✗ not this</div>
      <pre class="code text-xs">
        <code>{rejected}</code>
      </pre>
    </div>
    <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 md:col-span-2">
      <span>
        {why}
        {tag ? <span class="text-slate-500"> · {tag}</span> : null}
      </span>
      <button
        type="button"
        data-action="flip"
        data-target={id}
        class="ml-auto rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        flip
      </button>
      <button
        type="button"
        data-action="revisit"
        data-target={id}
        class="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        revisit
      </button>
    </div>
  </div>
);
