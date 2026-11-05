import type { SketchNote, SketchRecipe, SketchScene, SketchTone } from "../contracts/sketchScene";

const SCENE_WIDTH = 1000;
const SCREEN_TOP = 30;
const FRAME_WIDTH = 700;
const FRAME_LEFT = 30;
const NOTE_LEFT = 760;
const NOTE_WIDTH = 220;
const PHONE_WIDTH = 300;
const PHONE_LEFT = 370;
const PHONE_NOTE_WIDTH = 260;
const LEFT_NOTE_LEFT = 30;
const RIGHT_NOTE_LEFT = 700;

type TextDirection = "ltr" | "rtl";

interface BrowserWindowPage {
  readonly title: string;
  readonly address: string;
  readonly bodyHtml: string;
}

interface ProductScreen {
  readonly id: string;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly html: string;
}

interface DashboardMetric {
  readonly part: string;
  readonly label: string;
  readonly value: string;
  readonly tone: SketchTone;
}

interface ActivityItem {
  readonly part: string;
  readonly text: string;
  readonly time: string;
}

interface PricingPlan {
  readonly part: string;
  readonly name: string;
  readonly price: string;
  readonly features: readonly string[];
  readonly isFeatured: boolean;
}

const createProductScene = (screen: ProductScreen, notes: readonly SketchNote[]): SketchScene => ({
  width: SCENE_WIDTH,
  height: screen.height + SCREEN_TOP * 2,
  nodes: [
    {
      id: screen.id,
      kind: "screen",
      x: screen.left,
      y: SCREEN_TOP,
      w: screen.width,
      h: screen.height,
      html: screen.html,
    },
  ],
  notes,
  look: { notePlacement: "beside" },
});

const createSideNote = (y: number, link: string, words: string): SketchNote => ({
  x: NOTE_LEFT,
  y,
  w: NOTE_WIDTH,
  link,
  words,
});

const createBrowserWindowHtml = (
  browserPage: BrowserWindowPage,
  textDirection: TextDirection,
) => `<div class="sk-browser-window w-full" dir="${textDirection}">
  <div class="sk-browser-tabs flex gap-2 px-3 pt-3"><span class="sk-browser-tab" data-status="selected">${browserPage.title}</span><span class="sk-browser-tab">+</span></div>
  <div class="sk-browser-url">${browserPage.address}</div>
  ${browserPage.bodyHtml}
</div>`;

const createMetricHtml = (metric: DashboardMetric) =>
  `<div class="sk-metric w-full" data-part="${metric.part}" data-tone="${metric.tone}"><p class="text-sm">${metric.label}</p><p class="text-3xl font-bold">${metric.value}</p></div>`;

const DASHBOARD_METRICS: readonly DashboardMetric[] = [
  { part: "revenueMetric", label: "Revenue this week", value: "$12,480", tone: "green" },
  { part: "openTicketsMetric", label: "Open tickets", value: "14", tone: "ink" },
  { part: "refundsMetric", label: "Refunds this week", value: "$320", tone: "red" },
];

const dashboardMetricsHtml = DASHBOARD_METRICS.map(createMetricHtml).join("");

const DASHBOARD_BAR_CHART_HTML = `<div class="flex w-full gap-3" data-part="ordersChart">
  <div class="flex h-32 flex-col justify-between text-right text-xs"><span>40</span><span>20</span><span>0</span></div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-bar-chart h-32" data-numbers="12,30,18,40,26,34"></div>
    <div class="flex justify-between text-xs"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
  </div>
</div>`;

const DASHBOARD_DONUT_HTML = `<div class="relative w-40" data-part="plansDonut">
  <div class="sk-donut-chart" data-numbers="50,30,15,5"></div>
  <div class="absolute inset-0 grid place-items-center text-center text-sm"><span>Plans<br>by tier</span></div>
</div>`;

const DASHBOARD_ORDERS_TABLE_HTML = `<div class="sk-table w-full text-xs" data-part="ordersTable">
  <div class="sk-table-row sk-table-head"><span>Order</span><span>Customer</span><span>Status</span></div>
  <div class="sk-table-row"><span>#1041</span><span>Dana</span><span class="sk-badge" data-fill="green">Paid</span></div>
  <div class="sk-table-row" data-status="selected"><span>#1042</span><span>Omer</span><span class="sk-badge" data-fill="yellow">Pending</span></div>
  <div class="sk-table-row"><span>#1043</span><span>Noa</span><span class="sk-badge" data-fill="red">Overdue</span></div>
</div>`;

