/** One tile in a Storyboard grid — an image with optional caption and display index. */
export interface StoryboardFrame {
  readonly src: string;
  readonly caption?: string;
  /** Display index (defaults to 1-based position in `frames`). */
  readonly index?: number;
}

export interface StoryboardProps {
  /** Stable id (e.g. "storyboard.trailer-keyframes") — participates in decision post-back. */
  readonly dataId: string;
  /**
   * Column count on wide viewports (1–6). Default 3. The grid reflows down on narrower
   * widths so tiles stay readable on any screen.
   */
  readonly columns?: number;
  readonly frames: ReadonlyArray<StoryboardFrame>;
}

/** Fixed Tailwind class strings so CDN JIT can see every column variant. */
const COLUMN_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
};

/**
 * A single responsive image grid — storyboard keyframes, screenshot sets, design variations.
 * `columns` sets the wide-viewport column count; the layout reflows down on smaller screens.
 * Pure: no client JS.
 */
export const Storyboard = ({ dataId, columns = 3, frames }: StoryboardProps) => {
  if (!dataId) throw new Error("Storyboard: dataId is required");
  if (frames.length === 0) throw new Error("Storyboard: frames[] is required and non-empty");
  const gridClass = COLUMN_CLASS[columns];
  if (!gridClass) throw new Error("Storyboard: columns must be an integer from 1 to 6");

  return (
    <div
      class={`storyboard grid gap-3 ${gridClass}`}
      data-storyboard
      data-id={dataId}
      data-columns={columns}
    >
      {frames.map((frame, i) => {
        const n = frame.index ?? i + 1;
        return (
          <figure
            key={`${frame.src}-${n}`}
            class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            data-frame
            data-index={n}
          >
            <div class="relative aspect-video bg-slate-100 dark:bg-slate-800">
              <img
                src={frame.src}
                alt={frame.caption ?? `Frame ${n}`}
                class="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <span class="absolute top-2 left-2 rounded-md bg-slate-900/70 px-1.5 py-0.5 font-mono text-[10px] text-white backdrop-blur">
                {String(n).padStart(2, "0")}
              </span>
            </div>
            {frame.caption ? (
              <figcaption class="px-3 py-2 text-slate-600 text-xs dark:text-slate-300">
                {frame.caption}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
};
