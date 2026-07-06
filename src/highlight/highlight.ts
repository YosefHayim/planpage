// The highlight pass — an edge transform, not part of the pure render. Shiki is async and
// loads TextMate grammars once; components stay pure/sync by emitting `data-hl` markers
// (see render/codeMark.ts), and this pass recovers each marker's source (JSX escapes only
// `&`, `<`, `"`, reversibly) and swaps its inner for Shiki's coloured spans. The output is
// fully self-contained: colours are inline styles (light) + `--shiki-dark` CSS variables
// (dark), so a rendered page needs no CDN and no client JS to show real VSCode colour.

import type { VNode } from "preact";
import type { Highlighter } from "shiki";
import { createHighlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { type RenderOptions, render } from "../render/render";

/** VSCode's own default themes — Shiki ships them verbatim. Dual-theme → light inline + dark var. */
const THEMES = { light: "light-plus", dark: "dark-plus" } as const;

/** Grammars loaded once. TS/JS-first, plus the languages a plan realistically shows. */
const LANGS = [
  "typescript",
  "tsx",
  "javascript",
  "jsx",
  "json",
  "jsonc",
  "bash",
  "markdown",
  "css",
  "html",
  "yaml",
  "python",
  "sql",
  "diff",
  "toml",
  "go",
  "rust",
] as const;

/** Friendly aliases → the canonical grammar id above. */
const ALIAS: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
  py: "python",
};

/** Our marker (render/codeMark.tsx) — `data-hl` (block) or `data-hl-line`, wrapping escaped source. */
const MARKER = /<code data-hl(-line)?="([^"]+)">([\s\S]*?)<\/code>/g;

/** Reverse JSX text escaping — preact-render-to-string only encodes `&`, `<`, `"` (amp last). */
const decodeEntities = (html: string): string =>
  html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

let cached: Promise<Highlighter> | null = null;

/** Lazily build (and memoise) the singleton highlighter with the JS engine — no WASM to bundle. */
const highlighter = (): Promise<Highlighter> => {
  cached ??= createHighlighter({
    themes: [THEMES.light, THEMES.dark],
    langs: [...LANGS],
    engine: createJavaScriptRegexEngine(),
  });
  return cached;
};

/**
 * Highlight every code marker in a rendered HTML string. Unmarked HTML passes through
 * untouched, and any block whose language is unknown keeps its plain escaped fallback —
 * so this pass never throws on skill-supplied code and degrades to readable monochrome.
 *
 * @param html - a rendered document (or fragment) that may contain `data-hl` markers
 * @returns the same HTML with marker inners replaced by Shiki's dual-theme spans
 */
export const highlight = async (html: string): Promise<string> => {
  const matches = [...html.matchAll(MARKER)];
  if (matches.length === 0) return html;
  const hl = await highlighter();
  const loaded = new Set(hl.getLoadedLanguages());
  let out = "";
  let cursor = 0;
  for (const match of matches) {
    const start = match.index ?? 0;
    out += html.slice(cursor, start);
    out += colour(hl, loaded, match) ?? match[0];
    cursor = start + match[0].length;
  }
  return out + html.slice(cursor);
};

/** Render a tree to a full document and highlight it in one await — the ergonomic edge helper. */
export const renderHighlighted = (content: VNode, options: RenderOptions = {}): Promise<string> =>
  highlight(render(content, options));

/** Replace one marker with Shiki's coloured `<code>` inner, or return null to keep the fallback. */
function colour(hl: Highlighter, loaded: Set<string>, match: RegExpMatchArray): string | null {
  const isLine = match[1] === "-line";
  const rawLang = match[2] ?? "";
  const lang = ALIAS[rawLang] ?? rawLang;
  if (!loaded.has(lang)) return null;
  const source = decodeEntities(match[3] ?? "");
  const full = hl.codeToHtml(source, { lang, themes: THEMES });
  const inner = full.slice(full.indexOf("<code>") + "<code>".length, full.lastIndexOf("</code>"));
  return isLine
    ? `<code data-hl-line="${lang}">${inner}</code>`
    : `<code data-hl="${lang}">${inner}</code>`;
}
