import type { Request } from "express";

export type KeyExtractor = (req: Request) => string | null | undefined | Promise<string | null | undefined>;

export interface RateLimitPolicy {
  /** Maximum burst capacity / number of allowed tokens in the bucket. */
  limit: number;

  /** Time window in seconds over which tokens are refilled. */
  windowSeconds: number;

  /** Unique prefix/scope for this policy in Redis (e.g. 'global', 'login', 'register:account'). */
  keyPrefix: string;

  /** Key extractors used to construct the rate limit key.
   * If omitted, defaults to client IP (or IP + User ID for authenticated sessions).
   */
  extractors?: KeyExtractor[];

  /** Number of tokens consumed per request (default: 1). */
  cost?: number;

  /**
   * Whether to allow the request through if Redis fails or times out.
   * Default: true (high availability, fail-open).
   */
  failOpen?: boolean;

  /** Custom error message returned when limit is breached. */
  message?: string;

  /** Optional custom TTL multiplier (default: 2 * windowSeconds, minimum 60s). */
  ttlSeconds?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
  resetAfter: number;
  key: string;
  policyPrefix: string;
  message?: string;
}

export interface RateLimitModuleOptions {
  /** Default global rate limit policy applied to all routes (unless decorated with @SkipRateLimit or route-specific limit). */
  globalPolicy?: RateLimitPolicy;

  /** Global fail-open strategy for Redis outages (default: true). */
  defaultFailOpen?: boolean;

  /** Global key prefix in Redis (default: 'rate_limit'). */
  redisKeyPrefix?: string;

  /** Whether the application is behind Cloudflare or a reverse proxy. */
  trustProxy?: boolean;
}
