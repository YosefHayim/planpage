import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { componentNames, diffRegistry } from "../gallery/capture";
import { GALLERY } from "../gallery/registry";

export interface CaptureCommandOptions {
  /** Exit non-zero on drift, for CI. */
  readonly check?: boolean;
}

/**
 * `planpage capture` — report components in src/components that are missing from the gallery
 * registry (and stale entries that are registered but gone). A dev tool: run from a checkout
 * (needs `src/components/`). The gallery-sync test is the enforced guarantee; this is the fast
 * local check. Resolve from `process.cwd()` so the bundled CLI under `dist/` still works.
 */
export const captureCommand = (options: CaptureCommandOptions): void => {
  const componentsDir = join(process.cwd(), "src", "components");
  if (!existsSync(componentsDir)) {
    throw new Error(
      "planpage capture: run from a planpage checkout (needs src/components/). The gallery-sync test covers CI.",
    );
  }
  const onDisk = componentNames(readdirSync(componentsDir));
  const diff = diffRegistry(onDisk, Object.keys(GALLERY));

  if (diff.missing.length === 0 && diff.extra.length === 0) {
    process.stdout.write("planpage: gallery is in sync ✓\n");
    return;
  }
  for (const name of diff.missing) {
    process.stdout.write(stub(name));
  }
  if (diff.extra.length > 0) {
    process.stdout.write(`planpage: registered but not on disk: ${diff.extra.join(", ")}\n`);
  }
  if (options.check) {
    process.exit(2);
  }
};

function stub(name: string): string {
  return `# add to src/gallery/registry.tsx (fill blurb/usage/props):
  ${name}: {
    category: "TODO",
    blurb: "TODO",
    usage: "<${name} … />",
    props: [],
    sample: () => <${name} />,
  },
`;
}
