import { CodeBlock } from "../../components/CodeBlock";
import { GALLERY, type GalleryName, type PropDoc, TEMPLATE_INDEX } from "../../gallery/registry";

/** Category display order for the rail + sections (an unknown category falls to the end). */
const CATEGORY_ORDER: ReadonlyArray<string> = [
  "layout",
  "notes",
  "sequence",
  "brainstorm",
  "metrics",
  "code",
  "diagram",
];

export interface LibraryProps {
  readonly title?: string;
}

/**
 * The living, auto-captured gallery: a sticky category rail + type-to-filter search beside a grid
 * of preview cards (one per registered component — live preview, usage, props). Reads the GALLERY
 * registry directly, so a new component appears the moment it is registered. The filter is an
 * opt-in island (Shell `filterable`); with no script the page is still a clean static gallery.
 */
export const Library = ({ title = "planpage — component gallery" }: LibraryProps) => {
  const groups = groupByCategory();
  return (
    <div class="lg:flex lg:gap-8">
      <aside class="mb-6 lg:sticky lg:top-20 lg:mb-0 lg:h-fit lg:w-48 lg:shrink-0">
        <input
          id="sui-filter"
          type="search"
          placeholder="Filter components…"
          class="mb-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <nav class="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
          {groups.map(([category, names]) => (
            <a key={category} href={`#cat-${category}`} class={RAIL_LINK}>
              <span class="capitalize">{category}</span>
              <span class="text-slate-400 text-xs">{names.length}</span>
            </a>
          ))}
          <a href="#cat-templates" class={RAIL_LINK}>
            <span>Templates</span>
            <span class="text-slate-400 text-xs">{TEMPLATE_INDEX.length}</span>
          </a>
        </nav>
      </aside>

      <div class="min-w-0 flex-1 space-y-10">
        <div>
          <h1 class="font-semibold text-2xl text-slate-900 tracking-tight dark:text-white">
            {title}
          </h1>
          <p class="mt-1 text-slate-500 text-sm dark:text-slate-400">
            {Object.keys(GALLERY).length} components, captured automatically — live preview, usage,
            and props.
          </p>
        </div>

        {groups.map(([category, names]) => (
          <section key={category} data-sec="" id={`cat-${category}`} class="scroll-mt-20">
            <h2 class={SECTION_HEAD}>
              <span class="capitalize">{category}</span>
              <span class="text-slate-400 text-xs">{names.length}</span>
            </h2>
            <div class="grid gap-4 sm:grid-cols-2">
              {names.map((name) => (
                <EntryCard key={name} name={name} />
              ))}
            </div>
          </section>
        ))}

        <section data-sec="" id="cat-templates" class="scroll-mt-20">
          <h2 class={SECTION_HEAD}>
            <span>Templates</span>
            <span class="text-slate-400 text-xs">{TEMPLATE_INDEX.length}</span>
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            {TEMPLATE_INDEX.map((template) => (
              <div
                key={template.name}
                data-card={`${template.name} ${template.blurb}`.toLowerCase()}
                class="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
              >
                <code class="text-indigo-500 text-sm">{template.name}</code>
                <p class="mt-1 text-slate-500 text-sm dark:text-slate-400">{template.blurb}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const RAIL_LINK =
  "flex items-center justify-between rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800";

const SECTION_HEAD =
  "mb-4 flex items-baseline gap-2 border-slate-200 border-b pb-2 font-semibold text-slate-900 dark:border-slate-800 dark:text-white";

function groupByCategory(): ReadonlyArray<[string, ReadonlyArray<GalleryName>]> {
  const names = Object.keys(GALLERY) as ReadonlyArray<GalleryName>;
  const buckets = new Map<string, GalleryName[]>();
  for (const name of names) {
    const list = buckets.get(GALLERY[name].category) ?? [];
    list.push(name);
    buckets.set(GALLERY[name].category, list);
  }
  return [...buckets].sort((a, b) => rank(a[0]) - rank(b[0]));
}

function rank(category: string): number {
  const i = CATEGORY_ORDER.indexOf(category);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

function EntryCard({ name }: { readonly name: GalleryName }) {
  const entry = GALLERY[name];
  return (
    <div
      data-card={`${name} ${entry.blurb}`.toLowerCase()}
      class="overflow-hidden rounded-xl border border-slate-200 transition-shadow hover:shadow-md dark:border-slate-800"
    >
      <div class="grid min-h-28 place-items-center overflow-x-auto border-slate-100 border-b bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40">
        {entry.sample()}
      </div>
      <div class="p-4">
        <div class="mb-2 flex flex-wrap items-baseline gap-2">
          <h3 class="font-semibold text-slate-900 dark:text-white">{name}</h3>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 text-xs uppercase tracking-wide dark:bg-slate-800 dark:text-slate-400">
            {entry.category}
          </span>
        </div>
        <p class="mb-3 text-slate-500 text-sm dark:text-slate-400">{entry.blurb}</p>
        <CodeBlock code={entry.usage} />
        <PropsTable props={entry.props} />
      </div>
    </div>
  );
}

function PropsTable({ props }: { readonly props: ReadonlyArray<PropDoc> }) {
  if (props.length === 0) return null;
  return (
    <div class="mt-3 overflow-x-auto">
      <table class="w-full text-left text-xs">
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} class="border-slate-100 border-t dark:border-slate-800">
              <td class="py-1 pr-3 font-mono text-slate-700 dark:text-slate-200">{prop.name}</td>
              <td class="py-1 pr-3 font-mono text-slate-400">{prop.type}</td>
              <td class="py-1 text-slate-400">{prop.required ? "required" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
