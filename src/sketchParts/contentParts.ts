import type { SketchPart } from "../contracts/sketchScene";

export const CONTENT_PARTS: readonly SketchPart[] = [
  {
    className: "sk-card",
    group: "content",
    name: "Card",
    useFor: "A box that groups related content.",
    examples: [
      { label: "Plain", html: '<div class="sk-card"></div>' },
      { label: "Blue fill", html: '<div class="sk-card" data-fill="blue"></div>' },
    ],
  },
  {
    className: "sk-text-lines",
    group: "content",
    name: "Text lines",
    useFor: "Placeholder squiggles where text will go.",
    examples: [
      { label: "Three lines", html: '<div class="sk-text-lines" data-count="3"></div>' },
      { label: "Five lines", html: '<div class="sk-text-lines" data-count="5"></div>' },
    ],
  },
];
