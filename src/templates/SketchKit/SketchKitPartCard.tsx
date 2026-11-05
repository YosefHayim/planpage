import type { VNode } from "preact";
import type { SketchPart } from "../../contracts/sketchScene";

export interface SketchKitPartCardProps {
  readonly part: SketchPart;
}

export const SketchKitPartCard = ({ part }: SketchKitPartCardProps): VNode => (
  <article id={part.className} class="space-y-3">
    <h3 class="text-lg font-bold">
      {part.name} <code>{part.className}</code>
    </h3>
    <p>{part.useFor}</p>
    <div class="grid gap-4 sm:grid-cols-2">
      {part.examples.map((example) => (
        <figure key={example.label} class="space-y-2 rounded border border-dashed p-4">
          <figcaption>{example.label}</figcaption>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: sketch kit examples are repo-authored, not user data */}
          <div class="sk-wireframe" dangerouslySetInnerHTML={{ __html: example.html }} />
        </figure>
      ))}
    </div>
  </article>
);
