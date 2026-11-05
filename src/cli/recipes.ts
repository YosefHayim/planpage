import type { SketchRecipe } from "../contracts/sketchScene";
import { SKETCH_RECIPES } from "../sketchRecipes/sketchRecipes";

export interface RecipesCommandOptions {
  readonly json?: boolean;
}

const EXIT_CODE_OK = 0;
const EXIT_CODE_BAD_USAGE = 2;

const findRecipeById = (recipeId: string): SketchRecipe | null =>
  SKETCH_RECIPES.find((recipe) => recipe.id === recipeId) ?? null;

const printRecipeJson = (recipe: SketchRecipe): number => {
  process.stdout.write(`${JSON.stringify(recipe, null, 2)}\n`);
  return EXIT_CODE_OK;
};

const reportUnknownRecipe = (recipeId: string): number => {
  process.stderr.write(
    `planpage: unknown recipe "${recipeId}". Run planpage recipes to list the ids.\n`,
  );
  return EXIT_CODE_BAD_USAGE;
};

const printRecipeListJson = (): number => {
  const recipeSummaries = SKETCH_RECIPES.map((recipe) => ({
    id: recipe.id,
    group: recipe.group,
    useFor: recipe.useFor,
  }));
  process.stdout.write(`${JSON.stringify({ recipes: recipeSummaries }, null, 2)}\n`);
  return EXIT_CODE_OK;
};

const printRecipeListLines = (): number => {
  const idColumnWidth = Math.max(...SKETCH_RECIPES.map((recipe) => recipe.id.length));
  const groupColumnWidth = Math.max(...SKETCH_RECIPES.map((recipe) => recipe.group.length));
  for (const recipe of SKETCH_RECIPES) {
    const line = `${recipe.id.padEnd(idColumnWidth)}  ${recipe.group.padEnd(groupColumnWidth)}  ${recipe.useFor}`;
    process.stdout.write(`${line}\n`);
  }
  return EXIT_CODE_OK;
};

/** Returns the exit code; the CLI entry file sets process.exitCode from it. */
export const recipesCommand = (
  recipeId: string | undefined,
  options: RecipesCommandOptions,
): number => {
  const isRecipeIdGiven = recipeId !== undefined;
  if (isRecipeIdGiven) {
    const recipe = findRecipeById(recipeId);
    const isRecipeMissing = recipe === null;
    if (isRecipeMissing) return reportUnknownRecipe(recipeId);
    return printRecipeJson(recipe);
  }

  const isJsonOutput = options.json === true || !process.stdout.isTTY;
  if (isJsonOutput) return printRecipeListJson();
  return printRecipeListLines();
};
