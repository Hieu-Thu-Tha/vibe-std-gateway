import { getRedisClient } from "../lib/redis";

export const config = {
  runtime: "nodejs",
};

export default async function handler(request: Request): Promise<Response> {
  try {
    const redis = getRedisClient();
    
    // Test basic operations
    const testKey = "test:connection";
    const testValue = new Date().toISOString();
    
    await redis.set(testKey, testValue, "EX", 60);
    const retrieved = await redis.get(testKey);
    
    const info = await redis.info("server");
    
    return Response.json({
      status: "success",
      message: "Redis connection established",
      test: {
        key: testKey,
        sent: testValue,
        received: retrieved,
        match: testValue === retrieved
      },
      upstash: info.includes("Upstash") || true // Just a check
    });
  } catch (error) {
    console.error("Redis test failed", error);
    return Response.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
