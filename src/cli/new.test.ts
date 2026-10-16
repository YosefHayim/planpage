import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { newCommand } from "./new";

const originalCwd = process.cwd();
let workspace = "";
beforeEach(() => {
  const prefix = join(tmpdir(), "planpage-new-");
  workspace = mkdtempSync(prefix);
  process.chdir(workspace);
});
afterEach(() => {
  process.chdir(originalCwd);
  rmSync(workspace, { recursive: true, force: true });
});

describe("template scaffolding", () => {
  it("preserves an existing template on a repeated command", () => {
    newCommand("review-plan");
    const componentPath = "src/templates/ReviewPlan/ReviewPlan.tsx";
    writeFileSync(componentPath, "custom component");
    expect(() => newCommand("review-plan")).toThrow(/already exists/);
    const component = readFileSync(componentPath, "utf8");
    expect(component).toBe("custom component");
  });

  it.each(["../outside", "", "x/y", "bad_name", "1-plan", "two--words", "Upper"])(
    "rejects invalid name %s before creating files",
    (name) => {
      expect(() => newCommand(name)).toThrow(/kebab-case/);
      const created = existsSync("src");
      expect(created).toBe(false);
    },
  );

  it("creates a component, escaping test and README", () => {
    newCommand("review-plan");
    const component = readFileSync("src/templates/ReviewPlan/ReviewPlan.tsx", "utf8");
    const test = readFileSync("src/templates/ReviewPlan/ReviewPlan.test.tsx", "utf8");
    expect(component).toContain("export const ReviewPlan");
    expect(test).toContain("toThrow");
    expect(test).toContain("&lt;img");
    const readmeExists = existsSync("src/templates/ReviewPlan/README.md");
    expect(readmeExists).toBe(true);
  });
});
