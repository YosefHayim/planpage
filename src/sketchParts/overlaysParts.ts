import type { SketchPart } from "../contracts/sketchScene";

const ORDERS_SCREEN_HTML =
  '<div class="h-72 space-y-3 p-4"><p class="text-xl">Orders</p><div class="grid grid-cols-2 gap-3"><div class="sk-card h-20"></div><div class="sk-card h-20"></div></div><div class="sk-card h-20"></div></div>';
const SCRIM_HTML = '<div class="sk-scrim"></div>';
const HEBREW_SCREEN_HTML =
  '<div class="h-72 space-y-3 p-4"><p class="text-xl">מוצרים</p><div class="grid grid-cols-2 gap-3"><div class="sk-card h-20"></div><div class="sk-card h-20"></div></div><div class="sk-card h-20"></div></div>';

export const OVERLAYS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-scrim",
    group: "overlays",
    name: "Scrim",
    useFor:
      "A dimmed hatch over the screen behind a dialog, sheet or drawer, so the panel on top stands out.",
    examples: [{ label: "Over a screen", html: `${ORDERS_SCREEN_HTML}${SCRIM_HTML}` }],
  },
  {
    className: "sk-dialog",
    group: "overlays",
    name: "Dialog",
    useFor: "A focused panel on top of a screen, with a title, a short text and actions.",
    examples: [
      {
        label: "Default",
        html: `${ORDERS_SCREEN_HTML}${SCRIM_HTML}<div class="sk-dialog absolute inset-x-6 top-1/2 -translate-y-1/2 space-y-3"><span class="sk-icon absolute end-3 top-3" data-icon="x"></span><p class="text-xl font-bold">Edit order</p><p>Change the note or the delivery day.</p><div class="flex justify-end gap-3"><button type="button" class="sk-button sk-ghost">Cancel</button><button type="button" class="sk-button sk-main">Save</button></div></div>`,
      },
    ],
  },
  {
    className: "sk-alert-dialog",
    group: "overlays",
    name: "Alert dialog",
    useFor:
      "A dialog that asks the user to confirm a risky action, with a cancel button and a red action.",
    examples: [
      {
        label: "Confirm delete",
        html: `${ORDERS_SCREEN_HTML}${SCRIM_HTML}<div class="sk-alert-dialog absolute inset-x-8 top-1/2 -translate-y-1/2 space-y-3"><p class="text-xl font-bold">Delete this order?</p><p>The order and its receipt will be removed.</p><div class="flex justify-end gap-2"><button type="button" class="sk-button">Cancel</button><button type="button" class="sk-button sk-danger">Delete order</button></div></div>`,
      },
    ],
  },
  {
    className: "sk-full-screen-modal",
    group: "overlays",
    name: "Full screen modal",
    useFor:
      "A whole screen layered over the app, with a close button in the top bar and one main action.",
    examples: [
      {
        label: "Edit profile",
        html: '<div class="sk-full-screen-modal h-72 space-y-4 p-4"><div class="flex items-center justify-between gap-3"><span class="sk-icon" data-icon="x"></span><p class="text-xl font-bold">Edit profile</p><button type="button" class="sk-button sk-main">Save</button></div><div class="sk-card h-20"></div><p>Name, photo and email address.</p></div>',
      },
    ],
  },
  {
    className: "sk-bottom-sheet",
    group: "overlays",
    name: "Bottom sheet",
    useFor:
      "A panel that slides up from the bottom edge, with a grab handle and one or two actions.",
    examples: [
      {
        label: "Sort orders",
        html: `${ORDERS_SCREEN_HTML}${SCRIM_HTML}<div class="sk-bottom-sheet absolute inset-x-0 bottom-0 space-y-3 pt-6"><p class="text-lg font-bold">Sort orders</p><p>Newest first, or the soonest delivery.</p><button type="button" class="sk-button sk-main w-full">Apply sort</button></div>`,
      },
    ],
  },
  {
    className: "sk-drawer",
    group: "overlays",
    name: "Drawer",
    useFor: "A side panel with a list of pages, slid in from the edge of the screen.",
    examples: [
      {
        label: "From the right",
        html: `${ORDERS_SCREEN_HTML}${SCRIM_HTML}<div class="sk-drawer absolute bottom-0 end-0 top-0 w-2/3 space-y-3 p-4"><p class="text-lg font-bold">Menu</p><p>Home</p><p>Orders</p><p>Settings</p></div>`,
      },
      {
        label: "Hebrew, mirrored",
        html: `<div dir="rtl">${HEBREW_SCREEN_HTML}${SCRIM_HTML}<div class="sk-drawer absolute bottom-0 end-0 top-0 w-2/3 space-y-3 p-4"><p class="text-lg font-bold">תפריט</p><p>בית</p><p>הזמנות</p><p>הגדרות</p></div></div>`,
      },
    ],
  },
  {
    className: "sk-action-sheet",
    group: "overlays",
    name: "Action sheet",
    useFor: "A short list of actions for one item, with a separate cancel button at the bottom.",
    examples: [
      {
        label: "Order actions",
        html: `${ORDERS_SCREEN_HTML}${SCRIM_HTML}<div class="absolute inset-x-3 bottom-3 space-y-2"><div class="sk-action-sheet space-y-1 p-2"><button type="button" class="sk-button sk-ghost w-full">Share link</button><button type="button" class="sk-button sk-ghost w-full">Duplicate order</button><button type="button" class="sk-button sk-ghost w-full">Delete order</button></div><button type="button" class="sk-button sk-main w-full">Cancel</button></div>`,
      },
    ],
  },
  {
    className: "sk-popover",
    group: "overlays",
    name: "Popover",
    useFor: "A small panel that opens under a button, with its pointer aimed at the button.",
    examples: [
      {
        label: "Sort menu",
        html: '<div class="space-y-6 p-4"><button type="button" class="sk-button mx-auto block">Sort</button><div class="sk-popover mx-auto w-64 space-y-2"><p class="font-bold">Sort by</p><p>Newest first</p><p>Soonest delivery</p></div></div>',
      },
    ],
  },
  {
    className: "sk-tooltip",
    group: "overlays",
    name: "Tooltip",
    useFor: "A short hint next to a button, with its pointer aimed down at the button.",
    examples: [
      {
        label: "Copy hint",
        html: '<div class="flex flex-col items-center gap-6 p-4"><div class="sk-tooltip">Copy link to this order</div><button type="button" class="sk-button">Share</button></div>',
      },
    ],
  },
  {
    className: "sk-hover-card",
    group: "overlays",
    name: "Hover card",
    useFor: "A bigger preview that opens when the pointer rests on a name or a link.",
    examples: [
      {
        label: "Person preview",
        html: '<div class="space-y-6 p-4"><p class="text-center">Ordered by <span class="underline">Maya Cohen</span></p><div class="sk-hover-card mx-auto w-72 space-y-2"><p class="font-bold">Maya Cohen</p><p>Designer at Northwind</p><p>Ordered 12 times this year</p><button type="button" class="sk-button sk-main">Message Maya</button></div></div>',
      },
    ],
  },
  {
    className: "sk-dropdown-menu",
    group: "overlays",
    name: "Dropdown menu",
    useFor: "A list of actions that drops down from a button, with rows and dividers.",
    examples: [
      {
        label: "Order actions",
        html: '<div class="sk-dropdown-menu w-64 space-y-1 p-2"><div class="sk-menu-row">Edit order</div><div class="sk-menu-row" data-status="hover">Duplicate order</div><div class="sk-menu-divider"></div><div class="sk-menu-row">Archive</div><div class="sk-menu-row">Delete</div></div>',
      },
      {
        label: "Hebrew, mirrored",
        html: '<div dir="rtl" class="sk-dropdown-menu w-64 space-y-1 p-2"><div class="sk-menu-row">עריכת הזמנה</div><div class="sk-menu-row" data-status="hover">שכפול הזמנה</div><div class="sk-menu-divider"></div><div class="sk-menu-row">ארכיון</div><div class="sk-menu-row">מחיקה</div></div>',
      },
    ],
  },
  {
    className: "sk-menu-row",
    group: "overlays",
    name: "Menu row",
    useFor: "One row in a menu, shown normal or hovered.",
    examples: [
      {
        label: "Normal",
        html: '<div class="sk-dropdown-menu w-56 p-2"><div class="sk-menu-row">Share link</div></div>',
      },
      {
        label: "Hovered",
        html: '<div class="sk-dropdown-menu w-56 p-2"><div class="sk-menu-row" data-status="hover">Share link</div></div>',
      },
    ],
  },
  {
    className: "sk-menu-divider",
    group: "overlays",
    name: "Menu divider",
    useFor: "A thin line that separates groups of rows in a menu.",
    examples: [
      {
        label: "Between rows",
        html: '<div class="sk-dropdown-menu w-56 p-2"><div class="sk-menu-row">Copy</div><div class="sk-menu-divider"></div><div class="sk-menu-row">Paste</div></div>',
      },
    ],
  },
  {
    className: "sk-context-menu",
    group: "overlays",
    name: "Context menu",
    useFor: "A menu that opens where the user right-clicks, with rows and a divider.",
    examples: [
      {
        label: "Right-click menu",
        html: '<div class="sk-context-menu w-56 space-y-1 p-2"><div class="sk-menu-row">Copy</div><div class="sk-menu-row" data-status="hover">Paste</div><div class="sk-menu-divider"></div><div class="sk-menu-row">Delete</div></div>',
      },
    ],
  },
  {
    className: "sk-toast",
    group: "overlays",
    name: "Toast",
    useFor: "A short message that pops up for a moment, with a tone and an icon.",
    examples: [
      {
        label: "Saved",
        html: '<div class="sk-toast max-w-xs" data-tone="green"><p class="font-bold">Changes saved</p><p>Your profile is up to date.</p></div>',
      },
      {
        label: "Error",
        html: '<div class="sk-toast max-w-xs" data-tone="red"><p class="font-bold">Could not save</p><p>Check your connection and try again.</p></div>',
      },
    ],
  },
  {
    className: "sk-toast-stack",
    group: "overlays",
    name: "Toast stack",
    useFor: "Several toasts piled up, each one offset a little behind the front one.",
    examples: [
      {
        label: "Three toasts",
        html: '<div class="sk-toast-stack max-w-xs"><div class="sk-toast"></div><div class="sk-toast"></div><div class="sk-toast" data-tone="green"><p class="font-bold">Changes saved</p><p>Your profile is up to date.</p></div></div>',
      },
    ],
  },
  {
    className: "sk-notification",
    group: "overlays",
    name: "Notification",
    useFor: "A card that tells the user about something new, like a reply or an update.",
    examples: [
      {
        label: "New reply",
        html: '<div class="sk-notification max-w-sm"><p class="font-bold">Maya replied</p><p>Can we move the call to 4 pm?</p></div>',
      },
      {
        label: "Warning",
        html: '<div class="sk-notification max-w-sm" data-tone="orange"><p class="font-bold">Stock is low</p><p>Only 3 left of the blue mug.</p></div>',
      },
    ],
  },
  {
    className: "sk-notification-stack",
    group: "overlays",
    name: "Notification stack",
    useFor: "Several notifications piled up, each one offset a little behind the front one.",
    examples: [
      {
        label: "Three notifications",
        html: '<div class="sk-notification-stack max-w-sm"><div class="sk-notification"></div><div class="sk-notification"></div><div class="sk-notification"><p class="font-bold">Maya replied</p><p>Can we move the call to 4 pm?</p></div></div>',
      },
    ],
  },
  {
    className: "sk-banner",
    group: "overlays",
    name: "Banner",
    useFor: "A strip across the top of a page with one message and one action.",
    examples: [
      {
        label: "Trial ending",
        html: '<div class="sk-banner flex items-center justify-between gap-3"><p>Your trial ends in 3 days.</p><button type="button" class="sk-button sk-main">Upgrade</button></div>',
      },
    ],
  },
  {
    className: "sk-alert",
    group: "overlays",
    name: "Alert",
    useFor: "An inline message with a tone and an icon: info, success, warning or error.",
    examples: [
      {
        label: "Info",
        html: '<div class="sk-alert" data-tone="blue"><p class="font-bold">New version</p><p>Version 2 is ready to install.</p></div>',
      },
      {
        label: "Success",
        html: '<div class="sk-alert" data-tone="green"><p class="font-bold">Changes saved</p><p>Your profile is up to date.</p></div>',
      },
      {
        label: "Warning",
        html: '<div class="sk-alert" data-tone="orange"><p class="font-bold">Trial ends soon</p><p>Add a card before Friday.</p></div>',
      },
      {
        label: "Error",
        html: '<div class="sk-alert" data-tone="red"><p class="font-bold">Payment failed</p><p>Your card was declined.</p></div>',
      },
    ],
  },
  {
    className: "sk-cookie-notice",
    group: "overlays",
    name: "Cookie notice",
    useFor:
      "A bottom card that asks the visitor about cookies, with a reject and an accept button.",
    examples: [
      {
        label: "Cookie choice",
        html: '<div class="sk-cookie-notice mx-auto max-w-lg space-y-3"><p class="font-bold">We use cookies</p><p>Cookies keep your cart and sign-in working.</p><div class="flex justify-end gap-2"><button type="button" class="sk-button sk-ghost">Reject</button><button type="button" class="sk-button sk-main">Accept all</button></div></div>',
      },
    ],
  },
  {
    className: "sk-permission-prompt",
    group: "overlays",
    name: "Permission prompt",
    useFor: "A card that asks the user for a phone permission, with an icon and two buttons.",
    examples: [
      {
        label: "Notifications",
        html: '<div class="sk-permission-prompt mx-auto max-w-sm space-y-3"><span class="sk-icon" data-icon="bell"></span><p class="font-bold">Allow notifications?</p><p>We will tell you when an order ships.</p><div class="flex justify-end gap-2"><button type="button" class="sk-button">Not now</button><button type="button" class="sk-button sk-main">Allow</button></div></div>',
      },
    ],
  },
  {
    className: "sk-tour-step",
    group: "overlays",
    name: "Tour step",
    useFor:
      "A callout that points at one part of the screen during a guided tour, with progress and next or skip.",
    examples: [
      {
        label: "Step 2 of 5",
        html: '<div class="space-y-6 p-4"><div class="flex justify-center"><button type="button" class="sk-button sk-main" data-status="focus">Filter</button></div><div class="sk-tour-step mx-auto w-72 space-y-2"><p class="text-sm">2 of 5</p><p class="font-bold">Filter your orders</p><p>Pick a day or a status to see fewer rows.</p><div class="flex justify-between gap-2"><button type="button" class="sk-button sk-ghost">Skip</button><button type="button" class="sk-button sk-main">Next</button></div></div></div>',
      },
    ],
  },
  {
    className: "sk-spinner",
    group: "overlays",
    name: "Spinner",
    useFor: "A rough open ring that shows something is loading.",
    examples: [
      { label: "Default", html: '<span class="sk-spinner"></span>' },
      {
        label: "Inline with text",
        html: '<div class="flex items-center gap-2"><span class="sk-spinner" data-tone="blue"></span><span>Loading orders</span></div>',
      },
    ],
  },
  {
    className: "sk-progress-bar",
    group: "overlays",
    name: "Progress bar",
    useFor: "A bar that fills from the start edge to show how far a task has got.",
    examples: [
      {
        label: "60 percent",
        html: '<div class="space-y-2"><p>Uploading photos</p><div class="sk-progress-bar" data-percent="60"></div></div>',
      },
      {
        label: "Hebrew, mirrored",
        html: '<div dir="rtl" class="space-y-2"><p>מעלה תמונות</p><div class="sk-progress-bar" data-percent="35"></div></div>',
      },
    ],
  },
  {
    className: "sk-progress-circle",
    group: "overlays",
    name: "Progress circle",
    useFor: "A ring that fills clockwise to show a percentage, with the number in the middle.",
    examples: [
      {
        label: "60 percent",
        html: '<span class="sk-progress-circle" data-percent="60">60%</span>',
      },
      { label: "Done", html: '<span class="sk-progress-circle" data-percent="100">100%</span>' },
      { label: "Not started", html: '<span class="sk-progress-circle" data-percent="0">0%</span>' },
    ],
  },
  {
    className: "sk-skeleton",
    group: "overlays",
    name: "Skeleton",
    useFor: "A soft hatched placeholder shaped like the content that is still loading.",
    examples: [
      {
        label: "Line",
        html: '<div class="sk-skeleton sk-skeleton-line w-full"></div>',
      },
      {
        label: "Block",
        html: '<div class="sk-skeleton sk-skeleton-block w-full"></div>',
      },
      {
        label: "Avatar",
        html: '<span class="sk-skeleton sk-skeleton-avatar"></span>',
      },
      {
        label: "Card",
        html: '<div class="sk-skeleton sk-skeleton-card w-full"></div>',
      },
      {
        label: "Loading row",
        html: '<div class="flex items-center gap-3"><span class="sk-skeleton sk-skeleton-avatar"></span><div class="w-full space-y-2"><div class="sk-skeleton sk-skeleton-line w-3/4"></div><div class="sk-skeleton sk-skeleton-line w-1/2"></div></div></div>',
      },
    ],
  },
  {
    className: "sk-empty-state",
    group: "overlays",
    name: "Empty state",
    useFor: "What a list shows when it has nothing yet: a drawing, a title, a line and one button.",
    examples: [
      {
        label: "No orders yet",
        html: '<div class="sk-empty-state"><span class="sk-empty-drawing"></span><p class="text-xl font-bold">No orders yet</p><p>Orders you place will show here.</p><button type="button" class="sk-button sk-main">Create order</button></div>',
      },
    ],
  },
  {
    className: "sk-empty-drawing",
    group: "overlays",
    name: "Empty drawing",
    useFor: "The dashed box with a plus that stands for an empty list.",
    examples: [{ label: "Empty box", html: '<span class="sk-empty-drawing"></span>' }],
  },
];
