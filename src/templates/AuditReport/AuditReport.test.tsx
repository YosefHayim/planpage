import { describe, expect, it } from "vitest";
import { render } from "../../render/render";
import { AuditReport } from "./AuditReport";

describe("AuditReport", () => {
  it("renders the scorecard, command, notes, and risks", () => {
    const html = render(
      <AuditReport
        title="example.com"
        overall={74}
        dimensions={[
          { label: "Accessibility", score: 92 },
          { label: "Security headers", score: 35, note: "no CSP" },
        ]}
        command={[{ command: "node scripts/auditSite.mjs https://example.com" }]}
        notes={[{ tone: "risk", title: "Headers", body: "Add a CSP." }]}
        risks={[{ risk: "No CSP", severity: "high", mitigation: "ship a CSP" }]}
      />,
    );
    expect(html).toContain("example.com");
    expect(html).toContain("Accessibility");
    expect(html).toContain("width:92%");
    expect(html).toContain("node scripts/auditSite.mjs https://example.com");
    expect(html).toContain("Add a CSP.");
    expect(html).toContain("No CSP");
  });

  it("throws when dimensions is empty", () => {
    expect(() => render(<AuditReport title="Empty" dimensions={[]} />)).toThrow(
      "dimensions[] is required",
    );
  });
});
