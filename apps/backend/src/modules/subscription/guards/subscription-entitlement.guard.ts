import { BadRequestException, type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { OrganizationScopedRequest } from "../../organization/context/types/organization-context.types";
import { EntitlementService } from "../services/entitlement.service";
import { REQUIRE_ENTITLEMENT_KEY } from "./require-entitlement.decorator";

@Injectable()
export class SubscriptionEntitlementGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlementService: EntitlementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== "http") return true;

    const featureCode = this.reflector.getAllAndOverride<string>(REQUIRE_ENTITLEMENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!featureCode) return true;

    const request = context.switchToHttp().getRequest<OrganizationScopedRequest>();
    const organizationId = request.organizationContext?.organizationId;

    if (!organizationId) {
      throw new BadRequestException("Current organization context required for entitlement check");
    }

    await this.entitlementService.assertFeature(organizationId, featureCode);
    return true;
  }
}
