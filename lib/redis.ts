import Redis from "ioredis";

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error("Missing REDIS_URL in environment");
    }
    redis = new Redis(redisUrl);
  }
  return redis;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};

export const setMemory = async (key: string, value: string, ttlSeconds?: number) => {
  const client = getRedisClient();
  if (ttlSeconds) {
    await client.set(key, value, "EX", ttlSeconds);
  } else {
    await client.set(key, value);
  }
};

export const getMemory = async (key: string): Promise<string | null> => {
  const client = getRedisClient();
  return await client.get(key);
};

export const deleteMemory = async (key: string) => {
  const client = getRedisClient();
  await client.del(key);
};
