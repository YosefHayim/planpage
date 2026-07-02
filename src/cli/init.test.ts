import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { initCommand } from "./init";

const originalCwd = process.cwd();
let workdir = "";

beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), "planpage-init-"));
  process.chdir(workdir);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(workdir, { recursive: true, force: true });
});

describe("init", () => {
  it("scaffolds all three agent on-ramps by default", () => {
    initCommand({});
    expect(existsSync(join(".claude", "skills", "render-plan", "SKILL.md"))).toBe(true);
    expect(existsSync(join(".cursor", "rules", "planpage.mdc"))).toBe(true);
    expect(existsSync("AGENTS.md")).toBe(true);
  });

  it("narrows to a single agent via --agent", () => {
    initCommand({ agent: "cursor" });
    expect(existsSync(join(".cursor", "rules", "planpage.mdc"))).toBe(true);
    expect(existsSync("AGENTS.md")).toBe(false);
  });

  it("appends a delimited block into an existing AGENTS.md without clobbering it", () => {
    writeFileSync("AGENTS.md", "# AGENTS.md\n\nMy existing rules.\n");
    initCommand({ agent: "codex" });
    const agents = readFileSync("AGENTS.md", "utf8");
    expect(agents).toContain("My existing rules.");
    expect(agents).toContain("Rendering plans (planpage)");
  });

  it("skips an existing on-ramp unless --force", () => {
    const path = join(".cursor", "rules", "planpage.mdc");
    initCommand({ agent: "cursor" });
    writeFileSync(path, "hand-edited");
    initCommand({ agent: "cursor" });
    expect(readFileSync(path, "utf8")).toBe("hand-edited");
    initCommand({ agent: "cursor", force: true });
    expect(readFileSync(path, "utf8")).not.toBe("hand-edited");
  });

  it("rejects an unknown agent", () => {
    expect(() => initCommand({ agent: "vim" })).toThrow(/must be one of/);
  });
});
