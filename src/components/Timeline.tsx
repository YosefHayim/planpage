import { StatusChip, type StepStatus } from "./StatusChip";

export interface TimelineItem {
  readonly label: string;
  readonly status: StepStatus;
  readonly detail?: string;
}

export interface TimelineProps {
  readonly items: ReadonlyArray<TimelineItem>;
}

/** A vertical progress rail — phases/milestones with a status and optional detail. */
export const Timeline = ({ items }: TimelineProps) => (
  <ol class="relative space-y-4 border-slate-200 border-l pl-6 dark:border-slate-800">
    {items.map((it) => (
      <li key={it.label} class="relative">
        <span class="-left-2 absolute top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 dark:border-slate-950" />
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-medium text-slate-800 text-sm dark:text-slate-100">{it.label}</span>
          <StatusChip status={it.status} />
        </div>
        {it.detail ? (
          <p class="mt-1 text-slate-500 text-xs dark:text-slate-400">{it.detail}</p>
        ) : null}
      </li>
    ))}
  </ol>
);
