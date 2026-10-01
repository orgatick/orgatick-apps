import type { RateLimitPolicy } from "../../types/rate-limit.types";
import { RateLimitExtractors } from "../../utils/extractors.util";

export const UPLOAD_RATE_LIMIT_POLICIES = {
  /** File upload limit (10 uploads per 1 minute). */
  fileUpload: {
    limit: 10,
    windowSeconds: 60,
    keyPrefix: "upload",
    extractors: [RateLimitExtractors.userOrIp()],
    message: "Upload rate limit exceeded. Please wait a moment before uploading more files.",
  } satisfies RateLimitPolicy,
} as const;
