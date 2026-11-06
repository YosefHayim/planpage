import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type RawData, WebSocket } from "ws";
import { EMPTY_DECISION } from "../contracts/decision";
import { type LiveServerHandle, type StartLiveServerSettings, startLiveServer } from "./liveServer";

type Frame = Record<string, unknown>;

interface FrameInbox {
  readonly nextFrame: (kind: string) => Promise<Frame>;
}

interface FrameWaiter {
  readonly kind: string;
  readonly settle: (frame: Frame) => void;
}

interface PlanFiles {
  readonly folder: string;
  readonly planPath: string;
  readonly decisionPath: string;
}

const PLAN_PAGE_SCRIPT = "window.livePlanTest = true;";

// Each test renders the sketch plan (shiki highlight), which can take seconds under load.
const liveServerTest = (name: string, testBody: () => Promise<void>) => {
  const liveServerTestTimeoutMs = 20000;
  return it(name, testBody, liveServerTestTimeoutMs);
};

const createdFolders: string[] = [];
const openedSockets: WebSocket[] = [];
const startedHandles: LiveServerHandle[] = [];

afterEach(() => {
  vi.restoreAllMocks();
  for (const socket of openedSockets.splice(0)) socket.terminate();
  for (const handle of startedHandles.splice(0)) handle.stop();
  for (const folder of createdFolders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

const samplePage = (nav: string, title: string, nodeId: string, words: string) => ({
  nav,
  title,
  scene: {
    width: 600,
    height: 300,
    nodes: [{ id: nodeId, kind: "box", x: 40, y: 40, w: 200, h: 100, words }],
    edges: [],
  },
});

const signInPage = samplePage("Sign in", "Sign in page", "loginBox", "Log in");
const homePage = samplePage("Home", "Home page", "homeBox", "Home");

const samplePlan = { title: "Login plan", pages: [signInPage, homePage] };

const createPlanFiles = (plan: unknown): PlanFiles => {
  const folder = mkdtempSync(join(tmpdir(), "planpage-live-"));
  createdFolders.push(folder);
  const planPath = join(folder, "plan.json");
  writeFileSync(planPath, JSON.stringify(plan));
  return { folder, planPath, decisionPath: join(folder, "decision.json") };
};

const testIdleTimeoutSeconds = 60;

const startTestServer = async (
  planFiles: PlanFiles,
  overrides: Partial<StartLiveServerSettings> = {},
): Promise<LiveServerHandle> => {
  const handle = await startLiveServer({
    planPath: planFiles.planPath,
    decisionPath: planFiles.decisionPath,
    pageScript: PLAN_PAGE_SCRIPT,
    port: 0,
    idleTimeoutSeconds: testIdleTimeoutSeconds,
    open: false,
    ...overrides,
  });
  startedHandles.push(handle);
  return handle;
};

const withTimeout = async <Value>(pending: Promise<Value>, label: string): Promise<Value> => {
  let timer: NodeJS.Timeout | undefined;
  const frameTimeoutMs = 10000;
  const timeout = new Promise<never>((_settle, fail) => {
    timer = setTimeout(() => fail(new Error(`timed out waiting for ${label}`)), frameTimeoutMs);
  });
  try {
    return await Promise.race([pending, timeout]);
  } finally {
    clearTimeout(timer);
  }
};

// The watcher can miss a write made right after the server starts, so the plan is rewritten
// until the awaited frame arrives.
const writePlanUntilFrame = async (
  planPath: string,
  planText: string,
  awaitedFrame: Promise<Frame>,
): Promise<Frame> => {
  writeFileSync(planPath, planText);
  const planRewriteIntervalMs = 100;
  const rewriting = setInterval(() => writeFileSync(planPath, planText), planRewriteIntervalMs);
  try {
    return await withTimeout(awaitedFrame, "a live server frame");
  } finally {
    clearInterval(rewriting);
  }
};

const openInbox = (socket: WebSocket): FrameInbox => {
  const unread: Frame[] = [];
  const waiters: FrameWaiter[] = [];
  socket.on("message", (rawFrame: RawData) => {
    const frame = JSON.parse(rawFrame.toString()) as Frame;
    const waiter = waiters.find((candidate) => candidate.kind === frame.kind);
    if (waiter === undefined) {
      unread.push(frame);
      return;
    }
    waiters.splice(waiters.indexOf(waiter), 1);
    waiter.settle(frame);
  });

  const nextFrame = (kind: string): Promise<Frame> => {
    const unreadFrame = unread.find((frame) => frame.kind === kind);
    if (unreadFrame !== undefined) {
      unread.splice(unread.indexOf(unreadFrame), 1);
      return Promise.resolve(unreadFrame);
    }
    return withTimeout(
      new Promise<Frame>((settle) => waiters.push({ kind, settle })),
      `a "${kind}" frame`,
    );
  };

  return { nextFrame };
};

const openSocketWithInbox = async (
  url: string,
  headers: Record<string, string> = {},
): Promise<{ socket: WebSocket; inbox: FrameInbox }> => {
  const socket = new WebSocket(url, { headers });
  openedSockets.push(socket);
  const inbox = openInbox(socket);
  await withTimeout(
    new Promise<void>((settleOpen, failOpen) => {
      socket.once("open", () => settleOpen());
      socket.on("error", failOpen);
    }),
    `the socket ${url} to open`,
  );
  return { socket, inbox };
};

const readUpgradeStatus = (url: string, headers: Record<string, string>): Promise<number> => {
  const socket = new WebSocket(url, { headers });
  openedSockets.push(socket);
  return withTimeout(
    new Promise<number>((settleStatus, failStatus) => {
      const switchingProtocolsStatus = 101;
      socket.once("open", () => settleStatus(switchingProtocolsStatus));
      socket.once("unexpected-response", (_request, upgradeReply) =>
        settleStatus(upgradeReply.statusCode ?? 0),
      );
      socket.on("error", failStatus);
    }),
    `the upgrade answer from ${url}`,
  );
};

const pageSocketUrl = (handle: LiveServerHandle): string => `ws://127.0.0.1:${handle.port}/page`;

const pageOrigin = (handle: LiveServerHandle): Record<string, string> => ({
  Origin: `http://127.0.0.1:${handle.port}`,
});

const postJson = (
  url: string,
  message: unknown,
  headers: Record<string, string> = {},
): Promise<Response> =>
  fetch(url, {
    method: "POST",
    body: JSON.stringify(message),
    headers: { "Content-Type": "application/json", ...headers },
  });

const cursorUrl = (handle: LiveServerHandle, token: string): string =>
  `http://127.0.0.1:${handle.port}/cursor?token=${token}`;

const sendCommentFrame = (page: WebSocket, frame: Frame): void => {
  page.send(JSON.stringify({ kind: "comment", ...frame }));
};

const saveFirstComment = async (handle: LiveServerHandle) => {
  const { socket: tab, inbox: tabInbox } = await openSocketWithInbox(
    pageSocketUrl(handle),
    pageOrigin(handle),
  );
  const { socket: agent, inbox: agentInbox } = await openSocketWithInbox(handle.agentSocketUrl);
  sendCommentFrame(tab, {
    draftId: "draft-1",
    page: 1,
    part: "loginBox",
    words: "Make the button bigger",
  });
  await tabInbox.nextFrame("comment-saved");
  await agentInbox.nextFrame("comment");
  return { tab, tabInbox, agent, agentInbox };
};

describe("startLiveServer", () => {
  liveServerTest("rejects a page socket whose Origin is another website", async () => {
    const handle = await startTestServer(createPlanFiles(samplePlan));

    const status = await readUpgradeStatus(pageSocketUrl(handle), {
      Origin: "http://evil.example",
    });

    expect(status).toBe(403);
  });

  liveServerTest("rejects an agent socket with a wrong token", async () => {
    const handle = await startTestServer(createPlanFiles(samplePlan));

    const status = await readUpgradeStatus(
      `ws://127.0.0.1:${handle.port}/agent?token=not-the-token`,
      {},
    );

    expect(status).toBe(403);
  });

  liveServerTest("rejects an agent socket that carries a browser Origin header", async () => {
    const handle = await startTestServer(createPlanFiles(samplePlan));

    const status = await readUpgradeStatus(handle.agentSocketUrl, pageOrigin(handle));

    expect(status).toBe(403);
  });

  liveServerTest(
    "sends a comment to the agent with commentId 1 and tells the tab it was saved",
    async () => {
      const handle = await startTestServer(createPlanFiles(samplePlan));
      const { socket: tab, inbox: tabInbox } = await openSocketWithInbox(
        pageSocketUrl(handle),
        pageOrigin(handle),
      );
      const { socket: agent, inbox: agentInbox } = await openSocketWithInbox(handle.agentSocketUrl);

      sendCommentFrame(tab, {
        draftId: "draft-1",
        page: 2,
        part: "homeBox",
        words: "  make this faster  ",
      });
      const savedFrame = await tabInbox.nextFrame("comment-saved");
      const agentFrame = await agentInbox.nextFrame("comment");

      expect(savedFrame.comment).toEqual({
        commentId: 1,
        draftId: "draft-1",
        page: 2,
        pageTitle: "Home page",
        part: "homeBox",
        words: "make this faster",
        status: "sent",
      });
      expect(agentFrame).toEqual({
        kind: "comment",
        commentId: 1,
        page: 2,
        pageTitle: "Home page",
        part: "homeBox",
        words: "make this faster",
      });
    },
  );

  liveServerTest(
    "ignores a comment frame that is not valid and keeps the next id at 1",
    async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
      const handle = await startTestServer(createPlanFiles(samplePlan));
      const { socket: tab, inbox: tabInbox } = await openSocketWithInbox(
        pageSocketUrl(handle),
        pageOrigin(handle),
      );

      sendCommentFrame(tab, { draftId: "draft-bad", page: 99, part: null, words: "out of range" });
      sendCommentFrame(tab, { draftId: "draft-empty", page: 1, part: null, words: "   " });
      tab.send("not json at all");
      sendCommentFrame(tab, { draftId: "draft-good", page: 1, part: null, words: "good one" });
      const savedFrame = await tabInbox.nextFrame("comment-saved");

      expect(savedFrame.comment).toMatchObject({ commentId: 1, draftId: "draft-good" });
      expect(consoleErrorSpy).toHaveBeenCalled();
    },
  );

  liveServerTest("sends comments-so-far to a tab that reconnects", async () => {
    const handle = await startTestServer(createPlanFiles(samplePlan));
    const { socket: firstTab, inbox: firstTabInbox } = await openSocketWithInbox(
      pageSocketUrl(handle),
      pageOrigin(handle),
    );
    sendCommentFrame(firstTab, { draftId: "draft-1", page: 1, part: null, words: "keep this" });
    await firstTabInbox.nextFrame("comment-saved");
    firstTab.terminate();

    const { socket: reloadedTab, inbox: reloadedInbox } = await openSocketWithInbox(
      pageSocketUrl(handle),
      pageOrigin(handle),
    );
    const soFarFrame = await reloadedInbox.nextFrame("comments-so-far");

    expect(soFarFrame.comments).toEqual([
      {
        commentId: 1,
        draftId: "draft-1",
        page: 1,
        pageTitle: "Sign in page",
        part: null,
        words: "keep this",
        status: "sent",
      },
    ]);
  });

  liveServerTest(
    "moves a comment to working and broadcasts the cursor when the agent names the comment",
    async () => {
      const planFiles = createPlanFiles(samplePlan);
      const handle = await startTestServer(planFiles);
      const { tab, tabInbox } = await saveFirstComment(handle);

      const cursorReply = await postJson(cursorUrl(handle, handle.token), {
        commentId: 1,
        page: null,
        part: null,
        say: "Looking at the login box",
      });
      const statusFrame = await tabInbox.nextFrame("comment-status");
      const cursorFrame = await tabInbox.nextFrame("cursor");

      expect(cursorReply.status).toBe(204);
      expect(statusFrame).toEqual({ kind: "comment-status", commentId: 1, status: "working" });
      expect(cursorFrame).toEqual({
        kind: "cursor",
        page: 1,
        part: "loginBox",
        say: "Looking at the login box",
      });
      tab.terminate();
    },
  );

  liveServerTest("refuses a cursor request with a wrong token", async () => {
    const handle = await startTestServer(createPlanFiles(samplePlan));

    const cursorReply = await postJson(cursorUrl(handle, "wrong-token"), {
      commentId: null,
      page: 1,
      part: null,
      say: "hello",
    });

    expect(cursorReply.status).toBe(403);
  });

  liveServerTest(
    "sends plan-changed with only the edited node and turns the working comment done",
    async () => {
      const planFiles = createPlanFiles(samplePlan);
      const handle = await startTestServer(planFiles);
      const { tabInbox } = await saveFirstComment(handle);
      await postJson(cursorUrl(handle, handle.token), {
        commentId: 1,
        page: null,
        part: null,
        say: "Editing the login box",
      });
      await tabInbox.nextFrame("comment-status");

      const editedPlan = {
        ...samplePlan,
        pages: [samplePage("Sign in", "Sign in page", "loginBox", "Sign in now"), homePage],
      };
      const changedFramePromise = tabInbox.nextFrame("plan-changed");
      const changedFrame = await writePlanUntilFrame(
        planFiles.planPath,
        JSON.stringify(editedPlan),
        changedFramePromise,
      );
      const doneFrame = await tabInbox.nextFrame("comment-status");

      expect(changedFrame.changes).toEqual([
        { page: 1, pageTitle: "Sign in page", changedParts: ["loginBox"] },
      ]);
      expect(String(changedFrame.html)).toContain("Sign in now");
      expect(doneFrame).toEqual({ kind: "comment-status", commentId: 1, status: "done" });
    },
  );

  liveServerTest(
    "sends plan-error to the agent for broken JSON and keeps serving the last good page",
    async () => {
      const planFiles = createPlanFiles(samplePlan);
      const handle = await startTestServer(planFiles);
      const { socket: agent, inbox: agentInbox } = await openSocketWithInbox(handle.agentSocketUrl);

      const errorFramePromise = agentInbox.nextFrame("plan-error");
      const errorFrame = await writePlanUntilFrame(
        planFiles.planPath,
        "{ this is not json",
        errorFramePromise,
      );
      const pageReply = await fetch(`http://127.0.0.1:${handle.port}/`);
      const pageHtml = await pageReply.text();

      expect(typeof errorFrame.message).toBe("string");
      expect(pageHtml).toContain("Login plan");
    },
  );

  liveServerTest("sends plan-reshaped when a page is added", async () => {
    const planFiles = createPlanFiles(samplePlan);
    const handle = await startTestServer(planFiles);
    const { socket: tab, inbox: tabInbox } = await openSocketWithInbox(
      pageSocketUrl(handle),
      pageOrigin(handle),
    );

    const addedPlan = {
      ...samplePlan,
      pages: [...samplePlan.pages, samplePage("Done", "Done page", "doneBox", "Done")],
    };
    const reshapedFramePromise = tabInbox.nextFrame("plan-reshaped");
    const reshapedFrame = await writePlanUntilFrame(
      planFiles.planPath,
      JSON.stringify(addedPlan),
      reshapedFramePromise,
    );

    expect(reshapedFrame.kind).toBe("plan-reshaped");
  });

  liveServerTest(
    "writes the decision, sends it to the agent and resolves closed as decision-written",
    async () => {
      const planFiles = createPlanFiles(samplePlan);
      const handle = await startTestServer(planFiles);
      const { socket: agent, inbox: agentInbox } = await openSocketWithInbox(handle.agentSocketUrl);
      const decision = { ...EMPTY_DECISION, approved: false, notes: "tighten the login" };

      const decisionReply = await postJson(`http://127.0.0.1:${handle.port}/decision`, decision);
      const decisionFrame = await agentInbox.nextFrame("decision");
      const exit = await handle.closed;

      expect(decisionReply.status).toBe(200);
      expect(JSON.parse(readFileSync(planFiles.decisionPath, "utf8"))).toEqual(decision);
      expect(decisionFrame.decision).toEqual(decision);
      expect(exit).toBe("decision-written");
    },
  );

  liveServerTest("resolves closed as idle-timeout when nobody uses the server", async () => {
    const handle = await startTestServer(createPlanFiles(samplePlan), {
      idleTimeoutSeconds: 0.2,
    });

    const exit = await handle.closed;

    expect(exit).toBe("idle-timeout");
  });

  liveServerTest(
    "serves the rendered plan with the page script right before the closing body tag",
    async () => {
      const handle = await startTestServer(createPlanFiles(samplePlan));

      const pageReply = await fetch(`http://127.0.0.1:${handle.port}/`);
      const pageHtml = await pageReply.text();

      expect(pageHtml).toContain(`<script>${PLAN_PAGE_SCRIPT}</script></body>`);
    },
  );
});
