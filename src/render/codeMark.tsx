import type { VNode } from "preact";

/**
 * The one code marker every code component emits — a helper (like {@link raw}), not a component.
 * `render()` stays pure/sync: the marker holds the JSX-escaped source, readable with zero JS, and
 * the async {@link highlight} pass at the edge recovers that source (unescaping it) and swaps the
 * inner for Shiki's coloured spans. The `data-hl` attribute is kept so the dark-theme CSS can swap.
 *
 * @param code - the source string to display and highlight
 * @param lang - Shiki language id (default "ts")
 * @param line - single-line marker (`data-hl-line`, AnnotatedCode) vs whole-block (`data-hl`)
 * @returns a `<code>` element carrying a stable, regex-matchable marker attribute
 */
export const codeMark = (code: string, lang = "ts", line = false): VNode =>
  line ? <code data-hl-line={lang}>{code}</code> : <code data-hl={lang}>{code}</code>;
