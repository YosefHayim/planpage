import type { SketchPart } from "../contracts/sketchScene";

export const NAVIGATION_PARTS: readonly SketchPart[] = [
  {
    className: "sk-top-bar",
    group: "navigation",
    name: "Screen top bar",
    useFor:
      "The bar across the top of a screen: a back or close mark at the start, a centered title, and an action at the end.",
    examples: [
      {
        label: "Back with action",
        html: '<header class="sk-top-bar"><span class="sk-top-bar-start"></span><span class="sk-top-bar-title">Order details</span><span class="sk-top-bar-end" data-icon="bell"></span></header>',
      },
      {
        label: "Close",
        html: '<header class="sk-top-bar sk-close"><span class="sk-top-bar-start"></span><span class="sk-top-bar-title">New post</span></header>',
      },
      {
        label: "Title only",
        html: '<header class="sk-top-bar"><span class="sk-top-bar-title">Settings</span></header>',
      },
      {
        label: "Compact",
        html: '<header class="sk-top-bar sk-compact"><span class="sk-top-bar-start"></span><span class="sk-top-bar-title">Profile</span><span class="sk-top-bar-end" data-icon="search"></span></header>',
      },
      {
        label: "Right to left",
        html: '<header class="sk-top-bar" dir="rtl"><span class="sk-top-bar-start"></span><span class="sk-top-bar-title">פרטי הזמנה</span><span class="sk-top-bar-end" data-icon="bell"></span></header>',
      },
    ],
  },
  {
    className: "sk-header-navigation",
    group: "navigation",
    name: "Header navigation",
    useFor:
      "A row of page links across the top of a website, with the current page shaded. On a small screen the links fold into one menu icon.",
    examples: [
      {
        label: "Desktop",
        html: '<nav class="sk-header-navigation"><span class="font-bold">Acme</span><div class="flex gap-1"><a class="sk-header-navigation-link" data-status="selected">Home</a><a class="sk-header-navigation-link">Pricing</a><a class="sk-header-navigation-link">Docs</a></div><span data-icon="search"></span></nav>',
      },
      {
        label: "Hover",
        html: '<nav class="sk-header-navigation"><span class="font-bold">Acme</span><div class="flex gap-1"><a class="sk-header-navigation-link">Home</a><a class="sk-header-navigation-link" data-status="hover">Pricing</a><a class="sk-header-navigation-link">Docs</a></div></nav>',
      },
      {
        label: "Small screen",
        html: '<nav class="sk-header-navigation"><span class="font-bold">Acme</span><span class="sk-header-navigation-menu"></span></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-header-navigation" dir="rtl"><span class="font-bold">אקמה</span><div class="flex gap-1"><a class="sk-header-navigation-link" data-status="selected">בית</a><a class="sk-header-navigation-link">מחירים</a><a class="sk-header-navigation-link">עזרה</a></div></nav>',
      },
    ],
  },
  {
    className: "sk-sidebar-navigation",
    group: "navigation",
    name: "Sidebar navigation",
    useFor:
      "A column of icon-and-label rows with section headings, for the main menu of an app. The current row is shaded.",
    examples: [
      {
        label: "Main menu",
        html: '<nav class="sk-sidebar-navigation"><p class="sk-sidebar-heading">Workspace</p><a class="sk-sidebar-row" data-status="selected"><span data-icon="home"></span>Dashboard</a><a class="sk-sidebar-row"><span data-icon="inbox"></span>Inbox<span class="ms-auto">3</span></a><a class="sk-sidebar-row"><span data-icon="users"></span>Team</a><p class="sk-sidebar-heading">Account</p><a class="sk-sidebar-row"><span data-icon="settings"></span>Settings</a></nav>',
      },
      {
        label: "Hover",
        html: '<nav class="sk-sidebar-navigation"><a class="sk-sidebar-row"><span data-icon="home"></span>Dashboard</a><a class="sk-sidebar-row" data-status="hover"><span data-icon="inbox"></span>Inbox</a><a class="sk-sidebar-row"><span data-icon="users"></span>Team</a></nav>',
      },
      {
        label: "Focus",
        html: '<nav class="sk-sidebar-navigation"><a class="sk-sidebar-row" data-status="selected"><span data-icon="home"></span>Dashboard</a><a class="sk-sidebar-row" data-status="focus"><span data-icon="inbox"></span>Inbox</a></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-sidebar-navigation" dir="rtl"><p class="sk-sidebar-heading">סביבת עבודה</p><a class="sk-sidebar-row" data-status="selected"><span data-icon="home"></span>לוח בקרה</a><a class="sk-sidebar-row"><span data-icon="inbox"></span>הודעות</a><a class="sk-sidebar-row"><span data-icon="users"></span>צוות</a></nav>',
      },
    ],
  },
  {
    className: "sk-bottom-tab-bar",
    group: "navigation",
    name: "Bottom tab bar",
    useFor: "The row of icon tabs along the bottom of a phone app. The current tab is shaded.",
    examples: [
      {
        label: "Four tabs",
        html: '<nav class="sk-bottom-tab-bar"><a class="sk-bottom-tab-item" data-status="selected"><span data-icon="home"></span>Home</a><a class="sk-bottom-tab-item"><span data-icon="search"></span>Search</a><a class="sk-bottom-tab-item"><span data-icon="inbox"></span>Inbox</a><a class="sk-bottom-tab-item"><span data-icon="user"></span>Profile</a></nav>',
      },
      {
        label: "Focus",
        html: '<nav class="sk-bottom-tab-bar"><a class="sk-bottom-tab-item" data-status="selected"><span data-icon="home"></span>Home</a><a class="sk-bottom-tab-item" data-status="focus"><span data-icon="search"></span>Search</a><a class="sk-bottom-tab-item"><span data-icon="inbox"></span>Inbox</a></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-bottom-tab-bar" dir="rtl"><a class="sk-bottom-tab-item" data-status="selected"><span data-icon="home"></span>בית</a><a class="sk-bottom-tab-item"><span data-icon="search"></span>חיפוש</a><a class="sk-bottom-tab-item"><span data-icon="inbox"></span>הודעות</a><a class="sk-bottom-tab-item"><span data-icon="user"></span>פרופיל</a></nav>',
      },
    ],
  },
  {
    className: "sk-floating-tab-bar",
    group: "navigation",
    name: "Floating tab bar",
    useFor:
      "A rounded tab bar that floats over the content, with an optional round action button in the middle.",
    examples: [
      {
        label: "With action",
        html: '<nav class="sk-floating-tab-bar"><a class="sk-floating-tab-item" data-status="selected"><span data-icon="home"></span>Home</a><a class="sk-floating-tab-item"><span data-icon="calendar"></span>Plan</a><span class="sk-floating-tab-action"><span data-icon="plus"></span></span><a class="sk-floating-tab-item"><span data-icon="inbox"></span>Inbox</a><a class="sk-floating-tab-item"><span data-icon="user"></span>Profile</a></nav>',
      },
      {
        label: "Two tabs",
        html: '<nav class="sk-floating-tab-bar"><a class="sk-floating-tab-item" data-status="selected"><span data-icon="home"></span>Home</a><a class="sk-floating-tab-item"><span data-icon="settings"></span>Settings</a></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-floating-tab-bar" dir="rtl"><a class="sk-floating-tab-item" data-status="selected"><span data-icon="home"></span>בית</a><a class="sk-floating-tab-item"><span data-icon="calendar"></span>תוכנית</a><span class="sk-floating-tab-action"><span data-icon="plus"></span></span><a class="sk-floating-tab-item"><span data-icon="user"></span>פרופיל</a></nav>',
      },
    ],
  },
  {
    className: "sk-glass-dock",
    group: "navigation",
    name: "Glass dock",
    useFor:
      "A floating rounded dock of icons at the bottom of the screen. The current app has a dot under its icon.",
    examples: [
      {
        label: "Dock",
        html: '<nav class="sk-glass-dock"><span class="sk-glass-dock-item" data-icon="home" data-status="selected"></span><span class="sk-glass-dock-item" data-icon="search"></span><span class="sk-glass-dock-item" data-icon="inbox"></span><span class="sk-glass-dock-item" data-icon="settings"></span></nav>',
      },
      {
        label: "With add button",
        html: '<nav class="sk-glass-dock"><span class="sk-glass-dock-item" data-icon="home" data-status="selected"></span><span class="sk-glass-dock-item" data-icon="calendar"></span><span class="sk-glass-dock-item" data-icon="plus"></span><span class="sk-glass-dock-item" data-icon="user"></span></nav>',
      },
    ],
  },
  {
    className: "sk-breadcrumbs",
    group: "navigation",
    name: "Breadcrumbs",
    useFor: "The path to the current page, with a link to each level. The current page is shaded.",
    examples: [
      {
        label: "Chevron separators",
        html: '<nav class="sk-breadcrumbs"><a class="sk-breadcrumb-item">Home</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item">Orders</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item" data-status="selected">Order 1042</a></nav>',
      },
      {
        label: "Slash separators",
        html: '<nav class="sk-breadcrumbs sk-slash"><a class="sk-breadcrumb-item">Home</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item">Orders</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item" data-status="selected">Order 1042</a></nav>',
      },
      {
        label: "Collapsed",
        html: '<nav class="sk-breadcrumbs"><a class="sk-breadcrumb-item">Home</a><span class="sk-breadcrumb-separator"></span><span class="sk-breadcrumb-item">…</span><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item" data-status="selected">Invoice</a></nav>',
      },
      {
        label: "Hover",
        html: '<nav class="sk-breadcrumbs"><a class="sk-breadcrumb-item" data-status="hover">Home</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item">Orders</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item">Order 1042</a></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-breadcrumbs" dir="rtl"><a class="sk-breadcrumb-item">בית</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item">הזמנות</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item" data-status="selected">הזמנה 1042</a></nav>',
      },
    ],
  },
  {
    className: "sk-pagination",
    group: "navigation",
    name: "Pagination",
    useFor:
      "Moves between pages of a list: previous and next arrows, the page numbers, and the current page shaded.",
    examples: [
      {
        label: "Page numbers",
        html: '<nav class="sk-pagination"><span class="sk-pagination-previous"></span><span class="sk-pagination-page">1</span><span class="sk-pagination-page" data-status="selected">2</span><span class="sk-pagination-page">3</span><span class="sk-pagination-page">4</span><span class="sk-pagination-next"></span></nav>',
      },
      {
        label: "First page",
        html: '<nav class="sk-pagination"><span class="sk-pagination-previous" data-status="disabled"></span><span class="sk-pagination-page" data-status="selected">1</span><span class="sk-pagination-page">2</span><span class="sk-pagination-page">3</span><span class="sk-pagination-next"></span></nav>',
      },
      {
        label: "Compact",
        html: '<nav class="sk-pagination"><span class="sk-pagination-previous"></span><span>Page 1 of 10</span><span class="sk-pagination-next"></span></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-pagination" dir="rtl"><span class="sk-pagination-previous"></span><span class="sk-pagination-page">1</span><span class="sk-pagination-page" data-status="selected">2</span><span class="sk-pagination-page">3</span><span class="sk-pagination-next"></span></nav>',
      },
    ],
  },
  {
    className: "sk-tabs",
    group: "navigation",
    name: "Tabs",
    useFor:
      "Switches between sections of one screen. The current tab has an underline, a filled tab, or a filled segment in a box.",
    examples: [
      {
        label: "Underline",
        html: '<div class="sk-tabs"><span class="sk-tabs-tab" data-status="selected">Overview</span><span class="sk-tabs-tab">Activity</span><span class="sk-tabs-tab">Settings</span></div>',
      },
      {
        label: "Segmented",
        html: '<div class="sk-tabs sk-segmented"><span class="sk-tabs-tab">Day</span><span class="sk-tabs-tab" data-status="selected">Week</span><span class="sk-tabs-tab">Month</span></div>',
      },
      {
        label: "Pill",
        html: '<div class="sk-tabs sk-pill"><span class="sk-tabs-tab" data-status="selected">Open</span><span class="sk-tabs-tab">Closed</span><span class="sk-tabs-tab" data-status="hover">All</span></div>',
      },
      {
        label: "Disabled tab",
        html: '<div class="sk-tabs"><span class="sk-tabs-tab" data-status="selected">Overview</span><span class="sk-tabs-tab" data-status="disabled">Billing</span><span class="sk-tabs-tab">Team</span></div>',
      },
    ],
  },
  {
    className: "sk-stepper",
    group: "navigation",
    name: "Progress steps and stepper",
    useFor:
      "Shows the steps of a process. Done steps have a tick, the current step is filled, and steps still to come are empty circles.",
    examples: [
      {
        label: "Horizontal",
        html: '<div class="sk-stepper"><div class="sk-stepper-step"><span class="sk-stepper-dot" data-checked></span>Cart</div><div class="sk-stepper-step"><span class="sk-stepper-dot" data-status="selected"></span>Address</div><div class="sk-stepper-step"><span class="sk-stepper-dot"></span>Payment</div></div>',
      },
      {
        label: "Vertical",
        html: '<div class="sk-stepper sk-vertical"><div class="sk-stepper-step"><span class="sk-stepper-dot" data-checked></span>Account created</div><div class="sk-stepper-step"><span class="sk-stepper-dot" data-status="selected"></span>Verify email</div><div class="sk-stepper-step"><span class="sk-stepper-dot"></span>Choose a plan</div></div>',
      },
      {
        label: "Right to left",
        html: '<div class="sk-stepper" dir="rtl"><div class="sk-stepper-step"><span class="sk-stepper-dot" data-checked></span>עגלה</div><div class="sk-stepper-step"><span class="sk-stepper-dot" data-status="selected"></span>כתובת</div><div class="sk-stepper-step"><span class="sk-stepper-dot"></span>תשלום</div></div>',
      },
    ],
  },
  {
    className: "sk-menubar",
    group: "navigation",
    name: "Menubar",
    useFor:
      "A row of menu words across the top of a desktop app. One menu is open below its word, with its items and checked options.",
    examples: [
      {
        label: "File menu open",
        html: '<div class="sk-menubar mb-28"><span class="sk-menubar-menu">File<div class="sk-menubar-panel"><span class="sk-menubar-item" data-status="hover">New file<span class="ms-auto">Cmd N</span></span><span class="sk-menubar-item">Open<span class="ms-auto">Cmd O</span></span><span class="sk-menubar-item">Save<span class="ms-auto">Cmd S</span></span></div></span><span class="sk-menubar-menu">Edit</span><span class="sk-menubar-menu">View</span></div>',
      },
      {
        label: "View menu with a checked item",
        html: '<div class="sk-menubar"><span class="sk-menubar-menu">File</span><span class="sk-menubar-menu" data-status="selected">View<div class="sk-menubar-panel"><span class="sk-menubar-item" data-checked>Show grid</span><span class="sk-menubar-item">Zoom in<span class="ms-auto">Cmd +</span></span><span class="sk-menubar-item">Full screen</span></div></span></div>',
      },
      {
        label: "Right to left",
        html: '<div class="sk-menubar" dir="rtl"><span class="sk-menubar-menu">קובץ</span><span class="sk-menubar-menu" data-status="selected">עריכה<div class="sk-menubar-panel"><span class="sk-menubar-item">העתק</span><span class="sk-menubar-item" data-checked>הדבק</span></div></span><span class="sk-menubar-menu">תצוגה</span></div>',
      },
    ],
  },
  {
    className: "sk-command-menu",
    group: "navigation",
    name: "Command menu",
    useFor:
      "A search box over grouped commands, with keyboard hints. Type to filter, pick a row to run it.",
    examples: [
      {
        label: "Results",
        html: '<div class="sk-command-menu"><div class="sk-command-menu-search"><span data-icon="search"></span>Search pages</div><p class="sk-command-menu-heading">Go to</p><div class="sk-command-menu-row" data-status="selected">Dashboard<span class="sk-command-menu-key ms-auto">Cmd D</span></div><div class="sk-command-menu-row">Team<span class="sk-command-menu-key ms-auto">Cmd T</span></div><p class="sk-command-menu-heading">Actions</p><div class="sk-command-menu-row">New project<span class="sk-command-menu-key ms-auto">Cmd K</span></div></div>',
      },
      {
        label: "Typed query",
        html: '<div class="sk-command-menu"><div class="sk-command-menu-search"><span data-icon="search"></span>Inv</div><div class="sk-command-menu-row" data-status="selected">Invoices<span class="sk-command-menu-key ms-auto">Cmd I</span></div><div class="sk-command-menu-row" data-status="hover">Invite team<span class="sk-command-menu-key ms-auto">Cmd U</span></div></div>',
      },
      {
        label: "Right to left",
        html: '<div class="sk-command-menu" dir="rtl"><div class="sk-command-menu-search"><span data-icon="search"></span>חפש דפים</div><p class="sk-command-menu-heading">מעבר אל</p><div class="sk-command-menu-row" data-status="selected">לוח בקרה<span class="sk-command-menu-key ms-auto">Cmd D</span></div><div class="sk-command-menu-row">צוות<span class="sk-command-menu-key ms-auto">Cmd T</span></div></div>',
      },
    ],
  },
  {
    className: "sk-table-of-contents",
    group: "navigation",
    name: "Table of contents",
    useFor:
      "A list of the headings of a long page. A marker on the edge shows the section being read.",
    examples: [
      {
        label: "Section being read",
        html: '<nav class="sk-table-of-contents"><a class="sk-toc-item">Introduction</a><a class="sk-toc-item ps-4" data-status="selected">Getting started</a><a class="sk-toc-item ps-4">Install the kit</a><a class="sk-toc-item">Parts</a><a class="sk-toc-item ps-4">Navigation</a></nav>',
      },
      {
        label: "Hover",
        html: '<nav class="sk-table-of-contents"><a class="sk-toc-item">Introduction</a><a class="sk-toc-item" data-status="hover">Getting started</a><a class="sk-toc-item">Parts</a></nav>',
      },
      {
        label: "Right to left",
        html: '<nav class="sk-table-of-contents" dir="rtl"><a class="sk-toc-item">מבוא</a><a class="sk-toc-item pe-4" data-status="selected">התחלה</a><a class="sk-toc-item pe-4">התקנה</a><a class="sk-toc-item">חלקים</a></nav>',
      },
    ],
  },
  {
    className: "sk-scroll-index",
    group: "navigation",
    name: "Scroll index",
    useFor:
      "A column of letters at the edge of a long list. Tap a letter to jump to that part of the list; the current letter is circled, and letters with no items are faded.",
    examples: [
      {
        label: "Current letter",
        html: '<div class="sk-scroll-index"><span class="sk-scroll-index-letter">A</span><span class="sk-scroll-index-letter">B</span><span class="sk-scroll-index-letter" data-status="selected">C</span><span class="sk-scroll-index-letter">D</span><span class="sk-scroll-index-letter" data-status="disabled">E</span><span class="sk-scroll-index-letter">F</span></div>',
      },
      {
        label: "Focus",
        html: '<div class="sk-scroll-index"><span class="sk-scroll-index-letter">A</span><span class="sk-scroll-index-letter" data-status="focus">B</span><span class="sk-scroll-index-letter">C</span></div>',
      },
    ],
  },
  {
    className: "sk-link",
    group: "navigation",
    name: "Link",
    useFor:
      "A text link. It has a hand-drawn underline; a quiet link only shows the underline on hover.",
    examples: [
      {
        label: "Underlined",
        html: '<a class="sk-link" href="#">Read the docs</a>',
      },
      {
        label: "Quiet",
        html: '<a class="sk-link sk-quiet" href="#">Read the docs</a>',
      },
      {
        label: "Quiet on hover",
        html: '<a class="sk-link sk-quiet" href="#" data-status="hover">Read the docs</a>',
      },
      {
        label: "Disabled",
        html: '<a class="sk-link" href="#" data-status="disabled">Read the docs</a>',
      },
    ],
  },
  {
    className: "sk-back-link",
    group: "navigation",
    name: "Back link",
    useFor:
      "A link that goes back one step, with a chevron pointing back. The chevron turns around under right to left.",
    examples: [
      {
        label: "Default",
        html: '<a class="sk-back-link" href="#">Back to orders</a>',
      },
      {
        label: "Hover",
        html: '<a class="sk-back-link" href="#" data-status="hover">Back to orders</a>',
      },
      {
        label: "Right to left",
        html: '<a class="sk-back-link" href="#" dir="rtl">חזרה להזמנות</a>',
      },
    ],
  },
];
