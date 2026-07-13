# AuditReport

A **scored audit report** — a graded `Scorecard` up top (A–F bar per dimension + an optional overall), the `Terminal` command that produced it, margin notes, and the gaps as a `RiskList`. Composes the new `Scorecard` + `Terminal` with the existing `RiskList` + `Callout`. The report surface for `web-best-practices` and `grill-me-code-style-review`.

## Data

```json
{
  "title": "web-best-practices — example.com",
  "overall": 74,
  "dimensions": [
    { "label": "Semantic HTML", "score": 88 },
    { "label": "Accessibility", "score": 92, "note": "1 minor contrast issue" },
    { "label": "Security headers", "score": 35, "note": "no CSP / HSTS" },
    { "label": "AI-readability", "score": 20, "note": "no llms.txt" }
  ],
  "command": [
    { "comment": "run the zero-dep audit scanner" },
    { "command": "node scripts/auditSite.mjs https://example.com" },
    { "output": "7 dimensions scored · 2 gaps found" }
  ],
  "notes": [{ "tone": "risk", "title": "Security headers", "body": "No CSP or HSTS — add a _headers file." }],
  "risks": [{ "risk": "Missing CSP allows injected script execution", "severity": "high", "mitigation": "ship a strict CSP" }]
}
```

- `title` + `dimensions` are required (a `score` is `0–100`, clamped). `overall`, `command`, `notes`, and `risks` are optional — each section appears only when present.

## Render

```tsx
import { render, AuditReport } from "planpage";
const html = render(<AuditReport {...report} />);
```

From the CLI: `planpage render audit-report --data report.json --open` (try `--sample`).
