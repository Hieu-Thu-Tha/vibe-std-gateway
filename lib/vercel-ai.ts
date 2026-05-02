import { createGateway, gateway, generateText } from "ai";
import { classifyModelError, ModelErrorType } from "./utils";
import {
  getAndRefreshQuarantinedModels,
  quarantineModel,
} from "./model-analytics";

function getConfig() {
  const apiKey =
    process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_API_KEY || "";

  if (!apiKey) {
    throw new Error("No API key found for Vercel AI Gateway.");
  }
  console.log("Using Vercel AI API key:", apiKey.slice(0, 8) + "****");

  const models = (process.env.VERCEL_AI_MODELS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const systemVibe = process.env.SYSTEM_VIBE || "";
  const allowDiscovery =
    (process.env.VERCEL_AI_DISCOVER_MODELS || "").toLowerCase() === "true";

  if (models.length === 0 && !allowDiscovery) {
    throw new Error(
      "No models specified in environment variable VERCEL_AI_MODELS",
    );
  }
  if (!systemVibe) {
    throw new Error("No system vibe specified in env");
  }

  return { apiKey, models, systemVibe, allowDiscovery };
}

export const infer = async (message: string): Promise<string | undefined> => {
  const { apiKey, models, systemVibe, allowDiscovery } = getConfig();
  const provider = apiKey ? createGateway({ apiKey }) : gateway;
  let modelList = models.length
    ? models
    : allowDiscovery
      ? await discoverModels(provider)
      : [];

  const quarantinedModels = await getAndRefreshQuarantinedModels();
  modelList = modelList.filter((model) => !quarantinedModels.has(model));

  if (modelList.length === 0) {
    throw new Error("No Vercel AI Gateway models available");
  }

  for (const currModel of modelList) {
    try {
      console.log(`Trying Vercel AI model ${currModel}...`);
      const { text } = await generateText({
        model: provider(currModel),
        system: systemVibe,
        prompt: message,
      });

      if (!text) {
        throw new Error("No response text received");
      }

      return text;
    } catch (error) {
      console.error(`Vercel AI model ${currModel} failed`, error);
      const errType = classifyModelError(error);
      if (
        errType === ModelErrorType.RateLimit ||
        errType === ModelErrorType.ServiceUnavailable
      ) {
        console.warn(
          `quarantining Vercel AI model ${currModel} due to ${errType} error`,
        );
        await quarantineModel(currModel);
      }
    }
  }

  throw new Error("All Vercel AI models failed");
};

export async function discoverModels(
  provider: typeof gateway,
): Promise<string[]> {
  const availableModels = await provider.getAvailableModels();
  return availableModels.models.map((model) => model.id).filter(Boolean);
}
