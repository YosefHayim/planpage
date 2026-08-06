// Pure logic for the auto-captured gallery. The directory read + report live at the CLI edge
// (src/cli/capture.ts); the drift guard is src/gallery/registry.test.ts. No I/O here.

/** Infra components that are page scaffolding, not showcase items. */
export const DENY: ReadonlyArray<string> = ["Shell", "SubmitBar", "FeedbackSidebar"];

/** Component file names → the component names that belong in the gallery (drops tests + infra). */
export const componentNames = (files: ReadonlyArray<string>): ReadonlyArray<string> =>
  files
    .filter((file) => file.endsWith(".tsx") && !file.endsWith(".test.tsx"))
    .map((file) => file.slice(0, -".tsx".length))
    .filter((name) => !DENY.includes(name));

export interface RegistryDiff {
  /** On disk but not registered — someone added a component and forgot the gallery. */
  readonly missing: ReadonlyArray<string>;
  /** Registered but no longer on disk — a stale entry. */
  readonly extra: ReadonlyArray<string>;
}

/** Compare what's on disk against what's registered. Empty both ways == in sync. */
export const diffRegistry = (
  onDisk: ReadonlyArray<string>,
  registered: ReadonlyArray<string>,
): RegistryDiff => ({
  missing: onDisk.filter((name) => !registered.includes(name)),
  extra: registered.filter((name) => !onDisk.includes(name)),
});
