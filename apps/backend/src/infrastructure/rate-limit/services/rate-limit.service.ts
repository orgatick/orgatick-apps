import { Inject, Injectable, Logger, Optional } from "@nestjs/common";
import type Redis from "ioredis";
import { REDIS_CLIENT } from "../../redis/redis.constants";
import { DEFAULT_REDIS_KEY_PREFIX, RATE_LIMIT_MODULE_OPTIONS } from "../constants/rate-limit.constants";
import { TOKEN_BUCKET_LUA_SCRIPT } from "../scripts/token-bucket.lua";
import type { RateLimitModuleOptions, RateLimitPolicy, RateLimitResult } from "../types/rate-limit.types";

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);
  private readonly prefix: string;
  private readonly defaultFailOpen: boolean;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @Optional()
    @Inject(RATE_LIMIT_MODULE_OPTIONS)
    options?: RateLimitModuleOptions,
  ) {
    this.prefix = options?.redisKeyPrefix ?? DEFAULT_REDIS_KEY_PREFIX;
    this.defaultFailOpen = options?.defaultFailOpen ?? true;
  }

  /** Atomically consumes tokens from the Token Bucket in Redis. */
  async consume(keyIdentifier: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
    const fullKey = `${this.prefix}:${policy.keyPrefix}:${keyIdentifier}`;
    const cost = policy.cost ?? 1;
    const windowMs = policy.windowSeconds * 1000;
    const refillRatePerMs = policy.limit / windowMs;
    const ttlSeconds = policy.ttlSeconds ?? Math.max(Math.ceil(policy.windowSeconds * 2), 60);
    const failOpen = policy.failOpen ?? this.defaultFailOpen;

    try {
      const rawResult = await this.redis.eval(
        TOKEN_BUCKET_LUA_SCRIPT,
        1,
        fullKey,
        policy.limit.toString(),
        refillRatePerMs.toString(),
        cost.toString(),
        ttlSeconds.toString(),
      );
      const result = rawResult as [number, number, number, number];

      const allowed = result[0] === 1;
      const remaining = Number(result[1]);
      const retryAfter = Number(result[2]);
      const resetAfter = Number(result[3]);

      return {
        allowed,
        limit: policy.limit,
        remaining,
        retryAfter,
        resetAfter,
        key: fullKey,
        policyPrefix: policy.keyPrefix,
        message: policy.message,
      };
    } catch (error) {
      this.logger.error(
        `Redis rate limit execution failed for key "${fullKey}". Fail-open: ${failOpen}. Error: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );

      if (failOpen) {
        return {
          allowed: true,
          limit: policy.limit,
          remaining: Math.max(0, policy.limit - cost),
          retryAfter: 0,
          resetAfter: 0,
          key: fullKey,
          policyPrefix: policy.keyPrefix,
        };
      }

      return {
        allowed: false,
        limit: policy.limit,
        remaining: 0,
        retryAfter: policy.windowSeconds,
        resetAfter: policy.windowSeconds,
        key: fullKey,
        policyPrefix: policy.keyPrefix,
        message: "Rate limit service temporarily unavailable.",
      };
    }
  }

  /** Clears a specific rate limit key (e.g. after successful authentication or administrative action). */
  async reset(keyIdentifier: string, policyPrefix: string): Promise<void> {
    const fullKey = `${this.prefix}:${policyPrefix}:${keyIdentifier}`;
    try {
      await this.redis.del(fullKey);
    } catch (error) {
      this.logger.warn(
        `Failed to delete rate limit key "${fullKey}": ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
