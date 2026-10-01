import { type CanActivate, type ExecutionContext, Inject, Injectable, Optional } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import {
  RATE_LIMIT_METADATA,
  RATE_LIMIT_MODULE_OPTIONS,
  SKIP_RATE_LIMIT_METADATA,
} from "../constants/rate-limit.constants";
import { RATE_LIMIT_POLICIES } from "../constants/rate-limit.policies";
import { RateLimitExceededException } from "../exceptions/rate-limit-exceeded.exception";
import { RateLimitService } from "../services/rate-limit.service";
import type { RateLimitModuleOptions, RateLimitPolicy } from "../types/rate-limit.types";
import { RateLimitExtractors } from "../utils/extractors.util";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly defaultGlobalPolicy: RateLimitPolicy;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly rateLimitService: RateLimitService,
    @Optional()
    @Inject(RATE_LIMIT_MODULE_OPTIONS)
    options?: RateLimitModuleOptions,
  ) {
    this.defaultGlobalPolicy = options?.globalPolicy ?? RATE_LIMIT_POLICIES.global;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.configService.get<string>("NODE_ENV") === "development") {
      return true;
    }

    // 1. Check for SkipRateLimit decorator on handler or class
    const isSkipped = this.reflector.getAllAndOverride<boolean>(SKIP_RATE_LIMIT_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipped) {
      return true;
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // 2. Fetch route-specific policies
    const routePolicies = this.reflector.getAllAndOverride<RateLimitPolicy[]>(RATE_LIMIT_METADATA, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Build list of policies to evaluate. If route policies exist, evaluate them.
    // Also always evaluate the global policy for general DDoS/burst protection.
    const policiesToEvaluate: RateLimitPolicy[] = [];
    if (routePolicies && routePolicies.length > 0) {
      policiesToEvaluate.push(...routePolicies);
    } else if (this.defaultGlobalPolicy) {
      policiesToEvaluate.push(this.defaultGlobalPolicy);
    }

    let lowestRemaining = Number.MAX_SAFE_INTEGER;
    let minLimit = Number.MAX_SAFE_INTEGER;
    let maxResetAfter = 0;

    // 3. Evaluate each policy
    for (const policy of policiesToEvaluate) {
      const extractors =
        policy.extractors && policy.extractors.length > 0 ? policy.extractors : [RateLimitExtractors.userOrIp()];

      for (const extractor of extractors) {
        const identifier = await extractor(request);
        if (!identifier) {
          // Extractor not applicable for this request (e.g. no email in body)
          continue;
        }

        const result = await this.rateLimitService.consume(identifier, policy);

        lowestRemaining = Math.min(lowestRemaining, result.remaining);
        minLimit = Math.min(minLimit, result.limit);
        maxResetAfter = Math.max(maxResetAfter, result.resetAfter);

        if (!result.allowed) {
          this.setHeaders(response, minLimit, 0, result.resetAfter, result.retryAfter);
          throw new RateLimitExceededException(
            result.retryAfter,
            result.message ?? "Too many requests. Please try again later.",
          );
        }
      }
    }

    // 4. Set rate limit telemetry headers on allowed responses
    if (minLimit !== Number.MAX_SAFE_INTEGER) {
      this.setHeaders(response, minLimit, lowestRemaining, maxResetAfter);
    }

    return true;
  }

  private setHeaders(res: Response, limit: number, remaining: number, resetAfter: number, retryAfter?: number): void {
    if (typeof res.setHeader === "function") {
      res.setHeader("X-RateLimit-Limit", limit.toString());
      res.setHeader("X-RateLimit-Remaining", remaining.toString());
      res.setHeader("X-RateLimit-Reset", resetAfter.toString());
      if (retryAfter !== undefined && retryAfter > 0) {
        res.setHeader("Retry-After", Math.ceil(retryAfter).toString());
      }
    }
  }
}
