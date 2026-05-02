import { infer as inferOpenRouter } from "../lib/openrouter";
import { infer as inferVercelAi } from "../lib/vercel-ai";

export const config = {
  runtime: "nodejs",
};

export default async function handler(request: any): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  let payload: { command?: string };
  try {
    const body = request.body;
    payload = typeof body === "string" ? JSON.parse(body) : body || {};
  } catch (error) {
    console.error("Failed to parse JSON body", error);
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const command = payload.command?.trim();
  if (!command) {
    return Response.json({ error: "No command provided" }, { status: 400 });
  }

  let result: string | undefined;
  let lastError: unknown;

  try {
    result = await inferOpenRouter(command);
  } catch (error) {
    lastError = error;
    console.error("OpenRouter failed", error);
  }

  if (!result) {
    try {
      result = await inferVercelAi(command);
    } catch (error) {
      lastError = error;
      console.error("Vercel AI SDK failed", error);
    }
  }

  if (!result) {
    const message =
      lastError instanceof Error ? lastError.message : "Unknown error";
    return Response.json(
      {
        error: "No response from computing model",
        details: message,
      },
      { status: 500 },
    );
  }

  const response = Response.json({ result });

  // Unref all lingering timers/sockets so event loop can drain
  if (global.gc) global.gc();

  return response;
}
