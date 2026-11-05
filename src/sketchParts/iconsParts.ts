import type { SketchPart } from "../contracts/sketchScene";

export const ICONS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-icon",
    group: "icons",
    name: "Icon",
    useFor: "A small Lucide icon, drawn rough, named by data-icon.",
    examples: [
      { label: "Search", html: '<span class="sk-icon" data-icon="search"></span>' },
      { label: "Chevron", html: '<span class="sk-icon" data-icon="chevron-down"></span>' },
      { label: "Check", html: '<span class="sk-icon" data-icon="check"></span>' },
      { label: "Plus", html: '<span class="sk-icon" data-icon="plus"></span>' },
      { label: "Close", html: '<span class="sk-icon" data-icon="x"></span>' },
      { label: "Bell", html: '<span class="sk-icon" data-icon="bell"></span>' },
    ],
  },
];
