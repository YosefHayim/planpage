import type {
  SketchLook,
  SketchPanel,
  SketchRecipe,
  SketchScene,
  SketchTone,
} from "../contracts/sketchScene";

interface LookPanelSpec {
  readonly caption: string;
  readonly look: SketchLook;
  readonly cookieTone?: SketchTone;
}

interface LookRecipeSpec {
  readonly id: string;
  readonly name: string;
  readonly useFor: string;
  readonly panelSpecs: readonly LookPanelSpec[];
}

const PANEL_WIDTH = 320;
const PANEL_HEIGHT = 300;
const PANEL_GAP = 20;
const PANEL_STEP = PANEL_WIDTH + PANEL_GAP;
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 340;
const CAPTION_Y = 326;
const PANEL_LETTERS = ["A", "B", "C"];

const createLookPanelScene = ({ look, cookieTone }: LookPanelSpec): SketchScene => ({
  width: PANEL_WIDTH,
  height: PANEL_HEIGHT,
  look,
  nodes: [
    { id: "browser", kind: "box", x: 60, y: 12, w: 120, h: 46, fill: "blue", words: "Browser" },
    { id: "server", kind: "box", x: 130, y: 108, w: 120, h: 46, fill: "grey", words: "Our server" },
    { id: "valid", kind: "diamond", x: 90, y: 176, w: 140, h: 64, words: "valid?" },
    {
      id: "cookie",
      kind: "box",
      x: 130,
      y: 262,
      w: 130,
      h: 34,
      fill: "green",
      tone: cookieTone,
      words: "session cookie",
    },
  ],
  edges: [
    { id: "browser-server", from: "browser", to: "server", route: "curve" },
    { id: "server-valid", from: "server", to: "valid", route: "curve" },
    {
      id: "valid-cookie",
      from: "valid",
      to: "cookie",
      route: "curve",
      label: "yes",
      tone: "green",
    },
  ],
  notes: [{ x: 192, y: 16, w: 120, words: "POST /login", link: "browser" }],
});

const createLookPanel = (panelIndex: number, panelSpec: LookPanelSpec): SketchPanel => ({
  offsetX: panelIndex * PANEL_STEP,
  width: PANEL_WIDTH,
  height: PANEL_HEIGHT,
  scene: createLookPanelScene(panelSpec),
});

const createCaptionLabels = (panelSpecs: readonly LookPanelSpec[]) =>
  panelSpecs.map((panelSpec, panelIndex) => ({
    x: panelIndex * PANEL_STEP + PANEL_WIDTH / 2,
    y: CAPTION_Y,
    anchor: "middle" as const,
    font: "mono" as const,
    tone: "soft" as const,
    words: panelSpec.caption,
  }));

const createLookCode = (panelSpecs: readonly LookPanelSpec[]): string =>
  panelSpecs
    .map(
      (panelSpec, panelIndex) => `${PANEL_LETTERS[panelIndex]}: ${JSON.stringify(panelSpec.look)}`,
    )
    .join("\n");

const createLookRecipe = ({ id, name, useFor, panelSpecs }: LookRecipeSpec): SketchRecipe => ({
  id,
  group: "look",
  name,
  useFor,
  scene: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    nodes: [],
    labels: createCaptionLabels(panelSpecs),
    panels: panelSpecs.map((panelSpec, panelIndex) => createLookPanel(panelIndex, panelSpec)),
  },
  code: { pseudo: createLookCode(panelSpecs) },
});

export const LOOK_RECIPES: readonly SketchRecipe[] = [
  createLookRecipe({
    id: "look-roughness",
    name: "How rough",
    useFor: "how hand-drawn the lines look",
    panelSpecs: [
      { caption: "A  roughness 0.5", look: { roughness: 0.5 } },
      { caption: "B  default, today", look: { roughness: null } },
      { caption: "C  roughness 1.8", look: { roughness: 1.8 } },
    ],
  }),
  createLookRecipe({
    id: "look-fill",
    name: "Fill",
    useFor: "how filled boxes are shaded",
    panelSpecs: [
      { caption: "A  solid, today", look: { fill: "solid" } },
      { caption: "B  hachure lines", look: { fill: "hachure" } },
      { caption: "C  cross-hatch", look: { fill: "cross-hatch" } },
    ],
  }),
  createLookRecipe({
    id: "look-lines",
    name: "Lines",
    useFor: "how arrows travel between boxes",
    panelSpecs: [
      { caption: "A  soft curves, today", look: { route: null } },
      { caption: "B  straight elbows", look: { route: "elbow" } },
      { caption: "C  straight diagonals", look: { route: "straight" } },
    ],
  }),
  createLookRecipe({
    id: "look-notes",
    name: "Note placement",
    useFor: "where side notes sit next to the part",
    panelSpecs: [
      { caption: "A  beside, today", look: { notePlacement: "beside" } },
      { caption: "B  under the part", look: { notePlacement: "under" } },
      { caption: "C  numbered badges", look: { notePlacement: "badge" } },
    ],
  }),
  createLookRecipe({
    id: "look-colors",
    name: "Colors",
    useFor: "how strong the box colors are",
    panelSpecs: [
      { caption: "A  pastel, today", look: { palette: "pastel" } },
      { caption: "B  ink only, green accent", look: { palette: "ink" }, cookieTone: "green" },
      { caption: "C  saturated", look: { palette: "saturated" } },
    ],
  }),
  createLookRecipe({
    id: "look-fonts",
    name: "Hand font",
    useFor: "which handwriting font the page uses",
    panelSpecs: [
      { caption: "A  Kalam, today", look: { font: "kalam" } },
      { caption: "B  Caveat", look: { font: "caveat" } },
      { caption: "C  Patrick Hand", look: { font: "patrick" } },
    ],
  }),
  createLookRecipe({
    id: "look-density",
    name: "Spacing",
    useFor: "how much room each part gets",
    panelSpecs: [
      { caption: "A  airy, today", look: { density: "airy" } },
      { caption: "B  compact", look: { density: "compact" } },
      { caption: "C  very compact", look: { density: "very-compact" } },
    ],
  }),
  createLookRecipe({
    id: "look-paper",
    name: "Paper",
    useFor: "what the background of the sketch looks like",
    panelSpecs: [
      { caption: "A  plain, today", look: { paper: "plain" } },
      { caption: "B  faint dots", look: { paper: "dots" } },
      { caption: "C  faint lines", look: { paper: "lined" } },
    ],
  }),
];
