import type { SketchPart } from "../contracts/sketchScene";

export const MARKS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-tap-marker",
    group: "marks",
    name: "Tap marker",
    useFor: "A finger dot with rings, showing where a person taps. Long press adds more rings.",
    examples: [
      {
        label: "Tap",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button sk-main">Save changes</button>
    <span class="sk-tap-marker absolute -end-7 top-1/2 h-6 w-6 min-h-0 min-w-0 -translate-y-1/2"></span>
  </div>
</div>`,
      },
      {
        label: "Long press",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button sk-main">Save changes</button>
    <span class="sk-tap-marker absolute -end-7 top-1/2 h-6 w-6 min-h-0 min-w-0 -translate-y-1/2" data-count="4"></span>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-cursor",
    group: "marks",
    name: "Cursor",
    useFor: "A mouse pointer arrow, showing where the mouse sits over a control.",
    examples: [
      {
        label: "Over a button",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button sk-main">Save changes</button>
    <span class="sk-cursor absolute left-full top-full"></span>
  </div>
</div>`,
      },
      {
        label: "Over a ghost button",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button sk-ghost">Skip for now</button>
    <span class="sk-cursor absolute left-full top-full"></span>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-click-ripple",
    group: "marks",
    name: "Click ripple",
    useFor: "Rings spreading out from a click, showing where a press landed.",
    examples: [
      {
        label: "Click",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button">Add task</button>
    <span class="sk-click-ripple absolute -end-7 top-1/2 h-6 w-6 min-h-0 min-w-0 -translate-y-1/2"></span>
  </div>
</div>`,
      },
      {
        label: "Long press",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button">Add task</button>
    <span class="sk-click-ripple absolute -end-7 top-1/2 h-6 w-6 min-h-0 min-w-0 -translate-y-1/2" data-count="4"></span>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-focus-ring",
    group: "marks",
    name: "Focus ring",
    useFor: "A dashed blue ring around the control that has keyboard focus.",
    examples: [
      {
        label: "Button",
        html: `<div class="relative m-4 inline-block">
  <button type="button" class="sk-button sk-main">Save changes</button>
  <span class="sk-focus-ring absolute -inset-2"></span>
</div>`,
      },
      {
        label: "Text field",
        html: `<div class="relative m-4 inline-block">
  <p class="text-lg">maya@planpage.app</p>
  <span class="sk-focus-ring absolute -inset-2"></span>
</div>`,
      },
    ],
  },
  {
    className: "sk-numbered-callout",
    group: "marks",
    name: "Numbered callout",
    useFor:
      "A numbered pin that points at one part of a screen, so a review can refer to it by number.",
    examples: [
      {
        label: "One pin on a button",
        html: `<div class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button">Save changes</button>
    <span class="sk-numbered-callout absolute -end-3.5 -top-3.5">1</span>
  </div>
</div>`,
      },
      {
        label: "Three pins on a screen",
        html: `<div class="space-y-6 p-6">
  <div class="relative ps-8">
    <p class="text-lg">Launch plan</p>
    <span class="sk-numbered-callout absolute -start-3.5 -top-3.5">1</span>
  </div>
  <div class="relative ps-8">
    <p>Ship the sign-in page by Friday.</p>
    <span class="sk-numbered-callout absolute -start-3.5 -top-3.5">2</span>
  </div>
  <div class="relative inline-block">
    <button type="button" class="sk-button sk-main">Save changes</button>
    <span class="sk-numbered-callout absolute -end-3.5 -top-3.5">3</span>
  </div>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="p-6">
  <div class="relative inline-block">
    <button type="button" class="sk-button">שמירה</button>
    <span class="sk-numbered-callout absolute -end-3.5 -top-3.5">1</span>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-highlight-marker",
    group: "marks",
    name: "Highlight marker",
    useFor: "A translucent yellow band under a phrase, to mark the words that matter.",
    examples: [
      {
        label: "Phrase",
        html: `<p class="p-6 text-lg">Ship the <span class="sk-highlight-marker">launch plan</span> by Friday.</p>`,
      },
      {
        label: "Green highlight",
        html: `<p class="p-6 text-lg">Ship the <span class="sk-highlight-marker" data-fill="green">review notes</span> today.</p>`,
      },
    ],
  },
  {
    className: "sk-redline-strike",
    group: "marks",
    name: "Redline strike",
    useFor: "A red line through a word or price that should go.",
    examples: [
      {
        label: "Struck price",
        html: `<p class="p-6 text-lg"><span class="sk-redline-strike" data-tone="red">$40</span> <span>$25 today</span></p>`,
      },
      {
        label: "Struck word",
        html: `<p class="p-6 text-lg">Ship on <span class="sk-redline-strike" data-tone="red">Monday</span> Friday</p>`,
      },
    ],
  },
  {
    className: "sk-error-outline",
    group: "marks",
    name: "Error outline",
    useFor: "A red outline around a field or text that has a problem, with a message beside it.",
    examples: [
      {
        label: "Field",
        html: `<div class="relative m-4 inline-block">
  <p class="text-lg">maya@planpage</p>
  <span class="sk-error-outline absolute -inset-2" data-fill="red"></span>
</div>`,
      },
      {
        label: "Field with message",
        html: `<div class="space-y-3 p-6">
  <div class="relative inline-block">
    <p class="text-lg">maya@planpage</p>
    <span class="sk-error-outline absolute -inset-2"></span>
  </div>
  <p class="text-sm">Enter a valid email address</p>
</div>`,
      },
    ],
  },
  {
    className: "sk-sticky-note",
    group: "marks",
    name: "Sticky note",
    useFor: "A yellow sticky note with a folded corner, for a short comment on a screen.",
    examples: [
      {
        label: "Yellow note",
        html: `<div class="p-6">
  <p class="sk-sticky-note w-56">Check the price with Dana before Friday</p>
</div>`,
      },
      {
        label: "Blue note",
        html: `<div class="p-6">
  <p class="sk-sticky-note w-56" data-fill="blue">Ask legal about the terms</p>
</div>`,
      },
    ],
  },
  {
    className: "sk-taped-note",
    group: "marks",
    name: "Taped note",
    useFor:
      "A tilted paper note held by a strip of tape, for a comment that sits on top of a screen.",
    examples: [
      {
        label: "Taped note",
        html: `<div class="p-8">
  <div class="sk-taped-note w-56">
    <p class="text-lg">Call the bank on Monday</p>
  </div>
</div>`,
      },
      {
        label: "Two lines",
        html: `<div class="p-8">
  <div class="sk-taped-note w-56">
    <p class="text-lg">Ask Dana about the price</p>
    <p>Keep the old layout for now</p>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-stamp",
    group: "marks",
    name: "Stamp",
    useFor: "A rough rotated stamp such as APPROVED or REJECTED, put on a finished screen.",
    examples: [
      {
        label: "Approved",
        html: `<div class="relative p-6">
  <p class="text-lg">Launch plan, version 2</p>
  <span class="sk-stamp absolute right-4 top-6" data-tone="green">APPROVED</span>
</div>`,
      },
      {
        label: "Rejected",
        html: `<div class="relative p-6">
  <p class="text-lg">Launch plan, version 1</p>
  <span class="sk-stamp absolute right-4 top-6" data-tone="red">REJECTED</span>
</div>`,
      },
    ],
  },
  {
    className: "sk-measure",
    group: "marks",
    name: "Spacing and size measure",
    useFor:
      "A dimension line with end ticks and a size label, showing a width or the gap between two parts.",
    examples: [
      {
        label: "Width",
        html: `<div class="space-y-1 p-6">
  <span class="sk-measure w-40">160 px</span>
  <button type="button" class="sk-button sk-main w-40">Save changes</button>
</div>`,
      },
      {
        label: "Gap between two buttons",
        html: `<div class="flex items-center p-6">
  <button type="button" class="sk-button">Back</button>
  <span class="sk-measure w-16">16 px</span>
  <button type="button" class="sk-button sk-main">Next</button>
</div>`,
      },
    ],
  },
  {
    className: "sk-swipe-arrow",
    group: "marks",
    name: "Swipe gesture arrow",
    useFor:
      "An arrow with a finger dot showing a swipe across a list row, such as swipe to delete.",
    examples: [
      {
        label: "Swipe to delete",
        html: `<div class="flex items-center gap-4 p-6">
  <p class="flex-1 text-lg">Order 1042</p>
  <span class="sk-swipe-arrow h-10 w-32"></span>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="flex items-center gap-4 p-6">
  <p class="flex-1 text-lg">הזמנה 1042</p>
  <span class="sk-swipe-arrow h-10 w-32"></span>
</div>`,
      },
    ],
  },
  {
    className: "sk-annotation-arrow",
    group: "marks",
    name: "Annotation arrow",
    useFor: "A curved arrow that points a note at the part of the screen it talks about.",
    examples: [
      {
        label: "Note to a button",
        html: `<div class="relative h-44 p-6">
  <p class="sk-sticky-note absolute left-6 bottom-6 w-40">Make this bigger</p>
  <span class="sk-annotation-arrow absolute left-40 top-4 h-28 w-44"></span>
  <button type="button" class="sk-button sk-main absolute right-6 top-2">Save changes</button>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="relative h-44 p-6">
  <p class="sk-sticky-note absolute right-6 bottom-6 w-40">להגדיל את הכפתור</p>
  <span class="sk-annotation-arrow absolute right-40 top-4 h-28 w-44"></span>
  <button type="button" class="sk-button sk-main absolute left-6 top-2">שמירה</button>
</div>`,
      },
    ],
  },
];
