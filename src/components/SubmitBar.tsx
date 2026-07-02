export interface SubmitBarProps {
  readonly approveLabel?: string;
  readonly adjustLabel?: string;
}

/** The sticky Approve / Adjust / Copy bar + notes box. Wired by the client script via [data-action]. */
export const SubmitBar = ({ approveLabel = "Approve", adjustLabel = "Adjust" }: SubmitBarProps) => (
  <div
    id="sui-bar"
    class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90"
  >
    <div class="mx-auto flex max-w-5xl items-center gap-3">
      <input
        id="sui-notes"
        placeholder="Notes / what to adjust…"
        class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
      <button
        type="button"
        data-action="approve"
        class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        ✓ {approveLabel}
      </button>
      <button
        type="button"
        data-action="adjust"
        class="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500"
      >
        ✎ {adjustLabel}
      </button>
      <button
        type="button"
        data-action="copy"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Copy decision
      </button>
    </div>
    <pre
      id="sui-token"
      class="mx-auto mt-2 hidden max-w-5xl whitespace-pre-wrap break-all text-amber-500 text-xs"
    />
  </div>
);
