import type { SketchRecipe } from "../contracts/sketchScene";
import { DATA_RECIPES } from "./dataRecipes";
import { DECISION_RECIPES } from "./decisionRecipes";
import { FILE_RECIPES } from "./fileRecipes";
import { FLOW_RECIPES } from "./flowRecipes";
import { LOOK_RECIPES } from "./lookRecipes";
import { PRODUCT_RECIPES } from "./productRecipes";
import { SCREEN_RECIPES } from "./screenRecipes";
import { SYSTEM_RECIPES } from "./systemRecipes";
import { TIME_RECIPES } from "./timeRecipes";

export const SKETCH_RECIPES: readonly SketchRecipe[] = [
  ...FLOW_RECIPES,
  ...TIME_RECIPES,
  ...FILE_RECIPES,
  ...DATA_RECIPES,
  ...SYSTEM_RECIPES,
  ...SCREEN_RECIPES,
  ...DECISION_RECIPES,
  ...LOOK_RECIPES,
  ...PRODUCT_RECIPES,
];
