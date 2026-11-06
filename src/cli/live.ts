import { request as httpRequest } from "node:http";
import type { LiveCursorRequest } from "../contracts/live";
import { LIVE_CLIENT_SCRIPT } from "../render/clientScript/live";
import {
  type LiveServerExit,
  type LiveServerHandle,
  type StartLiveServerSettings,
  startLiveServer,
} from "../server/liveServer";

const EXIT_FAILED = 1;
const EXIT_ERROR = 2;

export interface LiveStartFlags {
  readonly data?: string;
  readonly decision?: string;
  readonly port: string;
  readonly timeout: string;
  readonly open: boolean;
}

export interface LiveCursorFlags {
  readonly port: string;
  readonly token: string;
  readonly say: string;
  readonly comment?: string;
  readonly page?: string;
  readonly part?: string;
}

interface CursorReply {
  readonly statusCode: number;
  readonly message: string;
}

const describeError = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const readLiveExitCode = (liveExit: LiveServerExit): number => {
  switch (liveExit) {
    case "decision-written":
      return 0;
    case "idle-timeout":
      return 3;
    case "error":
      return EXIT_ERROR;
    case "stopped":
      return EXIT_FAILED;
  }
};

const startLiveHandle = async (
  settings: StartLiveServerSettings,
): Promise<LiveServerHandle | null> => {
  try {
    return await startLiveServer(settings);
  } catch (error) {
    process.stderr.write(`${describeError(error)}\n`);
    return null;
  }
};

export const runLiveCommand = async (flags: LiveStartFlags): Promise<number> => {
  const { data, decision } = flags;
  const isPathsGiven = data != null && decision != null;
  if (!isPathsGiven) {
    process.stderr.write("planpage: live needs --data and --decision\n");
    return EXIT_ERROR;
  }

  const port = Number(flags.port);
  const idleTimeoutSeconds = Number(flags.timeout);
  const isPortUsable = Number.isInteger(port) && port >= 0;
  const isTimeoutUsable = Number.isInteger(idleTimeoutSeconds) && idleTimeoutSeconds > 0;
  if (!isPortUsable || !isTimeoutUsable) {
    process.stderr.write(
      "planpage: --port must be a whole number, --timeout a positive whole number of seconds\n",
    );
    return EXIT_ERROR;
  }

  const handle = await startLiveHandle({
    planPath: data,
    decisionPath: decision,
    pageScript: LIVE_CLIENT_SCRIPT,
    port,
    idleTimeoutSeconds,
    open: flags.open,
  });
  const isStartFailed = handle == null;
  if (isStartFailed) return EXIT_ERROR;

  const connectionDetails = {
    pageUrl: handle.pageUrl,
    agentSocketUrl: handle.agentSocketUrl,
    port: handle.port,
    token: handle.token,
  };
  process.stdout.write(`${JSON.stringify(connectionDetails)}\n`);
  process.stderr.write(`planpage: live plan page is running at ${handle.pageUrl}\n`);

  const stopLiveServer = (): void => handle.stop();
  process.once("SIGINT", stopLiveServer);
  process.once("SIGTERM", stopLiveServer);

  const liveExit = await handle.closed;
  return readLiveExitCode(liveExit);
};

const sendCursorRequest = (
  port: number,
  token: string,
  cursorRequest: LiveCursorRequest,
): Promise<CursorReply> =>
  new Promise((settleReply, failReply) => {
    const requestBody = JSON.stringify(cursorRequest);
    const encodedToken = encodeURIComponent(token);
    // node:http sends no Origin header, which the live server refuses on purpose.
    const clientRequest = httpRequest(
      {
        host: "127.0.0.1",
        port,
        path: `/cursor?token=${encodedToken}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
        },
      },
      (serverReply) => {
        const chunks: Buffer[] = [];
        serverReply.on("data", (chunk: Buffer) => chunks.push(chunk));
        serverReply.on("end", () => {
          const replyMessage = Buffer.concat(chunks).toString("utf8");
          settleReply({ statusCode: serverReply.statusCode ?? 0, message: replyMessage });
        });
      },
    );
    clientRequest.on("error", failReply);
    clientRequest.end(requestBody);
  });

interface CursorTarget {
  readonly commentId: number | null;
  readonly page: number | null;
}

const readCursorTarget = (flags: LiveCursorFlags): CursorTarget => {
  const isCommentGiven = flags.comment != null;
  const isPageGiven = flags.page != null;
  const commentId = isCommentGiven ? Number(flags.comment) : null;
  const page = isPageGiven ? Number(flags.page) : null;
  return { commentId, page };
};

export const runLiveCursorCommand = async (flags: LiveCursorFlags): Promise<number> => {
  const isTargetGiven = flags.comment != null || flags.page != null;
  if (!isTargetGiven) {
    process.stderr.write("planpage: live cursor needs --comment or --page\n");
    return EXIT_ERROR;
  }

  const port = Number(flags.port);
  const { commentId, page } = readCursorTarget(flags);
  const isPortUsable = Number.isInteger(port) && port > 0;
  const isCommentIdUsable = commentId == null || Number.isInteger(commentId);
  const isPageUsable = page == null || Number.isInteger(page);
  const isUsageValid = isPortUsable && isCommentIdUsable && isPageUsable;
  if (!isUsageValid) {
    process.stderr.write("planpage: --port, --comment and --page must be whole numbers\n");
    return EXIT_ERROR;
  }

  const cursorRequest: LiveCursorRequest = {
    commentId,
    page,
    part: flags.part ?? null,
    say: flags.say,
  };
  try {
    const cursorReply = await sendCursorRequest(port, flags.token, cursorRequest);
    const lowestSuccessStatus = 200;
    const lowestRedirectStatus = 300;
    const isReplySuccessful =
      cursorReply.statusCode >= lowestSuccessStatus &&
      cursorReply.statusCode < lowestRedirectStatus;
    if (isReplySuccessful) return 0;

    process.stderr.write(`${cursorReply.message}\n`);
    return EXIT_FAILED;
  } catch (error) {
    process.stderr.write(`planpage: could not reach the live server: ${describeError(error)}\n`);
    return EXIT_FAILED;
  }
};
