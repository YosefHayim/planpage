export interface ScoreDimension {
  readonly label: string;
  /** 0–100. Clamped and rounded before display. */
  readonly score: number;
  readonly note?: string;
}

export interface ScorecardProps {
  readonly dimensions: ReadonlyArray<ScoreDimension>;
  /** Optional headline score (0–100) shown as a big graded badge. */
  readonly overall?: number;
  readonly title?: string;
}

/**
 * A score-per-dimension panel — each dimension gets a graded bar (A–F colour by score) and an
 * optional note, with an optional headline `overall` badge. Renders a web-best-practices audit or a
 * grill-me-code-style-review verdict as one skimmable card. Pure — no client JS.
 */
export const Scorecard = ({ dimensions, overall, title }: ScorecardProps) => {
  if (dimensions.length === 0) throw new Error("Scorecard: dimensions[] is required and non-empty");
  const head = overall === undefined ? null : grade(overall);
  return (
    <div class="rounded-xl border border-slate-200 p-5 dark:border-slate-800">
      {title || head ? (
        <div class="mb-4 flex items-center gap-3">
          {title ? (
            <h3 class="font-semibold text-slate-900 text-sm dark:text-white">{title}</h3>
          ) : null}
          {head ? (
            <span
              class={`ml-auto inline-flex items-baseline gap-1 rounded-lg px-2.5 py-1 font-bold ${head.soft}`}
            >
              <span class="text-lg">{clamp(overall ?? 0)}</span>
              <span class="text-xs">/ 100 · {head.letter}</span>
            </span>
          ) : null}
        </div>
      ) : null}

      <div class="space-y-3">
        {dimensions.map((dim) => {
          const g = grade(dim.score);
          return (
            <div key={dim.label}>
              <div class="mb-1 flex items-baseline gap-2">
                <span class="font-medium text-slate-700 text-sm dark:text-slate-200">
                  {dim.label}
                </span>
                {dim.note ? <span class="text-slate-400 text-xs">{dim.note}</span> : null}
                <span class={`ml-auto font-semibold text-xs ${g.text}`}>
                  {clamp(dim.score)} · {g.letter}
                </span>
              </div>
              <div class="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  class={`score-bar h-full rounded-full ${g.bar}`}
                  style={`width:${clamp(dim.score)}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Round + clamp a raw score into the 0–100 display range. */
function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

interface Grade {
  readonly bar: string;
  readonly text: string;
  readonly soft: string;
  readonly letter: string;
}

/** Map a score to its A–F grade band — bar fill, text colour, soft badge, and letter. */
function grade(score: number): Grade {
  const s = clamp(score);
  if (s >= 90)
    return {
      bar: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      soft: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
      letter: "A",
    };
  if (s >= 75)
    return {
      bar: "bg-lime-500",
      text: "text-lime-600 dark:text-lime-400",
      soft: "bg-lime-500/15 text-lime-600 dark:text-lime-300",
      letter: "B",
    };
  if (s >= 60)
    return {
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      soft: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
      letter: "C",
    };
  if (s >= 40)
    return {
      bar: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      soft: "bg-orange-500/15 text-orange-600 dark:text-orange-300",
      letter: "D",
    };
  return {
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    soft: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
    letter: "F",
  };
}
