import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { CodeExplorer } from "./CodeExplorer";

const FILES = [
  {
    path: "src/orders/createOrder.ts",
    code: "export const createOrder = () => 1",
    before: "function createOrder(){}",
  },
  { path: "src/orders/index.ts", code: 'export * from "./createOrder"' },
  { path: "src/routes/orders.ts", code: 'router.post("/orders", createOrder)' },
];

describe("CodeExplorer", () => {
  it("renders a scoped explorer root, a sidebar entry per file, and a pane per file", () => {
    const html = render(<CodeExplorer files={FILES} label="Adding an endpoint" />);
    expect(html).toContain("data-explorer");
    expect(html).toContain('data-file-open="src/orders/createOrder.ts"');
    expect(html).toContain('data-file="src/routes/orders.ts"');
    expect(html).toContain("Adding an endpoint");
  });

  it("groups files under their folders in the sidebar", () => {
    const html = render(<CodeExplorer files={FILES} />);
    expect(html).toContain(">orders<"); // folder label, not a file button
    expect(html).toContain(">routes<");
  });

  it("adds a before/after toggle only for files that carry a before", () => {
    const html = render(<CodeExplorer files={FILES} />);
    expect(html).toContain('data-variant-btn="before"');
    expect(html).toContain('data-variant="before"');
  });

  it("opens the first file by default and hides the rest", () => {
    const html = render(<CodeExplorer files={FILES} />);
    const firstPane = html.indexOf('data-file="src/orders/createOrder.ts"');
    const lastPane = html.indexOf('data-file="src/routes/orders.ts"');
    expect(html.slice(firstPane, firstPane + 60)).not.toContain("hidden");
    expect(html.slice(lastPane, lastPane + 60)).toContain("hidden");
  });

  it("throws an actionable error on empty files", () => {
    expect(() => render(<CodeExplorer files={[]} />)).toThrow(/files\[\] is required/);
  });
});
