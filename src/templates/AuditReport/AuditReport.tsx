import { Callout, type CalloutTone } from "../../components/Callout";
import { type Risk, RiskList } from "../../components/RiskList";
import { type ScoreDimension, Scorecard } from "../../components/Scorecard";
import { SectionCard } from "../../components/SectionCard";
import { Terminal, type TerminalLine } from "../../components/Terminal";

export interface AuditNote {
  readonly tone: CalloutTone;
  readonly title?: string;
  readonly body: string;
}

export interface AuditReportProps {
  readonly title: string;
  readonly overall?: number;
  readonly dimensions: ReadonlyArray<ScoreDimension>;
  /** The command that produced the report — shown in a faux terminal. */
  readonly command?: ReadonlyArray<TerminalLine>;
  readonly notes?: ReadonlyArray<AuditNote>;
  readonly risks?: ReadonlyArray<Risk>;
}

/**
 * A scored audit report — a graded Scorecard up top, the command that produced it, margin notes,
 * and the gaps as a RiskList. Composes the new Scorecard + Terminal with the existing RiskList +
 * Callout. The report surface for web-best-practices / grill-me-code-style-review.
 */
export const AuditReport = ({
  title,
  overall,
  dimensions,
  command,
  notes,
  risks,
}: AuditReportProps) => {
  if (dimensions.length === 0)
    throw new Error("AuditReport: dimensions[] is required and non-empty");
  return (
    <div class="space-y-8">
      <Scorecard title={title} overall={overall} dimensions={dimensions} />
      {command && command.length > 0 ? (
        <SectionCard title="How it was run" chip="cli">
          <Terminal lines={command} />
        </SectionCard>
      ) : null}
      {notes && notes.length > 0 ? (
        <div class="space-y-3">
          {notes.map((note) => (
            <Callout key={note.body} tone={note.tone} title={note.title}>
              {note.body}
            </Callout>
          ))}
        </div>
      ) : null}
      {risks && risks.length > 0 ? (
        <SectionCard title="Gaps & fixes" chip="risks">
          <RiskList items={risks} />
        </SectionCard>
      ) : null}
    </div>
  );
};
