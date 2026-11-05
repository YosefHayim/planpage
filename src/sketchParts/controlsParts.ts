import type { SketchPart } from "../contracts/sketchScene";

const AMOUNT_PAD_KEY_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"];

const createAmountPadHtml = (pressedKeyLabel: string | null, amountText: string): string => {
  const keyHtmlList = AMOUNT_PAD_KEY_LABELS.map((keyLabel) => {
    const isPressed = keyLabel === pressedKeyLabel;
    const statusAttribute = isPressed ? ' data-status="selected"' : "";
    return `<span class="sk-key"${statusAttribute}>${keyLabel}</span>`;
  });
  return `<div class="sk-amount-pad w-64"><span class="sk-amount-display">${amountText}</span>${keyHtmlList.join("")}</div>`;
};

export const CONTROLS_PARTS: readonly SketchPart[] = [
  {
    className: "sk-button",
    group: "controls",
    name: "Button",
    useFor:
      "A main action, an outlined or secondary action, a plain text link, a destructive action, or a button that is disabled, loading or failed.",
    examples: [
      {
        label: "Main",
        html: '<button type="button" class="sk-button sk-main">Save changes</button>',
      },
      { label: "Outline", html: '<button type="button" class="sk-button">Cancel</button>' },
      {
        label: "Secondary",
        html: '<button type="button" class="sk-button sk-secondary">Duplicate</button>',
      },
      {
        label: "Ghost",
        html: '<button type="button" class="sk-button sk-ghost">Skip for now</button>',
      },
      {
        label: "Link",
        html: '<button type="button" class="sk-button sk-link">View terms</button>',
      },
      {
        label: "Destructive",
        html: '<button type="button" class="sk-button sk-danger">Delete account</button>',
      },
      {
        label: "Small",
        html: '<button type="button" class="sk-button sk-main sk-small">Add</button>',
      },
      {
        label: "Large",
        html: '<button type="button" class="sk-button sk-main sk-large">Continue</button>',
      },
      {
        label: "With icon",
        html: '<button type="button" class="sk-button sk-main"><span data-icon="plus"></span>Add task</button>',
      },
      {
        label: "Hover",
        html: '<button type="button" class="sk-button" data-status="hover">Save</button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-button sk-main" data-status="focus">Save changes</button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-button sk-main" data-status="disabled">Save changes</button>',
      },
      {
        label: "Loading",
        html: '<button type="button" class="sk-button sk-main" data-status="loading"><span class="sk-button-spinner"></span>Saving</button>',
      },
      {
        label: "Error",
        html: '<button type="button" class="sk-button" data-status="error">Retry</button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-button sk-main" dir="rtl">שמירת שינויים</button>',
      },
      {
        label: "Long label",
        html: '<button type="button" class="sk-button sk-main">Save changes and continue</button>',
      },
    ],
  },
  {
    className: "sk-icon-button",
    group: "controls",
    name: "Icon button",
    useFor: "A round button that holds only an icon, such as search, close or add.",
    examples: [
      {
        label: "Search",
        html: '<button type="button" class="sk-icon-button" aria-label="Search" data-icon="search"></button>',
      },
      {
        label: "Main",
        html: '<button type="button" class="sk-icon-button sk-main" aria-label="Add" data-icon="plus"></button>',
      },
      {
        label: "Close",
        html: '<button type="button" class="sk-icon-button" aria-label="Close" data-icon="x"></button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-icon-button" aria-label="Notifications" data-icon="bell" data-status="focus"></button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-icon-button" aria-label="Confirm" data-icon="check" data-status="disabled"></button>',
      },
    ],
  },
  {
    className: "sk-button-group",
    group: "controls",
    name: "Button group",
    useFor:
      "Several joined choices in one row where one segment is picked, such as Day, Week or Month.",
    examples: [
      {
        label: "Three segments",
        html: '<div class="sk-button-group"><span>Day</span><span data-status="selected">Week</span><span>Month</span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-button-group" data-status="disabled"><span>List</span><span>Grid</span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-button-group" dir="rtl"><span>יום</span><span data-status="selected">שבוע</span><span>חודש</span></div>',
      },
    ],
  },
  {
    className: "sk-fab",
    group: "controls",
    name: "Floating action button",
    useFor:
      "The one main action that floats over a screen, either a round icon or an extended label with an icon.",
    examples: [
      {
        label: "Icon",
        html: '<button type="button" class="sk-fab" aria-label="New note" data-icon="plus"></button>',
      },
      {
        label: "Extended",
        html: '<button type="button" class="sk-fab sk-extended"><span data-icon="plus"></span>New note</button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-fab" aria-label="New note" data-icon="plus" data-status="focus"></button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-fab" aria-label="New note" data-icon="plus" data-status="disabled"></button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-fab sk-extended" dir="rtl"><span data-icon="plus"></span>הערה חדשה</button>',
      },
    ],
  },
  {
    className: "sk-hold-button",
    group: "controls",
    name: "Hold button",
    useFor:
      "A button that runs only after the person holds it down, such as delete, with a fill that shows how far the hold has got.",
    examples: [
      {
        label: "Not held",
        html: '<button type="button" class="sk-hold-button">Hold to delete</button>',
      },
      {
        label: "Half held",
        html: '<button type="button" class="sk-hold-button" data-percent="55">Hold to delete</button>',
      },
      {
        label: "Almost done",
        html: '<button type="button" class="sk-hold-button" data-percent="90">Keep holding</button>',
      },
      {
        label: "Done",
        html: '<button type="button" class="sk-hold-button" data-percent="100">Deleted</button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-hold-button" data-status="focus">Hold to delete</button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-hold-button" data-status="disabled">Hold to delete</button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-hold-button" dir="rtl" data-percent="60">החזיקו למחיקה</button>',
      },
    ],
  },
  {
    className: "sk-progress-button",
    group: "controls",
    name: "Progress button",
    useFor: "A button that shows a task running: a fill that grows, then a success or a failure.",
    examples: [
      { label: "Idle", html: '<button type="button" class="sk-progress-button">Upload</button>' },
      {
        label: "Uploading",
        html: '<button type="button" class="sk-progress-button" data-percent="40">Uploading</button>',
      },
      {
        label: "Success",
        html: '<button type="button" class="sk-progress-button" data-status="success">Uploaded</button>',
      },
      {
        label: "Error",
        html: '<button type="button" class="sk-progress-button" data-status="error">Upload failed</button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-progress-button" data-status="focus">Upload</button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-progress-button" data-status="disabled">Upload</button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-progress-button" dir="rtl" data-percent="70">מעלה קובץ</button>',
      },
    ],
  },
  {
    className: "sk-social-button",
    group: "controls",
    name: "Social button",
    useFor:
      "A sign-in button for one provider, with the provider mark, filled or outlined, or as a round icon only.",
    examples: [
      {
        label: "Outline",
        html: '<button type="button" class="sk-social-button"><span class="sk-social-mark">G</span>Continue with Google</button>',
      },
      {
        label: "Filled",
        html: '<button type="button" class="sk-social-button" data-fill="grey"><span class="sk-social-mark">A</span>Continue with Apple</button>',
      },
      {
        label: "Icon only",
        html: '<button type="button" class="sk-social-button sk-icon-only" aria-label="Continue with Facebook"><span class="sk-social-mark">f</span></button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-social-button" data-status="disabled"><span class="sk-social-mark">G</span>Continue with Google</button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-social-button" dir="rtl"><span class="sk-social-mark">G</span>המשך עם Google</button>',
      },
    ],
  },
  {
    className: "sk-app-store-button",
    group: "controls",
    name: "App store button",
    useFor: "The download badge that links to the App Store or Google Play.",
    examples: [
      {
        label: "App Store",
        html: '<button type="button" class="sk-app-store-button"><span>Download on the</span><strong>App Store</strong></button>',
      },
      {
        label: "Google Play",
        html: '<button type="button" class="sk-app-store-button" data-fill="grey"><span>Get it on</span><strong>Google Play</strong></button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-app-store-button" data-status="disabled"><span>Download on the</span><strong>App Store</strong></button>',
      },
    ],
  },
  {
    className: "sk-undo-button",
    group: "controls",
    name: "Undo button",
    useFor:
      "A button that stays for a few seconds after an action, with a ring that runs down until the action is final.",
    examples: [
      {
        label: "Counting down",
        html: '<button type="button" class="sk-undo-button" data-percent="70">Undo send</button>',
      },
      {
        label: "Almost gone",
        html: '<button type="button" class="sk-undo-button" data-percent="15">Undo</button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-undo-button" data-percent="50" data-status="focus">Undo</button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-undo-button" data-percent="50" data-status="disabled">Undo</button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-undo-button" dir="rtl" data-percent="60">ביטול</button>',
      },
    ],
  },
  {
    className: "sk-shutter-button",
    group: "controls",
    name: "Shutter button",
    useFor: "The big round button that takes a photo or starts a recording.",
    examples: [
      {
        label: "Ready",
        html: '<button type="button" class="sk-shutter-button" aria-label="Take photo"></button>',
      },
      {
        label: "Busy",
        html: '<button type="button" class="sk-shutter-button" aria-label="Saving photo" data-status="loading"></button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-shutter-button" aria-label="Take photo" data-status="focus"></button>',
      },
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
  {
    className: "sk-input",
    group: "controls",
    name: "Input",
    useFor:
      "One line of text with a label above it, a placeholder, a hint under it, or an error message when the value is wrong.",
    examples: [
      {
        label: "Label and placeholder",
        html: '<div class="flex w-72 flex-col gap-1"><span class="text-sm">Email</span><div class="sk-input"><span class="text-gray-500">you@example.com</span></div></div>',
      },
      {
        label: "Hint",
        html: '<div class="flex w-72 flex-col gap-1"><span class="text-sm">Password</span><div class="sk-input"><span>••••••••</span></div><span class="text-xs">At least 8 characters</span></div>',
      },
      {
        label: "Error",
        html: '<div class="flex w-72 flex-col gap-1"><span class="text-sm">Email</span><div class="sk-input" data-status="error"><span>maya@exmple</span></div><span class="text-xs">Check the email address</span></div>',
      },
      {
        label: "Focus",
        html: '<div class="sk-input w-72" data-status="focus"><span>Maya Cohen</span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-input w-72" data-status="disabled"><span class="text-gray-500">Order number locked</span></div>',
      },
      {
        label: "With icon",
        html: '<div class="sk-input w-72"><span data-icon="search"></span><span class="text-gray-500">Search orders</span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-input w-72" dir="rtl"><span>שם מלא</span></div>',
      },
    ],
  },
  {
    className: "sk-textarea",
    group: "controls",
    name: "Text area",
    useFor: "Several lines of text, such as a message, a note or a description.",
    examples: [
      {
        label: "Filled",
        html: '<div class="sk-textarea w-72">Thanks for the quick reply. I will check the order today.</div>',
      },
      {
        label: "Empty with placeholder",
        html: '<div class="sk-textarea w-72"><span class="text-gray-500">Write a short note</span></div>',
      },
      {
        label: "Focus",
        html: '<div class="sk-textarea w-72" data-status="focus">Add a delivery note</div>',
      },
      {
        label: "Error",
        html: '<div class="sk-textarea w-72" data-status="error">Too short</div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-textarea w-72" data-status="disabled">This note is read only</div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-textarea w-72" dir="rtl">תודה על התשובה המהירה. אבדוק את ההזמנה היום.</div>',
      },
    ],
  },
  {
    className: "sk-number-input",
    group: "controls",
    name: "Number input",
    useFor:
      "A number with minus and plus buttons on each side, such as a quantity or a guest count.",
    examples: [
      {
        label: "Quantity",
        html: '<div class="sk-number-input w-40"><span>−</span><span>2</span><span>+</span></div>',
      },
      {
        label: "Focus",
        html: '<div class="sk-number-input w-40" data-status="focus"><span>−</span><span>5</span><span>+</span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-number-input w-40" data-status="disabled"><span>−</span><span>1</span><span>+</span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-number-input w-40" dir="rtl"><span>−</span><span>3</span><span>+</span></div>',
      },
    ],
  },
  {
    className: "sk-amount-pad",
    group: "controls",
    name: "Amount pad",
    useFor:
      "A keypad that types a money amount, with the amount shown on top, such as a payment or a transfer.",
    examples: [
      { label: "Ready", html: createAmountPadHtml(null, "$24.50") },
      { label: "Key pressed", html: createAmountPadHtml("5", "$245") },
    ],
  },
  {
    className: "sk-verification-code-input",
    group: "controls",
    name: "Verification code input",
    useFor:
      "A row of single boxes for a one-time code that the person types, one digit in each box.",
    examples: [
      {
        label: "Empty",
        html: '<div class="sk-verification-code-input w-80" data-status="focus"><span></span><span></span><span></span><span></span><span></span><span></span></div>',
      },
      {
        label: "Typing",
        html: '<div class="sk-verification-code-input w-80" data-status="focus"><span>4</span><span>8</span><span>2</span><span></span><span></span><span></span></div>',
      },
      {
        label: "Complete",
        html: '<div class="sk-verification-code-input w-80"><span>4</span><span>8</span><span>2</span><span>9</span><span>1</span><span>7</span></div>',
      },
      {
        label: "Four digits",
        html: '<div class="sk-verification-code-input w-56"><span>5</span><span>0</span><span>3</span><span>6</span></div>',
      },
      {
        label: "Error",
        html: '<div class="sk-verification-code-input w-80" data-status="error"><span>4</span><span>8</span><span>2</span><span>9</span><span>1</span><span>0</span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-verification-code-input w-80" data-status="disabled"><span>4</span><span>8</span><span>2</span><span>9</span><span>1</span><span>7</span></div>',
      },
    ],
  },
  {
    className: "sk-prompt-input",
    group: "controls",
    name: "Prompt input",
    useFor:
      "A chat box for typing a message to an AI assistant, with an attach button and a send button.",
    examples: [
      {
        label: "Ready",
        html: '<div class="sk-prompt-input w-80"><span class="text-gray-500">Ask about these orders</span><div class="sk-prompt-tools"><span data-icon="paperclip"></span><span class="sk-prompt-send"><span data-icon="arrow-up"></span></span></div></div>',
      },
      {
        label: "Focus",
        html: '<div class="sk-prompt-input w-80" data-status="focus"><span>Which orders are late this week?</span><div class="sk-prompt-tools"><span data-icon="paperclip"></span><span class="sk-prompt-send"><span data-icon="arrow-up"></span></span></div></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-prompt-input w-80" data-status="disabled"><span class="text-gray-500">Ask about these orders</span><div class="sk-prompt-tools"><span data-icon="paperclip"></span><span class="sk-prompt-send"><span data-icon="arrow-up"></span></span></div></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-prompt-input w-80" dir="rtl"><span class="text-gray-500">שאלו על ההזמנות</span><div class="sk-prompt-tools"><span data-icon="paperclip"></span><span class="sk-prompt-send"><span data-icon="arrow-up"></span></span></div></div>',
      },
    ],
  },
  {
    className: "sk-tag-input",
    group: "controls",
    name: "Tag input",
    useFor:
      "A box that holds tags as small chips, each with an x to remove it, and a place to type the next tag.",
    examples: [
      {
        label: "Tags",
        html: '<div class="sk-tag-input w-80"><span class="sk-tag-input-chip">Urgent<span data-icon="x"></span></span><span class="sk-tag-input-chip">Billing<span data-icon="x"></span></span><span class="text-gray-500">Add a tag</span></div>',
      },
      {
        label: "Focus",
        html: '<div class="sk-tag-input w-80" data-status="focus"><span class="sk-tag-input-chip">Urgent<span data-icon="x"></span></span><span>Refund</span></div>',
      },
      {
        label: "Error",
        html: '<div class="sk-tag-input w-80" data-status="error"><span class="sk-tag-input-chip">Urgent<span data-icon="x"></span></span><span class="text-gray-500">Tag already exists</span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-tag-input w-80" data-status="disabled"><span class="sk-tag-input-chip">Urgent<span data-icon="x"></span></span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-tag-input w-80" dir="rtl"><span class="sk-tag-input-chip">דחוף<span data-icon="x"></span></span><span class="sk-tag-input-chip">חשבונית<span data-icon="x"></span></span></div>',
      },
    ],
  },
  {
    className: "sk-select",
    group: "controls",
    name: "Select",
    useFor: "A field that opens a list of fixed choices, such as a fruit, a country or a plan.",
    examples: [
      {
        label: "Placeholder",
        html: '<div class="sk-select w-72"><span class="text-gray-500">Choose a fruit</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Chosen",
        html: '<div class="sk-select w-72"><span>Apple</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Open",
        html: '<div class="flex w-72 flex-col gap-2"><div class="sk-select"><span>Banana</span><span data-icon="chevron-up"></span></div><div class="sk-select-list"><span class="sk-select-row">Apple</span><span class="sk-select-row" data-status="selected">Banana<span data-icon="check"></span></span><span class="sk-select-row">Cherry</span></div></div>',
      },
      {
        label: "Error",
        html: '<div class="sk-select w-72" data-status="error"><span class="text-gray-500">Required</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-select w-72" data-status="disabled"><span>Banana</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-select w-72" dir="rtl"><span>תפוח</span><span data-icon="chevron-down"></span></div>',
      },
    ],
  },
  {
    className: "sk-combobox",
    group: "controls",
    name: "Combobox",
    useFor: "A field where the person types to search a long list and picks one match.",
    examples: [
      {
        label: "Empty",
        html: '<div class="sk-combobox w-72"><span class="text-gray-500">Pick a framework</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Typed",
        html: '<div class="sk-combobox w-72"><span>Re</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Open",
        html: '<div class="flex w-72 flex-col gap-2"><div class="sk-combobox"><span>Re</span><span data-icon="chevron-up"></span></div><div class="sk-select-list"><span class="sk-select-row" data-status="selected">React<span data-icon="check"></span></span><span class="sk-select-row">Remix</span></div></div>',
      },
      {
        label: "Invalid",
        html: '<div class="sk-combobox w-72" data-status="error"><span class="text-gray-500">Pick a framework</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-combobox w-72" data-status="disabled"><span>Remix</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-combobox w-72" dir="rtl"><span>ריאקט</span><span data-icon="chevron-down"></span></div>',
      },
    ],
  },
  {
    className: "sk-multi-select",
    group: "controls",
    name: "Multi-select",
    useFor:
      "A field that picks several values, shown as chips, such as team members or departments.",
    examples: [
      {
        label: "Small",
        html: '<div class="sk-multi-select sk-small w-80"><span class="sk-tag-input-chip">Design<span data-icon="x"></span></span><span class="sk-tag-input-chip">Ops<span data-icon="x"></span></span><span class="sk-tag-input-chip">+2</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Medium",
        html: '<div class="sk-multi-select w-80"><span class="sk-tag-input-chip">Design<span data-icon="x"></span></span><span class="sk-tag-input-chip">Ops<span data-icon="x"></span></span><span class="sk-tag-input-chip">+2</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Large",
        html: '<div class="sk-multi-select sk-large w-80"><span class="sk-tag-input-chip">Design<span data-icon="x"></span></span><span class="sk-tag-input-chip">Ops<span data-icon="x"></span></span><span class="sk-tag-input-chip">+2</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Placeholder",
        html: '<div class="sk-multi-select w-80"><span class="text-gray-500">Select teams</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Invalid",
        html: '<div class="sk-multi-select w-80" data-status="error"><span class="text-gray-500">Select at least one team</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Disabled",
        html: '<div class="sk-multi-select w-80" data-status="disabled"><span class="sk-tag-input-chip">Design</span><span data-icon="chevron-down"></span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-multi-select w-80" dir="rtl"><span class="sk-tag-input-chip">עיצוב<span data-icon="x"></span></span><span data-icon="chevron-down"></span></div>',
      },
    ],
  },
  {
    className: "sk-radio",
    group: "controls",
    name: "Radio",
    useFor: "One choice out of a group, shown as a round dot that is filled when picked.",
    examples: [
      { label: "Unchecked", html: '<span class="sk-radio"></span>' },
      { label: "Checked", html: '<span class="sk-radio" data-checked></span>' },
      { label: "Focus", html: '<span class="sk-radio" data-status="focus"></span>' },
      { label: "Disabled", html: '<span class="sk-radio" data-status="disabled"></span>' },
      {
        label: "Disabled and checked",
        html: '<span class="sk-radio" data-status="disabled" data-checked></span>',
      },
    ],
  },
  {
    className: "sk-radio-group",
    group: "controls",
    name: "Radio group",
    useFor:
      "A list of radio choices where only one can be picked, such as a plan or a delivery time.",
    examples: [
      {
        label: "Three choices",
        html: '<div class="sk-radio-group"><div><span class="sk-radio" data-checked></span><span>Monthly</span></div><div><span class="sk-radio"></span><span>Yearly</span></div><div><span class="sk-radio"></span><span>Lifetime</span></div></div>',
      },
      {
        label: "Disabled choice",
        html: '<div class="sk-radio-group"><div><span class="sk-radio" data-checked></span><span>Standard shipping</span></div><div><span class="sk-radio" data-status="disabled"></span><span>Same day, sold out</span></div></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-radio-group" dir="rtl"><div><span class="sk-radio" data-checked></span><span>חודשי</span></div><div><span class="sk-radio"></span><span>שנתי</span></div></div>',
      },
    ],
  },
  {
    className: "sk-switch",
    group: "controls",
    name: "Switch",
    useFor: "A switch that turns one setting on or off, such as notifications.",
    examples: [
      { label: "Off", html: '<span class="sk-switch"></span>' },
      { label: "On", html: '<span class="sk-switch" data-checked></span>' },
      { label: "Focus", html: '<span class="sk-switch" data-status="focus"></span>' },
      {
        label: "Disabled",
        html: '<span class="sk-switch" data-status="disabled" data-checked></span>',
      },
      { label: "Hebrew", html: '<span class="sk-switch" dir="rtl" data-checked></span>' },
    ],
  },
  {
    className: "sk-toggle",
    group: "controls",
    name: "Toggle",
    useFor: "A button that stays pressed when it is on, such as bold or pin.",
    examples: [
      { label: "Off", html: '<button type="button" class="sk-toggle">Bold</button>' },
      {
        label: "Pressed",
        html: '<button type="button" class="sk-toggle" data-status="selected">Bold</button>',
      },
      {
        label: "With icon",
        html: '<button type="button" class="sk-toggle" data-status="selected" aria-label="Pin"><span data-icon="bell"></span></button>',
      },
      {
        label: "Focus",
        html: '<button type="button" class="sk-toggle" data-status="focus">Italic</button>',
      },
      {
        label: "Disabled",
        html: '<button type="button" class="sk-toggle" data-status="disabled">Italic</button>',
      },
      {
        label: "Hebrew",
        html: '<button type="button" class="sk-toggle" dir="rtl" data-status="selected">מודגש</button>',
      },
    ],
  },
  {
    className: "sk-toggle-group",
    group: "controls",
    name: "Toggle group",
    useFor: "A row of toggles where several can be on at once, such as text styles or filters.",
    examples: [
      {
        label: "Several on",
        html: '<div class="sk-toggle-group"><span class="sk-toggle" data-status="selected">Bold</span><span class="sk-toggle">Italic</span><span class="sk-toggle" data-status="selected">Underline</span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-toggle-group" dir="rtl"><span class="sk-toggle" data-status="selected">מודגש</span><span class="sk-toggle">נטוי</span></div>',
      },
    ],
  },
  {
    className: "sk-slider",
    group: "controls",
    name: "Slider",
    useFor: "Pick one value on a line, such as volume or a price cap.",
    examples: [
      { label: "Middle", html: '<div class="sk-slider" data-percent="40"></div>' },
      {
        label: "Disabled",
        html: '<div class="sk-slider" data-percent="40" data-status="disabled"></div>',
      },
      { label: "Hebrew", html: '<div class="sk-slider" dir="rtl" data-percent="70"></div>' },
    ],
  },
  {
    className: "sk-range-slider",
    group: "controls",
    name: "Range slider",
    useFor: "Pick a low and a high value on one line, such as a price range.",
    examples: [
      {
        label: "Range",
        html: '<div class="sk-range-slider" data-percent="20" data-percent-end="70"></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-range-slider" dir="rtl" data-percent="30" data-percent-end="80"></div>',
      },
    ],
  },
  {
    className: "sk-rating-stars",
    group: "controls",
    name: "Rating stars",
    useFor: "Show or pick a score out of five stars.",
    examples: [
      {
        label: "Three of five",
        html: '<div class="sk-rating-stars" data-count="3"><span class="sk-rating-star"></span><span class="sk-rating-star"></span><span class="sk-rating-star"></span><span class="sk-rating-star"></span><span class="sk-rating-star"></span></div>',
      },
    ],
  },
  {
    className: "sk-color-swatch",
    group: "controls",
    name: "Color swatch",
    useFor: "A round color choice, shown alone or in a row of colors.",
    examples: [
      { label: "Red", html: '<span class="sk-color-swatch" data-fill="red"></span>' },
      {
        label: "Selected",
        html: '<span class="sk-color-swatch" data-fill="blue" data-status="selected"></span>',
      },
      {
        label: "Focus",
        html: '<span class="sk-color-swatch" data-fill="green" data-status="focus"></span>',
      },
    ],
  },
  {
    className: "sk-color-picker",
    group: "controls",
    name: "Color picker",
    useFor: "Pick any color with a color area, a hue bar and a hex code.",
    examples: [
      {
        label: "Default",
        html: '<div class="sk-color-picker"><div class="sk-color-area"></div><div class="sk-color-hue"></div><div class="sk-color-hex"></div></div>',
      },
    ],
  },
  {
    className: "sk-date-field",
    group: "controls",
    name: "Date field",
    useFor: "Show or pick a date, with a calendar icon.",
    examples: [
      {
        label: "Filled",
        html: '<div class="sk-date-field"><span data-icon="calendar-days"></span><span>12 Mar 2026</span></div>',
      },
      {
        label: "Empty",
        html: '<div class="sk-date-field"><span data-icon="calendar-days"></span><span>Pick a date</span></div>',
      },
    ],
  },
  {
    className: "sk-time-picker",
    group: "controls",
    name: "Time picker",
    useFor: "Show or pick a time of day, with a clock icon.",
    examples: [
      {
        label: "Filled",
        html: '<div class="sk-time-picker"><span data-icon="alarm-clock"></span><span>09:30</span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-time-picker" dir="rtl"><span data-icon="alarm-clock"></span><span>09:30</span></div>',
      },
    ],
  },
  {
    className: "sk-wheel-picker",
    group: "controls",
    name: "Wheel picker",
    useFor: "Scroll through a short list and keep one item in the middle.",
    examples: [
      {
        label: "Three rows",
        html: '<div class="sk-wheel-picker"><span class="sk-wheel-row">Mon</span><span class="sk-wheel-row" data-status="selected">Tue</span><span class="sk-wheel-row">Wed</span></div>',
      },
    ],
  },
  {
    className: "sk-search-bar",
    group: "controls",
    name: "Search bar",
    useFor: "A field to type a search, with a search icon.",
    examples: [
      {
        label: "Empty",
        html: '<div class="sk-search-bar"><span data-icon="search"></span><span>Search</span></div>',
      },
      {
        label: "Hebrew",
        html: '<div class="sk-search-bar" dir="rtl"><span data-icon="search"></span><span>חיפוש</span></div>',
      },
    ],
  },
  {
    className: "sk-filter-bar",
    group: "controls",
    name: "Filter bar",
    useFor: "A row of filter chips, where one or more chips can be on.",
    examples: [
      {
        label: "Chips",
        html: '<div class="sk-filter-bar"><span data-icon="funnel"></span><span class="sk-filter-chip" data-status="selected">Paid</span><span class="sk-filter-chip">Overdue</span></div>',
      },
    ],
  },
  {
    className: "sk-drop-zone",
    group: "controls",
    name: "Drop zone",
    useFor: "An area where a user drops or picks files to upload.",
    examples: [
      {
        label: "Idle",
        html: '<div class="sk-drop-zone"><span data-icon="upload-cloud"></span><span>Drop files here</span></div>',
      },
      {
        label: "Hover",
        html: '<div class="sk-drop-zone" data-status="hover"><span data-icon="upload-cloud"></span><span>Drop files here</span></div>',
      },
    ],
  },
  {
    className: "sk-file-upload-item",
    group: "controls",
    name: "File upload item",
    useFor: "One file in an upload list, with its name and progress.",
    examples: [
      {
        label: "Uploading",
        html: '<div class="sk-file-upload-item"><span data-icon="file-text"></span><span>invoice.pdf</span><span class="sk-file-progress" data-percent="60"></span></div>',
      },
    ],
  },
  {
    className: "sk-signature-pad",
    group: "controls",
    name: "Signature pad",
    useFor: "A box where a user signs with a finger or a mouse.",
    examples: [{ label: "Signed", html: '<div class="sk-signature-pad"></div>' }],
  },
  {
    className: "sk-slide-to-confirm",
    group: "controls",
    name: "Slide to confirm",
    useFor: "A long action that needs a deliberate slide, such as a payment or a delete.",
    examples: [
      {
        label: "Idle",
        html: '<div class="sk-slide-to-confirm"><span class="sk-slide-knob"><span data-icon="arrow-right"></span></span><span>Slide to confirm</span></div>',
      },
    ],
  },
];
