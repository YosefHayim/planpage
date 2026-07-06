import { CodeBlock } from "../../components/CodeBlock";
import { CodeExplorer, type ExplorerFile } from "../../components/CodeExplorer";
import { Flow } from "../../components/Flow";
import { PickBlock } from "../../components/PickBlock";
import { SectionCard } from "../../components/SectionCard";

export interface CodeStylePlanProps {
  readonly title: string;
  readonly picks: ReadonlyArray<{
    readonly id: string;
    readonly rule: string;
    readonly chosen: string;
    readonly rejected: string;
    readonly why?: string;
    readonly tag?: string;
  }>;
  /**
   * The canonical example. A single snippet (`code`) renders a CodeBlock; a `files` list renders
   * the IDE-style CodeExplorer (sidebar tree + per-file before/after) — the paved multi-file road.
   */
  readonly canonical?: {
    readonly label: string;
    readonly code?: string;
    readonly lang?: string;
    readonly files?: ReadonlyArray<ExplorerFile>;
  };
  /** Raw Mermaid source for the CLI-routing diagram. */
  readonly cliFlow?: string;
}

/** The pick-the-code gallery + canonical example + CLI flow — a code-style review, interactive. */
export const CodeStylePlan = ({ title, picks, canonical, cliFlow }: CodeStylePlanProps) => {
  if (picks.length === 0) throw new Error("CodeStylePlan: picks[] is required and non-empty");
  return (
    <div class="space-y-8">
      <SectionCard title={title} chip="code style">
        <div class="space-y-4">
          {picks.map((p) => (
            <PickBlock
              key={p.id}
              id={p.id}
              rule={p.rule}
              chosen={p.chosen}
              rejected={p.rejected}
              why={p.why}
              tag={p.tag}
            />
          ))}
        </div>
      </SectionCard>
      {canonical ? (
        <SectionCard title="Canonical example">
          {canonical.files && canonical.files.length > 0 ? (
            <CodeExplorer label={canonical.label} files={canonical.files} />
          ) : (
            <CodeBlock label={canonical.label} code={canonical.code ?? ""} lang={canonical.lang} />
          )}
        </SectionCard>
      ) : null}
      {cliFlow ? (
        <SectionCard title="CLI">
          <Flow source={cliFlow} />
        </SectionCard>
      ) : null}
    </div>
  );
};
