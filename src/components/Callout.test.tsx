import { describe, expect, it } from "vitest";
import { Callout, type CalloutTone } from "./Callout";
import { render } from "../render/render";

const ALL: ReadonlyArray<CalloutTone> = [
  "note",
  "warn",
  "success",
  "danger",
  "risk",
  "decision",
  "assumption",
];

describe("Callout", () => {
  it("renders every tone without throw", () => {
    const html = render(
      <div>
        {ALL.map((tone) => (
          <Callout key={tone} tone={tone} title={tone}>
            body-{tone}
          </Callout>
        ))}
      </div>,
    );
    for (const tone of ALL) {
      expect(html).toContain(`body-${tone}`);
      expect(html).toContain(tone);
    }
  });
});
