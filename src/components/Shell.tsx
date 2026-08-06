import type { ComponentChildren } from "preact";
import {
  CAROUSEL_SCRIPT,
  CLIENT_SCRIPT,
  CODE_EXPLORER_SCRIPT,
  DIAGRAM_SCRIPT,
  GALLERY_FILTER,
  QUESTION_POLL_SCRIPT,
  QUIZ_SCRIPT,
  THEME_TOGGLE,
  WHITEBOARD_SCRIPT,
} from "../render/clientScript";
import { FeedbackSidebar } from "./FeedbackSidebar";

/** Colour scheme for a rendered document. `auto` follows the OS `prefers-color-scheme`. */
export type Theme = "auto" | "light" | "dark";

export interface ShellProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly theme?: Theme;
  /** When true, includes the fixed feedback sidebar + the post-back client script. */
  readonly interactive?: boolean;
  /** When true, includes the gallery filter island (the Library's type-to-filter search). */
  readonly filterable?: boolean;
  /** When true, includes the CodeExplorer client island (file switching + before/after toggle). */
  readonly explorable?: boolean;
  /** When true, includes the QuestionPoll client script (selection, progress, submit). */
  readonly pollable?: boolean;
  /** When true, includes the Quiz grade island (grade · reveal · score · submit). */
  readonly quizzable?: boolean;
  /** When true, includes the Carousel island (slideshow autoplay + arrows/dots/swipe sync). */
  readonly carousel?: boolean;
  /** When true, includes the diagram-board island (edit source · drag nodes · queue for agent). */
  readonly diagramable?: boolean;
  /** When true, includes the freehand whiteboard island (rough pen · queue PNG for agent). */
  readonly sketchable?: boolean;
  readonly children: ComponentChildren;
}

const TAILWIND_CONFIG =
  "tailwind.config={darkMode:'class',theme:{extend:{fontFamily:{mono:['ui-monospace','SFMono-Regular','Menlo','monospace']}}}}";

const THEME_PREPAINT =
  "(function(){try{var t=document.documentElement.getAttribute('data-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark');}catch(e){}})();";

const MERMAID =
  "import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';mermaid.initialize({startOnLoad:true,theme:document.documentElement.classList.contains('dark')?'dark':'neutral',securityLevel:'loose',flowchart:{htmlLabels:true,curve:'basis'}});window.mermaid=mermaid;";

/** Rough.js — sketchy Excalidraw-like strokes for the whiteboard island. */
const ROUGH =
  "import('https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.esm.js').then(function(m){window.rough=m.default||m;}).catch(function(){});";