const ACTIVITY_ITEMS: readonly ActivityItem[] = [
  { part: "activityFirst", text: "Dana commented", time: "2 min ago" },
  { part: "activitySecond", text: "Omer invited you", time: "1 hour ago" },
  { part: "activityThird", text: "Maya uploaded photos", time: "Yesterday" },
];

const createActivityHtml = (activity: ActivityItem) =>
  `<div class="sk-activity-feed" data-part="${activity.part}"><p class="font-medium">${activity.text}</p><p class="text-sm">${activity.time}</p></div>`;

const activityFeedHtml = ACTIVITY_ITEMS.map(createActivityHtml).join("");

const dashboardScreenHtml = `<div class="sk-app-shell w-full">
  <div class="sk-app-shell-header flex items-center justify-between px-4 py-2">
    <span class="text-lg">Store admin</span>
    <span class="sk-avatar" data-fill="blue">MK</span>
  </div>
  <div class="sk-app-shell-body">
    <div class="sk-app-shell-sidebar w-36 space-y-1 py-3">
      <p class="sk-app-shell-link" data-status="selected" data-part="sidebarDashboard">Dashboard</p>
      <p class="sk-app-shell-link">Orders</p>
      <p class="sk-app-shell-link">Customers</p>
      <p class="sk-app-shell-link">Settings</p>
    </div>
    <div class="sk-app-shell-content space-y-4 p-4">
      <div class="flex items-center justify-between">
        <h2 class="sk-heading text-2xl">Dashboard</h2>
        <button type="button" class="sk-button sk-main" data-status="loading" data-part="exportButton"><span class="sk-button-spinner"></span>Exporting</button>
      </div>
      <div class="grid grid-cols-3 gap-3">${dashboardMetricsHtml}</div>
      <div class="grid grid-cols-3 gap-3">
        <div class="sk-card col-span-2 space-y-2 p-3">
          <p class="font-bold">Orders by day</p>
          ${DASHBOARD_BAR_CHART_HTML}
        </div>
        <div class="sk-card space-y-3 p-3">
          <p class="font-bold">Plans</p>
          ${DASHBOARD_DONUT_HTML}
          <div class="flex items-center justify-between gap-2 text-sm"><span>Signups</span><div class="sk-sparkline w-24" data-numbers="9,8,9,6,5,5,3,2"></div></div>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="sk-card space-y-2 p-3">
          <p class="font-bold">Latest orders</p>
          ${DASHBOARD_ORDERS_TABLE_HTML}
        </div>
        <div class="sk-card space-y-2 p-3">
          <p class="font-bold">Recent activity</p>
          <div class="flex flex-col gap-2" data-part="recentActivity">${activityFeedHtml}</div>
        </div>
      </div>
    </div>
  </div>
</div>`;

const dashboardScreen: ProductScreen = {
  id: "dashboardScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 820,
  html: dashboardScreenHtml,
};

const listDetailPageHtml = createBrowserWindowHtml(
  {
    title: "רשימת הזמנות",
    address: "planpage.app/orders",
    bodyHtml: `<div class="sk-split-view w-full p-3">
    <div class="sk-split-pane space-y-3">
      <div class="sk-search-bar w-full" data-part="ordersSearch"><span data-icon="search"></span><span>חיפוש הזמנה</span></div>
      <div class="sk-list" data-part="ordersList">
        <div class="sk-list-item">הזמנה 1041</div>
        <div class="sk-list-item" data-status="selected" data-part="selectedOrder">הזמנה 1042</div>
        <div class="sk-list-item">הזמנה 1043</div>
      </div>
    </div>
    <div class="sk-split-pane space-y-3">
      <div class="flex items-center justify-between gap-2">
        <h3 class="sk-heading text-lg">הזמנה 1042</h3>
        <span class="sk-badge" data-fill="yellow" data-part="orderBadge">ממתין</span>
      </div>
      <dl class="sk-description-list w-full" data-part="orderDetails">
        <div class="sk-list-item"><dt class="font-bold">לקוח</dt><dd>עומר כהן</dd></div>
        <div class="sk-list-item"><dt class="font-bold">סכום</dt><dd>120 ₪</dd></div>
      </dl>
      <div class="sk-alert" data-tone="orange" data-part="refundAlert"><p class="font-bold">ההחזר ממתין</p><p>הכסף יחזור תוך 3 ימים.</p></div>
      <div class="flex gap-2">
        <button type="button" class="sk-button sk-main" data-part="editButton">עריכה</button>
        <button type="button" class="sk-button">סגירה</button>
      </div>
    </div>
  </div>`,
  },
  "rtl",
);

