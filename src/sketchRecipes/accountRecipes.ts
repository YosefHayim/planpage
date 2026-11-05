import type { SketchNote, SketchRecipe, SketchScene } from "../contracts/sketchScene";

type TextDirection = "ltr" | "rtl";

type FieldStatus = "focus" | "error" | "disabled";

interface LabeledInput {
  readonly label: string;
  readonly value: string;
  readonly inputPart: string;
  readonly status?: FieldStatus;
  readonly hint?: string;
}

interface BrowserPage {
  readonly tabTitle: string;
  readonly addressText: string;
  readonly contentHtml: string;
}

interface ScreenNote {
  readonly top: number;
  readonly part: string;
  readonly words: string;
}

const LEFT_TO_RIGHT: TextDirection = "ltr";
const RIGHT_TO_LEFT: TextDirection = "rtl";
const SCREEN_NODE_ID = "screen";
const SCENE_WIDTH = 1000;
const FRAME_LEFT = 40;
const FRAME_TOP = 25;
const PHONE_WIDTH = 340;
const PHONE_HEIGHT = 600;
const PHONE_SCENE_HEIGHT = 650;
const BROWSER_WIDTH = 600;
const BROWSER_HEIGHT = 520;
const BROWSER_SCENE_HEIGHT = 580;
const PHONE_NOTE_LEFT = 440;
const PHONE_NOTE_WIDTH = 500;
const BROWSER_NOTE_LEFT = 680;
const BROWSER_NOTE_WIDTH = 280;

const createLabeledInputHtml = (labeledInput: LabeledInput): string => {
  const isStatusSet = labeledInput.status != null;
  const statusAttribute = isStatusSet ? ` data-status="${labeledInput.status}"` : "";
  const isHintSet = labeledInput.hint != null;
  const hintHtml = isHintSet ? `<span class="text-xs">${labeledInput.hint}</span>` : "";

  return `<div class="flex w-full flex-col gap-1">
    <span class="text-sm">${labeledInput.label}</span>
    <div class="sk-input" data-part="${labeledInput.inputPart}"${statusAttribute}><span>${labeledInput.value}</span></div>
    ${hintHtml}
  </div>`;
};

const createPhoneHtml = (
  screenHtml: string,
  direction: TextDirection,
): string => `<div class="sk-phone h-full" dir="${direction}">
  <div class="sk-phone-notch"></div>
  <div class="sk-phone-status"><span>9:41</span><span>5G 88%</span></div>
  <div class="sk-phone-screen space-y-3">${screenHtml}</div>
  <div class="sk-phone-home"></div>
</div>`;

const createBrowserHtml = (
  page: BrowserPage,
  direction: TextDirection,
): string => `<div class="sk-browser-window h-full" dir="${direction}">
  <div class="sk-browser-tabs flex gap-2 px-3 pt-3"><span class="sk-browser-tab" data-status="selected">${page.tabTitle}</span><span class="sk-browser-tab">+</span></div>
  <div class="sk-browser-url">${page.addressText}</div>
  <div class="space-y-3 p-4">${page.contentHtml}</div>
</div>`;

const createSceneNotes = (
  notes: readonly ScreenNote[],
  left: number,
  width: number,
): readonly SketchNote[] =>
  notes.map((note) => ({
    x: left,
    y: note.top,
    w: width,
    words: note.words,
    link: `${SCREEN_NODE_ID}#${note.part}`,
  }));

const createPhoneScene = (screenHtml: string, notes: readonly ScreenNote[]): SketchScene => ({
  width: SCENE_WIDTH,
  height: PHONE_SCENE_HEIGHT,
  nodes: [
    {
      id: SCREEN_NODE_ID,
      kind: "screen",
      x: FRAME_LEFT,
      y: FRAME_TOP,
      w: PHONE_WIDTH,
      h: PHONE_HEIGHT,
      html: screenHtml,
    },
  ],
  notes: createSceneNotes(notes, PHONE_NOTE_LEFT, PHONE_NOTE_WIDTH),
  look: { notePlacement: "beside" },
});