const STYLE =
  ".code{white-space:pre;overflow-x:auto;tab-size:2;max-width:100%}" +
  /* Soft-wrap for usage snippets / flashcard / carousel code so narrow cards stay readable */
  ".code-wrap{white-space:pre-wrap!important;overflow-wrap:anywhere;word-break:break-word;overflow-x:hidden}" +
  /* Shiki dual-theme: light colours are inline; swap to the --shiki-dark var under .dark */
  "html.dark [data-hl] span,html.dark [data-hl-line] span{color:var(--shiki-dark)!important}" +
  ".chip{font-size:.75rem;padding:.15em .7em;border-radius:999px;font-weight:600;white-space:nowrap}.mermaid{display:flex;justify-content:center}.pick.flipped .chosen{opacity:.4;filter:grayscale(1)}.pick.flipped .rejected{opacity:1;filter:none;outline:2px solid #34d399}.pick.revisit{outline:2px dashed #fbbf24;outline-offset:4px;border-radius:12px}.theme-ico .sun,.theme-ico .moon{transform-origin:center;transition:transform .5s cubic-bezier(.4,0,.2,1),opacity .35s ease}.theme-ico .moon{opacity:0;transform:rotate(-90deg) scale(.3)}.dark .theme-ico .sun{opacity:0;transform:rotate(90deg) scale(.3)}.dark .theme-ico .moon{opacity:1;transform:none}.spin{display:inline-block;animation:pp-spin 1s linear infinite}@keyframes pp-spin{to{transform:rotate(360deg)}}" +
  /* Sparkle animations */
  ".sparkle-1,.sparkle-2,.sparkle-3{animation:sparkle-pulse 2s ease-in-out infinite}.sparkle-2{animation-delay:.4s}.sparkle-3{animation-delay:.8s}@keyframes sparkle-pulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.5);opacity:1}}" +
  /* Question card states */
  ".question-card.collapsed{max-height:48px;overflow:hidden;transition:max-height .4s ease,opacity .3s ease}.question-card.answered{border-color:#34d399}" +
  /* Option states */
  "[data-option].selected{background:#ecfdf5;color:#064e3b;outline:2px solid #10b981}[data-option].faded{opacity:.4;transition:opacity .3s ease}" +
  /* Progress bar animation */
  "[data-progress-fill]{transition:width .5s cubic-bezier(.4,0,.2,1)}" +
  /* Sidebar rail */
  ".nav-rail{position:fixed;top:50%;left:.75rem;transform:translateY(-50%);z-index:20}.nav-dot{width:8px;height:8px;border-radius:50%;background:#94a3b8;transition:transform .2s,background .2s}.nav-dot.active{background:#f59e0b;transform:scale(1.4);animation:dot-pulse 1.5s ease-in-out infinite}@keyframes dot-pulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 5px rgba(245,158,11,0)}}" +
  /* Smooth hover lift */
  "[data-option]{transition:transform .15s ease,box-shadow .15s ease}[data-option]:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.08)}" +
  /* Flashcard flip — grid stack so both faces size the card (absolute-only collapsed width) */
  ".flip-card{perspective:1000px;width:100%}" +
  ".flip-inner{display:grid;width:100%;transition:transform .5s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d}" +
  ".flip-face{grid-area:1/1;width:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden}" +
  ".flip-back{transform:rotateY(180deg)}" +
  ".flip-card:has(input:checked) .flip-inner{transform:rotateY(180deg)}" +
  /* CodeExplorer drag-resize */
  "body.pp-resizing{cursor:col-resize!important;user-select:none}" +
  "body.pp-resizing iframe,body.pp-resizing pre{pointer-events:none}" +
  ".pp-split{touch-action:none}" +
  /* Diagram board */
  ".pp-diagram [data-diagram-stage] svg{max-width:100%;height:auto}" +
  ".pp-diagram g.node,.pp-diagram g.actor{touch-action:none}" +
  /* Whiteboard (excalidraw-like) */
  ".pp-wb-tool-on{background:#4f46e5!important;color:#fff!important}" +
  ".pp-wb-swatch-on{outline:2px solid #4f46e5;outline-offset:1px}" +
  ".pp-wb-sticky{position:absolute;min-width:7rem;max-width:11rem;min-height:4rem;padding:.5rem;border-radius:.25rem;background:#fef08a;color:#1e293b;font:12px/1.35 system-ui,sans-serif;box-shadow:2px 3px 0 rgba(15,23,42,.12);cursor:grab;outline:none}" +
  ".pp-wb-sticky:focus{ring:2px;box-shadow:0 0 0 2px #4f46e5}" +
  /* Carousel — marquee ticker + slideshow scrollbar hide + score bar */
  "@keyframes pp-marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}.marquee-track{display:flex;width:max-content;animation:pp-marquee 30s linear infinite}.marquee-rev{animation-direction:reverse}.marquee:hover .marquee-track{animation-play-state:paused}.no-scrollbar{scrollbar-width:none}.no-scrollbar::-webkit-scrollbar{display:none}.score-bar{transition:width .6s cubic-bezier(.4,0,.2,1)}" +
  /* Quiz option states */
  "[data-quiz-option].quiz-correct{border-color:#10b981;background:#ecfdf5;color:#064e3b}[data-quiz-option].quiz-correct .mark-correct{color:#059669}[data-quiz-option].quiz-wrong{border-color:#f43f5e;background:#fff1f2;color:#881337}[data-quiz-option].quiz-wrong .mark-wrong{color:#e11d48}html.dark [data-quiz-option].quiz-correct{background:rgba(16,185,129,.15);color:#a7f3d0}html.dark [data-quiz-option].quiz-wrong{background:rgba(244,63,94,.15);color:#fecdd3}.quiz-card.answered [data-quiz-option]{cursor:default}.quiz-card.answered{border-color:#34d399}" +
  /* Feedback sidebar reserves the right column so chrome never sits under it */
  "body.pp-has-sidebar{padding-right:min(100vw,22rem)}" +
  "html[data-pp-mode=annotate] main{cursor:crosshair}html[data-pp-mode=edit] main{cursor:text}" +
  ".pp-mode-on{background:#4f46e5;color:#fff!important}" +
  ".pp-shot-thumb{position:relative;width:3.25rem;height:3.25rem;border-radius:.5rem;overflow:hidden;border:1px solid #e2e8f0;background:#f1f5f9}" +
  "html.dark .pp-shot-thumb{border-color:#334155;background:#1e293b}" +
  ".pp-shot-thumb img{width:100%;height:100%;object-fit:cover;display:block}" +
  ".pp-shot-x{position:absolute;top:2px;right:2px;width:1.1rem;height:1.1rem;border:0;border-radius:999px;background:rgba(15,23,42,.75);color:#fff;font-size:11px;line-height:1;cursor:pointer;padding:0}" +
  ".pp-target-on{outline:2px solid #6366f1;outline-offset:3px;border-radius:6px}" +
  ".pp-annotated{box-shadow:inset 3px 0 0 #f59e0b}" +
  ".pp-edited{box-shadow:inset 3px 0 0 #10b981}" +
  ".pp-editing{outline:2px dashed #34d399;outline-offset:2px;border-radius:4px;min-width:1ch}" +
  ".pp-pill{border:1px solid #e2e8f0;border-radius:10px;padding:.55rem .65rem;background:#f8fafc;font-size:12px}" +
  "html.dark .pp-pill{border-color:#1e293b;background:#0f172a}" +
  ".pp-pill-top{display:flex;align-items:center;justify-content:space-between;gap:.5rem;margin-bottom:.2rem}" +
  ".pp-pill-kind{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6366f1}" +
  ".pp-pill[data-kind=edit] .pp-pill-kind{color:#059669}.pp-pill[data-kind=flip] .pp-pill-kind{color:#d97706}.pp-pill[data-kind=revisit] .pp-pill-kind{color:#ca8a04}.pp-pill[data-kind=diagram] .pp-pill-kind{color:#8b5cf6}.pp-pill[data-kind=sketch] .pp-pill-kind{color:#ec4899}" +
  ".pp-pill-x{border:0;background:transparent;color:#94a3b8;cursor:pointer;font-size:14px;line-height:1;padding:0 .15rem}" +
  ".pp-pill-label{font-weight:600;color:#0f172a}html.dark .pp-pill-label{color:#e2e8f0}" +
  ".pp-pill-img{display:block;width:100%;max-height:7rem;object-fit:cover;border-radius:.4rem;margin-top:.35rem;border:1px solid #e2e8f0}html.dark .pp-pill-img{border-color:#334155}" +
  ".pp-pill-diff{display:flex;flex-direction:column;gap:.15rem;margin-top:.25rem;color:#64748b}" +
  ".pp-pill[data-kind=shot] .pp-pill-kind{color:#0ea5e9}" +
  ".pp-from{text-decoration:line-through;opacity:.75}.pp-to{color:#059669}html.dark .pp-to{color:#6ee7b7}" +
  ".pp-arrow{display:none}.pp-pill-sel,.pp-pill-note{margin-top:.2rem;color:#64748b}.pp-pill-note{color:#334155}html.dark .pp-pill-note{color:#cbd5e1}" +
  ".pp-anno-card{position:fixed;z-index:40;width:min(18rem,calc(100vw - 1rem));border:1px solid #e2e8f0;border-radius:12px;background:#fff;box-shadow:0 12px 40px rgba(15,23,42,.18);padding:.75rem;font:12px/1.4 system-ui,sans-serif}" +
  "html.dark .pp-anno-card{border-color:#1e293b;background:#0f172a;color:#e2e8f0}" +
  ".pp-anno-head{font-weight:700;font-size:12px;margin-bottom:.25rem}.pp-anno-label{color:#64748b;margin-bottom:.35rem}" +
  ".pp-anno-sel{font-style:italic;color:#94a3b8;margin-bottom:.35rem}.pp-anno-input{width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:.4rem .5rem;font:12px/1.4 system-ui,sans-serif;resize:vertical;background:transparent;color:inherit}" +
  "html.dark .pp-anno-input{border-color:#334155}.pp-anno-actions{display:flex;justify-content:flex-end;gap:.4rem;margin-top:.5rem}" +
  ".pp-anno-btn{border:1px solid #cbd5e1;background:transparent;border-radius:8px;padding:.35rem .6rem;font-size:12px;cursor:pointer;color:inherit}" +
  ".pp-anno-primary{background:#4f46e5;border-color:#4f46e5;color:#fff}" +
  ".sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}" +
  /* Reduced motion */
  "@media (prefers-reduced-motion:reduce){.sparkle-1,.sparkle-2,.sparkle-3{animation:none}.question-card.collapsed{transition:none}.nav-dot.active{animation:none}[data-option]{transition:none}[data-option]:hover{transform:none}[data-progress-fill]{transition:none}.theme-ico .sun,.theme-ico .moon{transition:none}.spin{animation:none}.flip-inner{transition:none}.marquee-track{animation:none}.score-bar{transition:none}}";

