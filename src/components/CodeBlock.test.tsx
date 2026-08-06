import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { CodeBlock } from "./CodeBlock";

describe("CodeBlock", () => {
  it("defaults to wrap so gallery usage does not overflow", () => {
    const html = render(<CodeBlock code={'const x = "long-usage-line"'} />);
    expect(html).toContain("code-wrap");
    expect(html).toContain("long-usage-line");
  });

  it("supports scroll overflow for classic pre lines", () => {
    const html = render(<CodeBlock code="const y = 1" overflow="scroll" />);
    // Shell global CSS may define .code-wrap — assert the <pre> uses scroll, not wrap.
    expect(html).toMatch(/<pre class="code[^"]*overflow-x-auto/);
    expect(html).not.toMatch(/<pre class="code[^"]*code-wrap/);
  });
});

