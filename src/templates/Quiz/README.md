# Quiz

A **graded quiz** page — a running score, a progress bar, and multiple-choice `QuizCard`s grouped by topic. Each card reveals ✓ on the correct option, ✗ on a wrong pick, plus its explanation, then locks. Carries its own submit bar so the score posts back to the coaching agent. The **test** half of the teach/coach flow (pair it with `flashcards` for the **learn** half).

## Data

```json
{
  "title": "Coach check — planpage architecture",
  "intro": "Answer to reveal the why. One option is correct; the rest are common traps.",
  "questions": [
    {
      "id": "q-island",
      "group": "Rendering",
      "question": "How does a template add interactivity?",
      "explanation": "A constant island from clientScript.ts, injected by the Shell and gated by a flag — never a <script> in a template.",
      "options": [
        { "id": "shell-flag", "label": "A constant island gated by a Shell flag", "correct": true },
        { "id": "inline", "label": "An inline <script> in the template" },
        { "id": "hydrate", "label": "Hydrate the Preact tree on the client" },
        { "id": "cdn", "label": "Pull a framework from a CDN" }
      ]
    }
  ]
}
```

- `title` + `questions` are required; each question needs **exactly one** `{ "correct": true }` option (it throws otherwise).
- `group` is optional — questions with the same group render under one heading. `explanation` is the teaching reveal. An option may carry `code` + `codeLang`.

## Render

```tsx
import { render, Quiz } from "planpage";
const html = render(<Quiz {...quiz} />, { quizzable: true });
```

From the CLI: `planpage render quiz --data quiz.json --open` (try `--sample`, or `--serve` to collect the score back as a `Decision`).
