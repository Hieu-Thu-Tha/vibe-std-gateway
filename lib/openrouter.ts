import { OpenRouter } from "@openrouter/sdk";
import * as https from "https";
import { ModelErrorType, classifyModelError } from "./utils";
import {
  quarantineModel,
  getAndRefreshQuarantinedModels,
} from "./model-analytics";

function getConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const freeModels = (process.env.OPENROUTER_FREE_MODELS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  const systemVibe = process.env.SYSTEM_VIBE || "";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in environment");
  }
  if (freeModels.length === 0) {
    throw new Error(
      "No free models specified in environment variable OPENROUTER_FREE_MODELS",
    );
  }
  if (!systemVibe) {
    throw new Error("No system vibe specified in env");
  }

  return { apiKey, freeModels, systemVibe };
}

// Stream the response to get reasoning tokens in usage
export const infer = async (message: string): Promise<string | undefined> => {
  const { apiKey, freeModels, systemVibe } = getConfig();
  // Create fresh instance per request to avoid connection pooling across invocations
  const openrouter = new OpenRouter({
    apiKey,
  });

  const quarantinedModels = await getAndRefreshQuarantinedModels();
  const availableModels = freeModels.filter(
    (model) => !quarantinedModels.has(model),
  );

  if (availableModels.length === 0) {
    throw new Error("No OpenRouter models available");
  }

  for (const currModel of availableModels) {
    try {
      console.log(`Trying model ${currModel}...`);
      const response = await openrouter.chat.send({
        chatRequest: {
          model: currModel,
          messages: [
            {
              role: "system",
              content: systemVibe,
            },
            {
              role: "user",
              content: message,
            },
          ],
        },
      });

      const responseMsg = response.choices[0].message.content;
      console.log(`Model ${currModel} responded with:`, responseMsg);
      if (!responseMsg) {
        throw new Error("No response message received");
      }

      return responseMsg;
    } catch (error) {
      console.error(`Model ${currModel} failed`, error);
      const errType = classifyModelError(error);
      if (
        errType === ModelErrorType.RateLimit ||
        errType === ModelErrorType.ServiceUnavailable
      ) {
        console.warn(
          `quarantining OpenRouter model ${currModel} due to ${errType} error`,
        );
        await quarantineModel(currModel);
      }
    }
  }

  throw new Error("All OpenRouter models failed");
};
