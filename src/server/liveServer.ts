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
import { type LivePlanData, findPlanDifference } from "./livePlanDiff";

export type LiveServerExit = "decision-written" | "idle-timeout" | "error" | "stopped";

export interface StartLiveServerSettings {
  readonly planPath: string;
  readonly decisionPath: string;
  /** Browser script placed before </body> of every page the server sends. */
  readonly pageScript: string;
  /** 0 lets the OS pick the port; a busy preferred port falls back to an OS pick. */
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
  readonly plan: LivePlanData;
  readonly html: string;
}

interface UnreadablePlan {
  readonly kind: "broken";
  readonly error: unknown;
}

type PlanReading = ReadablePlan | UnreadablePlan;

const LOOPBACK_HOST = "127.0.0.1";
const PAGE_PATH = "/";
const PAGE_SOCKET_PATH = "/page";
const AGENT_SOCKET_PATH = "/agent";
const CURSOR_PATH = "/cursor";
const DECISION_PATH = "/decision";
const PLAN_RELOAD_DEBOUNCE_MS = 150;
const MILLISECONDS_PER_SECOND = 1000;
const MAX_PAGE_FRAME_BYTES = 1024 * 1024;
const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_BAD_REQUEST = 400;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;
const HTTP_SERVER_ERROR = 500;
const FORBIDDEN_STATUS_LINE = "403 Forbidden";
const NOT_FOUND_STATUS_LINE = "404 Not Found";
const DECISION_RECEIVED_HTML =
  "<body style='font:16px system-ui;padding:3rem'>Feedback received — return to your terminal.</body>";

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const isPortBusy = (error: unknown): boolean =>
  error instanceof Error && "code" in error && error.code === "EADDRINUSE";

const injectPageScript = (html: string, pageScript: string): string => {
  const scriptTag = `<script>${pageScript}</script>`;
  return html.replace("</body>", () => `${scriptTag}</body>`);
};

