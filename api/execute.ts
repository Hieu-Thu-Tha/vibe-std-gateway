import { executeCommand } from "../lib/execute-command";

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

  try {
    const result = await executeCommand(command);
    return Response.json({ result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      {
        error: "No response from computing model",
        details: message,
      },
      { status: 500 },
    );
  }
}