const listDetailScreen: ProductScreen = {
  id: "listDetailScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 390,
  html: listDetailPageHtml,
};

const aiChatScreenHtml = `<div class="sk-app-window w-full">
  <div class="sk-app-window-title">Assistant</div>
  <div class="space-y-3 p-4">
    <div class="flex items-center gap-2"><span class="sk-avatar" data-fill="blue">AI</span><p class="font-bold">Plan helper</p></div>
    <div class="sk-message-thread w-full" data-part="messageThread">
      <div class="sk-speech-bubble w-64"><p>What would you like to plan today?</p></div>
      <div class="sk-speech-bubble sk-from-me w-64" data-fill="blue"><p>A launch checklist for the shop.</p></div>
      <div class="sk-speech-bubble w-64"><p>Here are five steps, each with an owner.</p></div>
    </div>
    <div class="sk-skeleton sk-skeleton-line w-1/2" data-part="typingSkeleton"></div>
    <div class="sk-chip-row" data-part="suggestionChips"><span class="sk-tag">Add dates</span><span class="sk-tag">Shorten</span><span class="sk-tag">Translate</span></div>
    <div class="sk-prompt-input w-full" data-status="focus" data-part="promptInput"><span>Ask for changes</span><div class="sk-prompt-tools"><span data-icon="paperclip"></span><span class="sk-prompt-send"><span data-icon="arrow-up"></span></span></div></div>
  </div>
</div>`;

const aiChatScreen: ProductScreen = {
  id: "aiChatScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 520,
  html: aiChatScreenHtml,
};

const checkoutPageHtml = createBrowserWindowHtml(
  {
    title: "Checkout",
    address: "planpage.app/checkout",
    bodyHtml: `<div class="space-y-4 p-4">
    <div class="sk-stepper" data-part="checkoutStepper">
      <div class="sk-stepper-step"><span class="sk-stepper-dot" data-checked></span>Cart</div>
      <div class="sk-stepper-step"><span class="sk-stepper-dot" data-checked></span>Address</div>
      <div class="sk-stepper-step"><span class="sk-stepper-dot" data-status="selected"></span>Payment</div>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-3">
        <div class="flex flex-col gap-1"><span class="text-sm">Email</span><div class="sk-input"><span>maya@example.com</span></div></div>
        <div class="sk-credit-card flex w-full flex-col justify-end" data-part="cardPreview"><p class="tracking-widest">•••• •••• •••• 4242</p><p class="text-sm">Dana Levi</p></div>
        <div class="flex flex-col gap-1"><span class="text-sm">Gift card</span><div class="sk-input" data-status="error"><span>$5</span></div><span class="text-xs">This card has no balance left</span></div>
        <div class="flex items-center gap-2"><span class="sk-checkbox" data-checked></span><span>Save card for next time</span></div>
      </div>
      <div class="sk-receipt w-full space-y-2" data-part="orderReceipt">
        <p class="font-bold">Your order</p>
        <div class="flex items-center justify-between text-sm"><span>Blue lamp</span><div class="sk-number-input w-32" data-part="quantityInput"><span>−</span><span>2</span><span>+</span></div></div>
        <div class="flex justify-between text-sm"><span>Shipping</span><span>$4.00</span></div>
        <span class="sk-badge" data-fill="green">Coupon applied</span>
        <div class="flex justify-between font-bold" data-part="orderTotal"><span>Total</span><span>$48.00</span></div>
        <button type="button" class="sk-button sk-main w-full" data-status="disabled" data-part="payButton">Pay $48.00</button>
      </div>
    </div>
  </div>`,
  },
  "ltr",
);

