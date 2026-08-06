import { describe, expect, it } from "vitest";
import { render } from "../render/render";
import { StatusChip, type StepStatus } from "./StatusChip";

const ALL: ReadonlyArray<StepStatus> = ["todo", "doing", "done", "blocked"];

describe("StatusChip", () => {
  it("renders every status with its default label", () => {
    const html = render(
      <div>
        {ALL.map((status) => (
          <StatusChip key={status} status={status} />
        ))}
      </div>,
    );
    expect(html).toContain("Todo");
    expect(html).toContain("Doing");
    expect(html).toContain("Done");
    expect(html).toContain("Blocked");
  });

  it("allows a custom label override", () => {
    const html = render(<StatusChip status="doing" label="In flight" />);
    expect(html).toContain("In flight");
  });
});
