import type { Theme } from "../components/Shell";
import { highlight } from "../highlight/highlight";
import { render } from "../render/render";
import { TEMPLATES, type TemplateName } from "./index";

export interface RenderTemplateHtmlOptions {
  readonly theme?: Theme;
  /** Set when the page is served with a post-back; quiz and sketch-plan never add the interactive shell. */
  readonly serve?: boolean;
}

/** The HTML `planpage render <template>` writes: the template, its shell flags, then the highlight pass. */
export const renderTemplateHtml = async (
  template: TemplateName,
  data: unknown,
  options: RenderTemplateHtmlOptions,
): Promise<string> => {
  const factory = TEMPLATES[template];
  return highlight(
    render(factory(data), {
      theme: options.theme,
      // Quiz carries its own SubmitBar + owns submit via the quizzable island — never add the
      // interactive post-back too, or both would handle [data-action] and double-submit.
      interactive: Boolean(options.serve) && template !== "quiz" && template !== "sketch-plan",
      filterable: template === "library",
      explorable: template === "code-style-plan" || template === "library",
      pollable: template === "question-poll",
      quizzable: template === "quiz" || template === "library",
      carousel: template === "library",
      // interactive plans also get diagram boards via Shell (diagramable || interactive)
      diagramable: template === "library",
      hasSketchScenes:
        template === "sketch-plan" || template === "library" || template === "sketch-kit",
    }),
  );
};
