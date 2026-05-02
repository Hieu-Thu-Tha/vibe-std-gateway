export enum ModelErrorType {
  RateLimit = "RateLimit",
  ServiceUnavailable = "ServiceUnavailable",
  Other = "Other",
}

export const classifyModelError = (error: unknown): ModelErrorType => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("429") ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("ratelimit") ||
      message.includes("quota exceeded")
    ) {
      return ModelErrorType.RateLimit;
    }

    if (
      message.includes("service unavailable") ||
      message.includes("503") ||
      message.includes("temporarily unavailable") ||
      message.includes("unavailable") ||
      message.includes("timeout") ||
      message.includes("bad gateway")
    ) {
      return ModelErrorType.ServiceUnavailable;
    }
  }

  return ModelErrorType.Other;
};
