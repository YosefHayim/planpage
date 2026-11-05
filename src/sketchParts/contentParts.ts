import type { SketchPart } from "../contracts/sketchScene";

interface MonthGrid {
  className: string;
  weekdayLabels: readonly string[];
  rootAttributes: string;
  attributesByDay: (day: number) => string;
}

const MONTH_DAY_COUNT = 30;
const MONTH_EMPTY_CELL_COUNT = 5;
const MONTH_WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_WEEKDAY_LABELS_HEBREW = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const MONTH_DAY_NUMBERS = [...Array(MONTH_DAY_COUNT).keys()].map((dayIndex) => dayIndex + 1);
const PICKED_DAY = 9;
const TODAY_DAY = 12;
const RANGE_START_DAY = 4;
const RANGE_END_DAY = 8;

const createPickedDayAttributes = (day: number): string => {
  const isPickedDay = day === PICKED_DAY;
  const isTodayDay = day === TODAY_DAY;
  if (isPickedDay) return ' data-status="selected"';
  if (isTodayDay) return " data-checked";
  return "";
};

const createRangeDayAttributes = (day: number): string => {
  const isInRange = day >= RANGE_START_DAY && day <= RANGE_END_DAY;
  const isRangeEnd = day === RANGE_START_DAY || day === RANGE_END_DAY;
  const rangeFillAttribute = isInRange ? ' data-fill="blue"' : "";
  const statusAttribute = isRangeEnd ? ' data-status="selected"' : "";
  return `${statusAttribute}${rangeFillAttribute}`;
};

