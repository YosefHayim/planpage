/**
 * Fixed right-hand conversation panel for interactive plans (lavish-style queue-then-send).
 * Users edit / annotate the plan first; staged feedback lists here; only **Send to Agent**
 * posts the batch. Wired by the post-back island via `#pp-bar`, `#pp-queue`, `#pp-notes`,
 * `#pp-shots`, and `[data-action]`.
 */
export const FeedbackSidebar = () => (
  <aside
    id="pp-bar"
    class="pp-sidebar fixed inset-y-0 right-0 z-40 flex w-[min(100vw,22rem)] flex-col border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950"
    aria-label="Feedback"
  >
    <div class="shrink-0 space-y-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
      <div>
        <div class="text-sm font-semibold text-slate-900 dark:text-white">Feedback</div>
        <p class="text-[11px] leading-snug text-slate-400">
          Annotate or edit the plan, attach screenshots, then send.
        </p>
      </div>
      <div
        class="flex w-full rounded-lg border border-slate-200 p-0.5 text-[11px] dark:border-slate-700"
        role="group"
        aria-label="Interaction mode"
      >
        <button
          type="button"
          data-action="mode"
          data-mode="annotate"
          class="pp-mode flex-1 rounded-md px-2 py-1.5 font-medium text-slate-600 dark:text-slate-300"
        >
          Annotate
        </button>
        <button
          type="button"
          data-action="mode"
          data-mode="edit"
          class="pp-mode flex-1 rounded-md px-2 py-1.5 font-medium text-slate-600 dark:text-slate-300"
        >
          Edit
        </button>
      </div>
    </div>

    <div id="pp-queue" class="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3" data-empty="true">
      <p class="pp-queue-empty px-1 text-xs text-slate-400">
        No feedback yet. Click the plan to annotate, switch to Edit to change text, or attach a
        screenshot below.
      </p>
    </div>

    <div class="shrink-0 space-y-2 border-t border-slate-200 p-3 dark:border-slate-800">
      <div id="pp-shots" class="flex flex-wrap gap-2" data-empty="true" />
      <div class="flex items-center gap-2">
        <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          <span aria-hidden="true">🖼</span>
          Screenshot
          <input
            id="pp-shot-input"
            type="file"
            accept="image/*"
            multiple
            class="sr-only"
            data-action="shot-pick"
          />
        </label>
        <span id="pp-shot-hint" class="text-[10px] text-slate-400">
          PNG/JPG · up to 5
        </span>
      </div>
      <label class="sr-only" for="pp-notes">
        Message to agent
      </label>
      <textarea
        id="pp-notes"
        rows={3}
        placeholder="Optional message to the agent…"
        class="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      />
      <div class="flex items-center gap-2">
        <button
          type="button"
          data-action="send"
          class="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Send to Agent
        </button>
        <button
          type="button"
          data-action="copy"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          title="Copy feedback JSON"
        >
          Copy
        </button>
      </div>
      <p id="pp-status" class="hidden text-xs font-medium text-emerald-500" />
      <pre
        id="pp-token"
        class="mt-1 hidden max-h-24 overflow-auto whitespace-pre-wrap break-all text-amber-500 text-[10px]"
      />
    </div>
  </aside>
);
