import { describe, expect, it } from "vitest";
import type { SketchEdgeEnd, SketchScene } from "../contracts/sketchScene";
import { SKETCH_RECIPES } from "./sketchRecipes";

const RECIPES_PER_GROUP = 8;

const scenesOf = (scene: SketchScene): readonly SketchScene[] => [
  scene,
  ...(scene.panels ?? []).flatMap((panel) => scenesOf(panel.scene)),
];

const nodeIdsOf = (scene: SketchScene): readonly string[] => scene.nodes.map((node) => node.id);

const isStringEnd = (end: SketchEdgeEnd): end is string => typeof end === "string";

describe("SKETCH_RECIPES", () => {
  it("gives every group exactly 8 recipes", () => {
    const groupNames = new Set(SKETCH_RECIPES.map((recipe) => recipe.group));

    const groupNamesWithWrongCount = [...groupNames].filter(
      (groupName) =>
        SKETCH_RECIPES.filter((recipe) => recipe.group === groupName).length !== RECIPES_PER_GROUP,
    );

    expect(groupNamesWithWrongCount).toEqual([]);
  });

  it("gives every recipe a unique id", () => {
    const allIds = SKETCH_RECIPES.map((recipe) => recipe.id);

    const uniqueIds = new Set(allIds);

    expect(uniqueIds.size).toBe(allIds.length);
  });

  it("links every string edge end to a node in the same scene", () => {
    const brokenEnds = SKETCH_RECIPES.flatMap((recipe) =>
      scenesOf(recipe.scene).flatMap((scene) => {
        const nodeIds = nodeIdsOf(scene);
        const edges = scene.edges ?? [];
        return edges.flatMap((edge) =>
          [edge.from, edge.to]
            .filter(isStringEnd)
            .filter((end) => !nodeIds.includes(end))
            .map((end) => `${recipe.id} edge ${edge.id} -> ${end}`),
        );
      }),
    );

    expect(brokenEnds).toEqual([]);
  });

  it("links every note to a node or an edge in the same scene", () => {
    const brokenLinks = SKETCH_RECIPES.flatMap((recipe) =>
      scenesOf(recipe.scene).flatMap((scene) => {
        const targetIds = [...nodeIdsOf(scene), ...(scene.edges ?? []).map((edge) => edge.id)];
        const notes = scene.notes ?? [];
        return notes
          .filter(
            (note) => note.link !== undefined && !targetIds.includes(note.link.split("#")[0] ?? ""),
          )
          .map((note) => `${recipe.id} note "${note.words}" -> ${note.link}`);
      }),
    );

    expect(brokenLinks).toEqual([]);
  });
});