const checkoutScreen: ProductScreen = {
  id: "checkoutScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 640,
  html: checkoutPageHtml,
};

const PRICING_PLANS: readonly PricingPlan[] = [
  {
    part: "starterCard",
    name: "Starter",
    price: "$9",
    features: ["Up to 3 projects", "Email support"],
    isFeatured: false,
  },
  {
    part: "proCard",
    name: "Pro",
    price: "$19",
    features: ["Unlimited projects", "Team sharing", "Priority support"],
    isFeatured: true,
  },
  {
    part: "teamCard",
    name: "Team",
    price: "$39",
    features: ["Shared workspace", "Admin roles"],
    isFeatured: false,
  },
];

const createPricingCardHtml = (plan: PricingPlan) => {
  const featuredFillAttribute = plan.isFeatured ? ` data-fill="yellow"` : "";
  const buttonClass = plan.isFeatured ? "sk-button sk-main" : "sk-button";
  const featuresHtml = plan.features
    .map((feature) => `<p class="sk-feature">${feature}</p>`)
    .join("");
  return `<div class="sk-pricing-card w-full" data-part="${plan.part}"${featuredFillAttribute}>
  <p class="text-sm">${plan.name}</p>
  <p class="text-3xl font-bold">${plan.price}<span class="text-base"> / month</span></p>
  <div class="mt-3 flex flex-col gap-2">${featuresHtml}</div>
  <button type="button" class="${buttonClass} mt-4 w-full" data-part="${plan.part}Button">Choose ${plan.name}</button>
</div>`;
};

const pricingCardsHtml = PRICING_PLANS.map(createPricingCardHtml).join("");

const pricingPageHtml = createBrowserWindowHtml(
  {
    title: "Pricing",
    address: "planpage.app/pricing",
    bodyHtml: `<div class="space-y-4 p-4">
    <div class="flex items-center justify-between">
      <h2 class="sk-heading text-2xl">Choose a plan</h2>
      <div class="sk-tabs sk-segmented" data-part="billingTabs"><span class="sk-tabs-tab">Monthly</span><span class="sk-tabs-tab" data-status="selected">Yearly</span></div>
    </div>
    <div class="grid grid-cols-3 gap-3">${pricingCardsHtml}</div>
    <div class="sk-testimonial w-full" data-part="testimonial"><p>This app saved us an hour every week.</p><p class="mt-2 text-sm font-medium">Noa Cohen, store owner</p></div>
  </div>`,
  },
  "ltr",
);

const pricingScreen: ProductScreen = {
  id: "pricingScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 560,
  html: pricingPageHtml,
};

const landingPageHtml = createBrowserWindowHtml(
  {
    title: "Home",
    address: "acme.example",
    bodyHtml: `<nav class="sk-header-navigation" data-part="siteHeader"><span class="font-bold">Acme</span><div class="flex gap-1"><a class="sk-header-navigation-link" data-status="selected">Home</a><a class="sk-header-navigation-link">Pricing</a><a class="sk-header-navigation-link">Docs</a></div><span data-icon="search"></span></nav>
  <div class="space-y-4 p-6 text-center">
    <h2 class="sk-heading text-3xl">Plan your launch on one page</h2>
    <p class="mx-auto max-w-md">Write the steps, the owners and the dates in one shared page.</p>
    <div class="flex justify-center gap-3">
      <button type="button" class="sk-button sk-main" data-part="heroButton">Start free</button>
      <button type="button" class="sk-button" data-part="demoButton">Watch demo</button>
    </div>
    <div class="sk-cover-image relative h-40 w-full" data-part="heroImage"><p class="absolute inset-x-0 bottom-0 px-4 py-2 font-medium">Product preview</p></div>
    <div class="grid grid-cols-3 gap-3 text-left" data-part="featureList">
      <p class="sk-feature">Share one plan with your team</p>
      <p class="sk-feature">Track every step with owners</p>
      <p class="sk-feature">Export a PDF in one click</p>
    </div>
    <div class="sk-testimonial w-full text-left" data-part="testimonial"><p>We launched two weeks early.</p><p class="mt-2 text-sm font-medium">Omer Levi, founder</p></div>
  </div>`,
  },
  "ltr",
);

