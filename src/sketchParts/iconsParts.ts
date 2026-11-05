import type { SketchPart, SketchPartExample } from "../contracts/sketchScene";

interface IconCategory {
  label: string;
  iconNames: readonly string[];
}

const ICON_CATEGORIES: readonly IconCategory[] = [
  {
    label: "Navigation",
    iconNames: [
      "chevron-left",
      "chevron-right",
      "chevron-up",
      "chevron-down",
      "chevrons-up-down",
      "arrow-left",
      "arrow-right",
      "arrow-up",
      "arrow-down",
      "menu",
      "house",
      "undo-2",
    ],
  },
  {
    label: "Actions",
    iconNames: [
      "search",
      "plus",
      "x",
      "check",
      "pencil",
      "trash-2",
      "share-2",
      "copy",
      "download",
      "upload",
      "funnel",
      "settings",
      "sliders-horizontal",
      "log-out",
      "log-in",
      "ellipsis",
      "ellipsis-vertical",
      "sparkles",
      "refresh-cw",
      "external-link",
    ],
  },
  {
    label: "Media",
    iconNames: [
      "play",
      "pause",
      "image",
      "images",
      "camera",
      "mic",
      "volume-2",
      "music",
      "video",
      "qr-code",
    ],
  },
  {
    label: "Communication",
    iconNames: [
      "mail",
      "message-circle",
      "message-square",
      "bell",
      "bell-ring",
      "phone",
      "send",
      "inbox",
    ],
  },
  {
    label: "Commerce",
    iconNames: [
      "shopping-cart",
      "shopping-bag",
      "credit-card",
      "tag",
      "wallet",
      "receipt",
      "ticket",
      "coins",
      "banknote",
    ],
  },
  {
    label: "Files",
    iconNames: [
      "file",
      "file-text",
      "folder",
      "folder-open",
      "paperclip",
      "link",
      "upload-cloud",
      "archive",
    ],
  },
  {
    label: "Status",
    iconNames: [
      "circle-check",
      "circle-alert",
      "triangle-alert",
      "info",
      "circle-help",
      "lock",
      "eye",
      "eye-off",
      "star",
      "heart",
      "shield-check",
      "flag",
      "thumbs-up",
    ],
  },
  {
    label: "People",
    iconNames: ["user", "users", "user-plus", "user-check", "user-round", "smile", "bot"],
  },
  {
    label: "Devices",
    iconNames: ["smartphone", "laptop", "monitor", "tablet", "watch", "wifi", "cpu"],
  },
  {
    label: "Weather and time",
    iconNames: [
      "sun",
      "moon",
      "cloud",
      "cloud-rain",
      "clock",
      "calendar",
      "calendar-days",
      "calendar-check",
      "alarm-clock",
      "timer",
      "hourglass",
    ],
  },
  {
    label: "Social",
    iconNames: [
      "globe",
      "map-pin",
      "map",
      "bookmark",
      "compass",
      "rss",
      "newspaper",
      "briefcase",
      "building-2",
      "rocket",
      "leaf",
      "trophy",
    ],
  },
  {
    label: "Layout and text",
    iconNames: [
      "grip-vertical",
      "layout-dashboard",
      "layout-grid",
      "columns-3",
      "list",
      "list-checks",
      "table",
      "bold",
      "italic",
      "underline",
      "align-left",
    ],
  },
  {
    label: "Data",
    iconNames: ["chart-column", "chart-line", "chart-pie", "activity"],
  },
];

const FILL_EXAMPLES = [
  { label: "Blue", fill: "blue" },
  { label: "Grey", fill: "grey" },
  { label: "Orange", fill: "orange" },
  { label: "Green", fill: "green" },
  { label: "Red", fill: "red" },
  { label: "Yellow", fill: "yellow" },
];

const TONE_NAMES = ["ink", "blue", "red", "green", "orange", "soft"];

const createIconCellHtml = (iconName: string): string =>
  `<div class="flex flex-col items-center gap-1"><span class="sk-icon" data-icon="${iconName}"></span><span class="text-xs">${iconName}</span></div>`;

const createIconGridHtml = (iconNames: readonly string[]): string => {
  const cellsHtml = iconNames.map(createIconCellHtml).join("");
  return `<div class="grid grid-cols-6 gap-3 sm:grid-cols-8">${cellsHtml}</div>`;
};

const createCategoryExamples = (): SketchPartExample[] =>
  ICON_CATEGORIES.map((category) => ({
    label: category.label,
    html: createIconGridHtml(category.iconNames),
  }));

const createToneExample = (): SketchPartExample => {
  const iconsHtml = TONE_NAMES.map(
    (toneName) => `<span class="sk-icon" data-icon="bell" data-tone="${toneName}"></span>`,
  ).join("");
  return { label: "Tones", html: `<div class="flex items-center gap-3">${iconsHtml}</div>` };
};

const createDisabledExample = (): SketchPartExample => ({
  label: "Disabled",
  html: '<div class="flex items-center gap-3"><span class="sk-icon" data-icon="bell" data-status="disabled"></span><span class="sk-icon" data-icon="search" data-status="disabled"></span></div>',
});

const createRightToLeftIconExample = (): SketchPartExample => ({
  label: "Right to left, in Hebrew",
  html: '<div dir="rtl" class="flex items-center gap-3"><span class="sk-icon" data-icon="chevron-left"></span><span class="sk-icon" data-icon="chevron-right"></span><span class="sk-icon" data-icon="arrow-left"></span><span>חזרה</span></div>',
});

const createFillExamples = (className: string, iconName: string): SketchPartExample[] =>
  FILL_EXAMPLES.map((fillExample) => ({
    label: fillExample.label,
    html: `<span class="${className}" data-icon="${iconName}" data-fill="${fillExample.fill}"></span>`,
  }));

export const ICONS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-icon",
    group: "icons",
    name: "Icon",
    useFor:
      "A small Lucide icon, drawn rough, named by data-icon. Directional icons mirror in right-to-left text.",
    examples: [
      ...createCategoryExamples(),
      createToneExample(),
      createDisabledExample(),
      createRightToLeftIconExample(),
    ],
  },
  {
    className: "sk-icon-tile",
    group: "icons",
    name: "Icon tile",
    useFor: "An icon in a soft filled rounded square, for feature lists, app grids and menus.",
    examples: [
      ...createFillExamples("sk-icon-tile", "bell"),
      {
        label: "Red icon",
        html: '<span class="sk-icon-tile" data-icon="bell" data-fill="grey" data-tone="red"></span>',
      },
      {
        label: "Disabled",
        html: '<span class="sk-icon-tile" data-icon="bell" data-status="disabled"></span>',
      },
      {
        label: "Right to left, in Hebrew",
        html: '<div dir="rtl" class="flex items-center gap-3"><span class="sk-icon-tile" data-icon="chevron-left"></span><span>חזרה</span></div>',
      },
    ],
  },
  {
    className: "sk-featured-icon",
    group: "icons",
    name: "Featured icon",
    useFor:
      "An icon in a soft filled circle with a light ring, for a headline or a single key point.",
    examples: [
      ...createFillExamples("sk-featured-icon", "sparkles"),
      {
        label: "Red icon",
        html: '<span class="sk-featured-icon" data-icon="thumbs-up" data-fill="grey" data-tone="red"></span>',
      },
      {
        label: "Disabled",
        html: '<span class="sk-featured-icon" data-icon="sparkles" data-status="disabled"></span>',
      },
    ],
  },
];
