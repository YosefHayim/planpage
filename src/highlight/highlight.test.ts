import { describe, expect, it } from "vitest";
import { CodeBlock } from "../components/CodeBlock";
import { render } from "../render/render";
import { highlight, renderHighlighted } from "./highlight";

describe("highlight", () => {
  it("swaps markers for Shiki dual-theme spans, keeping data-hl for the CSS swap", async () => {
    const html = await highlight(render(CodeBlock({ code: "const x: number = 1", lang: "ts" })));
    expect(html).toContain("--shiki-dark:"); // dual-theme colour variable
    expect(html).toContain('<span style="color:'); // real token colour, inline
    expect(html).toContain('class="line"'); // Shiki line structure replaced the plain fallback
    expect(html).toContain('data-hl="typescript"'); // "ts" alias normalised, attribute kept for the CSS swap
  });

  it("recovers source exactly through JSX escaping (generics, quotes, ampersands)", async () => {
    const src = 'const m: Map<string, T> = fn("a") && g';
    const html = await highlight(render(CodeBlock({ code: src })));
    // strip tags, then decode both named and numeric entities (Shiki emits hex like &#x3C;)
    const text = html
      .replace(/<[^>]+>/g, "")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&");
    expect(text).toContain(src); // no lost or double-escaped characters
  });

  it("leaves HTML without markers untouched", async () => {
    const plain = "<p>no code here</p>";
    expect(await highlight(plain)).toBe(plain);
  });

  it("keeps the plain fallback when the language is unknown", async () => {
    const html = await highlight(render(CodeBlock({ code: "SELECT 1", lang: "not-a-lang" })));
    expect(html).toContain("SELECT 1"); // survives as escaped fallback, no throw
  });

  it("renderHighlighted renders and colours in one step", async () => {
    const html = await renderHighlighted(CodeBlock({ code: "const y = 2", lang: "ts" }));
    expect(html).toContain("<!doctype html>");
    expect(html).toContain("--shiki-dark:");
  });
});
