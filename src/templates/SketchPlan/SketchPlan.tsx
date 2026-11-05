import { Fragment } from "preact";
import type { SketchDecisionQuestion, SketchPlanPage } from "../../contracts/sketchScene";
import { SketchPlanSection } from "./SketchPlanSection";

export interface SketchPlanProps {
  readonly title: string;
  readonly pages: readonly SketchPlanPage[];
}

const buildKeyHint = (firstDecision: SketchDecisionQuestion | undefined): string => {
  const isThereNoDecision = firstDecision === undefined;
  if (isThereNoDecision) return "Left/Right: pages. Esc: back.";

  const options = firstDecision.options;
  const firstOption = options[0];
  const lastOption = options[options.length - 1];
  const hasNoOptions = firstOption === undefined || lastOption === undefined;
  if (hasNoOptions) throw new Error("SketchPlan: a decision needs at least one option");

  return `Left/Right: pages. 1-${options.length} or ${firstOption.letter}-${lastOption.letter}: pick. Enter: send. Esc: back.`;
};

/**
 * A plan as a set of hand-sketched pages with one picture each. Static HTML for the nav and
 * the pages; the sketch island draws the pictures and the pager shows one page at a time.
 * The "Your call" page posts the decision back through the serve post-back.
 */
export const SketchPlan = ({ title, pages }: SketchPlanProps) => {
  const isTitleMissing = !title;
  if (isTitleMissing) throw new Error("SketchPlan: title is required");

  const hasNoPages = pages.length === 0;
  if (hasNoPages) throw new Error("SketchPlan: pages[] is required and non-empty");

  const firstDecision = pages.find((page) => page.decision !== undefined)?.decision;
  const keyHint = buildKeyHint(firstDecision);

  return (
    <div class="sketch-page">
      <p class="sketch-plan-title">{title}</p>
      <nav class="sketch-nav" aria-label="Pages">
        {pages.map((page, pageIndex) => {
          const pageNumber = pageIndex + 1;
          const isFirstPage = pageNumber === 1;
          const stepState = isFirstPage ? "active" : "upcoming";
          const hasLineAfter = pageNumber < pages.length;
          return (
            <Fragment key={page.title}>
              <a
                class="sketch-nav-step"
                href={`#${pageNumber}`}
                title={page.nav}
                aria-label={`${pageNumber}. ${page.nav}`}
                data-sketch-nav-step
                data-state={stepState}
              >
                {pageNumber}
              </a>
              {hasLineAfter && (
                <span class="sketch-nav-line" data-sketch-nav-line data-state="upcoming" />
              )}
            </Fragment>
          );
        })}
      </nav>
      <p class="sketch-keys">{keyHint}</p>
      {pages.map((page) => (
        <SketchPlanSection key={page.title} page={page} />
      ))}
    </div>
  );
};
