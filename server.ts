import "dotenv/config";

import { createServer } from "node:http";
import { executeCommand } from "./lib/execute-command";

const port = Number(process.env.PORT || 3000);

function sendJson(
  response: import("node:http").ServerResponse,
  statusCode: number,
  body: unknown,
) {
  const payload = JSON.stringify(body);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  response.end(payload);
}

async function readRequestBody(request: import("node:http").IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/health" && request.method === "GET") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.url === "/api/execute" && request.method === "POST") {
      const payload = (await readRequestBody(request)) as { command?: string };
      const command = payload.command?.trim();

      if (!command) {
        sendJson(response, 400, { error: "No command provided" });
        return;
      }

      const result = await executeCommand(command);
      sendJson(response, 200, { result });
      return;
    }

    sendJson(response, 404, { error: "Not Found" });
  } catch (error) {
    console.error("Request failed", error);
    sendJson(response, 500, {
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
