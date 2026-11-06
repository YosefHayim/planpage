import { randomUUID } from "node:crypto";
import { type FSWatcher, readFileSync, watch, writeFileSync } from "node:fs";
import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { basename, dirname } from "node:path";
import type { Duplex } from "node:stream";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import { openPath } from "../cli/io";
import type { Decision } from "../contracts/decision";
import type {
  LiveComment,
  LiveCommentForAgent,
  LiveCommentFromPage,
  LiveCommentStatus,
  LiveMessageToAgent,
  LiveMessageToPage,
} from "../contracts/live";
import { renderTemplateHtml } from "../templates/renderTemplateHtml";
import { isCommentFrame, isCursorBody, isJsonObject, isPageNumberInPlan } from "./liveFrames";
import { type LivePlan, findPlanDifference } from "./livePlanDiff";

export type LiveServerExit = "decision-written" | "idle-timeout" | "error" | "stopped";

export interface StartLiveServerSettings {
  readonly planPath: string;
  readonly decisionPath: string;
  readonly pageScript: string;
  readonly port: number;
  readonly idleTimeoutSeconds: number;
  readonly open: boolean;
}

export interface LiveServerHandle {
  readonly pageUrl: string;
  readonly agentSocketUrl: string;
  readonly port: number;
  readonly token: string;
  readonly closed: Promise<LiveServerExit>;
  readonly stop: () => void;
}

interface ReadablePlan {
  readonly kind: "ready";
  readonly plan: LivePlan;
  readonly html: string;
}

interface UnreadablePlan {
  readonly kind: "broken";
  readonly error: unknown;
}

type PlanReading = ReadablePlan | UnreadablePlan;

interface CurrentPlan {
  readonly plan: LivePlan;
  readonly html: string;
}

interface LiveTimers {
  idle?: NodeJS.Timeout;
  reload?: NodeJS.Timeout;
}

interface LiveSession {
  readonly token: string;
  readonly serverSettings: StartLiveServerSettings;
  readonly planFileName: string;
  currentPlan: CurrentPlan;
  readonly comments: Map<number, LiveComment>;
  readonly pageSockets: Set<WebSocket>;
  readonly agentSockets: Set<WebSocket>;
  readonly timers: LiveTimers;
  readonly reloads: { started: number };
  readonly shutdownState: { isClosed: boolean };
  readonly pageServer: WebSocketServer;
  readonly agentServer: WebSocketServer;
  readonly httpServer: Server;
  planWatcher: FSWatcher | null;
  readonly settleClosed: (exit: LiveServerExit) => void;
}

interface SocketUpgrade {
  readonly request: IncomingMessage;
  readonly socket: Duplex;
  readonly head: Buffer;
}

interface HttpExchange {
  readonly request: IncomingMessage;
  readonly reply: ServerResponse;
  readonly url: URL;
}

const LOOPBACK_HOST = "127.0.0.1";
const PAGE_PATH = "/";
const AGENT_SOCKET_PATH = "/agent";
const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const FORBIDDEN_STATUS_LINE = "403 Forbidden";
const HTML_CONTENT_TYPE = "text/html; charset=utf-8";

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const isPortBusy = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "EADDRINUSE";

const injectPageScript = (html: string, pageScript: string): string => {
  const scriptTag = `<script>${pageScript}</script>`;
  return html.replace("</body>", () => `${scriptTag}</body>`);
};

const parseJsonOrNull = (incomingString: string): unknown => {
  try {
    return JSON.parse(incomingString);
  } catch {
    console.error({ liveServer: "body is not JSON" });
    return null;
  }
};

const readRequestAsString = (request: IncomingMessage): Promise<string> =>
  new Promise((settleText, failText) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => settleText(Buffer.concat(chunks).toString("utf8")));
    request.on("error", failText);
  });

const readUrl = (request: IncomingMessage): URL =>
  new URL(request.url ?? PAGE_PATH, `http://${LOOPBACK_HOST}`);

const sendText = (reply: ServerResponse, status: number, message: string): void => {
  reply.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  reply.end(message);
};

const sendHtml = (reply: ServerResponse, html: string): void => {
  reply.writeHead(HTTP_OK, { "Content-Type": HTML_CONTENT_TYPE });
  reply.end(html);
};