const landingScreen: ProductScreen = {
  id: "landingScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 740,
  html: landingPageHtml,
};

const notFoundPageHtml = createBrowserWindowHtml(
  {
    title: "Not found",
    address: "planpage.app/orders/9999",
    bodyHtml: `<div class="space-y-4 p-4">
    <nav class="sk-breadcrumbs" data-part="breadcrumbs"><a class="sk-breadcrumb-item">Home</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item">Orders</a><span class="sk-breadcrumb-separator"></span><a class="sk-breadcrumb-item" data-status="selected">Order 9999</a></nav>
    <div class="sk-search-bar w-full" data-part="searchBar"><span data-icon="search"></span><span>Search orders</span></div>
    <div class="sk-empty-state" data-part="emptyState">
      <span class="sk-empty-drawing"></span>
      <p class="text-xl font-bold">We could not find this page</p>
      <p>The link may be old, or the order was removed.</p>
      <div class="flex justify-center gap-2">
        <button type="button" class="sk-button sk-main" data-part="homeButton">Go to home</button>
        <button type="button" class="sk-button" data-part="backButton">Go back</button>
      </div>
    </div>
  </div>`,
  },
  "ltr",
);

const notFoundScreen: ProductScreen = {
  id: "notFoundScreen",
  left: FRAME_LEFT,
  width: FRAME_WIDTH,
  height: 480,
  html: notFoundPageHtml,
};

const searchPhoneHtml = `<div class="sk-phone mx-auto w-full">
  <div class="sk-phone-notch"></div>
  <div class="sk-phone-status"><span>9:41</span><span>5G 88%</span></div>
  <div class="sk-phone-screen space-y-3">
    <p class="text-lg font-bold">Search</p>
    <div class="sk-search-bar w-full" data-status="focus" data-part="searchBar"><span data-icon="search"></span><span>Blue lamp</span></div>
    <div class="sk-filter-bar" data-part="filterBar"><span data-icon="funnel"></span><span class="sk-filter-chip" data-status="selected">In stock</span><span class="sk-filter-chip">Sale</span></div>
    <div class="sk-list" data-part="resultRows">
      <div class="sk-list-item" data-status="selected">Blue lamp, 24 cm</div>
      <div class="sk-list-item">Blue lamp, desk</div>
    </div>
    <div class="space-y-2" data-part="loadingRows">
      <div class="sk-skeleton sk-skeleton-line w-3/4"></div>
      <div class="sk-skeleton sk-skeleton-line w-1/2"></div>
    </div>
  </div>
  <div class="sk-phone-home"></div>
</div>`;

const searchScreen: ProductScreen = {
  id: "searchScreen",
  left: PHONE_LEFT,
  width: PHONE_WIDTH,
  height: 520,
  html: searchPhoneHtml,
};