const createBrowserScene = (screenHtml: string, notes: readonly ScreenNote[]): SketchScene => ({
  width: SCENE_WIDTH,
  height: BROWSER_SCENE_HEIGHT,
  nodes: [
    {
      id: SCREEN_NODE_ID,
      kind: "screen",
      x: FRAME_LEFT,
      y: FRAME_TOP,
      w: BROWSER_WIDTH,
      h: BROWSER_HEIGHT,
      html: screenHtml,
    },
  ],
  notes: createSceneNotes(notes, BROWSER_NOTE_LEFT, BROWSER_NOTE_WIDTH),
  look: { notePlacement: "beside" },
});

const loginEmailFieldHtml = createLabeledInputHtml({
  label: "אימייל",
  value: "maya@example.com",
  inputPart: "email-input",
  status: "focus",
});
const loginPasswordFieldHtml = createLabeledInputHtml({
  label: "סיסמה",
  value: "••••••",
  inputPart: "password-input",
  status: "error",
  hint: "הסיסמה לא נכונה, נסו שוב",
});
const loginScreenHtml = createPhoneHtml(
  `<p class="text-lg">כניסה</p>
  ${loginEmailFieldHtml}
  ${loginPasswordFieldHtml}
  <button type="button" class="sk-button sk-main w-full" data-part="log-in-button">כניסה</button>
  <p><a class="sk-link" href="#" data-part="forgot-password-link">שכחתי סיסמה</a></p>
  <div class="sk-separator"></div>
  <button type="button" class="sk-social-button" data-part="provider-a-button"><span class="sk-social-mark">א</span>המשך עם ספק א</button>
  <button type="button" class="sk-social-button" data-fill="grey" data-part="provider-b-button"><span class="sk-social-mark">ב</span>המשך עם ספק ב</button>`,
  RIGHT_TO_LEFT,
);
const loginNotes: readonly ScreenNote[] = [
  {
    top: 120,
    part: "password-input",
    words: "השדה מסומן באדום כשהסיסמה שגויה, והשגיאה מופיעה מתחתיו.",
  },
  { top: 300, part: "log-in-button", words: "כניסה היא הפעולה הראשית, והמשך עם ספק נמצא מתחתיה." },
  { top: 420, part: "provider-a-button", words: "כל ספק מקבל כפתור אחד, עם הסימן שלו." },
  {
    top: 520,
    part: "forgot-password-link",
    words: "שכחתי סיסמה הוא קישור ולא כפתור, כדי שלא יתחרה בכניסה.",
  },
];

const signupEmailFieldHtml = createLabeledInputHtml({
  label: "Email",
  value: "maya@exmple",
  inputPart: "email-input",
  status: "error",
  hint: "Check the email address",
});
const signupPasswordFieldHtml = createLabeledInputHtml({
  label: "Password",
  value: "••••••",
  inputPart: "password-input",
});
const signupScreenHtml = createBrowserHtml(
  {
    tabTitle: "Sign up",
    addressText: "app.example.com/sign-up",
    contentHtml: `<p class="text-lg">Create account</p>
  ${signupEmailFieldHtml}
  ${signupPasswordFieldHtml}
  <div class="flex flex-col gap-1" data-part="password-rules">
    <div class="flex items-center gap-2"><span class="sk-checkbox" data-checked></span><span class="text-sm">8 characters or more</span></div>
    <div class="flex items-center gap-2"><span class="sk-checkbox"></span><span class="text-sm">One number</span></div>
  </div>
  <div class="flex items-center justify-between"><span>I agree to the terms</span><span class="sk-checkbox" data-checked data-part="terms-checkbox"></span></div>
  <button type="button" class="sk-button sk-main" data-part="create-account-button">Create account</button>`,
  },
  LEFT_TO_RIGHT,
);
const signupNotes: readonly ScreenNote[] = [
  { top: 110, part: "email-input", words: "Shows the error under the field, not in a toast." },
  { top: 250, part: "password-rules", words: "Each password rule ticks off as the person types." },
  {
    top: 390,
    part: "terms-checkbox",
    words: "Create account stays off until the terms box is ticked.",
  },
  {
    top: 490,
    part: "create-account-button",
    words: "Create account is the one main action at the bottom of the form.",
  },
];

