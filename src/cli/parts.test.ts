import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { partsCommand } from "./parts";

describe("partsCommand", () => {
  let writtenText: string;
  let errorText: string;

  beforeEach(() => {
    writtenText = "";
    errorText = "";
    vi.spyOn(process.stdout, "write").mockImplementation((text) => {
      writtenText += String(text);
      return true;
    });
    vi.spyOn(process.stderr, "write").mockImplementation((text) => {
      errorText += String(text);
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints the part list as JSON when json is set", () => {
    const exitCode = partsCommand(undefined, { json: true });

    expect(exitCode).toBe(0);
    expect(JSON.parse(writtenText).parts[0].className).toBe("sk-button");
  });

  it("prints the example HTML of one part as JSON with its examples", () => {
    const exitCode = partsCommand("sk-checkbox", { json: true });

    expect(exitCode).toBe(0);
    expect(JSON.parse(writtenText).examples.length).toBeGreaterThan(0);
  });

  it("exits with bad usage and names the part when the class name is unknown", () => {
    const exitCode = partsCommand("sk-nope", { json: true });

    expect(exitCode).toBe(2);
    expect(errorText).toContain('unknown part "sk-nope"');
  });
});
