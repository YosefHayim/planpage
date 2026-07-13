import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { Terminal } from "./Terminal";

describe("Terminal", () => {
  it("renders commands, comments, and output", () => {
    const html = render(
      <Terminal
        title="zsh"
        lines={[
          { comment: "install it" },
          { command: "npx planpage init" },
          { output: "planpage: scaffolded skill" },
        ]}
      />,
    );
    expect(html).toContain("zsh");
    expect(html).toContain("npx planpage init");
    expect(html).toContain("install it");
    expect(html).toContain("planpage: scaffolded skill");
  });

  it("throws when lines is empty", () => {
    expect(() => render(<Terminal lines={[]} />)).toThrow("lines[] is required");
  });
});
