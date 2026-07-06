import type { VNode } from "preact";
import { codeMark } from "../render/codeMark";

export interface ExplorerFile {
  /** Full path from the tree root, e.g. "src/orders/createOrder.ts" — folders are split on "/". */
  readonly path: string;
  /** The file's code (the "after" / final version shown by default). */
  readonly code: string;
  /** Optional previous version — its presence adds a before/after toggle to this file. */
  readonly before?: string;
  /** Shiki language id. Defaults to the one inferred from the path's extension, else "ts". */
  readonly lang?: string;
}

export interface CodeExplorerProps {
  /** The files to browse, in sidebar order. First file opens by default. */
  readonly files: ReadonlyArray<ExplorerFile>;
  /** Optional header, e.g. "Canonical example — adding an endpoint". */
  readonly label?: string;
}

/** Extension → Shiki language, so callers rarely need to set `lang` by hand. */
const LANG_BY_EXT: Record<string, string> = {
  ts: "ts",
  tsx: "tsx",
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  json: "json",
  jsonc: "jsonc",
  css: "css",
  html: "html",
  md: "markdown",
  py: "python",
  go: "go",
  rs: "rust",
  sql: "sql",
  sh: "bash",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
};

/**
 * An IDE-style file explorer for a multi-file example: a folder tree on the left, one editor
 * pane per file on the right. Click a file to open it; a file with a `before` gets a before/after
 * toggle. Every pane is syntax-highlighted by the render-time pass; the client island only swaps
 * which pane is visible (opt-in via the Shell `explorable` flag), so the first file reads with no JS.
 *
 * @param files - the files to browse; the first opens by default
 * @param label - optional header shown above the explorer
 * @returns a bordered explorer with a `data-explorer` root the client island scopes to
 */
export const CodeExplorer = ({ files, label }: CodeExplorerProps) => {
  if (files.length === 0) throw new Error("CodeExplorer: files[] is required and non-empty");
  const tree = buildTree(files);
  return (
    <div
      data-explorer
      class="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1e1e1e]"
    >
      {label ? (
        <div class="border-b border-slate-100 px-3 py-2 font-mono text-xs text-slate-500 dark:border-slate-800">
          {label}
        </div>
      ) : null}
      <div class="grid md:grid-cols-[minmax(9rem,14rem)_1fr]">
        <nav
          aria-label="Files"
          class="max-h-96 overflow-auto border-b border-slate-100 bg-slate-50 py-2 text-sm md:border-b-0 md:border-r dark:border-slate-800 dark:bg-slate-900/50"
        >
          {renderNodes(tree, 0, files[0]?.path)}
        </nav>
        <div class="min-w-0">
          {files.map((file, i) => (
            <FilePane key={file.path} file={file} lang={langOf(file)} open={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface TreeNode {
  readonly name: string;
  /** Set on leaves (files) — the matching ExplorerFile.path used as the switch key. */
  readonly file?: ExplorerFile;
  readonly children: Map<string, TreeNode>;
}

/** The Shiki language for a file: explicit `lang` wins, else inferred from the extension, else "ts". */
function langOf(file: ExplorerFile): string {
  return file.lang ?? LANG_BY_EXT[file.path.split(".").pop() ?? ""] ?? "ts";
}

/** Fold the flat file list into a nested folder tree, preserving first-seen order per level. */
function buildTree(files: ReadonlyArray<ExplorerFile>): TreeNode {
  const root: TreeNode = { name: "", children: new Map() };
  for (const file of files) {
    const parts = file.path.split("/");
    let node = root;
    parts.forEach((name, i) => {
      const isLeaf = i === parts.length - 1;
      const existing = node.children.get(name);
      const next = existing ?? { name, children: new Map(), ...(isLeaf ? { file } : {}) };
      if (!existing) node.children.set(name, next);
      node = next;
    });
  }
  return root;
}

/** Render a level of the tree: folders (as labels) then files (as switch buttons), sorted. */
function renderNodes(node: TreeNode, depth: number, activePath: string | undefined): VNode {
  const entries = [...node.children.values()].sort(sortNodes);
  return (
    <ul class={depth === 0 ? "" : "ml-3 border-l border-slate-200 dark:border-slate-700"}>
      {entries.map((child) =>
        child.file ? (
          <li key={child.name}>
            <button
              type="button"
              data-file-open={child.file.path}
              class={`flex w-full items-center gap-1.5 px-3 py-1 text-left font-mono text-xs transition-colors hover:bg-slate-200/60 dark:hover:bg-slate-800 ${
                child.file.path === activePath
                  ? "bg-white font-medium text-indigo-600 dark:bg-slate-800 dark:text-white"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <FileIcon />
              <span class="truncate">{child.name}</span>
              {child.file.before ? (
                <span
                  class="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
                  title="has a before"
                />
              ) : null}
            </button>
          </li>
        ) : (
          <li key={child.name}>
            <div class="flex items-center gap-1.5 px-3 py-1 font-mono text-xs text-slate-400 dark:text-slate-500">
              <FolderIcon />
              <span class="truncate">{child.name}</span>
            </div>
            {renderNodes(child, depth + 1, activePath)}
          </li>
        ),
      )}
    </ul>
  );
}

/** Folders sort before files, each group alphabetical — the familiar sidebar ordering. */
function sortNodes(a: TreeNode, b: TreeNode): number {
  const aFile = a.file ? 1 : 0;
  const bFile = b.file ? 1 : 0;
  return aFile - bFile || a.name.localeCompare(b.name);
}

/** One file's editor pane — a path bar (+ before/after toggle) and the highlighted code panes. */
const FilePane = ({
  file,
  lang,
  open,
}: {
  readonly file: ExplorerFile;
  readonly lang: string;
  readonly open: boolean;
}) => (
  <section data-file={file.path} class={open ? "" : "hidden"}>
    <div class="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-800">
      <span class="truncate font-mono text-xs text-slate-500">{file.path}</span>
      {file.before ? (
        <div class="ml-auto flex overflow-hidden rounded-md border border-slate-200 text-xs dark:border-slate-700">
          <button
            type="button"
            data-variant-btn="before"
            class="px-2 py-0.5 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            before
          </button>
          <button
            type="button"
            data-variant-btn="after"
            class="bg-emerald-500 px-2 py-0.5 font-medium text-white"
          >
            after
          </button>
        </div>
      ) : null}
    </div>
    {file.before !== undefined ? (
      <pre
        data-variant="before"
        class="code hidden bg-white p-4 text-xs leading-relaxed text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100"
      >
        {codeMark(file.before, lang)}
      </pre>
    ) : null}
    <pre
      data-variant="after"
      class="code bg-white p-4 text-xs leading-relaxed text-slate-800 dark:bg-[#1e1e1e] dark:text-slate-100"
    >
      {codeMark(file.code, lang)}
    </pre>
  </section>
);

const FileIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.3"
    class="h-3.5 w-3.5 shrink-0 opacity-70"
    aria-hidden="true"
  >
    <path d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5Z" />
    <path d="M9 1.5V5.5H13" />
  </svg>
);

const FolderIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    class="h-3.5 w-3.5 shrink-0 opacity-70"
    aria-hidden="true"
  >
    <path d="M1.75 3.5A1.25 1.25 0 0 1 3 2.25h3.2c.33 0 .64.13.88.37l.9.88H13A1.25 1.25 0 0 1 14.25 5.6v6.65A1.25 1.25 0 0 1 13 13.5H3a1.25 1.25 0 0 1-1.25-1.25V3.5Z" />
  </svg>
);
