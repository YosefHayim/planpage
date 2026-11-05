import type { SketchPart } from "../contracts/sketchScene";

const WEEKDAY_LABELS_HTML =
  "<span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>";
const HEBREW_MONTH_LABELS_HTML =
  "<span>ינו׳</span><span>פבר׳</span><span>מרץ</span><span>אפר׳</span><span>מאי</span><span>יונ׳</span>";
const SCALE_40_LABELS_HTML =
  "<span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>";
const SCALE_90_LABELS_HTML = "<span>90</span><span>60</span><span>30</span><span>0</span>";

const SCALE_80_LABELS_HTML =
  "<span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>";
const X_SCALE_80_LABELS_HTML =
  "<span>0</span><span>20</span><span>40</span><span>60</span><span>80</span>";
const TWELVE_WEEK_CALENDAR_NUMBERS = Array.from(
  { length: 84 },
  (_, dayIndex) => (dayIndex * 5 + 3) % 9,
).join(",");

export const CHARTS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-bar-chart",
    group: "charts",
    name: "Bar chart",
    useFor:
      "Compare amounts across categories. data-numbers gives one bar per category. data-second-numbers adds a second bar beside each one, or stacks it on top with sk-stacked.",
    examples: [
      {
        label: "Grouped bars with two series",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-bar-chart h-40" data-numbers="12,30,18,40,26,34" data-second-numbers="20,14,28,22,30,16"></div>
    <div class="flex justify-between text-xs">${WEEKDAY_LABELS_HTML}</div>
  </div>
</div>`,
      },
      {
        label: "Stacked bars",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-bar-chart sk-stacked h-40" data-numbers="12,30,18,40,26,34" data-second-numbers="8,10,6,12,9,5"></div>
    <div class="flex justify-between text-xs">${WEEKDAY_LABELS_HTML}</div>
  </div>
</div>`,
      },
      {
        label: "Horizontal bars, right to left",
        html: `<div dir="rtl" class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-xs">${HEBREW_MONTH_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-bar-chart sk-horizontal h-40" data-numbers="12,30,18,40,26,34"></div>
    <div class="flex justify-between text-xs"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span></div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-line-chart",
    group: "charts",
    name: "Line chart",
    useFor:
      "Show how one or two values change over time. data-numbers draws the main line. data-second-numbers draws a second line in orange.",
    examples: [
      {
        label: "Single line",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-line-chart h-40" data-numbers="12,30,18,40,26,34"></div>
    <div class="flex justify-between text-xs">${WEEKDAY_LABELS_HTML}</div>
  </div>
</div>`,
      },
      {
        label: "Two lines",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-line-chart h-40" data-numbers="12,30,18,40,26,34" data-second-numbers="20,14,28,22,30,16"></div>
    <div class="flex justify-between text-xs">${WEEKDAY_LABELS_HTML}</div>
  </div>
</div>`,
      },
      {
        label: "Right to left, Hebrew months",
        html: `<div dir="rtl" class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-line-chart h-40" data-numbers="12,30,18,40,26,34"></div>
    <div class="flex justify-between text-xs">${HEBREW_MONTH_LABELS_HTML}</div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-area-chart",
    group: "charts",
    name: "Area chart",
    useFor:
      "A line chart with the space under it filled, to show size over time. data-numbers fills the main area, and data-second-numbers adds a second filled area.",
    examples: [
      {
        label: "Single filled area",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-area-chart h-40" data-numbers="12,30,18,40,26,34"></div>
    <div class="flex justify-between text-xs">${WEEKDAY_LABELS_HTML}</div>
  </div>
</div>`,
      },
      {
        label: "Two filled areas",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-area-chart h-40" data-numbers="12,30,18,40,26,34" data-second-numbers="20,14,28,22,30,16"></div>
    <div class="flex justify-between text-xs">${WEEKDAY_LABELS_HTML}</div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-pie-chart",
    group: "charts",
    name: "Pie chart",
    useFor:
      "Show how a whole splits into parts. data-numbers gives one slice per value, and the slices are sized by their share of the total.",
    examples: [
      {
        label: "Sample slices",
        html: `<div class="w-56"><div class="sk-pie-chart"></div></div>`,
      },
      {
        label: "Sales by channel with legend",
        html: `<div class="flex w-full items-center gap-4">
  <div class="w-40"><div class="sk-pie-chart" data-numbers="45,25,20,10"></div></div>
  <ul class="flex flex-col gap-1 text-sm"><li>Web 45%</li><li>App 25%</li><li>Store 20%</li><li>Other 10%</li></ul>
</div>`,
      },
    ],
  },
  {
    className: "sk-donut-chart",
    group: "charts",
    name: "Donut chart",
    useFor:
      "A pie chart with a hole in the middle, so a total or a headline number can sit in the center. data-numbers gives one ring segment per value.",
    examples: [
      {
        label: "Sample ring with total in the center",
        html: `<div class="relative w-56">
  <div class="sk-donut-chart"></div>
  <div class="absolute inset-0 grid place-items-center text-center text-sm"><span>$4,280<br>this month</span></div>
</div>`,
      },
      {
        label: "Ring with custom slices",
        html: `<div class="relative w-56">
  <div class="sk-donut-chart" data-numbers="50,30,15,5"></div>
  <div class="absolute inset-0 grid place-items-center text-center text-sm"><span>Plan<br>usage</span></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-scatter-chart",
    group: "charts",
    name: "Scatter chart",
    useFor:
      "Show many points on two axes, to see if they cluster. data-numbers holds x and y as pairs (x1,y1,x2,y2 and so on). With sk-bubble, data-second-numbers gives each point a size.",
    examples: [
      {
        label: "Dots",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_80_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-scatter-chart h-40" data-numbers="10,20,25,40,40,28,55,62,70,50,80,80"></div>
    <div class="flex justify-between text-xs">${X_SCALE_80_LABELS_HTML}</div>
    <div class="flex justify-between text-xs"><span>Visits across, sign-ups up</span></div>
  </div>
</div>`,
      },
      {
        label: "Bubbles sized by second numbers",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_80_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-scatter-chart sk-bubble h-40" data-numbers="10,20,25,40,40,28,55,62,70,50,80,80" data-second-numbers="4,9,6,12,7,3"></div>
    <div class="flex justify-between text-xs">${X_SCALE_80_LABELS_HTML}</div>
    <div class="flex justify-between text-xs"><span>Ad spend across, sales up</span></div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-radar-chart",
    group: "charts",
    name: "Radar chart",
    useFor:
      "Compare one item across several measures at once. data-numbers gives one value per axis, going clockwise from the top.",
    examples: [
      {
        label: "Five axes",
        html: `<div class="flex w-full items-center gap-4">
  <div class="w-56"><div class="sk-radar-chart"></div></div>
  <ul class="flex flex-col gap-1 text-sm"><li>Speed 60</li><li>Power 80</li><li>Range 45</li><li>Comfort 70</li><li>Price 50</li></ul>
</div>`,
      },
    ],
  },
  {
    className: "sk-polar-area-chart",
    group: "charts",
    name: "Polar area chart",
    useFor:
      "Compare several values as equal wedges, where each wedge's distance from the center shows its size. data-numbers gives one wedge per value.",
    examples: [
      {
        label: "Five wedges",
        html: `<div class="flex w-full items-center gap-4">
  <div class="w-44"><div class="sk-polar-area-chart"></div></div>
  <ul class="flex flex-col gap-1 text-sm"><li>Mon 30</li><li>Tue 45</li><li>Wed 20</li><li>Thu 60</li><li>Fri 35</li></ul>
</div>`,
      },
    ],
  },
  {
    className: "sk-funnel-chart",
    group: "charts",
    name: "Funnel chart",
    useFor:
      "Show how a group shrinks step by step, like visits to sign-ups to paid. data-numbers gives one count per stage, largest first. With sk-pyramid, the stages widen down instead.",
    examples: [
      {
        label: "Funnel",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-48 flex-col justify-around text-right text-xs"><span>Visits</span><span>Sign-ups</span><span>Trials</span><span>Paid</span></div>
  <div class="sk-funnel-chart h-48 min-w-0 flex-1"></div>
</div>`,
      },
      {
        label: "Pyramid",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-48 flex-col justify-around text-right text-xs"><span>Bronze</span><span>Silver</span><span>Gold</span><span>Platinum</span></div>
  <div class="sk-funnel-chart sk-pyramid h-48 min-w-0 flex-1"></div>
</div>`,
      },
      {
        label: "Funnel, right to left",
        html: `<div dir="rtl" class="flex w-full gap-3">
  <div class="flex h-48 flex-col justify-around text-xs"><span>כניסות</span><span>הרשמות</span><span>ניסיון</span><span>משלמים</span></div>
  <div class="sk-funnel-chart h-48 min-w-0 flex-1" data-numbers="1000,600,320,140"></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-heatmap-chart",
    group: "charts",
    name: "Heatmap",
    useFor:
      "Show intensity across a grid, like activity by weekday and hour. data-numbers fills the grid row by row, and a blank value leaves its cell empty.",
    examples: [
      {
        label: "Grid of six columns",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-around text-right text-xs"><span>Mon</span><span>Tue</span><span>Wed</span></div>
  <div class="sk-heatmap-chart h-40 min-w-0 flex-1"></div>
</div>`,
      },
      {
        label: "Calendar, one column per week",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-around text-right text-xs"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
  <div class="sk-heatmap-chart sk-calendar h-40 min-w-0 flex-1" data-numbers="${TWELVE_WEEK_CALENDAR_NUMBERS}"></div>
</div>`,
      },
      {
        label: "Grid with empty cells",
        html: `<div class="flex w-full gap-3">
  <div class="sk-heatmap-chart h-40 min-w-0 flex-1" data-numbers="2,,9,4,,3,8,6,1,3,,10"></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-treemap-chart",
    group: "charts",
    name: "Treemap",
    useFor:
      "Show parts of a whole as nested tiles, where a bigger tile means a bigger share. data-numbers gives one tile per value.",
    examples: [
      {
        label: "Sample tiles",
        html: `<div class="w-full"><div class="sk-treemap-chart h-44"></div></div>`,
      },
      {
        label: "Budget by team",
        html: `<div class="w-full"><div class="sk-treemap-chart h-44" data-numbers="40,25,15,10,10"></div></div>`,
      },
    ],
  },
  {
    className: "sk-waterfall-chart",
    group: "charts",
    name: "Waterfall chart",
    useFor:
      "Show how a starting amount grows or shrinks step by step to an end amount. data-numbers gives the start, then each change; a negative number is a decrease.",
    examples: [
      {
        label: "Start, changes, and total",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_90_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-waterfall-chart h-40" data-numbers="60,30,-20,15,-10"></div>
    <div class="flex justify-between text-xs"><span>Start</span><span>Sales</span><span>Refunds</span><span>Ads</span><span>Fees</span><span>End</span></div>
  </div>
</div>`,
      },
      {
        label: "Right to left, Hebrew labels",
        html: `<div dir="rtl" class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-xs">${SCALE_90_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-waterfall-chart h-40" data-numbers="60,30,-20,15,-10"></div>
    <div class="flex justify-between text-xs"><span>התחלה</span><span>מכירות</span><span>החזרים</span><span>פרסום</span><span>עמלות</span><span>סוף</span></div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-candlestick-chart",
    group: "charts",
    name: "Candlestick chart",
    useFor:
      "Show a price in each period: open, high, low and close. data-numbers gives four values per candle in that order. A green candle closed up, a red one closed down.",
    examples: [
      {
        label: "Four candles",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-candlestick-chart h-40"></div>
    <div class="flex justify-between text-xs"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span></div>
  </div>
</div>`,
      },
      {
        label: "Right to left, Hebrew days",
        html: `<div dir="rtl" class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-xs">${SCALE_40_LABELS_HTML}</div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-candlestick-chart h-40"></div>
    <div class="flex justify-between text-xs"><span>א׳</span><span>ב׳</span><span>ג׳</span><span>ד׳</span></div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-sankey-chart",
    group: "charts",
    name: "Sankey chart",
    useFor:
      "Show where a total flows, like traffic from sources into plans. data-numbers gives the size of each flow, and the ribbons are sized to match.",
    examples: [
      {
        label: "Three flows",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-44 flex-col justify-around text-right text-sm"><span>Search</span><span>Social</span><span>Email</span></div>
  <div class="sk-sankey-chart h-44 min-w-0 flex-1" data-numbers="40,30,20"></div>
  <div class="flex h-44 flex-col justify-around text-sm"><span>Team</span><span>Pro</span><span>Free</span></div>
</div>`,
      },
      {
        label: "Right to left, Hebrew labels",
        html: `<div dir="rtl" class="flex w-full gap-3">
  <div class="flex h-44 flex-col justify-around text-right text-sm"><span>חיפוש</span><span>רשתות</span><span>מייל</span></div>
  <div class="sk-sankey-chart h-44 min-w-0 flex-1" data-numbers="40,30,20"></div>
  <div class="flex h-44 flex-col justify-around text-sm"><span>צוות</span><span>מקצועי</span><span>חינם</span></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-bump-chart",
    group: "charts",
    name: "Bump chart",
    useFor:
      "Show how teams rank across periods. data-numbers gives each team's rank per period, where 1 is the top. data-second-numbers draws a second team's ranks in orange.",
    examples: [
      {
        label: "Ranks over four weeks",
        html: `<div class="flex w-full gap-3">
  <div class="flex h-40 flex-col justify-between text-right text-xs"><span>1</span><span>2</span><span>3</span></div>
  <div class="flex min-w-0 flex-1 flex-col gap-1">
    <div class="sk-bump-chart h-40" data-numbers="1,2,3,2" data-second-numbers="3,1,2,1"></div>
    <div class="flex justify-between text-xs"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
  </div>
</div>`,
      },
    ],
  },
  {
    className: "sk-activity-gauge",
    group: "charts",
    name: "Activity gauge",
    useFor:
      "Show several goals as nested rings that fill clockwise, like move, exercise and stand goals. data-numbers gives each ring's percent, outer ring first.",
    examples: [
      {
        label: "Three rings",
        html: `<div class="flex w-full items-center gap-4">
  <div class="w-40"><div class="sk-activity-gauge"></div></div>
  <ul class="flex flex-col gap-1 text-sm"><li>Move 72%</li><li>Exercise 48%</li><li>Stand 88%</li></ul>
</div>`,
      },
      {
        label: "Custom percents",
        html: `<div class="flex w-full items-center gap-4">
  <div class="w-40"><div class="sk-activity-gauge" data-numbers="90,60,30"></div></div>
  <ul class="flex flex-col gap-1 text-sm"><li>Tasks 90%</li><li>Reviews 60%</li><li>Shipping 30%</li></ul>
</div>`,
      },
    ],
  },
  {
    className: "sk-liquid-gauge",
    group: "charts",
    name: "Liquid gauge",
    useFor:
      "Show one percent as a circle filled with a wavy liquid. data-percent sets the level. With data-status error, the liquid turns red.",
    examples: [
      {
        label: "Sample level, 60 percent",
        html: `<div class="relative w-40">
  <div class="sk-liquid-gauge" data-percent="60"></div>
  <div class="absolute inset-0 grid place-items-center text-lg">60%</div>
</div>`,
      },
      {
        label: "Nearly full, 85 percent",
        html: `<div class="relative w-40">
  <div class="sk-liquid-gauge" data-percent="85"></div>
  <div class="absolute inset-0 grid place-items-center text-lg">85%</div>
</div>`,
      },
      {
        label: "Error",
        html: `<div class="relative w-40">
  <div class="sk-liquid-gauge" data-percent="30" data-status="error"></div>
  <div class="absolute inset-0 grid place-items-center text-lg">30%</div>
</div>`,
      },
    ],
  },
  {
    className: "sk-segment-meter",
    group: "charts",
    name: "Segment meter",
    useFor:
      "Show a level as a row of blocks, like a password strength or a battery. data-count sets how many blocks, and data-percent sets how many are filled.",
    examples: [
      {
        label: "Five blocks at 60 percent",
        html: `<div class="flex w-full flex-col gap-1"><div class="sk-segment-meter h-6"></div><span class="text-xs">Strong password</span></div>`,
      },
      {
        label: "Ten blocks at 30 percent",
        html: `<div class="flex w-full flex-col gap-1"><div class="sk-segment-meter h-6" data-count="10" data-percent="30"></div><span class="text-xs">Weak password</span></div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="flex w-full flex-col gap-1"><div class="sk-segment-meter h-6" data-count="10" data-percent="70"></div><span class="text-xs">סיסמה חזקה</span></div>`,
      },
    ],
  },
  {
    className: "sk-uptime-bars",
    group: "charts",
    name: "Uptime bars",
    useFor:
      "Show the status of each day in a row, like a service's uptime history. data-numbers gives each day's uptime percent. Green is 99.5 or more, orange is 95 or more, red is lower, and a blank day stays empty.",
    examples: [
      {
        label: "Last 14 days",
        html: `<div class="flex w-full flex-col gap-2">
  <div class="sk-uptime-bars h-10"></div>
  <div class="flex justify-between text-xs"><span>14 days ago</span><span>Today</span></div>
</div>`,
      },
      {
        label: "With a day with no data",
        html: `<div class="flex w-full flex-col gap-2">
  <div class="sk-uptime-bars h-10" data-numbers="100,100,99.8,100,97,100,,100,100,100,93,100,100,100"></div>
  <div class="flex justify-between text-xs"><span>Payments API</span><span>99.97% uptime</span></div>
</div>`,
      },
    ],
  },
  {
    className: "sk-sparkline",
    group: "charts",
    name: "Sparkline",
    useFor:
      "A tiny line with no axes, to show a trend next to a number. data-numbers gives the values, and the last point is marked.",
    examples: [
      {
        label: "Beside a number",
        html: `<div class="flex w-full items-center justify-between gap-4 text-sm"><span>Revenue</span><div class="sk-sparkline w-32"></div><span>+12%</span></div>`,
      },
      {
        label: "Downward trend",
        html: `<div class="flex w-full items-center justify-between gap-4 text-sm"><span>Churn</span><div class="sk-sparkline w-32" data-numbers="9,8,9,6,5,5,3,2"></div><span>-4%</span></div>`,
      },
    ],
  },
  {
    className: "sk-progress-meter",
    group: "charts",
    name: "Progress meter",
    useFor:
      "A horizontal scale from 0 to 100 with ticks and a marker, to show how far something has got. data-percent sets the marker. With data-status error, the bar turns red.",
    examples: [
      {
        label: "Sample at 60 percent",
        html: `<div class="flex w-full flex-col gap-1"><div class="sk-progress-meter h-10"></div><div class="flex justify-between text-xs"><span>0</span><span>50</span><span>100</span></div></div>`,
      },
      {
        label: "Upload at 85 percent",
        html: `<div class="flex w-full flex-col gap-1"><div class="sk-progress-meter h-10" data-percent="85"></div><span class="text-xs">Uploading photos, 85%</span></div>`,
      },
      {
        label: "Error",
        html: `<div class="flex w-full flex-col gap-1"><div class="sk-progress-meter h-10" data-percent="40" data-status="error"></div><span class="text-xs">Upload failed at 40%</span></div>`,
      },
      {
        label: "Right to left",
        html: `<div dir="rtl" class="flex w-full flex-col gap-1"><div class="sk-progress-meter h-10" data-percent="60"></div><span class="text-xs">העלאה, 60%</span></div>`,
      },
    ],
  },
];
