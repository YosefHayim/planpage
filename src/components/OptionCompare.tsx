/** Where an option landed after weighing. Colours the card + verdict chip. */
export type Verdict = "chosen" | "rejected" | "maybe";

export interface CompareOption {
  readonly name: string;
  readonly pros: ReadonlyArray<string>;
  readonly cons: ReadonlyArray<string>;
  readonly verdict?: Verdict;
}

export interface OptionCompareProps {
  readonly options: ReadonlyArray<CompareOption>;
}

const VERDICT: Record<
  Verdict,
  { readonly card: string; readonly chip: string; readonly icon: string; readonly label: string }
> = {
  chosen: {
    card: "border-emerald-600/50 ring-1 ring-emerald-500/30",
    chip: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    icon: "✓",
    label: "Chosen",
  },
  rejected: {
    card: "border-rose-700/30 opacity-60",
    chip: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    icon: "✕",
    label: "Rejected",
  },
  maybe: {
    card: "border-amber-500/40",
    chip: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    icon: "~",
    label: "Maybe",
  },
};

/** N-way approach comparison — pros/cons side by side with a verdict. The PickBlock's big sibling. */
export const OptionCompare = ({ options }: OptionCompareProps) => (
  <div class="flex flex-wrap gap-3">
    {options.map((o) => {
      const v = o.verdict ? VERDICT[o.verdict] : null;
      return (
        <div
          key={o.name}
          class={`min-w-0 grow basis-52 rounded-xl border p-4 ${v ? v.card : "border-slate-200 dark:border-slate-800"}`}
        >
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="font-semibold text-slate-900 text-sm dark:text-white">{o.name}</span>
            {v ? (
              <span class={`chip inline-flex items-center gap-1 ${v.chip}`}>
                <span aria-hidden="true">{v.icon}</span>
                {v.label}
              </span>
            ) : null}
          </div>
          <ul class="space-y-1 text-xs">
            {o.pros.map((p) => (
              <li key={p} class="text-emerald-600 dark:text-emerald-300">
                + {p}
              </li>
            ))}
            {o.cons.map((c) => (
              <li key={c} class="text-rose-500 dark:text-rose-300">
                − {c}
              </li>
            ))}
          </ul>
        </div>
      );
    })}
  </div>
);
