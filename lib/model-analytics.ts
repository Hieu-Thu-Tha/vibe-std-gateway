import { getRedisClient } from "../lib/redis";

export const QUARANTINE_KEY = "models:quarantine";

interface QuarantinedModel {
  modelName: string;
  expiresAt: number;
}

export const quarantineModel = async (model: string) => {
  if (!process.env.REDIS_URL) return; // Skip if Redis not configured
  const payload: QuarantinedModel = {
    modelName: model,
    expiresAt: Date.now() + Number(process.env.MODEL_QUARANTINE_MS) || 120_000,
  };
  await getRedisClient().sadd(QUARANTINE_KEY, JSON.stringify(payload));
};

export const getAndRefreshQuarantinedModels = async (): Promise<
  Map<string, QuarantinedModel>
> => {
  if (!process.env.REDIS_URL) return new Map(); // Skip if Redis not configured
  
  const members = await getRedisClient().smembers(QUARANTINE_KEY);
  const now = Date.now();
  const stillLockedModels: Map<string, QuarantinedModel> = new Map();
  const pipeline = getRedisClient().pipeline();

  for (const member of members) {
    const payload: QuarantinedModel = JSON.parse(member);
    if (payload.expiresAt > now) {
      stillLockedModels.set(payload.modelName, payload);
    } else {
      pipeline.srem(QUARANTINE_KEY, member);
    }
  }

  await pipeline.exec();
  return stillLockedModels;
};