const parseJsonOrNull = (text: string): unknown => {
  try {
    return JSON.parse(text);
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
  reply.writeHead(HTTP_OK, { "Content-Type": "text/html; charset=utf-8" });
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

const readPageTitle = (plan: LivePlanData, pageNumber: number): string => {
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
    const plan = JSON.parse(planString) as LivePlanData;
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

export const startLiveServer = async (
  serverSettings: StartLiveServerSettings,
): Promise<LiveServerHandle> => {
  const firstReading = await readPlanPage(serverSettings.planPath, serverSettings.pageScript);
  if (firstReading.kind === "broken") {
    throw new Error("planpage: the plan file could not be rendered", { cause: firstReading.error });
  }

  const token = randomUUID();
  const planFileName = basename(serverSettings.planPath);
  const latest = { plan: firstReading.plan, html: firstReading.html };
  const comments = new Map<number, LiveComment>();
  const pageSockets = new Set<WebSocket>();
  const agentSockets = new Set<WebSocket>();
  const timers: { idle?: NodeJS.Timeout; reload?: NodeJS.Timeout } = {};
  const reloads = { started: 0 };
  const lifecycle = { isClosed: false };
  let settleClosed: (exit: LiveServerExit) => void = () => undefined;
  const closed = new Promise<LiveServerExit>((settle) => {
    settleClosed = settle;
  });

  const pageServer = new WebSocketServer({ noServer: true, maxPayload: MAX_PAGE_FRAME_BYTES });
  const agentServer = new WebSocketServer({ noServer: true });
  const httpServer = createServer(async (request, reply) => {
    await answerRequest(request, reply);
  });

  const readBoundPort = (): number => (httpServer.address() as AddressInfo).port;

  const isAllowedPageOrigin = (origin: string | undefined): boolean => {
    const port = readBoundPort();
    return origin === `http://127.0.0.1:${port}` || origin === `http://localhost:${port}`;
  };

  const isTokenValid = (url: URL): boolean => url.searchParams.get("token") === token;

  const sendToPages = (message: LiveMessageToPage): void => {
    for (const pageSocket of pageSockets) sendFrame(pageSocket, message);
  };

  const sendToAgents = (message: LiveMessageToAgent): void => {
    for (const agentSocket of agentSockets) sendFrame(agentSocket, message);
  };

  const touchIdle = (): void => {
    clearTimeout(timers.idle);
    timers.idle = setTimeout(() => {
      console.error({ liveServer: "idle timeout" });
      shutdown("idle-timeout");
    }, serverSettings.idleTimeoutSeconds * MILLISECONDS_PER_SECOND);
  };

  const shutdown = (exit: LiveServerExit): void => {
    const isAlreadyClosed = lifecycle.isClosed;
    if (isAlreadyClosed) return;

    lifecycle.isClosed = true;
    clearTimeout(timers.idle);
    clearTimeout(timers.reload);
    planWatcher.close();
    for (const socket of [...pageSockets, ...agentSockets]) socket.close();
    httpServer.closeAllConnections();
    httpServer.close();
    settleClosed(exit);
  };

  const setCommentStatus = (comment: LiveComment, status: LiveCommentStatus): void => {
    comments.set(comment.commentId, { ...comment, status });
    sendToPages({ kind: "comment-status", commentId: comment.commentId, status });
  };

  const markWorkingCommentsDone = (): void => {
    for (const comment of comments.values()) {
      const isWorking = comment.status === "working";
      if (isWorking) setCommentStatus(comment, "done");
    }
  };

  const saveComment = (commentFrame: LiveCommentFromPage): void => {
    const comment: LiveComment = {
      commentId: comments.size + 1,
      draftId: commentFrame.draftId,
      page: commentFrame.page,
      pageTitle: readPageTitle(latest.plan, commentFrame.page),
      part: commentFrame.part,
      words: commentFrame.words.trim(),
      status: "sent",
    };
    comments.set(comment.commentId, comment);
    sendToPages({ kind: "comment-saved", comment });
    sendToAgents(createCommentForAgent(comment));
  };

  const readPageFrame = (frameString: string): void => {
    touchIdle();
    const frame = parseJsonOrNull(frameString);
    const isValidComment = isCommentFrame(frame, latest.plan.pages.length);
    if (!isValidComment) {
      console.error({ liveServer: "ignored a page frame that is not a valid comment" });
      return;
    }

    saveComment(frame);
  };

  const openPageSocket = (pageSocket: WebSocket): void => {
    pageSockets.add(pageSocket);
    sendFrame(pageSocket, { kind: "comments-so-far", comments: [...comments.values()] });
    pageSocket.on("message", (frame: RawData) => readPageFrame(frame.toString()));
    pageSocket.on("close", () => {
      pageSockets.delete(pageSocket);
    });
    pageSocket.on("error", (error) => console.error({ liveServer: "page socket error", error }));
    touchIdle();
  };

  const openAgentSocket = (agentSocket: WebSocket): void => {
    agentSockets.add(agentSocket);
    agentSocket.on("message", () => touchIdle());
    agentSocket.on("close", () => {
      agentSockets.delete(agentSocket);
    });
    agentSocket.on("error", (error) => console.error({ liveServer: "agent socket error", error }));
    touchIdle();
  };

  const acceptPageSocket = (request: IncomingMessage, socket: Duplex, head: Buffer): void => {
    const isOriginAllowed = isAllowedPageOrigin(request.headers.origin);
    if (!isOriginAllowed) {
      rejectUpgrade(socket, FORBIDDEN_STATUS_LINE);
      return;
    }

    pageServer.handleUpgrade(request, socket, head, openPageSocket);
  };

  const acceptAgentSocket = (
    request: IncomingMessage,
    url: URL,
    socket: Duplex,
    head: Buffer,
  ): void => {
    const hasBrowserOrigin = request.headers.origin !== undefined;
    const isAgentAllowed = isTokenValid(url) && !hasBrowserOrigin;
    if (!isAgentAllowed) {
      rejectUpgrade(socket, FORBIDDEN_STATUS_LINE);
      return;
    }

    agentServer.handleUpgrade(request, socket, head, openAgentSocket);
  };

  const answerCursorPost = async (
    request: IncomingMessage,
    reply: ServerResponse,
    url: URL,
  ): Promise<void> => {
    const hasBrowserOrigin = request.headers.origin !== undefined;
    const isAuthorized = isTokenValid(url) && !hasBrowserOrigin;
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
    const namedComment = isCommentNamed ? comments.get(commentId) : undefined;
    const isUnknownComment = isCommentNamed && namedComment === undefined;
    if (isUnknownComment) {
      sendText(reply, HTTP_NOT_FOUND, `planpage: no comment with id ${commentId}`);
      return;
    }

    const isPageFromComment = namedComment !== undefined && cursorRequest.page === null;
    const cursorPage = isPageFromComment ? namedComment.page : cursorRequest.page;
    const cursorPart = isPageFromComment ? namedComment.part : cursorRequest.part;
    const isPageKnown =
      cursorPage !== null && isPageNumberInPlan(cursorPage, latest.plan.pages.length);
    if (!isPageKnown) {
      sendText(
        reply,
        HTTP_BAD_REQUEST,
        "planpage: cursor needs a page in the plan or a comment id",
      );
      return;
    }

    if (namedComment !== undefined) setCommentStatus(namedComment, "working");
    sendToPages({ kind: "cursor", page: cursorPage, part: cursorPart, say: cursorRequest.say });
    touchIdle();
    reply.writeHead(HTTP_NO_CONTENT);
    reply.end();
  };

  const answerDecisionPost = async (
    request: IncomingMessage,
    reply: ServerResponse,
  ): Promise<void> => {
    const origin = request.headers.origin;
    const hasForeignOrigin = origin !== undefined && !isAllowedPageOrigin(origin);
    if (hasForeignOrigin) {
      sendText(reply, HTTP_FORBIDDEN, "planpage: decision request refused");
      return;
    }

    const decisionString = (await readRequestAsString(request)) || "{}";
    const decisionValue = parseJsonOrNull(decisionString);
    if (!isJsonObject(decisionValue)) {
      sendText(reply, HTTP_BAD_REQUEST, "planpage: decision body must be a JSON object");
      return;
    }

    const decision = decisionValue as Decision;
    writeFileSync(serverSettings.decisionPath, decisionString);
    sendToAgents({ kind: "decision", decision });
    reply.writeHead(HTTP_OK, { "Content-Type": "text/html; charset=utf-8" });
    reply.end(DECISION_RECEIVED_HTML, () => shutdown("decision-written"));
  };

  const answerRequest = async (request: IncomingMessage, reply: ServerResponse): Promise<void> => {
    const url = readUrl(request);
    const isPageRequest = request.method === "GET" && url.pathname === PAGE_PATH;
    const isCursorRequest = request.method === "POST" && url.pathname === CURSOR_PATH;
    const isDecisionRequest = request.method === "POST" && url.pathname === DECISION_PATH;
    try {
      if (isPageRequest) {
        sendHtml(reply, latest.html);
        return;
      }
      if (isCursorRequest) {
        await answerCursorPost(request, reply, url);
        return;
      }
      if (isDecisionRequest) {
        await answerDecisionPost(request, reply);
        return;
      }
      sendText(reply, HTTP_NOT_FOUND, "planpage: not found");
    } catch (error) {
      console.error({ liveServer: "request failed", error });
      sendText(reply, HTTP_SERVER_ERROR, "planpage: server error");
    }
  };

  const applyReadablePlan = (reading: ReadablePlan): void => {
    const difference = findPlanDifference(latest.plan, reading.plan);
    latest.plan = reading.plan;
    latest.html = reading.html;

    const isPlanUnchanged = difference.kind === "changed" && difference.changes.length === 0;
    if (isPlanUnchanged) return;

    const isReshaped = difference.kind === "reshaped";
    if (isReshaped) {
      sendToPages({ kind: "plan-reshaped" });
    } else {
      sendToPages({ kind: "plan-changed", html: reading.html, changes: difference.changes });
    }
    markWorkingCommentsDone();
  };

  const reloadPlan = async (): Promise<void> => {
    reloads.started += 1;
    const reloadNumber = reloads.started;
    const reading = await readPlanPage(serverSettings.planPath, serverSettings.pageScript);
    const isSuperseded = reloadNumber !== reloads.started;
    if (isSuperseded) return;

    touchIdle();
    if (reading.kind === "broken") {
      console.error({
        liveServer: "plan file is not renderable; keeping the last good page",
        error: reading.error,
      });
      sendToAgents({ kind: "plan-error", message: describeError(reading.error) });
      return;
    }

    applyReadablePlan(reading);
  };

  const watchPlanFolder = (): FSWatcher =>
    watch(dirname(serverSettings.planPath), (_eventType, changedFileName) => {
      const isPlanFileEvent = changedFileName === planFileName;
      if (!isPlanFileEvent) return;

      clearTimeout(timers.reload);
      timers.reload = setTimeout(async () => {
        await reloadPlan();
      }, PLAN_RELOAD_DEBOUNCE_MS);
    });

  httpServer.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = readUrl(request);
    const isPageSocketPath = url.pathname === PAGE_SOCKET_PATH;
    const isAgentSocketPath = url.pathname === AGENT_SOCKET_PATH;
    if (isPageSocketPath) {
      acceptPageSocket(request, socket, head);
      return;
    }
    if (isAgentSocketPath) {
      acceptAgentSocket(request, url, socket, head);
      return;
    }
    rejectUpgrade(socket, NOT_FOUND_STATUS_LINE);
  });

  const address = await listenWithFallback(httpServer, serverSettings.port);
  const planWatcher = watchPlanFolder();
  planWatcher.on("error", (error) => {
    console.error({ liveServer: "plan watcher failed", error });
    shutdown("error");
  });
  httpServer.on("error", (error) => {
    console.error({ liveServer: "http server failed", error });
    shutdown("error");
  });
  touchIdle();

  const pageUrl = `http://${LOOPBACK_HOST}:${address.port}${PAGE_PATH}`;
  if (serverSettings.open) openPath(pageUrl);

  return {
    pageUrl,
    agentSocketUrl: `ws://${LOOPBACK_HOST}:${address.port}${AGENT_SOCKET_PATH}?token=${token}`,
    port: address.port,
    token,
    closed,
    stop: () => shutdown("stopped"),
  };
};