const rejectUpgrade = (socket: Duplex, statusLine: string): void => {
  socket.write(`HTTP/1.1 ${statusLine}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
};

const sendFrame = (socket: WebSocket, message: LiveMessageToPage | LiveMessageToAgent): void => {
  const isSocketOpen = socket.readyState === WebSocket.OPEN;
  if (!isSocketOpen) return;

  socket.send(JSON.stringify(message));
};

const sendToPages = (session: LiveSession, message: LiveMessageToPage): void => {
  for (const pageSocket of session.pageSockets) sendFrame(pageSocket, message);
};

const sendToAgents = (session: LiveSession, message: LiveMessageToAgent): void => {
  for (const agentSocket of session.agentSockets) sendFrame(agentSocket, message);
};

const readPageTitle = (plan: LivePlan, pageNumber: number): string => {
  const page = plan.pages[pageNumber - 1];
  const isPageMissing = page === undefined;
  if (isPageMissing) throw new Error(`planpage: the plan has no page ${pageNumber}`);

  return page.title;
};

const createCommentForAgent = (comment: LiveComment): LiveCommentForAgent => ({
  kind: "comment",
  commentId: comment.commentId,
  page: comment.page,
  pageTitle: comment.pageTitle,
  part: comment.part,
  words: comment.words,
});

const readPlanPage = async (planPath: string, pageScript: string): Promise<PlanReading> => {
  try {
    const planString = readFileSync(planPath, "utf8");
    const plan = JSON.parse(planString) as LivePlan;
    const pageHtml = await renderTemplateHtml("sketch-plan", plan, { serve: true });

    return { kind: "ready", plan, html: injectPageScript(pageHtml, pageScript) };
  } catch (error) {
    return { kind: "broken", error };
  }
};

const listenOnLoopback = (server: Server, port: number): Promise<AddressInfo> =>
  new Promise((settleListen, failListen) => {
    const onListenError = (error: Error): void => failListen(error);
    server.once("error", onListenError);
    server.listen(port, LOOPBACK_HOST, () => {
      server.off("error", onListenError);
      settleListen(server.address() as AddressInfo);
    });
  });

const listenWithFallback = async (server: Server, preferredPort: number): Promise<AddressInfo> => {
  try {
    return await listenOnLoopback(server, preferredPort);
  } catch (error) {
    const shouldFallBack = isPortBusy(error) && preferredPort !== 0;
    if (!shouldFallBack) throw error;

    console.error({ liveServer: "preferred port is busy, using another port", preferredPort });
    return listenOnLoopback(server, 0);
  }
};

const readBoundPort = (session: LiveSession): number =>
  (session.httpServer.address() as AddressInfo).port;

const isAllowedPageOrigin = (session: LiveSession, origin: string | undefined): boolean => {
  const port = readBoundPort(session);
  return origin === `http://127.0.0.1:${port}` || origin === `http://localhost:${port}`;
};

const isTokenValid = (token: string, url: URL): boolean => url.searchParams.get("token") === token;

const shutdown = (session: LiveSession, exit: LiveServerExit): void => {
  const isAlreadyClosed = session.shutdownState.isClosed;
  if (isAlreadyClosed) return;

  session.shutdownState.isClosed = true;
  clearTimeout(session.timers.idle);
  clearTimeout(session.timers.reload);
  session.planWatcher?.close();
  for (const socket of [...session.pageSockets, ...session.agentSockets]) socket.close();

  session.httpServer.closeAllConnections();
  session.httpServer.close();
  session.settleClosed(exit);
};

const touchIdle = (session: LiveSession): void => {
  clearTimeout(session.timers.idle);
  const millisecondsPerSecond = 1000;
  const idleMilliseconds = session.serverSettings.idleTimeoutSeconds * millisecondsPerSecond;

  session.timers.idle = setTimeout(() => {
    console.error({ liveServer: "idle timeout" });
    shutdown(session, "idle-timeout");
  }, idleMilliseconds);
};

const setCommentStatus = (
  session: LiveSession,
  comment: LiveComment,
  status: LiveCommentStatus,
): void => {
  session.comments.set(comment.commentId, { ...comment, status });
  sendToPages(session, { kind: "comment-status", commentId: comment.commentId, status });
};

const markWorkingCommentsDone = (session: LiveSession): void => {
  for (const comment of session.comments.values()) {
    const isWorking = comment.status === "working";
    if (isWorking) setCommentStatus(session, comment, "done");
  }
};

const saveComment = (session: LiveSession, commentFrame: LiveCommentFromPage): void => {
  const comment: LiveComment = {
    commentId: session.comments.size + 1,
    draftId: commentFrame.draftId,
    page: commentFrame.page,
    pageTitle: readPageTitle(session.currentPlan.plan, commentFrame.page),
    part: commentFrame.part,
    words: commentFrame.words.trim(),
    status: "sent",
  };
  session.comments.set(comment.commentId, comment);
  sendToPages(session, { kind: "comment-saved", comment });
  sendToAgents(session, createCommentForAgent(comment));
};

const readPageFrame = (session: LiveSession, frameString: string): void => {
  touchIdle(session);
  const frame = parseJsonOrNull(frameString);
  const isValidComment = isCommentFrame(frame, session.currentPlan.plan.pages.length);
  if (!isValidComment) {
    console.error({ liveServer: "ignored a page frame that is not a valid comment" });
    return;
  }

  saveComment(session, frame);
};

const openPageSocket = (session: LiveSession, pageSocket: WebSocket): void => {
  session.pageSockets.add(pageSocket);
  sendFrame(pageSocket, { kind: "comments-so-far", comments: [...session.comments.values()] });
  pageSocket.on("message", (frame: RawData) => readPageFrame(session, frame.toString()));
  pageSocket.on("close", () => {
    session.pageSockets.delete(pageSocket);
  });
  pageSocket.on("error", (error) => console.error({ liveServer: "page socket error", error }));
  touchIdle(session);
};

const openAgentSocket = (session: LiveSession, agentSocket: WebSocket): void => {
  session.agentSockets.add(agentSocket);
  agentSocket.on("message", () => touchIdle(session));
  agentSocket.on("close", () => {
    session.agentSockets.delete(agentSocket);
  });
  agentSocket.on("error", (error) => console.error({ liveServer: "agent socket error", error }));
  touchIdle(session);
};

const acceptPageSocket = (session: LiveSession, upgrade: SocketUpgrade): void => {
  const isOriginAllowed = isAllowedPageOrigin(session, upgrade.request.headers.origin);
  if (!isOriginAllowed) {
    rejectUpgrade(upgrade.socket, FORBIDDEN_STATUS_LINE);
    return;
  }

  session.pageServer.handleUpgrade(upgrade.request, upgrade.socket, upgrade.head, (pageSocket) =>
    openPageSocket(session, pageSocket),
  );
};

const acceptAgentSocket = (session: LiveSession, upgrade: SocketUpgrade, url: URL): void => {
  const hasBrowserOrigin = upgrade.request.headers.origin !== undefined;
  const isAgentAllowed = isTokenValid(session.token, url) && !hasBrowserOrigin;
  if (!isAgentAllowed) {
    rejectUpgrade(upgrade.socket, FORBIDDEN_STATUS_LINE);
    return;
  }

  session.agentServer.handleUpgrade(upgrade.request, upgrade.socket, upgrade.head, (agentSocket) =>
    openAgentSocket(session, agentSocket),
  );
};

const routeUpgrade = (session: LiveSession, upgrade: SocketUpgrade): void => {
  const url = readUrl(upgrade.request);
  const isPageSocketPath = url.pathname === "/page";
  const isAgentSocketPath = url.pathname === AGENT_SOCKET_PATH;
  if (isPageSocketPath) {
    acceptPageSocket(session, upgrade);
    return;
  }
  if (isAgentSocketPath) {
    acceptAgentSocket(session, upgrade, url);
    return;
  }
  rejectUpgrade(upgrade.socket, "404 Not Found");
};

const answerCursorPost = async (session: LiveSession, exchange: HttpExchange): Promise<void> => {
  const { request, reply, url } = exchange;
  const hasBrowserOrigin = request.headers.origin !== undefined;
  const isAuthorized = isTokenValid(session.token, url) && !hasBrowserOrigin;
  if (!isAuthorized) {
    sendText(reply, HTTP_FORBIDDEN, "planpage: cursor request refused");
    return;
  }

  const requestString = await readRequestAsString(request);
  const cursorRequest = parseJsonOrNull(requestString);
  if (!isCursorBody(cursorRequest)) {
    sendText(reply, HTTP_BAD_REQUEST, "planpage: cursor body must be a LiveCursorRequest");
    return;
  }

  const { commentId } = cursorRequest;
  const isCommentNamed = commentId !== null;
  const namedComment = isCommentNamed ? session.comments.get(commentId) : undefined;
  const isUnknownComment = isCommentNamed && namedComment === undefined;
  if (isUnknownComment) {
    sendText(reply, HTTP_NOT_FOUND, `planpage: no comment with id ${commentId}`);
    return;
  }

  const isPageFromComment = namedComment !== undefined && cursorRequest.page === null;
  const cursorPage = isPageFromComment ? namedComment.page : cursorRequest.page;
  const cursorPart = isPageFromComment ? namedComment.part : cursorRequest.part;
  const isPageKnown =
    cursorPage !== null && isPageNumberInPlan(cursorPage, session.currentPlan.plan.pages.length);
  if (!isPageKnown) {
    sendText(reply, HTTP_BAD_REQUEST, "planpage: cursor needs a page in the plan or a comment id");
    return;
  }

  if (namedComment !== undefined) setCommentStatus(session, namedComment, "working");
  sendToPages(session, {
    kind: "cursor",
    page: cursorPage,
    part: cursorPart,
    say: cursorRequest.say,
  });
  touchIdle(session);

  const noContentStatusCode = 204;
  reply.writeHead(noContentStatusCode);
  reply.end();
};

const answerDecisionPost = async (session: LiveSession, exchange: HttpExchange): Promise<void> => {
  const { request, reply } = exchange;
  const origin = request.headers.origin;
  const hasForeignOrigin = origin !== undefined && !isAllowedPageOrigin(session, origin);
  if (hasForeignOrigin) {
    sendText(reply, HTTP_FORBIDDEN, "planpage: decision request refused");
    return;
  }

  const decisionString = (await readRequestAsString(request)) || "{}";
  const decisionValue = parseJsonOrNull(decisionString);
  const decision = decisionValue as Decision;
  if (!isJsonObject(decisionValue)) {
    sendText(reply, HTTP_BAD_REQUEST, "planpage: decision body must be a JSON object");
    return;
  }

  writeFileSync(session.serverSettings.decisionPath, decisionString);
  sendToAgents(session, { kind: "decision", decision });
  reply.writeHead(HTTP_OK, { "Content-Type": HTML_CONTENT_TYPE });
  reply.end(
    "<body style='font:16px system-ui;padding:3rem'>Feedback received — return to your terminal.</body>",
    () => shutdown(session, "decision-written"),
  );
};

const answerRequest = async (
  session: LiveSession,
  request: IncomingMessage,
  reply: ServerResponse,
): Promise<void> => {
  const url = readUrl(request);
  const isPageRequest = request.method === "GET" && url.pathname === PAGE_PATH;
  const isCursorRequest = request.method === "POST" && url.pathname === "/cursor";
  const isDecisionRequest = request.method === "POST" && url.pathname === "/decision";
  const exchange: HttpExchange = { request, reply, url };
  try {
    if (isPageRequest) {
      sendHtml(reply, session.currentPlan.html);
      return;
    }
    if (isCursorRequest) {
      await answerCursorPost(session, exchange);
      return;
    }
    if (isDecisionRequest) {
      await answerDecisionPost(session, exchange);
      return;
    }
    sendText(reply, HTTP_NOT_FOUND, "planpage: not found");
  } catch (error) {
    console.error({ liveServer: "request failed", error });
    const serverErrorStatusCode = 500;
    sendText(reply, serverErrorStatusCode, "planpage: server error");
  }
};

const applyReadablePlan = (session: LiveSession, reading: ReadablePlan): void => {
  const difference = findPlanDifference(session.currentPlan.plan, reading.plan);
  session.currentPlan = { plan: reading.plan, html: reading.html };

  const isPlanUnchanged = difference.kind === "changed" && difference.changes.length === 0;
  if (isPlanUnchanged) return;

  const isReshaped = difference.kind === "reshaped";
  if (isReshaped) {
    sendToPages(session, { kind: "plan-reshaped" });
  } else {
    sendToPages(session, {
      kind: "plan-changed",
      html: reading.html,
      changes: difference.changes,
    });
  }
  markWorkingCommentsDone(session);
};

const reloadPlan = async (session: LiveSession): Promise<void> => {
  session.reloads.started += 1;
  const reloadNumber = session.reloads.started;
  const { planPath, pageScript } = session.serverSettings;
  const reading = await readPlanPage(planPath, pageScript);
  const isSuperseded = reloadNumber !== session.reloads.started;
  if (isSuperseded) return;

  touchIdle(session);
  const isPlanBroken = reading.kind === "broken";
  if (isPlanBroken) {
    console.error({
      liveServer: "plan file is not renderable; keeping the last good page",
      error: reading.error,
    });
    sendToAgents(session, { kind: "plan-error", message: describeError(reading.error) });
    return;
  }

  applyReadablePlan(session, reading);
};

const watchPlanFolder = (session: LiveSession): FSWatcher =>
  watch(dirname(session.serverSettings.planPath), (_eventType, changedFileName) => {
    const isPlanFileEvent = changedFileName === session.planFileName;
    if (!isPlanFileEvent) return;

    clearTimeout(session.timers.reload);
    const planReloadDebounceMs = 150;
    session.timers.reload = setTimeout(async () => {
      await reloadPlan(session);
    }, planReloadDebounceMs);
  });

export const startLiveServer = async (
  serverSettings: StartLiveServerSettings,
): Promise<LiveServerHandle> => {
  const firstReading = await readPlanPage(serverSettings.planPath, serverSettings.pageScript);
  const isFirstReadingBroken = firstReading.kind === "broken";
  if (isFirstReadingBroken) {
    throw new Error("planpage: the plan file could not be rendered", { cause: firstReading.error });
  }

  let settleClosed: (exit: LiveServerExit) => void = () => undefined;
  const closed = new Promise<LiveServerExit>((settle) => {
    settleClosed = settle;
  });

  const maxPageFrameBytes = 1024 * 1024;
  const session: LiveSession = {
    token: randomUUID(),
    serverSettings,
    planFileName: basename(serverSettings.planPath),
    currentPlan: { plan: firstReading.plan, html: firstReading.html },
    comments: new Map(),
    pageSockets: new Set(),
    agentSockets: new Set(),
    timers: {},
    reloads: { started: 0 },
    shutdownState: { isClosed: false },
    pageServer: new WebSocketServer({ noServer: true, maxPayload: maxPageFrameBytes }),
    agentServer: new WebSocketServer({ noServer: true }),
    httpServer: createServer(async (request, reply) => {
      await answerRequest(session, request, reply);
    }),
    planWatcher: null,
    settleClosed,
  };

  const { token } = session;
  session.httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    routeUpgrade(session, { request, socket, head });
  });

  const address = await listenWithFallback(session.httpServer, serverSettings.port);
  const planWatcher = watchPlanFolder(session);
  session.planWatcher = planWatcher;
  planWatcher.on("error", (error) => {
    console.error({ liveServer: "plan watcher failed", error });
    shutdown(session, "error");
  });
  session.httpServer.on("error", (error) => {
    console.error({ liveServer: "http server failed", error });
    shutdown(session, "error");
  });
  touchIdle(session);

  const pageUrl = `http://${LOOPBACK_HOST}:${address.port}${PAGE_PATH}`;
  const isOpenRequested = serverSettings.open;
  if (isOpenRequested) openPath(pageUrl);

  return {
    pageUrl,
    agentSocketUrl: `ws://${LOOPBACK_HOST}:${address.port}${AGENT_SOCKET_PATH}?token=${token}`,
    port: address.port,
    token: session.token,
    closed,
    stop: () => shutdown(session, "stopped"),
  };
};
