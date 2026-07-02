import type { ComponentChildren } from "preact";

export interface SectionCardProps {
  readonly title: string;
  /** Optional state chip, e.g. "create" · "validate ✓" · "drift" · "before → after". */
  readonly chip?: string;
  readonly children: ComponentChildren;
}

/** A titled section with an optional state chip. Everything else nests inside one of these. */
export const SectionCard = ({ title, chip, children }: SectionCardProps) => (
  <section class="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      {chip ? (
        <span class="chip bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">{chip}</span>
      ) : null}
    </div>
    {children}
  </section>
);