export const PRODUCT_RECIPES: readonly SketchRecipe[] = [
  {
    id: "dashboard-screen",
    group: "product",
    name: "Dashboard",
    useFor: "stats, a chart and recent activity.",
    scene: createProductScene(dashboardScreen, [
      createSideNote(
        60,
        "dashboardScreen#revenueMetric",
        "Revenue, open tickets and refunds come from one summary query.",
      ),
      createSideNote(
        200,
        "dashboardScreen#ordersChart",
        "The bars show orders for each day of this week.",
      ),
      createSideNote(
        360,
        "dashboardScreen#recentActivity",
        "Recent activity lists the newest five events.",
      ),
      createSideNote(
        500,
        "dashboardScreen#exportButton",
        "Export shows a spinner until the file is ready.",
      ),
    ]),
  },
  {
    id: "list-detail-screen",
    group: "product",
    name: "List and detail",
    useFor: "a list with the chosen item open beside it.",
    scene: createProductScene(listDetailScreen, [
      createSideNote(
        60,
        "listDetailScreen#selectedOrder",
        "The picked row is the one shown on the right.",
      ),
      createSideNote(
        200,
        "listDetailScreen#orderDetails",
        "Details come from the order record when the row is picked.",
      ),
      createSideNote(
        330,
        "listDetailScreen#refundAlert",
        "The orange alert shows while the refund is waiting.",
      ),
    ]),
  },
  {
    id: "ai-chat-screen",
    group: "product",
    name: "AI chat",
    useFor: "a chat with an assistant.",
    scene: createProductScene(aiChatScreen, [
      createSideNote(60, "aiChatScreen#messageThread", "Replies appear one by one in the thread."),
      createSideNote(
        200,
        "aiChatScreen#typingSkeleton",
        "The grey line is shown while the assistant is still writing.",
      ),
      createSideNote(
        330,
        "aiChatScreen#suggestionChips",
        "A tapped chip fills the prompt with its text.",
      ),
      createSideNote(
        450,
        "aiChatScreen#promptInput",
        "Enter sends the message. The paperclip attaches a file.",
      ),
    ]),
  },
  {
    id: "checkout-screen",
    group: "product",
    name: "Checkout",
    useFor: "paying for an order.",
    scene: createProductScene(checkoutScreen, [
      createSideNote(
        60,
        "checkoutScreen#checkoutStepper",
        "The stepper shows the payment step is open.",
      ),
      createSideNote(
        200,
        "checkoutScreen#quantityInput",
        "Quantity changes the line total and the order total.",
      ),
      createSideNote(330, "checkoutScreen#orderTotal", "Totals update when the coupon applies."),
      createSideNote(
        460,
        "checkoutScreen#payButton",
        "Pay stays disabled until the card and the gift card are valid.",
      ),
    ]),
  },
  {
    id: "pricing-screen",
    group: "product",
    name: "Pricing",
    useFor: "comparing plans.",
    scene: createProductScene(pricingScreen, [
      createSideNote(
        60,
        "pricingScreen#billingTabs",
        "Yearly shows the price per month, billed once a year.",
      ),
      createSideNote(
        200,
        "pricingScreen#proCard",
        "Pro is the yellow card, the plan most people pick.",
      ),
      createSideNote(
        340,
        "pricingScreen#proCardButton",
        "Each Choose button opens the checkout screen.",
      ),
      createSideNote(
        470,
        "pricingScreen#testimonial",
        "A short quote sits under the plans to build trust.",
      ),
    ]),
  },
  {
    id: "landing-screen",
    group: "product",
    name: "Landing page",
    useFor: "a marketing home page.",
    scene: createProductScene(landingScreen, [
      createSideNote(60, "landingScreen#heroButton", "The main button starts the sign-up flow."),
      createSideNote(200, "landingScreen#heroImage", "The picture shows the product in use."),
      createSideNote(
        330,
        "landingScreen#featureList",
        "Each feature is one short promise, not a paragraph.",
      ),
      createSideNote(470, "landingScreen#testimonial", "The quote comes right after the features."),
    ]),
  },
  {
    id: "not-found-screen",
    group: "product",
    name: "Not found",
    useFor: "a missing page or an empty result.",
    scene: createProductScene(notFoundScreen, [
      createSideNote(
        60,
        "notFoundScreen#breadcrumbs",
        "Breadcrumbs show where the missing page sits.",
      ),
      createSideNote(200, "notFoundScreen#searchBar", "Search keeps the words the person typed."),
      createSideNote(330, "notFoundScreen#emptyState", "The empty drawing marks the empty result."),
      createSideNote(
        430,
        "notFoundScreen#homeButton",
        "The main button always gives one way back.",
      ),
    ]),
  },
  {
    id: "search-screen",
    group: "product",
    name: "Search",
    useFor: "search with filters and results.",
    scene: createProductScene(searchScreen, [
      {
        x: LEFT_NOTE_LEFT,
        y: 110,
        w: PHONE_NOTE_WIDTH,
        link: "searchScreen#searchBar",
        words: "Typing searches as you go.",
      },
      {
        x: LEFT_NOTE_LEFT,
        y: 230,
        w: PHONE_NOTE_WIDTH,
        link: "searchScreen#filterBar",
        words: "Filter chips narrow the results.",
      },
      {
        x: RIGHT_NOTE_LEFT,
        y: 320,
        w: PHONE_NOTE_WIDTH,
        link: "searchScreen#resultRows",
        words: "The picked row is the best match.",
      },
      {
        x: RIGHT_NOTE_LEFT,
        y: 440,
        w: PHONE_NOTE_WIDTH,
        link: "searchScreen#loadingRows",
        words: "Grey rows show while more results load.",
      },
    ]),
  },
];
