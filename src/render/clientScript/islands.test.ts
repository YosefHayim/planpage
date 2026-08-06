import { describe, expect, it } from "vitest";
import { CAROUSEL_SCRIPT } from "./carousel";
import { DIAGRAM_SCRIPT } from "./diagram";
import { CLIENT_SCRIPT } from "./postback";
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

  it("postback blocks empty send and hardens clipboard fallback messaging", () => {
    // Empty queue → approved:true → refuse send (no silent empty POST).
    expect(CLIENT_SCRIPT).toContain("approved:empty");
    expect(CLIENT_SCRIPT).toContain("Nothing to send");
    // No-server path copies; clipboard failure surfaces the token.
    expect(CLIENT_SCRIPT).toContain("No server — copied, paste it back in your terminal.");
    expect(CLIENT_SCRIPT).toContain("Clipboard blocked — copy the token below.");
    expect(CLIENT_SCRIPT).toContain("No server — copy the token below into your terminal.");
    // Queue-then-send only — never Approve/Adjust on the plan feedback path.
    expect(CLIENT_SCRIPT).not.toMatch(/data-action=['"]approve['"]/);
    expect(CLIENT_SCRIPT).not.toMatch(/a===['"]approve['"]/);
    expect(CLIENT_SCRIPT).not.toMatch(/a===['"]adjust['"]/);
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
