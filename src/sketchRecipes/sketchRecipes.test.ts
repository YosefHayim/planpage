import { describe, expect, it } from "vitest";
import type { SketchEdgeEnd, SketchScene } from "../contracts/sketchScene";
import { SKETCH_RECIPES } from "./sketchRecipes";

const EXPECTED_RECIPE_COUNT = 64;
const EXPECTED_RECIPES_PER_GROUP = 8;

const scenesOf = (scene: SketchScene): readonly SketchScene[] => [
  scene,
  ...(scene.panels ?? []).flatMap((panel) => scenesOf(panel.scene)),
];

const nodeIdsOf = (scene: SketchScene): readonly string[] => scene.nodes.map((node) => node.id);

const isStringEnd = (end: SketchEdgeEnd): end is string => typeof end === "string";

describe("SKETCH_RECIPES", () => {
  it("holds 64 recipes, 8 in each of the 8 groups", () => {
    const groupNames = new Set(SKETCH_RECIPES.map((recipe) => recipe.group));

    const countsPerGroup = [...groupNames].map(
      (groupName) => SKETCH_RECIPES.filter((recipe) => recipe.group === groupName).length,
    );

    expect(SKETCH_RECIPES).toHaveLength(EXPECTED_RECIPE_COUNT);
    expect(groupNames.size).toBe(8);
    expect(countsPerGroup).toEqual(Array(8).fill(EXPECTED_RECIPES_PER_GROUP));
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
          .filter((note) => note.link !== undefined && !targetIds.includes(note.link))
          .map((note) => `${recipe.id} note "${note.words}" -> ${note.link}`);
      }),
    );

    expect(brokenLinks).toEqual([]);
  });
});
