import { describe, expect, it } from "vitest";
import { CAROUSEL_SCRIPT } from "./carousel";
import { CLIENT_SCRIPT } from "./postback";
import { DIAGRAM_SCRIPT } from "./diagram";
import { WHITEBOARD_SCRIPT } from "./whiteboard";

describe("client islands (string contracts)", () => {
  it("carousel never calls scrollIntoView (page-jump regression)", () => {
    // Comments may mention the word — ban the call form only.
    expect(CAROUSEL_SCRIPT).not.toMatch(/\.scrollIntoView\s*\(/);
    expect(CAROUSEL_SCRIPT).toMatch(/scrollLeft|scrollTo/);
  });

  it("postback collect includes diagrams + whiteboards hooks", () => {
    expect(CLIENT_SCRIPT).toContain("__ppCollectDiagrams");
    expect(CLIENT_SCRIPT).toContain("__ppCollectWhiteboards");
    expect(CLIENT_SCRIPT).toContain("whiteboards");
    expect(CLIENT_SCRIPT).toContain("diagrams");
    expect(CLIENT_SCRIPT).toContain("screenshots");
  });

  it("diagram board exposes queue + collect for agent feedback", () => {
    expect(DIAGRAM_SCRIPT).toContain("data-diagram-board");
    expect(DIAGRAM_SCRIPT).toContain("__ppCollectDiagrams");
    expect(DIAGRAM_SCRIPT).toContain("diagram-queue");
  });

  it("whiteboard board exports PNG queue for agent feedback", () => {
    expect(WHITEBOARD_SCRIPT).toContain("data-whiteboard");
    expect(WHITEBOARD_SCRIPT).toContain("__ppCollectWhiteboards");
    expect(WHITEBOARD_SCRIPT).toContain("wb-queue");
    expect(WHITEBOARD_SCRIPT).toContain("toDataURL");
  });
});
