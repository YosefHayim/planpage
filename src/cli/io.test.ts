import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spawnMock = vi.fn(() => ({ unref: vi.fn() }));

vi.mock("node:child_process", () => ({
  spawn: spawnMock,
}));

describe("openPath", () => {
  beforeEach(() => {
    spawnMock.mockClear();
    delete process.env.PLANPAGE_NO_OPEN;
  });

  afterEach(() => {
    delete process.env.PLANPAGE_NO_OPEN;
  });

  it("opens a path only once per process (dedupe)", async () => {
    const url = `http://127.0.0.1:4311/dedupe-${Date.now()}-${Math.random()}`;
    const { openPath } = await import("./io");
    openPath(url);
    openPath(url);
    openPath(url);
    expect(spawnMock).toHaveBeenCalledTimes(1);
  });

  it("skips open when PLANPAGE_NO_OPEN is set", async () => {
    process.env.PLANPAGE_NO_OPEN = "1";
    const { openPath } = await import("./io");
    const before = spawnMock.mock.calls.length;
    openPath(`http://127.0.0.1:4312/no-open-${Date.now()}-${Math.random()}`);
    expect(spawnMock.mock.calls.length).toBe(before);
  });
});
