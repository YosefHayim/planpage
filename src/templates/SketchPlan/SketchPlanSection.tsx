import { SketchScene } from "../../components/SketchScene";
import type { SketchPlanPage } from "../../contracts/sketchScene";
import { SketchPlanCodeDrawer } from "./SketchPlanCodeDrawer";
import { SketchPlanDecision } from "./SketchPlanDecision";

export interface SketchPlanSectionProps {
  readonly page: SketchPlanPage;
}

export const SketchPlanSection = ({ page }: SketchPlanSectionProps) => {
  const hasSubtitle = page.subtitle !== undefined;
  const hasLegend = page.legend !== undefined;
  const toggle = page.toggle;
  const hasToggle = toggle !== undefined;
  const code = page.code;
  const hasCode = code !== undefined;
  const decision = page.decision;
  const hasDecision = decision !== undefined;
  const hasPicture = page.scene.nodes.length > 0;

  return (
    <section class="sketch-section" data-sketch-page="">
      <header class="sketch-head">
        <div>
          <h2 class="sketch-title" tabIndex={-1} data-sketch-title="">
            {page.title}
          </h2>
          {hasSubtitle && <p class="sketch-subtitle">{page.subtitle}</p>}
        </div>
        <div class="sketch-tools">
          <button
            type="button"
            class="sketch-button"
            data-sketch-notes-toggle=""
            aria-pressed="true"
          >
            Notes on
          </button>
          {hasCode && (
            <button type="button" class="sketch-button" data-sketch-code-toggle="">
              View code
            </button>
          )}
        </div>
      </header>
      {hasLegend && <p class="sketch-legend">{page.legend}</p>}
      {hasToggle && (
        <div class="sketch-tools" role="group" aria-label="Mode">
          {toggle.choices.map((choice) => {
            const isInitialChoice = choice.id === toggle.initial;
            const pressedValue = isInitialChoice ? "true" : "false";
            return (
              <button
                key={choice.id}
                type="button"
                class="sketch-button"
                data-sketch-mode={choice.id}
                aria-pressed={pressedValue}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      )}
      {hasCode && <SketchPlanCodeDrawer code={code} />}
      {hasPicture && <SketchScene scene={page.scene} label={page.title} />}
      {hasDecision && <SketchPlanDecision decision={decision} />}
    </section>
  );
};