const forgotEmailFieldHtml = createLabeledInputHtml({
  label: "Email",
  value: "maya@example.com",
  inputPart: "email-input",
  status: "focus",
});
const forgotScreenHtml = createPhoneHtml(
  `<p class="text-lg">Forgot password</p>
  <p class="text-sm">We will email you a reset link.</p>
  ${forgotEmailFieldHtml}
  <button type="button" class="sk-progress-button w-full" data-percent="40" data-part="send-link-button">Sending link</button>
  <div class="sk-alert" data-tone="blue" data-part="spam-hint">Check the spam folder if no email arrives in a minute.</div>
  <p class="text-center"><a class="sk-link" href="#" data-part="back-link">Back to log in</a></p>`,
  LEFT_TO_RIGHT,
);
const forgotNotes: readonly ScreenNote[] = [
  { top: 150, part: "email-input", words: "Asks for the email only. Nothing else on this screen." },
  {
    top: 330,
    part: "send-link-button",
    words: "While the link is sent, the button fills up, then says it is done.",
  },
  {
    top: 470,
    part: "back-link",
    words: "Back to log in is a link under the button, so the person can leave at once.",
  },
];

const verifyCodeScreenHtml = createPhoneHtml(
  `<p class="text-lg">Enter the code</p>
  <p class="text-sm">We sent a 6-digit code to maya@example.com.</p>
  <div class="sk-stepper" data-part="step-dots">
    <div class="sk-stepper-step"><span class="sk-stepper-dot" data-checked></span>Email</div>
    <div class="sk-stepper-step"><span class="sk-stepper-dot" data-status="selected"></span>Code</div>
    <div class="sk-stepper-step"><span class="sk-stepper-dot"></span>Done</div>
  </div>
  <div class="sk-verification-code-input w-full" data-status="error" data-part="code-input"><span>4</span><span>8</span><span>2</span><span>9</span><span>1</span><span>0</span></div>
  <p class="text-sm" data-part="code-error">That code is wrong. Try again.</p>
  <button type="button" class="sk-button sk-main w-full">Verify</button>
  <p class="text-center"><a class="sk-link sk-quiet" href="#" data-status="disabled" data-part="resend-link">Resend in 30 seconds</a></p>`,
  LEFT_TO_RIGHT,
);
const verifyCodeNotes: readonly ScreenNote[] = [
  { top: 130, part: "step-dots", words: "Three steps show where the person is in sign-up." },
  {
    top: 290,
    part: "code-input",
    words: "Six boxes, one digit each. Typing jumps to the next box.",
  },
  {
    top: 400,
    part: "code-error",
    words: "A wrong code shows the error under the boxes, and the digits stay so one can be fixed.",
  },
  {
    top: 530,
    part: "resend-link",
    words: "Resend is locked until the timer ends, so codes are not sent again and again.",
  },
];

