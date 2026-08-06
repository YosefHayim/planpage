import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { FeedbackSidebar } from "./FeedbackSidebar";

describe("FeedbackSidebar", () => {
  it("renders queue-then-send chrome used by the post-back island", () => {
    // Shell only mounts this when interactive — unit the chrome itself.
    const html = render(
      <div>
        <FeedbackSidebar />
      </div>,
    );
    expect(html).toContain('id="pp-bar"');
    expect(html).toContain('id="pp-queue"');
    expect(html).toContain('id="pp-notes"');
    expect(html).toContain('id="pp-shot-input"');
    expect(html).toContain('data-action="send"');
    expect(html).toContain('data-action="mode"');
    expect(html).toContain('data-mode="annotate"');
    expect(html).toContain('data-mode="edit"');
    expect(html).toContain("Send to Agent");
    expect(html).toContain("Screenshot");
    // Queue-then-send only — no Approve/Adjust regression.
    expect(html).not.toContain('data-action="approve"');
    expect(html).not.toContain('data-action="adjust"');
  });
});
