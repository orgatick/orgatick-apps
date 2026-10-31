import { BadRequestException, type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { OrganizationScopedRequest } from "../../organization/context/types/organization-context.types";
import { EntitlementService } from "../services/entitlement.service";
import { REQUIRE_LIMIT_KEY, type RequireLimitOptions } from "./require-limit.decorator";

@Injectable()
export class SubscriptionLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlementService: EntitlementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== "http") return true;

    const options = this.reflector.getAllAndOverride<RequireLimitOptions>(REQUIRE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!options) return true;

    const request = context.switchToHttp().getRequest<OrganizationScopedRequest>();
    const organizationId = request.organizationContext?.organizationId;

    if (!organizationId) {
      throw new BadRequestException("Current organization context required for limit quota check");
    }

    await this.entitlementService.assertLimit(organizationId, options.limitCode, options.requested ?? 1);
    return true;
  }
}