const onboardingScreenHtml = createPhoneHtml(
  `<p class="text-sm" data-part="step-progress-label">Step 1 of 3</p>
  <div class="sk-progress-bar" data-percent="33"></div>
  <div class="sk-card h-24 w-full" data-part="step-picture"></div>
  <div class="flex justify-center"><span class="sk-featured-icon" data-icon="sparkles" data-fill="blue" data-part="step-icon"></span></div>
  <p class="text-center text-lg">Check a plant in seconds</p>
  <p class="text-center text-sm">Point the camera at a leaf and see what it needs.</p>
  <div class="flex justify-center gap-2"><span class="sk-dot" data-fill="blue"></span><span class="sk-dot" data-fill="grey"></span><span class="sk-dot" data-fill="grey"></span></div>
  <button type="button" class="sk-button sk-main w-full" data-part="next-button">Next</button>
  <p class="text-center"><a class="sk-link sk-quiet" href="#" data-part="skip-link">Skip for now</a></p>`,
  LEFT_TO_RIGHT,
);
const onboardingNotes: readonly ScreenNote[] = [
  {
    top: 120,
    part: "step-progress-label",
    words: "The bar shows how far through the steps the person is.",
  },
  {
    top: 250,
    part: "step-icon",
    words: "One icon and one short line per step, never a wall of text.",
  },
  { top: 390, part: "next-button", words: "Next is the main action. Skip is a quiet link." },
];

const settingsScreenHtml = createBrowserHtml(
  {
    tabTitle: "Settings",
    addressText: "app.example.com/settings",
    contentHtml: `<div class="flex gap-3">
    <div class="sk-list w-40" data-part="section-list">
      <div class="sk-list-item" data-status="selected">Account</div>
      <div class="sk-list-item">Notifications</div>
      <div class="sk-list-item">Privacy</div>
      <div class="sk-list-item">Billing</div>
    </div>
    <div class="flex-1 space-y-3">
      <div class="flex items-center justify-between"><span>Email updates</span><span class="sk-switch" data-checked data-part="email-switch"></span></div>
      <div class="flex items-center justify-between"><span>Push alerts</span><span class="sk-switch" data-status="focus" data-part="push-switch"></span></div>
      <div class="flex items-center justify-between"><span>Weekly summary</span><span class="sk-switch" data-status="disabled" data-part="weekly-switch"></span></div>
      <p class="text-xs">Weekly summary is part of the Pro plan.</p>
      <div class="sk-card p-3"><p class="text-sm">Pro plan, renews on 1 January</p></div>
      <div class="sk-separator"></div>
      <button type="button" class="sk-button sk-danger" data-part="delete-account-button">Delete account</button>
    </div>
  </div>`,
  },
  LEFT_TO_RIGHT,
);
const settingsNotes: readonly ScreenNote[] = [
  {
    top: 110,
    part: "email-switch",
    words: "A switch saves at once. There is no Save button on this page.",
  },
  {
    top: 230,
    part: "push-switch",
    words: "A focused switch shows a ring, so the person sees where the cursor is.",
  },
  { top: 350, part: "weekly-switch", words: "A locked switch says why, in plain words, under it." },
  {
    top: 470,
    part: "delete-account-button",
    words: "Delete account is red and alone at the bottom, away from the switches.",
  },
];

const profileScreenHtml = createPhoneHtml(
  `<header class="sk-top-bar"><span class="sk-top-bar-start" data-icon="chevron-left"></span><span class="sk-top-bar-title">Profile</span><span class="sk-top-bar-end" data-icon="settings"></span></header>
  <div class="flex flex-col items-center gap-2">
    <span class="sk-avatar sk-large" data-fill="blue" data-part="avatar">MC</span>
    <p class="text-lg">Maya Cohen</p>
    <span class="sk-badge" data-fill="green" data-part="plan-badge">Pro</span>
  </div>
  <button type="button" class="sk-button w-full">Edit profile</button>
  <div class="sk-list">
    <div class="sk-list-item sk-with-chevron">Notifications</div>
    <div class="sk-list-item sk-with-chevron" data-status="selected" data-part="language-row">Language</div>
    <div class="sk-list-item sk-with-chevron">Privacy</div>
  </div>
  <p class="text-center"><a class="sk-link sk-quiet" href="#" data-part="log-out-link">Log out</a></p>`,
  LEFT_TO_RIGHT,
);
const profileNotes: readonly ScreenNote[] = [
  { top: 110, part: "avatar", words: "Initials show when no photo is set." },
  {
    top: 250,
    part: "plan-badge",
    words: "The plan badge sits under the name, so the plan is seen first.",
  },
  {
    top: 390,
    part: "language-row",
    words: "Each row opens one setting, with a chevron on the right.",
  },
  {
    top: 520,
    part: "log-out-link",
    words: "Log out is last and quiet, away from anything that deletes.",
  },
];

