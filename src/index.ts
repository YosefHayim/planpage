// Public API. Consumers author against these components and turn a tree into HTML with render().

export { Accordion, type AccordionItem, type AccordionProps } from "./components/Accordion";
export {
  AnnotatedCode,
  type AnnotatedCodeProps,
  type Annotation,
} from "./components/AnnotatedCode";
export { Callout, type CalloutProps, type CalloutTone } from "./components/Callout";
export { CodeBlock, type CodeBlockProps } from "./components/CodeBlock";
export {
  CodeExplorer,
  type CodeExplorerProps,
  type ExplorerFile,
} from "./components/CodeExplorer";
export { DiffBlock, type DiffBlockProps } from "./components/DiffBlock";
export { Flow, type FlowProps } from "./components/Flow";
export {
  type CompareOption,
  OptionCompare,
  type OptionCompareProps,
  type Verdict,
} from "./components/OptionCompare";
export { PickBlock, type PickBlockProps } from "./components/PickBlock";
export { PlanSummary, type PlanSummaryProps, type Stat } from "./components/PlanSummary";
export { type Risk, RiskList, type RiskListProps, type Severity } from "./components/RiskList";
export { SectionCard, type SectionCardProps } from "./components/SectionCard";
export { Shell, type ShellProps, type Theme } from "./components/Shell";
export { type StatusChipProps, StatusChip, type StepStatus } from "./components/StatusChip";
export { type Step, Steps, type StepsProps } from "./components/Steps";
export { SubmitBar, type SubmitBarProps } from "./components/SubmitBar";
export { Timeline, type TimelineItem, type TimelineProps } from "./components/Timeline";
export { TreePanel, type TreePanelProps } from "./components/TreePanel";
export type { Decision } from "./contracts/decision";
export {
  GALLERY,
  type GalleryEntry,
  type GalleryName,
  type PropDoc,
  TEMPLATE_INDEX,
  type TemplateInfo,
} from "./gallery/registry";
export { highlight, renderHighlighted } from "./highlight/highlight";
export { raw } from "./render/raw";
export { render, type RenderOptions } from "./render/render";
export { serve, type ServeOptions } from "./server/serve";
export { BeforeAfter, type BeforeAfterProps } from "./templates/BeforeAfter/BeforeAfter";
export { CodeStylePlan, type CodeStylePlanProps } from "./templates/CodeStylePlan/CodeStylePlan";
export { Library, type LibraryProps } from "./templates/Library/Library";
export { PlanBrief, type PlanBriefProps, type PlanNote } from "./templates/PlanBrief/PlanBrief";
export {
  QuestionCard,
  type QuestionCardProps,
  type QuestionOption,
} from "./components/QuestionCard";
export {
  QuestionPoll,
  type QuestionLayout,
  type QuestionPollProps,
} from "./templates/QuestionPoll/QuestionPoll";
export { SAMPLES, TEMPLATES, type TemplateName } from "./templates";
