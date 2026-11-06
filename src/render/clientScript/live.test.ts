import { describe, expect, it } from "vitest";
import { LIVE_CLIENT_SCRIPT } from "./live";

describe("LIVE_CLIENT_SCRIPT (string contract)", () => {
  it("parses as JavaScript", () => {
    expect(() => new Function(LIVE_CLIENT_SCRIPT)).not.toThrow();
  });

  it("connects to the /page socket on the page's own host", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain('"ws://" + location.host + "/page"');
  });

  it("waits for a successful open before starting the page UI, and reconnects with growing waits", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain("const startLivePage");
    expect(LIVE_CLIENT_SCRIPT).toContain("2 ** reconnectAttempts");
    expect(LIVE_CLIENT_SCRIPT).toContain("reconnectMaxWaitMs");
  });

  it("sends a comment frame with a tab-made draft id, page and part", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain('kind: "comment", draftId');
    expect(LIVE_CLIENT_SCRIPT).toContain("crypto.randomUUID()");
  });

  it("handles every server message kind", () => {
    for (const kind of [
      "comments-so-far",
      "comment-saved",
      "comment-status",
      "cursor",
      "plan-changed",
      "plan-reshaped",
    ]) {
      expect(LIVE_CLIENT_SCRIPT).toContain(`case "${kind}"`);
    }
  });

  it("swaps changed sections in place and redraws them through the sketch hooks", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain("DOMParser");
    expect(LIVE_CLIENT_SCRIPT).toContain("document.importNode");
    expect(LIVE_CLIENT_SCRIPT).toContain("window.SketchEngine.drawFramesIn(importedSection)");
    expect(LIVE_CLIENT_SCRIPT).toContain("window.SketchPager.bindControlsIn(importedSection)");
  });

  it("takes over the pager's ask event so Ask becomes a live comment", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain('document.addEventListener("pp-sketch-ask", onSketchAsk)');
    expect(LIVE_CLIENT_SCRIPT).toContain("askEvent.preventDefault()");
  });

  it("redraws pins and glow after every sketch draw", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain(
      'document.addEventListener("pp-sketch-drawn", onSketchDrawn)',
    );
  });

  it("keeps the previous version for Before and After toggles", () => {
    expect(LIVE_CLIENT_SCRIPT).toContain("data-live-version-toggle");
    expect(LIVE_CLIENT_SCRIPT).toContain('isShowingBefore ? "After" : "Before"');
  });

  it("uses no template literal inside the script body, so it can be embedded safely", () => {
    const scriptBodyStart = LIVE_CLIENT_SCRIPT.indexOf("(function ()");
    const scriptBody = LIVE_CLIENT_SCRIPT.slice(scriptBodyStart);
    expect(scriptBody).not.toMatch(/`/);
  });
});
