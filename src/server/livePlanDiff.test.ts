import { describe, expect, it } from "vitest";
import type { SketchPlanPage, SketchScene } from "../contracts/sketchScene";
import { type LivePlanData, findPlanDifference } from "./livePlanDiff";

const sceneWithBox = (boxWords: string, boxId = "box"): SketchScene => ({
  width: 100,
  height: 100,
  nodes: [{ id: boxId, kind: "box", x: 0, y: 0, w: 50, h: 50, words: boxWords }],
  edges: [],
});

const pageWithBox = (title: string, boxWords: string): SketchPlanPage => ({
  nav: title,
  title,
  scene: sceneWithBox(boxWords),
});

const planWithPages = (pages: readonly SketchPlanPage[]): LivePlanData => ({
  title: "Plan",
  pages,
});

describe("findPlanDifference", () => {
  it("reports a reshape when the number of pages changes", () => {
    const previousPlan = planWithPages([pageWithBox("One", "a")]);
    const nextPlan = planWithPages([pageWithBox("One", "a"), pageWithBox("Two", "b")]);

    const difference = findPlanDifference(previousPlan, nextPlan);

    expect(difference).toEqual({ kind: "reshaped" });
  });

  it("lists only the page and the part that changed", () => {
    const previousPlan = planWithPages([pageWithBox("One", "a"), pageWithBox("Two", "b")]);
    const nextPlan = planWithPages([pageWithBox("One", "a"), pageWithBox("Two", "changed")]);

    const difference = findPlanDifference(previousPlan, nextPlan);

    expect(difference).toEqual({
      kind: "changed",
      changes: [{ page: 2, pageTitle: "Two", changedParts: ["box"] }],
    });
  });

  it("lists a changed part of a decision option scene under its page", () => {
    const pageWithOptions = (choiceWords: string): SketchPlanPage => ({
      nav: "Pick",
      title: "Pick",
      scene: sceneWithBox("fixed"),
      decision: {
        question: "Which one?",
        options: [{ letter: "A", title: "First", scene: sceneWithBox(choiceWords, "choiceBox") }],
      },
    });
    const previousPlan = planWithPages([pageWithOptions("old")]);
    const nextPlan = planWithPages([pageWithOptions("new")]);

    const difference = findPlanDifference(previousPlan, nextPlan);

    expect(difference).toEqual({
      kind: "changed",
      changes: [{ page: 1, pageTitle: "Pick", changedParts: ["choiceBox"] }],
    });
  });

  it("returns no page changes when the plans are the same", () => {
    const plan = planWithPages([pageWithBox("One", "a")]);

    const difference = findPlanDifference(plan, plan);

    expect(difference).toEqual({ kind: "changed", changes: [] });
  });
});
