# Flashcards

A **flip-card study deck** — a responsive grid of `Flashcard`s. Tap a card to flip: front is a term/question, the back reveals the definition + an optional code snippet. Pure CSS, **no client JS**. The **learn** half of the teach/coach flow (pair it with `quiz` for the **test** half); renders a `grill-me-stack` glossary or a `teach` concept set.

## Data

```json
{
  "title": "planpage — core vocabulary",
  "intro": "Tap a card to flip.",
  "cards": [
    {
      "label": "render",
      "front": "Island",
      "back": "A constant client script the Shell injects, gated by a boolean flag — the only interactivity in a page.",
      "code": "pollable ? <script … /> : null"
    },
    {
      "label": "cli",
      "front": "Post-back",
      "back": "The opt-in loop where a served page returns one Decision to the agent."
    }
  ]
}
```

- `title` + `cards` are required; each card needs `front` + `back`. `label` (a small tag) and `code` + `codeLang` are optional.

## Render

```tsx
import { render, Flashcards } from "planpage";
const html = render(<Flashcards {...deck} />);
```

From the CLI: `planpage render flashcards --data deck.json --open` (try `--sample`).
