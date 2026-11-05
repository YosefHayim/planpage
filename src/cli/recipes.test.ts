import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SKETCH_RECIPES } from "../sketchRecipes/sketchRecipes";
import { recipesCommand } from "./recipes";
const BAD_USAGE_EXIT_CODE = 2;
const OK_EXIT_CODE = 0;

let writtenToStdout = "";
let writtenToStderr = "";

const originalIsTty = process.stdout.isTTY;

const setStdoutIsTty = (isTty: boolean) => {
  Object.defineProperty(process.stdout, "isTTY", { value: isTty, configurable: true });
};

beforeEach(() => {
  writtenToStdout = "";
  writtenToStderr = "";
  vi.spyOn(process.stdout, "write").mockImplementation((text: string | Uint8Array) => {
    writtenToStdout += text.toString();
    return true;
  });
  vi.spyOn(process.stderr, "write").mockImplementation((text: string | Uint8Array) => {
    writtenToStderr += text.toString();
    return true;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  setStdoutIsTty(originalIsTty);
});

describe("recipesCommand", () => {
  it("lists every recipe id, group and useFor as one JSON object with --json", () => {
    const exitCode = recipesCommand(undefined, { json: true });

    const listReply = JSON.parse(writtenToStdout) as { recipes: { id: string; group: string }[] };
    expect(exitCode).toBe(OK_EXIT_CODE);
    expect(listReply.recipes).toHaveLength(SKETCH_RECIPES.length);
    expect(listReply.recipes[0]).toMatchObject({ id: "flow", group: "flows" });
  });

  it("prints JSON when there is no TTY, even without --json", () => {
    setStdoutIsTty(false);

    recipesCommand(undefined, {});

    const listReply = JSON.parse(writtenToStdout) as { recipes: unknown[] };
    expect(listReply.recipes).toHaveLength(SKETCH_RECIPES.length);
  });

  it("prints one recipe as JSON when given its id", () => {
    const exitCode = recipesCommand("flow", {});

    const recipeReply = JSON.parse(writtenToStdout) as { id: string; scene: { nodes: unknown[] } };
    expect(exitCode).toBe(OK_EXIT_CODE);
    expect(recipeReply.id).toBe("flow");
    expect(recipeReply.scene.nodes.length).toBeGreaterThan(0);
  });

  it("returns exit code 2 and a stderr message for an unknown id", () => {
    const exitCode = recipesCommand("no-such-recipe", {});

    expect(exitCode).toBe(BAD_USAGE_EXIT_CODE);
    expect(writtenToStderr).toContain('unknown recipe "no-such-recipe"');
    expect(writtenToStdout).toBe("");
  });
});
