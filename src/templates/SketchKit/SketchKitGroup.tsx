import type { VNode } from "preact";
import type { SketchPart } from "../../contracts/sketchScene";
import { SketchKitPartCard } from "./SketchKitPartCard";

export interface SketchKitGroupProps {
  readonly title: string;
  readonly parts: readonly SketchPart[];
}

export const SketchKitGroup = ({ title, parts }: SketchKitGroupProps): VNode => (
  <section class="space-y-6">
    <h2 class="text-xl font-bold">{title}</h2>
    {parts.map((part) => (
      <SketchKitPartCard key={part.className} part={part} />
    ))}
  </section>
);
