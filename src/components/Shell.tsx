import type { ComponentChildren } from "preact";
import { CLIENT_SCRIPT, GALLERY_FILTER, THEME_TOGGLE } from "../render/clientScript";
import { SubmitBar } from "./SubmitBar";

/** Colour scheme for a rendered document. `auto` follows the OS `prefers-color-scheme`. */
export type Theme = "auto" | "light" | "dark";

export interface ShellProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly theme?: Theme;
  /** When true, includes the sticky submit-bar + the post-back client script. */
  readonly interactive?: boolean;
  /** When true, includes the gallery filter island (the Library's type-to-filter search). */
  readonly filterable?: boolean;
  readonly children: ComponentChildren;
}

const TAILWIND_CONFIG =
  "tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{mono:['ui-monospace','SFMono-Regular','Menlo','monospace']}}}}";

const THEME_PREPAINT =
  "(function(){try{var t=document.documentElement.getAttribute('data-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();";

const MERMAID =
  "import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';mermaid.initialize({startOnLoad:true,theme:document.documentElement.classList.contains('dark')?'dark':'neutral',securityLevel:'loose'});";

const STYLE =
  ".code{white-space:pre;overflow-x:auto;tab-size:2}.chip{font-size:.75rem;padding:.15em .7em;border-radius:999px;font-weight:600;white-space:nowrap}.mermaid{display:flex;justify-content:center}.pick.flipped .chosen{opacity:.4;filter:grayscale(1)}.pick.flipped .rejected{opacity:1;filter:none;outline:2px solid #34d399}.pick.revisit{outline:2px dashed #fbbf24;outline-offset:4px;border-radius:12px}.theme-ico .sun,.theme-ico .moon{transform-origin:center;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .35s ease}.theme-ico .moon{opacity:0;transform:rotate(-90deg) scale(.3)}.dark .theme-ico .sun{opacity:0;transform:rotate(90deg) scale(.3)}.dark .theme-ico .moon{opacity:1;transform:none}.spin{display:inline-block;animation:sui-spin 1s linear infinite}@keyframes sui-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.theme-ico .sun,.theme-ico .moon{transition:none}.spin{animation:none}}";

/**
 * The fixed page skeleton every rendered document nests inside: Tailwind + Mermaid from
 * CDN, light/dark theme, sticky header, and (interactive only) the submit-bar. Skills supply
 * content and never restyle this shell — a fixed shell is what makes every report look alike.
 */
export const Shell = ({
  title = "planpage",
  subtitle,
  theme = "auto",
  interactive = false,
  filterable = false,
  children,
}: ShellProps) => (
  <html lang="en" data-theme={theme}>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
      <script src="https://cdn.tailwindcss.com" />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data */}
      <script dangerouslySetInnerHTML={{ __html: TAILWIND_CONFIG }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data */}
      <script dangerouslySetInnerHTML={{ __html: THEME_PREPAINT }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra style, not skill data */}
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
    </head>
    <body class="bg-white font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200">
      <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div class="mx-auto flex max-w-5xl items-center gap-3">
          <span class="grid h-6 w-6 place-items-center rounded-md bg-indigo-600 text-xs font-bold text-white">
            PP
          </span>
          <div>
            <h1 class="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>
            {subtitle ? <p class="text-slate-400 text-xs">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            data-action="theme"
            title="toggle light / dark"
            aria-label="Toggle colour theme"
            class="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="theme-ico h-4 w-4"
              aria-hidden="true"
            >
              <g class="sun">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </g>
              <path class="moon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </header>
      <main class={`mx-auto max-w-5xl space-y-8 px-6 py-8 ${interactive ? "pb-40" : ""}`}>
        {children}
      </main>
      {interactive ? <SubmitBar /> : null}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra module, not skill data */}
      <script type="module" dangerouslySetInnerHTML={{ __html: MERMAID }} />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data */}
      <script dangerouslySetInnerHTML={{ __html: THEME_TOGGLE }} />
      {filterable ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
        <script dangerouslySetInnerHTML={{ __html: GALLERY_FILTER }} />
      ) : null}
      {interactive ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
        <script dangerouslySetInnerHTML={{ __html: CLIENT_SCRIPT }} />
      ) : null}
    </body>
  </html>
);