/**
 * The fixed page skeleton every rendered document nests inside: Tailwind + Mermaid from
 * CDN, light/dark theme, sticky header, and (interactive only) the feedback sidebar. Skills
 * supply content and never restyle this shell — a fixed shell is what makes every report look alike.
 */
export const Shell = ({
  title = "planpage",
  subtitle,
  theme = "auto",
  interactive = false,
  filterable = false,
  explorable = false,
  pollable = false,
  quizzable = false,
  carousel = false,
  diagramable = false,
  sketchable = false,
  children,
}: ShellProps) => {
  const diagramsOn = diagramable || interactive;
  const sketchOn = sketchable || interactive;
  return (
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
      <body
        class={`bg-white font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-200 ${interactive ? "pp-has-sidebar" : ""}`}
      >
        <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div class="mx-auto flex max-w-5xl items-center gap-3">
            <span class="grid h-6 w-6 place-items-center rounded-md bg-indigo-600 text-xs font-bold text-white">
              PP
            </span>
            <div class="min-w-0">
              <h1 class="text-sm font-semibold text-slate-900 dark:text-white">{title}</h1>
              {subtitle ? <p class="text-slate-400 text-xs">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              data-action="theme"
              title="toggle light / dark"
              aria-label="Toggle colour theme"
              class="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
        <main class="mx-auto max-w-5xl space-y-8 px-6 py-8">{children}</main>
        {interactive ? <FeedbackSidebar /> : null}
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
        {pollable ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
          <script dangerouslySetInnerHTML={{ __html: QUESTION_POLL_SCRIPT }} />
        ) : null}
        {quizzable ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
          <script dangerouslySetInnerHTML={{ __html: QUIZ_SCRIPT }} />
        ) : null}
        {carousel ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
          <script dangerouslySetInnerHTML={{ __html: CAROUSEL_SCRIPT }} />
        ) : null}
        {explorable ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
          <script dangerouslySetInnerHTML={{ __html: CODE_EXPLORER_SCRIPT }} />
        ) : null}
        {diagramsOn ? (
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data
          <script dangerouslySetInnerHTML={{ __html: DIAGRAM_SCRIPT }} />
        ) : null}
        {sketchOn ? (
          <>
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra module, not skill data */}
            <script type="module" dangerouslySetInnerHTML={{ __html: ROUGH }} />
            {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Shell infra script, not skill data */}
            <script dangerouslySetInnerHTML={{ __html: WHITEBOARD_SCRIPT }} />
          </>
        ) : null}
      </body>
    </html>
  );
};