const createMonthGridHtml = (monthGrid: MonthGrid): string => {
  const headerCellsHtml = monthGrid.weekdayLabels
    .map((label) => `<span class="text-xs">${label}</span>`)
    .join("");
  const dayCellsHtml = MONTH_DAY_NUMBERS.map(
    (day) => `<span class="sk-calendar-day"${monthGrid.attributesByDay(day)}>${day}</span>`,
  ).join("");
  const emptyCellsHtml = "<span></span>".repeat(MONTH_EMPTY_CELL_COUNT);
  return `<div class="${monthGrid.className}"${monthGrid.rootAttributes}>${headerCellsHtml}${dayCellsHtml}${emptyCellsHtml}</div>`;
};

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
    className: "sk-heading",
    group: "content",
    name: "Heading",
    useFor: "A title for a screen or a section.",
    examples: [
      { label: "Screen title", html: '<h2 class="sk-heading text-2xl">Order history</h2>' },
      { label: "Section title", html: '<h3 class="sk-heading text-lg">Shipping address</h3>' },
      {
        label: "Hebrew, right to left",
        html: '<h2 class="sk-heading text-2xl" dir="rtl">היסטוריית הזמנות</h2>',
      },
    ],
  },
  {
    className: "sk-text-lines",
    group: "content",
    name: "Text lines",
    useFor: "Placeholder squiggles where text will go. Shows as many rows as fit the box.",
    examples: [
      { label: "Fills the box", html: '<div class="sk-text-lines h-24"></div>' },
      { label: "Three lines", html: '<div class="sk-text-lines h-24" data-count="3"></div>' },
      { label: "Short box", html: '<div class="sk-text-lines h-10"></div>' },
    ],
  },
  {
    className: "sk-paragraph",
    group: "content",
    name: "Paragraph",
    useFor: "A block of body text, written as real words.",
    examples: [
      {
        label: "Body text",
        html: '<p class="sk-paragraph">Your plan renews on the first of every month. You can cancel any time from billing.</p>',
      },
      {
        label: "Hebrew, right to left",
        html: '<p class="sk-paragraph" dir="rtl">התוכנית מתחדשת בתחילת כל חודש. אפשר לבטל בכל עת מדף החיוב.</p>',
      },
    ],
  },
  {
    className: "sk-label",
    group: "content",
    name: "Label",
    useFor: "A short name above a field or a value.",
    examples: [
      { label: "Plain", html: '<label class="sk-label">Email</label>' },
      {
        label: "Error",
        html: '<span class="sk-label" data-status="error">Email is required</span>',
      },
    ],
  },
  {
    className: "sk-separator",
    group: "content",
    name: "Separator",
    useFor: "A thin line that splits two parts of a screen.",
    examples: [
      { label: "Plain", html: '<div class="sk-separator"></div>' },
      { label: "Soft", html: '<div class="sk-separator" data-tone="soft"></div>' },
      { label: "Blue", html: '<div class="sk-separator" data-tone="blue"></div>' },
    ],
  },
  {
    className: "sk-avatar",
    group: "content",
    name: "Avatar",
    useFor: "A round picture or initials that stand for a person.",
    examples: [
      { label: "Initials", html: '<span class="sk-avatar" data-fill="blue">AL</span>' },
      { label: "Large", html: '<span class="sk-avatar sk-large" data-fill="orange">MK</span>' },
      { label: "No fill", html: '<span class="sk-avatar">JD</span>' },
    ],
  },
  {
    className: "sk-avatar-group",
    group: "content",
    name: "Avatar group",
    useFor: "A row of overlapping avatars for a team or a list of people.",
    examples: [
      {
        label: "Three people",
        html: '<div class="sk-avatar-group"><span class="sk-avatar" data-fill="blue">AL</span><span class="sk-avatar" data-fill="green">MK</span><span class="sk-avatar" data-fill="orange">JD</span></div>',
      },
      {
        label: "With a count",
        html: '<div class="sk-avatar-group"><span class="sk-avatar" data-fill="blue">AL</span><span class="sk-avatar" data-fill="grey">+4</span></div>',
      },
    ],
  },
  {
    className: "sk-avatar-label",
    group: "content",
    name: "Avatar with label",
    useFor: "An avatar with a name and a role next to it.",
    examples: [
      {
        label: "Name and role",
        html: '<div class="sk-avatar-label"><span class="sk-avatar" data-fill="blue">AL</span><div><p class="font-bold">Ava Levi</p><p class="text-sm">Product designer</p></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-avatar-label" dir="rtl"><span class="sk-avatar" data-fill="blue">אל</span><div><p class="font-bold">אבה לוי</p><p class="text-sm">מעצבת מוצר</p></div></div>',
      },
    ],
  },
  {
    className: "sk-badge",
    group: "content",
    name: "Badge",
    useFor: "A small pill that shows a status or a count.",
    examples: [
      { label: "Blue", html: '<span class="sk-badge" data-fill="blue">New</span>' },
      { label: "Green", html: '<span class="sk-badge" data-fill="green">Paid</span>' },
      { label: "Yellow", html: '<span class="sk-badge" data-fill="yellow">Pending</span>' },
      { label: "Red", html: '<span class="sk-badge" data-fill="red">Overdue</span>' },
      {
        label: "Hebrew, right to left",
        html: '<span class="sk-badge" data-fill="green" dir="rtl">פעיל</span>',
      },
    ],
  },
  {
    className: "sk-badge-group",
    group: "content",
    name: "Badge group",
    useFor: "Several badges in a row that wrap when space runs out.",
    examples: [
      {
        label: "Three badges",
        html: '<div class="sk-badge-group"><span class="sk-badge" data-fill="blue">New</span><span class="sk-badge" data-fill="green">Paid</span><span class="sk-badge" data-fill="grey">Gift</span></div>',
      },
    ],
  },
  {
    className: "sk-tag",
    group: "content",
    name: "Tag",
    useFor: "A label a user can add, remove or pick.",
    examples: [
      { label: "Plain", html: '<span class="sk-tag">Design</span>' },
      { label: "Removable", html: '<span class="sk-tag" data-icon="x">Design</span>' },
      { label: "Selected", html: '<span class="sk-tag" data-status="selected">Design</span>' },
      {
        label: "Hebrew, removable",
        html: '<span class="sk-tag" data-icon="x" dir="rtl">עיצוב</span>',
      },
    ],
  },
  {
    className: "sk-chip-row",
    group: "content",
    name: "Chip row",
    useFor: "A row of tags where one or more is picked.",
    examples: [
      {
        label: "One picked",
        html: '<div class="sk-chip-row"><span class="sk-tag" data-status="selected">All</span><span class="sk-tag">Shoes</span><span class="sk-tag">Bags</span><span class="sk-tag">Watches</span></div>',
      },
    ],
  },
  {
    className: "sk-status-light",
    group: "content",
    name: "Status light",
    useFor: "A dot with a short word that shows if something is synced, working or offline.",
    examples: [
      { label: "Synced", html: '<span class="sk-status-light" data-fill="green">Synced</span>' },
      { label: "Working", html: '<span class="sk-status-light" data-fill="orange">Syncing</span>' },
      { label: "Offline", html: '<span class="sk-status-light" data-fill="grey">Offline</span>' },
      {
        label: "Hebrew, right to left",
        html: '<span class="sk-status-light" data-fill="green" dir="rtl">מסונכרן</span>',
      },
    ],
  },
  {
    className: "sk-dot",
    group: "content",
    name: "Dot",
    useFor: "A small filled circle that marks a state or a count.",
    examples: [
      { label: "Red", html: '<span class="sk-dot" data-fill="red"></span>' },
      { label: "Green", html: '<span class="sk-dot" data-fill="green"></span>' },
      { label: "Blue", html: '<span class="sk-dot" data-fill="blue"></span>' },
      { label: "Grey", html: '<span class="sk-dot" data-fill="grey"></span>' },
    ],
  },
  {
    className: "sk-card-stack",
    group: "content",
    name: "Card stack",
    useFor: "Cards piled on each other, so a user sees there are more behind the top one.",
    examples: [
      {
        label: "Three cards",
        html: '<div class="sk-card-stack h-32"><div class="sk-card" data-fill="blue"><p class="font-bold">Week 3 notes</p></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-card-stack h-32" dir="rtl"><div class="sk-card" data-fill="green"><p class="font-bold">הערות שבוע 3</p></div></div>',
      },
    ],
  },
  {
    className: "sk-folder-card",
    group: "content",
    name: "Folder card",
    useFor: "A folder with a name and a count of what is inside.",
    examples: [
      {
        label: "Yellow folder",
        html: '<div class="sk-folder-card w-44" data-fill="yellow"><p class="font-bold">Invoices</p><p class="text-sm">12 files</p></div>',
      },
      {
        label: "Picked",
        html: '<div class="sk-folder-card w-44" data-status="selected"><p class="font-bold">Receipts</p><p class="text-sm">4 files</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-folder-card w-44" dir="rtl" data-fill="yellow"><p class="font-bold">חשבוניות</p><p class="text-sm">12 קבצים</p></div>',
      },
    ],
  },
  {
    className: "sk-option-card",
    group: "content",
    name: "Option card",
    useFor: "A big choice card the user taps to pick one plan or option.",
    examples: [
      {
        label: "Not picked",
        html: '<div class="sk-option-card w-56"><p class="font-bold">Monthly</p><p class="text-sm">Billed each month</p></div>',
      },
      {
        label: "Picked",
        html: '<div class="sk-option-card w-56" data-status="selected"><p class="font-bold">Yearly</p><p class="text-sm">Save 20 percent</p></div>',
      },
      {
        label: "Hebrew, picked",
        html: '<div class="sk-option-card w-56" dir="rtl" data-status="selected"><p class="font-bold">שנתי</p><p class="text-sm">חיסכון של 20 אחוז</p></div>',
      },
    ],
  },
  {
    className: "sk-panel",
    group: "content",
    name: "Panel",
    useFor: "A plain square box that holds a group of settings or fields.",
    examples: [
      {
        label: "Plain",
        html: '<div class="sk-panel w-64"><p class="font-bold">Filters</p><p class="text-sm">Show only open orders</p></div>',
      },
      {
        label: "Grey fill",
        html: '<div class="sk-panel w-64" data-fill="grey"><p class="font-bold">Filters</p><p class="text-sm">Show only open orders</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-panel w-64" dir="rtl"><p class="font-bold">מסננים</p><p class="text-sm">הצג הזמנות פתוחות בלבד</p></div>',
      },
    ],
  },
  {
    className: "sk-list",
    group: "content",
    name: "List",
    useFor: "A box of rows that share one edge, like settings or an inbox.",
    examples: [
      {
        label: "Three rows",
        html: '<div class="sk-list w-64"><div class="sk-list-item">Inbox</div><div class="sk-list-item">Sent</div><div class="sk-list-item">Drafts</div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-list w-64" dir="rtl"><div class="sk-list-item">דואר נכנס</div><div class="sk-list-item">נשלחו</div><div class="sk-list-item">טיוטות</div></div>',
      },
    ],
  },
  {
    className: "sk-list-item",
    group: "content",
    name: "List item",
    useFor: "One row in a list, with an optional arrow to a deeper screen.",
    examples: [
      {
        label: "With arrow",
        html: '<div class="sk-list w-64"><div class="sk-list-item sk-with-chevron">Billing</div><div class="sk-list-item">Team</div></div>',
      },
      {
        label: "Picked",
        html: '<div class="sk-list w-64"><div class="sk-list-item">Team</div><div class="sk-list-item" data-status="selected">Billing</div></div>',
      },
      {
        label: "Hebrew, with arrow",
        html: '<div class="sk-list w-64" dir="rtl"><div class="sk-list-item sk-with-chevron">חיוב</div><div class="sk-list-item">צוות</div></div>',
      },
    ],
  },
  {
    className: "sk-sortable-list",
    group: "content",
    name: "Sortable list",
    useFor: "A list whose rows the user drags into a new order, shown with grip dots.",
    examples: [
      {
        label: "Three tasks",
        html: '<div class="sk-sortable-list w-64"><div class="sk-list-item sk-sortable">Morning run</div><div class="sk-list-item sk-sortable">Pay rent</div><div class="sk-list-item sk-sortable">Call Mom</div></div>',
      },
    ],
  },
  {
    className: "sk-swipe-row",
    group: "content",
    name: "Swipe row",
    useFor: "A row the user swipes to reveal an action such as delete.",
    examples: [
      {
        label: "Delete revealed",
        html: '<div class="sk-swipe-row w-72"><span class="min-w-0 flex-1 truncate px-4">Lunch with Dana</span><span class="sk-swipe-action w-1/3 text-center font-bold">Delete</span></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-swipe-row w-72" dir="rtl"><span class="min-w-0 flex-1 truncate px-4">ארוחת צהריים עם דנה</span><span class="sk-swipe-action w-1/3 text-center font-bold">מחק</span></div>',
      },
    ],
  },
  {
    className: "sk-table",
    group: "content",
    name: "Table",
    useFor: "Rows and columns of data with a header and one row the user can pick.",
    examples: [
      {
        label: "Header, rows and a picked row",
        html: '<div class="sk-table w-96"><div class="sk-table-row sk-table-head"><span>Order</span><span>Customer</span><span>Total</span></div><div class="sk-table-row"><span>#1041</span><span>Dana</span><span>$48</span></div><div class="sk-table-row" data-status="selected"><span>#1042</span><span>Omer</span><span>$120</span></div><div class="sk-table-row"><span>#1043</span><span>Noa</span><span>$36</span></div></div>',
      },
    ],
  },
  {
    className: "sk-description-list",
    group: "content",
    name: "Description list",
    useFor: "Pairs of a label and its value, like a plan or an order summary.",
    examples: [
      {
        label: "Plan details",
        html: '<dl class="sk-description-list w-72"><div class="sk-list-item"><dt class="font-bold">Plan</dt><dd>Pro, monthly</dd></div><div class="sk-list-item"><dt class="font-bold">Renews</dt><dd>June 1</dd></div><div class="sk-list-item"><dt class="font-bold">Card</dt><dd>Visa ending 4242</dd></div></dl>',
      },
      {
        label: "Hebrew, right to left",
        html: '<dl class="sk-description-list w-72" dir="rtl"><div class="sk-list-item"><dt class="font-bold">תוכנית</dt><dd>פרו, חודשי</dd></div><div class="sk-list-item"><dt class="font-bold">חידוש</dt><dd>1 ביוני</dd></div></dl>',
      },
    ],
  },
  {
    className: "sk-accordion",
    group: "content",
    name: "Accordion",
    useFor: "A stack of sections where one opens to show its text.",
    examples: [
      {
        label: "One open",
        html: '<div class="sk-accordion w-72"><div class="sk-accordion-item" data-checked><div class="sk-accordion-trigger"><span class="font-bold">Shipping</span></div><div class="sk-accordion-content"><p class="text-sm">Free over $50. Arrives in 3 days.</p></div></div><div class="sk-accordion-item"><div class="sk-accordion-trigger"><span class="font-bold">Returns</span></div></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-accordion w-72" dir="rtl"><div class="sk-accordion-item"><div class="sk-accordion-trigger"><span class="font-bold">משלוחים</span></div></div><div class="sk-accordion-item"><div class="sk-accordion-trigger"><span class="font-bold">החזרות</span></div></div></div>',
      },
    ],
  },
  {
    className: "sk-collapsible",
    group: "content",
    name: "Collapsible",
    useFor: "One section that opens or closes on its own, like advanced options.",
    examples: [
      {
        label: "Closed",
        html: '<div class="sk-collapsible w-72"><div class="sk-collapsible-trigger"><span class="font-bold">Advanced options</span></div></div>',
      },
      {
        label: "Open",
        html: '<div class="sk-collapsible w-72" data-checked><div class="sk-collapsible-trigger"><span class="font-bold">Advanced options</span></div><div class="sk-accordion-content"><p class="text-sm">Turn on beta features.</p></div></div>',
      },
    ],
  },
  {
    className: "sk-tree-view",
    group: "content",
    name: "Tree view",
    useFor: "Nested folders or pages, opened by chevrons and indented by depth.",
    examples: [
      {
        label: "Nested folders",
        html: '<div class="sk-tree-view w-64"><div class="sk-tree-row sk-tree-folder" data-checked data-count="0" style="--depth: 0"><span>src</span></div><div class="sk-tree-row sk-tree-folder" data-count="1" style="--depth: 1"><span>screens</span></div><div class="sk-tree-row" data-count="2" style="--depth: 2"><span>home.tsx</span></div><div class="sk-tree-row" data-count="1" style="--depth: 1"><span>app.tsx</span></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-tree-view w-64" dir="rtl"><div class="sk-tree-row sk-tree-folder" data-checked data-count="0" style="--depth: 0"><span>קוד</span></div><div class="sk-tree-row sk-tree-folder" data-count="1" style="--depth: 1"><span>מסכים</span></div><div class="sk-tree-row" data-count="2" style="--depth: 2"><span>דף הבית</span></div><div class="sk-tree-row" data-count="1" style="--depth: 1"><span>האפליקציה</span></div></div>',
      },
    ],
  },
  {
    className: "sk-calendar",
    group: "content",
    name: "Calendar",
    useFor: "A month grid for picking one day. Today is ringed, the picked day is filled.",
    examples: [
      {
        label: "Picked day and today",
        html: createMonthGridHtml({
          className: "sk-calendar",
          weekdayLabels: MONTH_WEEKDAY_LABELS,
          rootAttributes: "",
          attributesByDay: createPickedDayAttributes,
        }),
      },
      {
        label: "Hebrew, right to left",
        html: createMonthGridHtml({
          className: "sk-calendar",
          weekdayLabels: MONTH_WEEKDAY_LABELS_HEBREW,
          rootAttributes: ' dir="rtl"',
          attributesByDay: createPickedDayAttributes,
        }),
      },
    ],
  },
  {
    className: "sk-date-range-calendar",
    group: "content",
    name: "Date range calendar",
    useFor:
      "A month grid for picking a start day and an end day, with the days between them shaded.",
    examples: [
      {
        label: "Range from 4 to 8",
        html: createMonthGridHtml({
          className: "sk-date-range-calendar",
          weekdayLabels: MONTH_WEEKDAY_LABELS,
          rootAttributes: "",
          attributesByDay: createRangeDayAttributes,
        }),
      },
    ],
  },
  {
    className: "sk-week-strip",
    group: "content",
    name: "Week strip",
    useFor: "Seven days in a row, for picking a day in the current week.",
    examples: [
      {
        label: "Wednesday picked",
        html: '<div class="sk-week-strip w-80"><span class="sk-week-day"><span>Mon</span><span>9</span></span><span class="sk-week-day"><span>Tue</span><span>10</span></span><span class="sk-week-day" data-status="selected"><span>Wed</span><span>11</span></span><span class="sk-week-day" data-checked><span>Thu</span><span>12</span></span><span class="sk-week-day"><span>Fri</span><span>13</span></span><span class="sk-week-day"><span>Sat</span><span>14</span></span><span class="sk-week-day"><span>Sun</span><span>15</span></span></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-week-strip w-80" dir="rtl"><span class="sk-week-day"><span>א׳</span><span>9</span></span><span class="sk-week-day"><span>ב׳</span><span>10</span></span><span class="sk-week-day" data-status="selected"><span>ג׳</span><span>11</span></span><span class="sk-week-day" data-checked><span>ד׳</span><span>12</span></span><span class="sk-week-day"><span>ה׳</span><span>13</span></span><span class="sk-week-day"><span>ו׳</span><span>14</span></span><span class="sk-week-day"><span>ש׳</span><span>15</span></span></div>',
      },
    ],
  },
  {
    className: "sk-countdown",
    group: "content",
    name: "Countdown",
    useFor: "Time left until a date, shown as days, hours, minutes and seconds.",
    examples: [
      {
        label: "Running",
        html: '<div class="sk-countdown w-96"><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">03</b><small>days</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">14</b><small>hours</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">52</b><small>minutes</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">09</b><small>seconds</small></span></div>',
      },
      {
        label: "Ended",
        html: '<div class="sk-countdown w-96" data-fill="red"><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">00</b><small>days</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">00</b><small>hours</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">00</b><small>minutes</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">00</b><small>seconds</small></span></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-countdown w-96" dir="rtl"><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">03</b><small>ימים</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">14</b><small>שעות</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">52</b><small>דקות</small></span><span class="flex flex-1 flex-col items-center justify-center py-2"><b class="text-2xl">09</b><small>שניות</small></span></div>',
      },
    ],
  },
  {
    className: "sk-timeline-item",
    group: "content",
    name: "Timeline item",
    useFor:
      "One dated event in a list of events, with a dot that holds an icon and a line to the next event.",
    examples: [
      {
        label: "Order history",
        html: '<div class="flex w-80 flex-col"><div class="sk-timeline-item" data-icon="check" data-fill="green"><p class="font-medium">Order delivered</p><p class="text-sm">Today, 09:40</p></div><div class="sk-timeline-item" data-icon="send"><p class="font-medium">Order shipped</p><p class="text-sm">Yesterday, 18:05</p></div><div class="sk-timeline-item" data-icon="shopping-bag"><p class="font-medium">Order placed</p><p class="text-sm">Monday, 11:12</p></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-80 flex-col" dir="rtl"><div class="sk-timeline-item" data-icon="check" data-fill="green"><p class="font-medium">ההזמנה נמסרה</p><p class="text-sm">היום, 09:40</p></div><div class="sk-timeline-item" data-icon="send"><p class="font-medium">ההזמנה יצאה לדרך</p><p class="text-sm">אתמול, 18:05</p></div><div class="sk-timeline-item" data-icon="shopping-bag"><p class="font-medium">ההזמנה נוצרה</p><p class="text-sm">יום שני, 11:12</p></div></div>',
      },
    ],
  },
  {
    className: "sk-activity-feed",
    group: "content",
    name: "Activity feed row",
    useFor:
      "One row of an activity feed: an avatar, one line of text and a time. Rows are joined by a line.",
    examples: [
      {
        label: "Recent activity",
        html: '<div class="flex w-80 flex-col"><div class="sk-activity-feed" data-fill="blue"><p class="font-medium">Dana commented on the plan</p><p class="text-sm">2 minutes ago</p></div><div class="sk-activity-feed"><p class="font-medium">Omer invited you to a board</p><p class="text-sm">1 hour ago</p></div><div class="sk-activity-feed"><p class="font-medium">Maya uploaded 3 photos</p><p class="text-sm">Yesterday</p></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-80 flex-col" dir="rtl"><div class="sk-activity-feed"><p class="font-medium">דנה הגיבה על התוכנית</p><p class="text-sm">לפני 2 דקות</p></div><div class="sk-activity-feed"><p class="font-medium">עומר הזמין אותך ללוח</p><p class="text-sm">לפני שעה</p></div></div>',
      },
    ],
  },
  {
    className: "sk-speech-bubble",
    group: "content",
    name: "Speech bubble",
    useFor: "One chat message. The tail shows whether it was sent or received.",
    examples: [
      {
        label: "Received",
        html: '<div class="sk-speech-bubble w-64"><p>Is the order still on the way?</p></div>',
      },
      {
        label: "Sent",
        html: '<div class="sk-speech-bubble sk-from-me w-64" data-fill="blue"><p>Yes, it ships today.</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-80 flex-col" dir="rtl"><div class="sk-speech-bubble w-64"><p>ההזמנה עדיין בדרך?</p></div><div class="sk-speech-bubble sk-from-me w-64" data-fill="blue"><p>כן, היא יוצאת היום.</p></div></div>',
      },
    ],
  },
  {
    className: "sk-message-thread",
    group: "content",
    name: "Message thread",
    useFor: "A chat column that holds speech bubbles, with replies on the other side.",
    examples: [
      {
        label: "Two messages",
        html: '<div class="sk-message-thread w-80"><div class="sk-speech-bubble w-64"><p>Is the order still on the way?</p></div><div class="sk-speech-bubble sk-from-me w-64" data-fill="blue"><p>Yes, it ships today.</p></div></div>',
      },
    ],
  },
  {
    className: "sk-image",
    group: "content",
    name: "Image",
    useFor: "A picture placeholder with a mountain and a sun, for a photo that is not loaded yet.",
    examples: [
      { label: "Square", html: '<div class="sk-image h-32 w-32"></div>' },
      { label: "Wide", html: '<div class="sk-image h-32 w-64"></div>' },
    ],
  },
  {
    className: "sk-cover-image",
    group: "content",
    name: "Cover image",
    useFor: "A wide picture at the top of a card, with a caption band along the bottom.",
    examples: [
      {
        label: "With caption",
        html: '<div class="sk-cover-image relative h-40 w-72"><p class="absolute inset-x-0 bottom-0 px-4 py-2 font-medium">Summer menu</p></div>',
      },
    ],
  },
  {
    className: "sk-image-viewer",
    group: "content",
    name: "Image viewer",
    useFor:
      "A large picture with arrows to move to the next or previous photo, and dots for the position.",
    examples: [
      {
        label: "Three photos",
        html: '<div class="sk-image-viewer relative h-48 w-72" data-count="3"><p class="absolute start-3 top-3 text-sm">Photo 1 of 3</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-image-viewer relative h-48 w-72" data-count="3" dir="rtl"><p class="absolute start-3 top-3 text-sm">תמונה 1 מתוך 3</p></div>',
      },
    ],
  },
  {
    className: "sk-carousel",
    group: "content",
    name: "Carousel",
    useFor: "A slide that moves between cards, with arrows and dots for the position.",
    examples: [
      {
        label: "Four slides",
        html: '<div class="sk-carousel relative h-40 w-72" data-count="4"><p class="absolute start-4 top-4 font-medium">Summer deals</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-carousel relative h-40 w-72" data-count="4" dir="rtl"><p class="absolute start-4 top-4 font-medium">מבצעי הקיץ</p></div>',
      },
    ],
  },
  {
    className: "sk-video-player",
    group: "content",
    name: "Video player",
    useFor: "A video frame with a play button and a progress bar along the bottom.",
    examples: [
      {
        label: "Playing at 40 percent",
        html: '<div class="sk-video-player relative h-48 w-72" data-percent="40"><p class="absolute start-3 top-3 text-sm">Kitchen tour</p></div>',
      },
      {
        label: "Not started",
        html: '<div class="sk-video-player relative h-48 w-72"><p class="absolute start-3 top-3 text-sm">Kitchen tour</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-video-player relative h-48 w-72" data-percent="60" dir="rtl"><p class="absolute start-3 top-3 text-sm">סיור במטבח</p></div>',
      },
    ],
  },
  {
    className: "sk-photo-fan",
    group: "content",
    name: "Photo fan",
    useFor: "Three photos stacked at an angle, like a pile of prints.",
    examples: [{ label: "Three photos", html: '<div class="sk-photo-fan h-48 w-64"></div>' }],
  },
  {
    className: "sk-map",
    group: "content",
    name: "Map",
    useFor: "A street map with one pin on a place.",
    examples: [{ label: "One pin", html: '<div class="sk-map h-48 w-72"></div>' }],
  },
  {
    className: "sk-qr-code",
    group: "content",
    name: "QR code",
    useFor: "A square code that opens a page or a ticket when scanned.",
    examples: [
      { label: "Large", html: '<div class="sk-qr-code w-48"></div>' },
      { label: "Small", html: '<div class="sk-qr-code w-24"></div>' },
    ],
  },
  {
    className: "sk-code-snippet",
    group: "content",
    name: "Code snippet",
    useFor: "A block of code with a copy button in the corner.",
    examples: [
      { label: "Command", html: '<div class="sk-code-snippet w-80"><p>pnpm add zod</p></div>' },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-code-snippet w-80" dir="rtl"><p>// שמירת השינויים</p></div>',
      },
    ],
  },
  {
    className: "sk-metric",
    group: "content",
    name: "Metric",
    useFor: "One big number with a label. A green or red tone adds an up or down arrow.",
    examples: [
      {
        label: "Trending up",
        html: '<div class="sk-metric w-56" data-tone="green"><p class="text-sm">Revenue this week</p><p class="text-3xl font-bold">$12,480</p></div>',
      },
      {
        label: "Trending down",
        html: '<div class="sk-metric w-56" data-tone="red"><p class="text-sm">Refunds this week</p><p class="text-3xl font-bold">$320</p></div>',
      },
      {
        label: "No trend",
        html: '<div class="sk-metric w-56"><p class="text-sm">Open tickets</p><p class="text-3xl font-bold">14</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-metric w-56" data-tone="green" dir="rtl"><p class="text-sm">ההכנסות השבוע</p><p class="text-3xl font-bold">12,480 ₪</p></div>',
      },
    ],
  },
  {
    className: "sk-stat-bar",
    group: "content",
    name: "Stat bar",
    useFor: "A bar that shows a share of a whole, from empty to full.",
    examples: [
      {
        label: "Quarter done",
        html: '<div class="flex w-64 flex-col gap-1"><p class="text-sm">Quarter done, 25 percent</p><div class="sk-stat-bar" data-percent="25"></div></div>',
      },
      {
        label: "Almost full, orange",
        html: '<div class="flex w-64 flex-col gap-1"><p class="text-sm">Budget used, 70 percent</p><div class="sk-stat-bar" data-percent="70" data-fill="orange"></div></div>',
      },
      {
        label: "Complete, green",
        html: '<div class="flex w-64 flex-col gap-1"><p class="text-sm">Profile complete</p><div class="sk-stat-bar" data-percent="100" data-fill="green"></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-64 flex-col gap-1" dir="rtl"><p class="text-sm">הושלם 60 אחוז</p><div class="sk-stat-bar" data-percent="60"></div></div>',
      },
    ],
  },
  {
    className: "sk-leaderboard-row",
    group: "content",
    name: "Leaderboard row",
    useFor: "One place in a ranked list. The first three places get gold, silver and bronze dots.",
    examples: [
      {
        label: "Top four",
        html: '<div class="flex w-80 flex-col"><div class="sk-leaderboard-row" data-count="1"><span class="sk-leaderboard-rank">1</span><span>Dana Levi</span><span class="ms-auto">1,820</span></div><div class="sk-leaderboard-row" data-count="2"><span class="sk-leaderboard-rank">2</span><span>Omer Cohen</span><span class="ms-auto">1,645</span></div><div class="sk-leaderboard-row" data-count="3"><span class="sk-leaderboard-rank">3</span><span>Maya Ben</span><span class="ms-auto">1,510</span></div><div class="sk-leaderboard-row" data-count="4"><span class="sk-leaderboard-rank">4</span><span>Itai Katz</span><span class="ms-auto">1,220</span></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-80 flex-col" dir="rtl"><div class="sk-leaderboard-row" data-count="1"><span class="sk-leaderboard-rank">1</span><span>דנה לוי</span><span class="ms-auto">1,820</span></div><div class="sk-leaderboard-row" data-count="2"><span class="sk-leaderboard-rank">2</span><span>עומר כהן</span><span class="ms-auto">1,645</span></div></div>',
      },
    ],
  },
  {
    className: "sk-feature",
    group: "content",
    name: "Feature",
    useFor: "A check mark with one line of text, for a list of benefits.",
    examples: [
      {
        label: "Benefits list",
        html: '<div class="flex w-64 flex-col gap-2"><p class="sk-feature">Free returns for 30 days</p><p class="sk-feature">Priority support</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-64 flex-col gap-2" dir="rtl"><p class="sk-feature">החזרה חינם תוך 30 יום</p><p class="sk-feature">תמיכה בעדיפות</p></div>',
      },
    ],
  },
  {
    className: "sk-pricing-card",
    group: "content",
    name: "Pricing card",
    useFor: "One plan with a name, a price, a short list of what it includes and a button.",
    examples: [
      {
        label: "Standard plan",
        html: '<div class="sk-pricing-card w-64"><p class="text-sm">Standard</p><p class="text-3xl font-bold">$9<span class="text-base"> / month</span></p><div class="mt-3 flex flex-col gap-2"><p class="sk-feature">Up to 3 projects</p><p class="sk-feature">Email support</p></div><button class="mt-4 w-full rounded border px-3 py-2">Choose plan</button></div>',
      },
      {
        label: "Featured plan, yellow",
        html: '<div class="sk-pricing-card w-64" data-fill="yellow"><p class="text-sm">Pro</p><p class="text-3xl font-bold">$19<span class="text-base"> / month</span></p><div class="mt-3 flex flex-col gap-2"><p class="sk-feature">Unlimited projects</p><p class="sk-feature">Team sharing</p></div><button class="mt-4 w-full rounded border px-3 py-2">Start free trial</button></div>',
      },
    ],
  },
  {
    className: "sk-testimonial",
    group: "content",
    name: "Testimonial",
    useFor: "A customer quote with the name and role of the person who said it.",
    examples: [
      {
        label: "Customer quote",
        html: '<div class="sk-testimonial w-72"><p>This app saved us an hour every week.</p><p class="mt-3 text-sm font-medium">Noa Cohen, store owner</p></div>',
      },
    ],
  },
  {
    className: "sk-receipt",
    group: "content",
    name: "Receipt",
    useFor: "A paper receipt with torn edges top and bottom, listing what was paid.",
    examples: [
      {
        label: "Cafe bill",
        html: '<div class="sk-receipt w-64"><p class="text-center font-bold">Corner Cafe</p><div class="mt-3 flex justify-between text-sm"><span>Flat white</span><span>12.00</span></div><div class="flex justify-between text-sm"><span>Croissant</span><span>9.00</span></div><div class="mt-2 flex justify-between font-bold"><span>Total</span><span>21.00</span></div></div>',
      },
    ],
  },
  {
    className: "sk-ticket",
    group: "content",
    name: "Ticket",
    useFor: "An event ticket with a notch on each side and a dashed tear line before the stub.",
    examples: [
      {
        label: "Concert",
        html: '<div class="sk-ticket w-80"><div class="w-2/3"><p class="font-bold">Jazz night</p><p class="text-sm">Friday, 21:00, Hall B</p><p class="text-sm">Seat 14, row C</p></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-ticket w-80" dir="rtl"><div class="w-2/3"><p class="font-bold">ערב ג׳אז</p><p class="text-sm">שישי, 21:00, אולם ב׳</p><p class="text-sm">מושב 14, שורה ג׳</p></div></div>',
      },
    ],
  },
  {
    className: "sk-boarding-pass",
    group: "content",
    name: "Boarding pass",
    useFor: "A flight pass with the trip details on the left and a barcode on the stub.",
    examples: [
      {
        label: "Flight",
        html: '<div class="sk-boarding-pass w-96"><div class="w-2/3"><p class="text-xs">Gate 12</p><p class="font-bold">TLV to LHR</p><p class="text-sm">Seat 14C, 09:40</p></div></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-boarding-pass w-96" dir="rtl"><div class="w-2/3"><p class="text-xs">שער 12</p><p class="font-bold">תל אביב ללונדון</p><p class="text-sm">מושב 14C, 09:40</p></div></div>',
      },
    ],
  },
  {
    className: "sk-credit-card",
    group: "content",
    name: "Credit card",
    useFor: "A bank card with a chip, the masked number and the name on it.",
    examples: [
      {
        label: "Card",
        html: '<div class="sk-credit-card flex w-72 flex-col justify-end"><p class="tracking-widest">•••• •••• •••• 4242</p><p class="text-sm">Dana Levi</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="sk-credit-card flex w-72 flex-col justify-end" dir="rtl"><p class="tracking-widest">•••• •••• •••• 4242</p><p class="text-sm">דנה לוי</p></div>',
      },
    ],
  },
  {
    className: "sk-streak",
    group: "content",
    name: "Streak",
    useFor: "Seven days in a row, with the days that were done filled in.",
    examples: [
      {
        label: "Four days done",
        html: '<div class="flex w-72 flex-col gap-2"><div class="sk-streak" data-count="4"></div><p class="text-sm">4 days in a row</p></div>',
      },
      {
        label: "Nothing done yet",
        html: '<div class="flex w-72 flex-col gap-2"><div class="sk-streak" data-count="0"></div><p class="text-sm">Start your streak today</p></div>',
      },
      {
        label: "Hebrew, right to left",
        html: '<div class="flex w-72 flex-col gap-2" dir="rtl"><div class="sk-streak" data-count="3"></div><p class="text-sm">3 ימים ברצף</p></div>',
      },
    ],
  },
  {
    className: "sk-rating-badge",
    group: "content",
    name: "Rating badge",
    useFor: "A small pill with a star and a score.",
    examples: [
      { label: "Score", html: '<span class="sk-rating-badge"><span>4.8</span></span>' },
      {
        label: "Score and count",
        html: '<span class="sk-rating-badge"><span>4.9 (120 reviews)</span></span>',
      },
      {
        label: "Hebrew, right to left",
        html: '<span class="sk-rating-badge" dir="rtl"><span>4.8 מתוך 5</span></span>',
      },
    ],
  },
];
