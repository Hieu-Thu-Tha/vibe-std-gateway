import { infer as inferOpenRouter } from "./openrouter";
import { infer as inferVercelAi } from "./vercel-ai";

export async function executeCommand(command: string): Promise<string> {
  let lastError: unknown;

  try {
    const openRouterResult = await inferOpenRouter(command);
    if (openRouterResult) {
      return openRouterResult;
    }
  } catch (error) {
    lastError = error;
    console.error("OpenRouter failed", error);
  }

  try {
    const vercelAiResult = await inferVercelAi(command);
    if (vercelAiResult) {
      return vercelAiResult;
    }
  } catch (error) {
    lastError = error;
    console.error("Vercel AI SDK failed", error);
  }

  const message = lastError instanceof Error ? lastError.message : "Unknown error";
  throw new Error(message);
}
