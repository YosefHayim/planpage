import { SketchScene } from "../../components/SketchScene";
import type { SketchDecisionQuestion } from "../../contracts/sketchScene";

export interface SketchPlanDecisionProps {
  readonly decision: SketchDecisionQuestion;
}

export const SketchPlanDecision = ({ decision }: SketchPlanDecisionProps) => {
  const firstOption = decision.options[0];
  const hasNoOptions = firstOption === undefined;
  if (hasNoOptions) throw new Error("SketchPlan: a decision needs at least one option");

  const firstLetter = firstOption.letter;
  return (
    <section class="sketch-decision" data-sketch-decision="" aria-label="Your call">
      <p>{decision.question}</p>
      <div class="sketch-options">
        {decision.options.map((option, optionIndex) => {
          const isFirstOption = optionIndex === 0;
          return (
            <label key={option.letter} class="sketch-option">
              <input
                type="radio"
                name="sketch-choice"
                value={option.letter}
                defaultChecked={isFirstOption}
              />
              <strong>{`${option.letter}. ${option.title}`}</strong>
              <div class="sketch-option-frame">
                <SketchScene
                  scene={option.scene}
                  label={`Option ${option.letter}: ${option.title}`}
                />
              </div>
            </label>
          );
        })}
      </div>
      <textarea
        class="sketch-textarea"
        data-sketch-decision-notes=""
        rows={3}
        placeholder="What should change?"
        aria-label="Notes for the agent"
      />
      <div class="sketch-decision-actions">
        <button type="button" class="sketch-button sketch-button--solid" data-sketch-approve="">
          {`Approve ${firstLetter}`}
        </button>
        <button type="button" class="sketch-button" data-sketch-ask="">
          Ask for changes
        </button>
      </div>
      <p class="sketch-status" role="status" data-sketch-status="" />
    </section>
  );
};
