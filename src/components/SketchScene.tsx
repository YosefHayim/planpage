import type { SketchScene as SketchSceneData } from "../contracts/sketchScene";
import { raw } from "../render/raw";

export interface SketchSceneProps {
  readonly scene: SketchSceneData;
  readonly label: string;
}

/**
 * One hand-sketched picture. The scene travels as JSON in a script tag, which the sketch
 * island reads and draws. `<` is escaped so no scene text can close the script tag.
 */
export const SketchScene = ({ scene, label }: SketchSceneProps) => {
  const sceneJson = JSON.stringify(scene).replace(/</g, "\\u003c");
  const sceneScript = `<script type="application/json" data-sketch-scene>${sceneJson}</script>`;
  return (
    <div class="sketch-frame" role="img" aria-label={label}>
      {raw(sceneScript)}
    </div>
  );
};
