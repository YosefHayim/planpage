import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { PickBlock } from "./PickBlock";

describe("PickBlock", () => {
  it("wraps chosen and rejected text so long prose is not cut off", () => {
    const html = render(<PickBlock id="demo" rule="Rule" chosen="a long sentence" rejected="b" />);
    const wrappedPres = html.match(/<pre class="code code-wrap[^"]*"/g) ?? [];
    expect(wrappedPres).toHaveLength(2);
  });
});
