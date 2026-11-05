export type SketchFont = "hand" | "mono";
export type SketchWeight = "regular" | "bold";
export type SketchSize = "normal" | "big";
export type SketchTone = "ink" | "red" | "green" | "blue" | "orange" | "soft";
export type SketchFill = "none" | "blue" | "grey" | "orange" | "green" | "red" | "yellow";
export type SketchSide = "top" | "bottom" | "left" | "right";
export type SketchRoute = "straight" | "elbow" | "curve";
export type SketchAnchor = "middle" | "start" | "end";
export type SketchNodeKind =
  | "box"
  | "diamond"
  | "ellipse"
  | "circle"
  | "phone"
  | "cylinder"
  | "sticky"
  | "rows"
  | "lane"
  | "bare"
  | "screen";

export interface SketchPoint {
  readonly x: number;
  readonly y: number;
}

export interface SketchWords {
  readonly words?: string;
  readonly font?: SketchFont;
  readonly weight?: SketchWeight;
  readonly size?: SketchSize;
  readonly tone?: SketchTone;
  readonly struck?: boolean;
  readonly path?: string;
}

export interface SketchRow {
  readonly words: string;
  readonly indent?: number;
  readonly struck?: boolean;
}

export interface SketchNode extends SketchWords {
  readonly id: string;
  readonly kind: SketchNodeKind;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  // A circle uses w as its diameter, so h is optional there.
  readonly h?: number;
  readonly fill?: SketchFill;
  readonly dashed?: boolean;
  readonly border?: "thick";
  readonly tilt?: number;
  readonly rows?: readonly (string | SketchRow)[];
  // The wireframe HTML a "screen" node shows inside its box (h is required there).
  readonly html?: string;
}

export type SketchEdgeEnd = string | SketchPoint;

export interface SketchEdge {
  readonly id: string;
  readonly from: SketchEdgeEnd;
  readonly to: SketchEdgeEnd;
  readonly route?: SketchRoute;
  readonly sides?: readonly [SketchSide, SketchSide];
  readonly arrow?: boolean;
  readonly label?: string;
  readonly tone?: SketchTone;
  readonly dashed?: boolean;
  readonly path?: string;
}

export interface SketchLabel extends SketchWords {
  readonly x: number;
  readonly y: number;
  readonly words: string;
  readonly anchor?: SketchAnchor;
}

export interface SketchNote {
  readonly x: number;
  readonly y: number;
  readonly w?: number;
  readonly words: string;
  readonly link?: string;
  readonly path?: string;
}

export interface SketchRule {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly dashed?: boolean;
  readonly tone?: SketchTone;
  readonly path?: string;
}

export interface SketchLook {
  readonly roughness?: number | null;
  readonly fill?: "solid" | "hachure" | "cross-hatch";
  readonly palette?: "pastel" | "ink" | "saturated";
  readonly route?: SketchRoute | null;
  readonly notePlacement?: "beside" | "under" | "badge";
  readonly font?: "kalam" | "caveat" | "patrick";
  readonly density?: "airy" | "compact" | "very-compact";
  readonly paper?: "plain" | "dots" | "lined";
}

export interface SketchPanel {
  readonly offsetX: number;
  readonly width: number;
  readonly height: number;
  readonly scene: SketchScene;
}

export interface SketchScene {
  readonly width: number;
  readonly height: number;
  readonly nodes: readonly SketchNode[];
  readonly edges?: readonly SketchEdge[];
  readonly labels?: readonly SketchLabel[];
  readonly notes?: readonly SketchNote[];
  readonly rules?: readonly SketchRule[];
  readonly look?: SketchLook;
  readonly panels?: readonly SketchPanel[];
}

export interface SketchCode {
  readonly pseudo?: string;
  readonly diff?: string;
  readonly docs?: string;
}

export interface SketchToggleChoice {
  readonly id: string;
  readonly label: string;
}

export interface SketchToggle {
  readonly initial: string;
  readonly choices: readonly SketchToggleChoice[];
}

export interface SketchDecisionOption {
  readonly letter: string;
  readonly title: string;
  readonly scene: SketchScene;
}

export interface SketchDecisionQuestion {
  readonly question: string;
  readonly options: readonly SketchDecisionOption[];
}

export interface SketchPlanPage {
  readonly nav: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly legend?: string;
  readonly scene: SketchScene;
  readonly toggle?: SketchToggle;
  readonly code?: SketchCode;
  readonly decision?: SketchDecisionQuestion;
}

export type SketchRecipeGroup =
  | "flows"
  | "time"
  | "files"
  | "data"
  | "systems"
  | "screens"
  | "account"
  | "decisions"
  | "look";

export interface SketchRecipe {
  readonly id: string;
  readonly group: SketchRecipeGroup;
  readonly name: string;
  readonly useFor: string;
  readonly scene: SketchScene;
  readonly toggle?: SketchToggle;
  readonly code?: SketchCode;
}

export type SketchPartGroup =
  | "controls"
  | "navigation"
  | "overlays"
  | "content"
  | "charts"
  | "frames"
  | "marks"
  | "icons";

export interface SketchPartExample {
  readonly label: string;
  readonly html: string;
}

export interface SketchPart {
  readonly className: string;
  readonly group: SketchPartGroup;
  readonly name: string;
  readonly useFor: string;
  readonly examples: readonly SketchPartExample[];
}

export type SketchIconTag =
  | "path"
  | "circle"
  | "rect"
  | "line"
  | "polyline"
  | "polygon"
  | "ellipse";

export interface SketchIconShape {
  readonly tag: SketchIconTag;
  readonly attributes: Readonly<Record<string, string | number>>;
}
