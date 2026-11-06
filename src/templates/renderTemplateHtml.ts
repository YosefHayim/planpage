import type { Theme } from "../components/Shell";
import { highlight } from "../highlight/highlight";
import { render } from "../render/render";
import { TEMPLATES, type TemplateName } from "./index";

export interface TemplateRenderRequest {
  readonly theme?: Theme;
  readonly serve?: boolean;
}

export const renderTemplateHtml = async (
  template: TemplateName,
  templateInput: unknown,
  renderRequest: TemplateRenderRequest,
): Promise<string> => {
  const factory = TEMPLATES[template];
  const isServedPage = Boolean(renderRequest.serve);
  return highlight(
    render(factory(templateInput), {
      theme: renderRequest.theme,
      // Quiz carries its own SubmitBar + owns submit via the quizzable island — never add the
      // interactive post-back too, or both would handle [data-action] and double-submit.
      interactive: isServedPage && template !== "quiz" && template !== "sketch-plan",
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
