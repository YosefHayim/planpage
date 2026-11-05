# Sketch style

The living style guide for sketch plans. Read this file before you draw any plan. Feedback from the owner changes this file over time (see [Stretching the style](#stretching-the-style)).

## The look

- Lines are hand-drawn with rough.js. Nothing is perfectly straight.
- Words in pictures use Kalam, a hand-written font.
- Notes and code use IBM Plex Mono.
- One picture per page. Each page has one title, a short subtitle and a legend.
- Notes sit next to the part they explain, with a dashed line to it.

This reads easily because each page answers one question. The words are short. The notes say the detail. The colors tell the reader what is old, new or done.

## Rules

- One picture per page. Split a big plan into more pages.
- Words are short and plain. Use real sample content from the owner's projects, never lorem ipsum.
- Notes are IBM Plex Mono and tied to a part with `link`.
- A removed thing is struck through, in red (`struck: true`).
- Every page has a legend line that says what the colors mean on that page.
- Every plan ends with a [Your call page](#the-your-call-page).
- The Notes and View code toggles stay on every page. Notes hide the dashed notes. View code opens the code drawer.

## Colors

The colors have these meanings in the approved sketches. Each page's legend says which meaning applies on that page.

| Color | Meaning |
| --- | --- |
| Grey (`fill: "grey"`, `tone: "soft"`) | Today, or our code |
| Blue | New, or the user and browser side |
| Orange | A second side or package |
| Green | Done, success, or your approval |
| Red | Failure, removed, or asks for changes |
| Yellow (`fill: "yellow"`) | A file, a cookie or a warning |

`tone` colors text and lines. `fill` colors the inside of a box. Use `struck: true` to strike out removed text; the strike line is always red. Use `fill: "yellow"` for a file or a warning box.

## Notes and links

- A note is mono text: `{ x, y, w, words, link }`. Set `link` to the id of the node or edge it explains.
- A dashed line runs from the note to its target. The line starts at the real text, measured after fonts load.
- Notes hide when the page has `html.notes-off`. The Notes toggle sets that.
- Keep notes to one or two short lines. A long explanation belongs in View code.

## Files and repo pictures

Use a `rows` node in mono font for a file tree. Mark each row:

- `+` new file (green)
- `~` changed file (yellow)
- `x` removed file (red, struck through)

Use a `box` grid with a one-line job label for a repo map. Use a `lane` for one side of a system.

Example rows (from the sketch-plan plan itself):

```json
{ "id": "afterTree", "kind": "rows", "x": 400, "y": 50, "w": 570, "h": 450, "fill": "blue", "font": "mono",
  "rows": ["src/", { "words": "contracts/", "indent": 1 }, { "words": "+ sketchScene.ts  (scene types)", "indent": 2 }] }
```

## Plan page format

A plan is one JSON file with a title and a list of pages. `SketchPlan` draws it.

```json
{
  "title": "Sketch plans move into planpage",
  "pages": [
    {
      "nav": "Overview",
      "title": "Sketch plans move into planpage",
      "subtitle": "The 64 sketches you approved become a planpage template.",
      "legend": "Grey is today. Blue is new in planpage. Green is you.",
      "scene": {
        "width": 1000,
        "height": 300,
        "nodes": [
          { "id": "todayData", "kind": "box", "x": 40, "y": 70, "w": 250, "h": 60, "fill": "grey", "words": "Claude writes the plan data" },
          { "id": "afterRender", "kind": "box", "x": 540, "y": 70, "w": 250, "h": 60, "fill": "blue", "words": "npx planpage render\nsketch-plan" }
        ],
        "notes": [
          { "x": 810, "y": 175, "w": 170, "link": "afterRender", "words": "The engine and all\n64 sketches ship\ninside the package." }
        ]
      },
      "code": { "pseudo": "plan.json -> planpage render sketch-plan -> one HTML file" }
    },
    {
      "nav": "Your call",
      "title": "Your call",
      "subtitle": "Pick one.",
      "legend": "Each card shows one option.",
      "decision": {
        "question": "Where should the sketches be drawn?",
        "options": [
          { "letter": "A", "title": "In the browser, as today (recommended)", "scene": { "width": 300, "height": 170, "nodes": [] } }
        ]
      }
    }
  ]
}
```

Each page has these fields. The types live in `src/contracts/sketchScene.ts` as `SketchPlanPage`.

| Field | Required | Meaning |
| --- | --- | --- |
| `nav` | yes | The short label in the page list (the pager). |
| `title` | yes | The page title. |
| `subtitle` | no | One short line under the title. |
| `legend` | no | What the colors mean on this page. |
| `scene` | yes | The one picture on the page. See [The scene format](#the-scene-format). |
| `toggle` | no | A switch that dims the parts of the picture that do not match the choice. |
| `code` | no | Code for View code: `pseudo`, `diff` and `docs`. Each is a plain string. |
| `decision` | no | Makes the page a Your call page. Holds a question and options A, B and C. |

### Reading the page

- Left and Right arrows change pages.
- Up and Down, or 1, 2, 3, or A, B, C, pick an option on a Your call page. The picked option gets a focus ring.
- Enter sends on a Your call page. On other pages, Enter goes to the next page.
- Esc closes the code drawer. Otherwise Esc goes back.
- In the notes box, Cmd or Ctrl plus Enter sends.
- Dark mode inverts the paper, the way Excalidraw does.

## The scene format

A scene is a plain object. The types live in `src/contracts/sketchScene.ts` as `SketchScene`. The browser engine, `sketch-engine.js`, draws it into a `<div class="sketch-frame">`. Coordinates are in design units on a fixed canvas (`width` wide, `height` tall). The engine scales it to the frame width, but never below 0.6. On a narrow screen a wide scene scrolls sideways inside its frame instead of shrinking the text.

Load order: `sketch.css`, rough.js (optional), `sketch-engine.js`.

### Top level

| Field | Required | Meaning |
| --- | --- | --- |
| `width` | yes | Canvas width. Use 1000. |
| `height` | yes | Canvas height. |
| `rules` | no | Plain lines, e.g. column dividers. Each has `x1`, `y1`, `x2`, `y2`, and optional `dashed`, `tone` and `path`. |
| `nodes` | yes | Shapes and text blocks. |
| `edges` | no | Arrows between nodes or points. |
| `labels` | no | Free text on the canvas. |
| `notes` | no | Mono notes, optionally linked to a node or edge. |
| `look` | no | How the sketch is drawn. See Look. Defaults apply to every missing knob. |
| `panels` | no | Several small scenes side by side. See Panels. When present, `nodes` and `edges` are ignored at the top level. |

### Shared fields

- `path`: optional. A space-separated list of mode ids, e.g. `"approve"` or `"approve change"`. When the page calls `setMode(frame, choice)`, every element whose `path` does not list `choice` is dimmed. No `path` means always shown.
- `words`: the text. Use `\n` for a new line.
- `font`: `"hand"` (default, Kalam) or `"mono"` (IBM Plex Mono).
- `weight`: `"regular"` (default) or `"bold"`.
- `size`: `"normal"` (default) or `"big"` (larger text from the shared size scale). `{ x: 500, y: 40, anchor: "middle", size: "big", words: "Today" }`
- `tone`: `"ink"` (default), `"red"`, `"green"`, `"blue"`, `"orange"` or `"soft"` (grey). The four colors are dark shades that read on paper.
- `struck`: `true` draws one thin red rough line through the text. Works on one line of text. `{ x: 500, y: 40, words: "Old plan", struck: true }`
- `fill`: `"none"` (default), `"blue"`, `"grey"`, `"orange"`, `"green"`, `"red"` or `"yellow"`.
- `dashed`: `true` for a dashed outline or line.
- `border`: box-like kinds only. `"thick"` draws a heavier outline (default is thin). `{ id: "api", kind: "box", x: 60, y: 40, w: 200, h: 80, border: "thick", words: "API" }`

### Node kinds

Every node has `id`, `kind`, `x`, `y`, `w`, `h`.

- `box`: rough rectangle with centered `words`. `{ id: "claude", kind: "box", x: 60, y: 40, w: 200, h: 80, fill: "blue", words: "Claude" }`
- `diamond`: rough diamond with centered `words`. `{ id: "choice", kind: "diamond", x: 60, y: 200, w: 200, h: 100, words: "Your call" }`
- `ellipse`: rough oval fitted in the box, with centered `words`. Same fields as `box`. `{ id: "start", kind: "ellipse", x: 60, y: 40, w: 200, h: 60, words: "Start" }`
- `circle`: rough circle with centered `words`. `w` is the diameter; `h` is ignored. `{ id: "step", kind: "circle", x: 60, y: 40, w: 60, words: "1" }`
- `phone`: rounded rough phone frame with a small notch bar at the top. Use about 9 wide to 19 tall. Children are separate nodes placed by their own `x` and `y` on the same canvas, listed after the phone so they draw on top. `{ id: "phone", kind: "phone", x: 60, y: 40, w: 190, h: 380 }`
- `cylinder`: rough box with an oval top and a curved bottom, a database shape. Same fields as `box`. `{ id: "db", kind: "cylinder", x: 60, y: 40, w: 140, h: 90, words: "Database" }`
- `sticky`: yellow sticky note with centered hand text, tilted by `tilt` in degrees from -4 to 4 (default 0). `{ id: "idea", kind: "sticky", x: 60, y: 40, w: 160, h: 120, tilt: -3, words: "Ask Sam" }`
- `rows`: rectangle split into equal rows, left aligned. Each row is a string, or `{ words, indent, struck }`. `indent` is a level (0 default, 1, 2...) that moves the text right and draws faint tree lines from the nearest row above with a smaller level. `struck` strikes that row. `{ id: "tree", kind: "rows", x: 60, y: 340, w: 260, h: 90, rows: ["src", { words: "engine.js", indent: 1 }, { words: "old.js", indent: 1, struck: true }], font: "mono" }`
- `lane`: rectangle with a bold `words` title at the top. Use `dashed: true` for a loose frame. `{ id: "browser", kind: "lane", x: 800, y: 60, w: 180, h: 400, words: "Browser", dashed: true }`
- `bare`: centered text only, no outline. `{ id: "caption", kind: "bare", x: 60, y: 480, w: 200, h: 30, words: "step 2", font: "mono", tone: "soft" }`

### Edges

Every edge has `id`, `from`, `to`. An endpoint is a node id (string) or a point (`{ x, y }`). A node endpoint starts or ends on the node's boundary.

- `route`: `"straight"` (default), `"elbow"` or `"curve"`.
- `sides`: for `elbow` only, `[fromSide, toSide]`, each `"top"`, `"bottom"`, `"left"` or `"right"`. The last leg always enters its side at a right angle, and the arrowhead tip sits on that side. Default: the sides that face each other, picked from the two centers (left and right when the ends are further apart sideways, otherwise top and bottom).
- `arrow`: `false` to hide the arrowhead (default shown).
- `label`: short text beside the middle of the edge, 8 px clear of the line, with a paper-colored halo so it stays readable.
- `tone`, `dashed`, `path` as above.

`{ id: "ask", from: "claude", to: "planpage", route: "elbow", sides: ["bottom", "top"], tone: "red", label: "change" }`

A point endpoint: `{ id: "loop", from: { x: 520, y: 300 }, to: "claude", route: "curve" }`. Any mix works: node to node, node to point, point to node, point to point.

### Labels

`{ x, y, words, anchor: "middle" | "start" | "end", font, weight, size, tone, struck, path }`. `x` and `y` are the centre of the text (`anchor` sets the horizontal side). `struck` and `size` work as in Shared fields.

`{ x: 500, y: 40, anchor: "middle", weight: "bold", words: "Today" }`

### Notes

`{ x, y, w, words, link, path }`. `w` is the width (default 200). `link` is an optional node or edge id. A dashed line runs from the note's real text (measured after fonts load) to the nearest point of that target: its box edge for a node, its middle point for an edge. Notes hide when the page sets `html.notes-off`.

`{ x: 760, y: 120, w: 200, words: "Approve sends\nthe plan back.", link: "approve" }`

### Look

`look` is an object on a scene. Every knob is optional; a missing knob uses its default. The type is `SketchLook`.

| Knob | Values | Default | Meaning |
| --- | --- | --- | --- |
| `roughness` | number or `null` | `null` | Hand-drawn wobble. `null` means 1.1 for shapes and 0.9 for edges. `0.5` is almost clean, `1.8` very sketchy. |
| `fill` | `"solid"`, `"hachure"`, `"cross-hatch"` | `"solid"` | How filled boxes are shaded. |
| `palette` | `"pastel"`, `"ink"`, `"saturated"` | `"pastel"` | `"ink"` drops fills and draws outlines only. `"saturated"` uses stronger colors. |
| `route` | `null`, `"straight"`, `"elbow"`, `"curve"` | `null` | `null` keeps each edge's own `route`. Any other value overrides every edge. |
| `notePlacement` | `"beside"`, `"under"`, `"badge"` | `"beside"` | `"beside"` uses the note's `x` and `y`. `"under"` pins the note under its linked part. `"badge"` puts a numbered badge on the part and the note at the side. |
| `font` | `"kalam"`, `"caveat"`, `"patrick"` | `"kalam"` | Hand font for `font: "hand"` text. Notes and `font: "mono"` text stay IBM Plex Mono. |
| `density` | `"airy"`, `"compact"`, `"very-compact"` | `"airy"` | Smaller hand text and notes for tighter layouts. |
| `paper` | `"plain"`, `"dots"`, `"lined"` | `"plain"` | Background of the scene: off-white, faint dot grid, or faint lines. |

`{ width: 1000, height: 300, look: { roughness: 1.8, fill: "hachure" }, nodes: [...] }`

### Panels

A scene with `panels` shows several small scenes side by side. Each panel has `offsetX` (left edge on the canvas), `width`, `height` and its own `scene`. The panel's `scene` is a normal scene (`width`, `height`, `nodes`, `edges`, `notes`, `look`) in its own coordinates, starting at 0, 0. The top-level `rules` and `labels` still draw on the outer canvas, so use them for captions.

`{ width: 1000, height: 340, labels: [{ x: 160, y: 326, anchor: "middle", words: "A  roughness 0.5" }], panels: [{ offsetX: 0, width: 320, height: 300, scene: { width: 320, height: 300, look: { roughness: 0.5 }, nodes: [...] } }] }`

### Toggle (page data, not read by the engine)

The page holds the toggle, not the scene. The page passes the chosen id to `setMode`. The type is `SketchToggle`.

`toggle: { initial: "approve", choices: [{ id: "approve", label: "Approve" }, { id: "change", label: "Change" }] }`

### Code and mounting

`drawCodeDrawer(drawer, { pseudo, diff, docs })` builds tabs for every key that is present. `bindCodeToggle(button, drawer)` and `bindNotesToggle(button)` wire the chrome. `fitScenes(document)` refits every frame (the engine also does this on resize).

## The Your call page

The last page of every sketch plan. It holds 3 options, A, B and C.

- Each option is a small sketch of one choice, with a title.
- A risk note, in red, says what goes wrong with that option. A recommended option says so in its title.
- Put the words "(recommended)" in the title of the option you suggest. Do not use a star or an emoji.
- The page has two buttons: Ask for changes, and Approve. Approve sends the picked letter.
- A question is one line above the options.

The owner's answer comes back as JSON. See [Reading the decision](#reading-the-decision).

## Recipes

There are 64 approved recipes in 8 groups. Each recipe is a ready-made `SketchScene` (plus optional `toggle` and `code`) with a `useFor` line. The recipes are in `src/sketchRecipes/`, one file per group, and `SKETCH_RECIPES` exports them all.

Pull one recipe into a plan:

```bash
npx planpage recipes                  # list every recipe: id, group and use-for
npx planpage recipes today-after      # print one recipe as JSON, to copy into a plan
```

Use it for, in short. The full notes per recipe are in each group file.

### Flows (`flowRecipes.ts`)

| id | Use it for |
| --- | --- |
| `flow` | Steps that run one after another. |
| `decision-tree` | A rule with several yes/no checks. |
| `today-after` | What changes, shown side by side. |
| `state-machine` | Something that moves through states. |
| `swimlane` | One flow across several actors. |
| `retry-loop` | Work that may fail and try again. |
| `failure-funnel` | Many failures, one clear message each. |
| `function-anatomy` | Where a function decides and where it touches the world. |

### Time (`timeRecipes.ts`)

| id | Use it for |
| --- | --- |
| `sequence` | Who talks to whom, in order. |
| `sequence-toggle` | The happy path vs a failure path in one picture. |
| `timeline` | Phases or PRs over time. |
| `steps-ladder` | A plan's step list with progress. |
| `parallel-tracks` | Agents or tasks running side by side. |
| `progress-board` | Status of many items. |
| `estimate-counters` | Counts, time and cost at a glance. |
| `gate-loop` | The end-of-task check and its fix loop. |

### Files (`fileRecipes.ts`)

| id | Use it for |
| --- | --- |
| `file-tree-before-after` | Any plan that adds, changes or removes files. |
| `repo-map` | The shape of a whole repo. |
| `file-moves` | Renames and moves. |
| `package-doors` | What a package exposes and what stays private. |
| `import-graph` | Who imports whom, and forbidden imports. |
| `file-split` | One file becoming several. |
| `shared-shape` | An interface and its implementations. |
| `code-notes` | How code shows on a page. |

### Data (`dataRecipes.ts`)

| id | Use it for |
| --- | --- |
| `data-model` | Database tables and links. |
| `json-shape` | The shape of an object or API reply. |
| `request-response` | One API call. |
| `data-pipeline` | Data moving through stages. |
| `cache-layers` | Where data is kept, and for how long. |
| `schema-migration` | A table before and after a migration. |
| `job-queue` | Background jobs with pacing. |
| `config-split` | What goes in .env vs environment.ts. |

### Systems (`systemRecipes.ts`)

| id | Use it for |
| --- | --- |
| `architecture` | The parts of a system and how they connect. |
| `deploy-gates` | Environments and approval gates. |
| `bundle-split` | What ships in each build. |
| `auth-boundary` | Public routes vs signed-in routes. |
| `ci-pipeline` | Lint, typecheck, test and build. |
| `monorepo-map` | App and package dependencies. |
| `webhook-flow` | A third party calling us. |
| `agent-team` | How a big job is split between agents. |

### Screens (`screenRecipes.ts`)

| id | Use it for |
| --- | --- |
| `desktop-wireframe` | A page layout. |
| `phone-wireframe` | A mobile screen. |
| `screen-before-after` | A UI change. |
| `screen-flow` | A user journey across screens. |
| `component-tree` | How a screen is built from parts. |
| `ui-states` | Loading, empty, error and ready. |
| `rtl-mirror` | Hebrew layouts. |
| `form-errors` | A form with its checks. |

### Decisions (`decisionRecipes.ts`)

| id | Use it for |
| --- | --- |
| `your-call` | The one choice the owner must make. |
| `compare-table` | Options side by side on several points. |
| `risks-questions` | What could go wrong and what is still open. |
| `effort-value` | Ranking ideas. |
| `done-checklist` | What must be true at the end. |
| `mind-map` | Exploring a topic before planning. |
| `buckets` | Sorting many items into groups. |
| `overview-grid` | The whole plan on one page. |

### Look (`lookRecipes.ts`)

Each look recipe shows the same small sketch three times, as panels A, B and C. The owner approves the look as a whole. These recipes test the look knobs above.

| id | Use it for |
| --- | --- |
| `look-roughness` | How rough: A 0.5, B 1.1 (today), C 1.8. |
| `look-fill` | Fill: A solid (today), B hachure, C cross-hatch. |
| `look-lines` | Lines: A soft curves (today), B elbows, C diagonals. |
| `look-notes` | Note placement: A beside (today), B under, C badges. |
| `look-colors` | Colors: A pastel (today), B ink only, C saturated. |
| `look-fonts` | Hand font: A Kalam (today), B Caveat, C Patrick Hand. |
| `look-density` | Spacing: A airy (today), B compact, C very compact. |
| `look-paper` | Paper: A plain (today), B dots, C lined. |

## Stretching the style

The style is a starting point. Feedback should change it. Follow these steps when the owner asks for a new kind of picture or a new look.

1. Decide what kind of change it is.
   - A new picture for a job we have not drawn yet: make a new recipe.
   - A new way to draw any picture (roughness, fill, font): add a look knob.
2. For a recipe, add it to the group file in `src/sketchRecipes/`. Use the same shape as the other recipes in that file: `id`, `group`, `name`, `useFor`, `scene`, and optional `toggle` and `code`.
3. Add the recipe to the list in this file, in its group table, with its id and a short use-for line.
4. For a look knob, add it to `SketchLook` in `src/contracts/sketchScene.ts`, add a row to the Look table above, and add a look recipe that shows the three values side by side.
5. The owner approves the change in a gallery before it ships. Show each new recipe or knob as A, B and C, and say which one you suggest.
6. After approval, merge the change through a PR like any other change.

### Rules for changing the style

- A rule in this file is never dropped silently. To remove or change a rule, write the change in this file in the same PR, with the owner's reason.
- A new look may replace an old one only after the owner approves it.
- Keep the old recipe ids. A recipe id is a public name, so renaming it breaks plans that use it.

## Reading the decision

The Your call page writes one JSON object, the usual Decision plus `choice`. `choice` is the letter the owner picked.

- Approve gives `{ "approved": true, "choice": "A", "notes": "" }`.
- Ask for changes gives `{ "approved": false, "choice": "B", "notes": "rename the second step" }`.

Act on `choice` first. Then act on `notes`. Then render a revised plan if `approved` is false.
