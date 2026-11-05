import type { SketchPart } from "../contracts/sketchScene";

export const CONTROLS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-button",
    group: "controls",
    name: "Button",
    useFor: "A main action, a secondary action, a plain text action, or a disabled or failed one.",
    examples: [
      { label: "Main", html: '<button type="button" class="sk-button sk-main">Save</button>' },
      { label: "Secondary", html: '<button type="button" class="sk-button">Cancel</button>' },
      { label: "Ghost", html: '<button type="button" class="sk-button sk-ghost">Skip</button>' },
      { label: "Danger", html: '<button type="button" class="sk-button sk-danger">Delete</button>' },
      { label: "Focus", html: '<button type="button" class="sk-button sk-main" data-status="focus">Save</button>' },
      { label: "Disabled", html: '<button type="button" class="sk-button" data-status="disabled">Save</button>' },
      { label: "Error", html: '<button type="button" class="sk-button" data-status="error">Retry</button>' },
    ],
  },
  {
    className: "sk-checkbox",
    group: "controls",
    name: "Checkbox",
    useFor: "A yes or no choice, shown with or without a check mark.",
    examples: [
      { label: "Unchecked", html: '<span class="sk-checkbox"></span>' },
      { label: "Checked", html: '<span class="sk-checkbox" data-checked></span>' },
      { label: "Disabled", html: '<span class="sk-checkbox" data-status="disabled"></span>' },
    ],
  },
];
