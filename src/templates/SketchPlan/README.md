# SketchPlan

A plan as **hand-sketched pages**: one picture per page, drawn with rough.js in Kalam and IBM Plex Mono, with notes tied to their part by dashed lines. Each page has **Notes** and **View code** toggles. The last page can be a **Your call** decision with options A, B and C, which posts the choice back through `serve`.

Keys: Left and Right move between pages, Up and Down or 1-3 / A-C pick an option, Enter sends, Esc goes back. Notes typing keeps every key; Cmd or Ctrl plus Enter asks for changes.

## Data

```json
{
  "title": "Sketch plans in planpage",
  "pages": [
    {
      "nav": "Overview",
      "title": "Plan review: today and after",
      "subtitle": "One plan page replaces the long chat reply.",
      "legend": "Black is today. Blue is new.",
      "toggle": { "initial": "after", "choices": [{ "id": "today", "label": "Today" }, { "id": "after", "label": "After" }] },
      "code": { "pseudo": "plan.json -> planpage render sketch-plan" },
      "scene": {
        "width": 600,
        "height": 200,
        "nodes": [{ "id": "data", "kind": "box", "x": 20, "y": 60, "w": 160, "h": 70, "words": "plan.json" }]
      }
    },
    {
      "nav": "Your call",
      "title": "Your call",
      "scene": { "width": 600, "height": 120, "nodes": [] },
      "decision": {
        "question": "Which way?",
        "options": [
          { "letter": "A", "title": "In the browser", "scene": { "width": 300, "height": 120, "nodes": [] } },
          { "letter": "B", "title": "In Node", "scene": { "width": 300, "height": 120, "nodes": [] } }
        ]
      }
    }
  ]
}
```

Render with `npx planpage render sketch-plan --data plan.json --serve --decision decision.json`. Without `--serve` the page still shows; the decision is copied to the clipboard instead of posted.

The sample (`sketchPlanSample.ts`) is the approved five-page integration plan.

## Live mode

`planpage live` serves the page over a live connection, so you can comment while the agent edits the plan.

- **Comment pins**: pin a comment on a part. The pin shows sent, working, then done as the agent answers.
- **Claude's cursor**: when the agent starts on a comment, a labelled cursor moves to the part and says what it is changing.
- **Pages change in place**: an edited page swaps into the open tab and glows where it changed.
- **Toast**: when you are on another page, a toast names the changed page. Click it to jump there.
- **Before / After**: after a change, Before shows the previous version of that page until you press After.
- **Approve** writes `decision.json` and the live command exits `0`.
