import type { SketchPart } from "../contracts/sketchScene";

export const FRAMES_PARTS: readonly SketchPart[] = [
  {
    className: "sk-browser-window",
    group: "frames",
    name: "Browser window",
    useFor: "A web page in a browser, with tabs and the address bar above it.",
    examples: [
      {
        label: "Plan open",
        html: `<div class="sk-browser-window mx-auto max-w-lg">
  <div class="sk-browser-tabs flex gap-2 px-3 pt-3">
    <span class="sk-browser-tab" data-status="selected">Launch plan</span>
    <span class="sk-browser-tab">Notes</span>
    <span class="sk-browser-tab">+</span>
  </div>
  <div class="sk-browser-url">planpage.app/plans/launch</div>
  <div class="space-y-3 p-4">
    <p class="text-lg">Launch plan</p>
    <p>Ship the sign-in page by Friday.</p>
    <button type="button" class="sk-button sk-main">Save changes</button>
  </div>
</div>`,
      },
      {
        label: "Notes tab open",
        html: `<div class="sk-browser-window mx-auto max-w-lg">
  <div class="sk-browser-tabs flex gap-2 px-3 pt-3">
    <span class="sk-browser-tab">Launch plan</span>
    <span class="sk-browser-tab" data-status="selected">Notes</span>
  </div>
  <div class="sk-browser-url">planpage.app/notes</div>
  <div class="space-y-3 p-4">
    <p class="text-lg">Meeting notes</p>
    <p>Dana will check the price.</p>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-laptop",
    group: "frames",
    name: "Laptop",
    useFor: "A screen with its base, for a whole desktop screen of a web app.",
    examples: [
      {
        label: "Dashboard",
        html: `<div class="sk-laptop mx-auto max-w-md">
  <div class="sk-laptop-screen space-y-3">
    <p class="text-lg">Orders</p>
    <p>Search orders</p>
    <button type="button" class="sk-button sk-main">Export</button>
  </div>
  <div class="sk-laptop-base"></div>
</div>`,
      },
      {
        label: "Sign in",
        html: `<div class="sk-laptop mx-auto max-w-md">
  <div class="sk-laptop-screen space-y-3">
    <p class="text-lg">Sign in</p>
    <p>Email address</p>
    <button type="button" class="sk-button sk-main">Continue</button>
  </div>
  <div class="sk-laptop-base"></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-app-window",
    group: "frames",
    name: "Desktop app window",
    useFor: "A desktop app window with three title dots and its title.",
    examples: [
      {
        label: "Planpage app",
        html: `<div class="sk-app-window mx-auto max-w-lg">
  <div class="sk-app-window-title">Planpage</div>
  <div class="space-y-3 p-4">
    <p class="text-lg">Launch plan</p>
    <button type="button" class="sk-button sk-main">Save changes</button>
  </div>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="sk-app-window mx-auto max-w-lg">
  <div class="sk-app-window-title">הגדרות</div>
  <div class="space-y-3 p-4">
    <p class="text-lg">תוכנית ההשקה</p>
    <button type="button" class="sk-button sk-main">שמירה</button>
  </div>
</div>`,
      },
      {
        label: "Settings window",
        html: `<div class="sk-app-window mx-auto max-w-lg">
  <div class="sk-app-window-title">Settings</div>
  <div class="space-y-3 p-4">
    <p class="text-lg">Notifications</p>
    <p>Email me when a plan changes.</p>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-tablet",
    group: "frames",
    name: "Tablet",
    useFor: "A tablet screen with a camera dot at the top.",
    examples: [
      {
        label: "Orders list",
        html: `<div class="sk-tablet mx-auto max-w-sm">
  <div class="sk-tablet-camera"></div>
  <div class="sk-tablet-screen space-y-3">
    <p class="text-lg">Orders</p>
    <p>Search orders</p>
    <button type="button" class="sk-button sk-main">Export</button>
  </div>
</div>`,
      },
      {
        label: "Dashboard",
        html: `<div class="sk-tablet mx-auto max-w-md">
  <div class="sk-tablet-camera"></div>
  <div class="sk-tablet-screen space-y-3">
    <p class="text-lg">Today</p>
    <p>12 plans shared</p>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-phone",
    group: "frames",
    name: "Phone",
    useFor: "A phone screen with a notch, a status bar with the time, and a home indicator.",
    examples: [
      {
        label: "Home",
        html: `<div class="sk-phone mx-auto max-w-xs">
  <div class="sk-phone-notch"></div>
  <div class="sk-phone-status">
    <span>9:41</span>
    <span>5G 88%</span>
  </div>
  <div class="sk-phone-screen">
    <p class="text-lg">Today</p>
    <p>Check a leaf or add a plant.</p>
    <button type="button" class="sk-button sk-main">Check a leaf</button>
  </div>
  <div class="sk-phone-home"></div>
</div>`,
      },
      {
        label: "Sign in",
        html: `<div class="sk-phone mx-auto max-w-xs">
  <div class="sk-phone-notch"></div>
  <div class="sk-phone-status">
    <span>9:41</span>
    <span>5G 88%</span>
  </div>
  <div class="sk-phone-screen">
    <p class="text-lg">Sign in</p>
    <p>Email address</p>
    <button type="button" class="sk-button sk-main">Continue</button>
  </div>
  <div class="sk-phone-home"></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-watch",
    group: "frames",
    name: "Watch",
    useFor: "A watch face with its straps, for a clock or a short activity summary.",
    examples: [
      {
        label: "Clock",
        html: `<div class="sk-watch mx-auto w-44">
  <div class="sk-watch-face flex flex-col items-center justify-center text-center">
    <span class="text-2xl">9:41</span>
    <span class="text-sm">Tue 5 Nov</span>
  </div>
  <span class="sk-watch-crown"></span>
</div>`,
      },
      {
        label: "Workout",
        html: `<div class="sk-watch mx-auto w-44">
  <div class="sk-watch-face flex flex-col items-center justify-center text-center">
    <span class="text-xl">6,200 steps</span>
    <span class="text-sm">Walk goal reached</span>
  </div>
  <span class="sk-watch-crown"></span>
</div>`,
      },
    ],
  },
  {
    className: "sk-terminal-window",
    group: "frames",
    name: "Terminal window",
    useFor: "A terminal with a solid title bar and monospace lines of commands and output.",
    examples: [
      {
        label: "Check run",
        html: `<div class="sk-terminal-window mx-auto max-w-lg">
  <div class="sk-terminal-title">zsh, planpage</div>
  <div class="sk-terminal-body space-y-1">
    <p>$ pnpm check</p>
    <p>Lint, typecheck, test and build</p>
    <p>All 4 tasks passed</p>
  </div>
</div>`,
      },
      {
        label: "Failed test",
        html: `<div class="sk-terminal-window mx-auto max-w-lg">
  <div class="sk-terminal-title">zsh, planpage</div>
  <div class="sk-terminal-body space-y-1">
    <p>$ pnpm test</p>
    <p><span class="text-red-500">1 test failed</span></p>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-extension-popup",
    group: "frames",
    name: "Extension popup",
    useFor: "A small popup that opens from a browser toolbar icon, with a small arrow at the top.",
    examples: [
      {
        label: "Save this page",
        html: `<div class="sk-extension-popup mx-auto max-w-xs">
  <div class="sk-extension-popup-body space-y-3">
    <p class="text-lg">Save this page</p>
    <p>Plan: Launch</p>
    <button type="button" class="sk-button sk-main">Save</button>
  </div>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="sk-extension-popup mx-auto max-w-xs">
  <div class="sk-extension-popup-body space-y-3">
    <p class="text-lg">שמירת הדף</p>
    <p>תוכנית: השקה</p>
    <button type="button" class="sk-button sk-main">שמירה</button>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-email-frame",
    group: "frames",
    name: "Email frame",
    useFor: "An email with its from and subject lines above the message body.",
    examples: [
      {
        label: "Launch email",
        html: `<div class="sk-email-frame mx-auto max-w-md">
  <div class="sk-email-header space-y-1">
    <p><span class="font-bold">From</span> Dana Cohen</p>
    <p><span class="font-bold">Subject</span> Launch plan is ready</p>
  </div>
  <div class="sk-email-body space-y-3">
    <p>Hi Maya, the plan is ready to review.</p>
    <button type="button" class="sk-button sk-main">Open plan</button>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-app-shell",
    group: "frames",
    name: "App shell",
    useFor: "An app with a header, a sidebar of links and a content area.",
    examples: [
      {
        label: "Plans",
        html: `<div class="sk-app-shell mx-auto max-w-lg">
  <div class="sk-app-shell-header flex items-center justify-between px-4 py-2">
    <span class="text-lg">Planpage</span>
    <button type="button" class="sk-button sk-ghost">Sign out</button>
  </div>
  <div class="sk-app-shell-body">
    <div class="sk-app-shell-sidebar space-y-1 py-3">
      <p class="sk-app-shell-link" data-status="selected">Plans</p>
      <p class="sk-app-shell-link">Orders</p>
      <p class="sk-app-shell-link">Settings</p>
    </div>
    <div class="sk-app-shell-content space-y-3 p-4">
      <p class="text-lg">Launch plan</p>
      <button type="button" class="sk-button sk-main">Save changes</button>
    </div>
  </div>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="sk-app-shell mx-auto max-w-lg">
  <div class="sk-app-shell-header flex items-center justify-between px-4 py-2">
    <span class="text-lg">פלנפייג'</span>
    <button type="button" class="sk-button sk-ghost">יציאה</button>
  </div>
  <div class="sk-app-shell-body">
    <div class="sk-app-shell-sidebar space-y-1 py-3">
      <p class="sk-app-shell-link" data-status="selected">תוכניות</p>
      <p class="sk-app-shell-link">הזמנות</p>
      <p class="sk-app-shell-link">הגדרות</p>
    </div>
    <div class="sk-app-shell-content space-y-3 p-4">
      <p class="text-lg">תוכנית ההשקה</p>
      <button type="button" class="sk-button sk-main">שמירת שינויים</button>
    </div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-split-view",
    group: "frames",
    name: "Split view",
    useFor: "Two panes side by side, such as a list and its detail, with a dashed divider.",
    examples: [
      {
        label: "List and detail",
        html: `<div class="sk-split-view mx-auto max-w-lg">
  <div class="sk-split-pane space-y-2">
    <p>Launch plan</p>
    <p>Sign-in flow</p>
    <p>Pricing page</p>
  </div>
  <div class="sk-split-pane space-y-3">
    <p class="text-lg">Launch plan</p>
    <button type="button" class="sk-button sk-main">Open</button>
  </div>
</div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="sk-split-view mx-auto max-w-lg">
  <div class="sk-split-pane space-y-2">
    <p>תוכנית ההשקה</p>
    <p>זרימת הכניסה</p>
    <p>דף מחירים</p>
  </div>
  <div class="sk-split-pane space-y-3">
    <p class="text-lg">תוכנית ההשקה</p>
    <button type="button" class="sk-button sk-main">פתיחה</button>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-column-grid",
    group: "frames",
    name: "Column grid",
    useFor: "A layout grid shown with dashed column guides, for planning where things sit.",
    examples: [
      {
        label: "Three columns",
        html: `<div class="sk-column-grid mx-auto grid max-w-lg grid-cols-3 gap-2">
  <div class="sk-column-grid-cell">Plans</div>
  <div class="sk-column-grid-cell">Orders</div>
  <div class="sk-column-grid-cell">Team</div>
</div>`,
      },
      {
        label: "Two columns",
        html: `<div class="sk-column-grid mx-auto grid max-w-lg grid-cols-2 gap-2">
  <div class="sk-column-grid-cell">Search orders</div>
  <div class="sk-column-grid-cell">Export</div>
  <div class="sk-column-grid-cell">Filter</div>
  <div class="sk-column-grid-cell">Sort</div>
</div>`,
      },
    ],
  },
];