const paywallScreenHtml = createPhoneHtml(
  `<header class="sk-top-bar sk-close"><span class="sk-top-bar-title">Choose a plan</span></header>
  <p class="text-center text-sm">Unlock every plant guide.</p>
  <div class="sk-option-card w-full" data-part="monthly-option"><p class="font-bold">Monthly</p><p class="text-sm">$4 each month</p></div>
  <div class="sk-option-card w-full" data-status="selected" data-part="yearly-option"><p class="flex items-center justify-between font-bold">Yearly <span class="sk-badge" data-fill="yellow" data-part="best-value-badge">Best value</span></p><p class="text-sm">Save 25 percent</p></div>
  <div class="flex flex-col gap-2"><p class="sk-feature">Unlimited plant checks</p><p class="sk-feature">Offline guides</p></div>
  <button type="button" class="sk-button sk-main w-full" data-part="start-button">Start for $36 a year</button>
  <p class="text-center"><a class="sk-link sk-quiet" href="#" data-part="restore-link">Restore purchases</a></p>`,
  LEFT_TO_RIGHT,
);
const paywallNotes: readonly ScreenNote[] = [
  {
    top: 130,
    part: "yearly-option",
    words: "The picked plan is marked, and the button below buys that plan.",
  },
  { top: 270, part: "best-value-badge", words: "Only one plan carries the badge." },
  {
    top: 400,
    part: "start-button",
    words: "One main button at the bottom, with the price in its label.",
  },
  {
    top: 520,
    part: "restore-link",
    words: "Restore purchases stays a quiet link, as the stores ask.",
  },
];

export const ACCOUNT_RECIPES: readonly SketchRecipe[] = [
  {
    id: "login-screen",
    group: "account",
    name: "Log in",
    useFor: "a log-in screen with email, password and social sign-in.",
    scene: createPhoneScene(loginScreenHtml, loginNotes),
  },
  {
    id: "signup-screen",
    group: "account",
    name: "Sign up",
    useFor: "a sign-up form with its checks.",
    scene: createBrowserScene(signupScreenHtml, signupNotes),
  },
  {
    id: "forgot-password-screen",
    group: "account",
    name: "Forgot password",
    useFor: "asking for a reset link.",
    scene: createPhoneScene(forgotScreenHtml, forgotNotes),
  },
  {
    id: "verify-code-screen",
    group: "account",
    name: "Verify code",
    useFor: "a one-time code step.",
    scene: createPhoneScene(verifyCodeScreenHtml, verifyCodeNotes),
  },
  {
    id: "onboarding-screen",
    group: "account",
    name: "Onboarding",
    useFor: "first-run steps that teach the app.",
    scene: createPhoneScene(onboardingScreenHtml, onboardingNotes),
  },
  {
    id: "settings-screen",
    group: "account",
    name: "Settings",
    useFor: "account and app settings with switches.",
    scene: createBrowserScene(settingsScreenHtml, settingsNotes),
  },
  {
    id: "profile-screen",
    group: "account",
    name: "Profile",
    useFor: "a user profile with its actions.",
    scene: createPhoneScene(profileScreenHtml, profileNotes),
  },
  {
    id: "paywall-screen",
    group: "account",
    name: "Paywall",
    useFor: "choosing a plan before the app opens.",
    scene: createPhoneScene(paywallScreenHtml, paywallNotes),
  },
];
