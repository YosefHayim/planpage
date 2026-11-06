import type { LivePageChange } from "../contracts/live";
import type { SketchPlanPage, SketchScene } from "../contracts/sketchScene";

export interface LivePlanData {
  readonly title: string;
  readonly pages: readonly SketchPlanPage[];
}

export type LivePlanDifference =
  | { readonly kind: "reshaped" }
  | { readonly kind: "changed"; readonly changes: readonly LivePageChange[] };

interface DrawnPart {
  readonly key: string;
  readonly id: string;
  readonly snapshot: string;
}

const listPageScenes = (page: SketchPlanPage): readonly SketchScene[] => {
  const decisionScenes = page.decision?.options.map((option) => option.scene) ?? [];
  return [page.scene, ...decisionScenes];
};

// The scene index is part of the key, so two decision options can reuse the same node id.
const listDrawnParts = (scenes: readonly SketchScene[]): readonly DrawnPart[] =>
  scenes.flatMap((scene, sceneIndex) =>
    [...scene.nodes, ...(scene.edges ?? [])].map((part) => ({
      key: `${sceneIndex}:${part.id}`,
      id: part.id,
      snapshot: JSON.stringify(part),
    })),
  );

const listChangedPartIds = (previousPage: SketchPlanPage, nextPage: SketchPlanPage): string[] => {
  const previousJsonByKey = new Map(
    listDrawnParts(listPageScenes(previousPage)).map((part) => [part.key, part.snapshot] as const),
  );
  const changedParts = listDrawnParts(listPageScenes(nextPage)).filter(
    (part) => previousJsonByKey.get(part.key) !== part.snapshot,
  );
  return [...new Set(changedParts.map((part) => part.id))];
};

const createPageChange = (
  previousPage: SketchPlanPage,
  nextPage: SketchPlanPage,
  pageNumber: number,
): LivePageChange | null => {
  const isPageSame = JSON.stringify(previousPage) === JSON.stringify(nextPage);
  if (isPageSame) return null;

  return {
    page: pageNumber,
    pageTitle: nextPage.title,
    changedParts: listChangedPartIds(previousPage, nextPage),
  };
};

const isPresentChange = (change: LivePageChange | null): change is LivePageChange =>
  change !== null;

export const findPlanDifference = (
  previousPlan: LivePlanData,
  nextPlan: LivePlanData,
): LivePlanDifference => {
  const isPageCountSame = previousPlan.pages.length === nextPlan.pages.length;
  if (!isPageCountSame) return { kind: "reshaped" };

  const changes = nextPlan.pages
    .map((nextPage, pageIndex) => {
      const previousPage = previousPlan.pages[pageIndex];
      const hasNoPreviousPage = previousPage === undefined;
      if (hasNoPreviousPage) {
        throw new Error("findPlanDifference: equal page counts leave no page without a match");
      }

      return createPageChange(previousPage, nextPage, pageIndex + 1);
    })
    .filter(isPresentChange);
  return { kind: "changed", changes };
};
