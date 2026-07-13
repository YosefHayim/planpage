export interface TerminalLine {
  /** A command, shown after a green `$` prompt. */
  readonly command?: string;
  /** Program output, shown muted. Newlines are preserved. */
  readonly output?: string;
  /** A `#`-prefixed dim comment. */
  readonly comment?: string;
}

export interface TerminalProps {
  /** The window title (e.g. "bash", "zsh"). Default "bash". */
  readonly title?: string;
  readonly lines: ReadonlyArray<TerminalLine>;
}

/** One terminal line — a command (green `$`), a `#` comment, or muted output. */
const Line = ({ line }: { readonly line: TerminalLine }) => {
  if (line.comment !== undefined) return <div class="text-slate-500"># {line.comment}</div>;
  if (line.command !== undefined)
    return (
      <div>
        <span class="select-none text-emerald-400">$</span>{" "}
        <span class="text-slate-100">{line.command}</span>
      </div>
    );
  return <div class="text-slate-400">{line.output}</div>;
};

/**
 * A faux terminal window — traffic-light title bar + a monospace body of commands, comments, and
 * output. Renders CLI flows for interactive-cli-reviewer or a skill's own `npx …` docs. Pure — no
 * client JS; it is a picture of a terminal, not a live one.
 */
export const Terminal = ({ title = "bash", lines }: TerminalProps) => {
  if (lines.length === 0) throw new Error("Terminal: lines[] is required and non-empty");
  return (
    <div class="overflow-hidden rounded-xl border border-slate-800 bg-[#0d1117] shadow-sm">
      <div class="flex items-center gap-2 border-slate-800 border-b px-4 py-2.5">
        <span class="h-3 w-3 rounded-full bg-rose-500" />
        <span class="h-3 w-3 rounded-full bg-amber-400" />
        <span class="h-3 w-3 rounded-full bg-emerald-500" />
        <span class="ml-2 font-mono text-slate-400 text-xs">{title}</span>
      </div>
      <pre class="overflow-x-auto p-4 font-mono text-slate-200 text-xs leading-relaxed">
        {lines.map((line, i) => (
          <Line key={`${line.command ?? line.comment ?? line.output ?? ""}-${i}`} line={line} />
        ))}
      </pre>
    </div>
  );
};
