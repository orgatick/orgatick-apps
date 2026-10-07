import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { OrganizationContextCookieService } from "../services/organization-context-cookie.service";
import { OrganizationContextService } from "../services/organization-context.service";
import type { OrganizationContext, OrganizationScopedRequest } from "../types/organization-context.types";

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  constructor(
    private readonly contextService: OrganizationContextService,
    private readonly cookieService: OrganizationContextCookieService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OrganizationScopedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    if (!request.user) {
      throw new UnauthorizedException("Authentication required");
    }

    const userId = BigInt(request.user.id);
    const organizationIdRaw = this.cookieService.getOrganizationId(request);

    let organizationContext: OrganizationContext | null = null;

    if (organizationIdRaw) {
      const organizationId = BigInt(organizationIdRaw);
      organizationContext = await this.contextService.resolveContext(userId, organizationId);
      if (!organizationContext) {
        this.cookieService.clearOrganizationId(response);
      }
    }

    // Auto-select default active organization when cookie is missing or invalid
    if (!organizationContext) {
      const defaultResolved = await this.contextService.resolveDefaultContext(userId);
      if (defaultResolved) {
        organizationContext = defaultResolved.context;
        this.cookieService.setOrganizationId(response, defaultResolved.organizationId);
      }
    }

    if (!organizationContext) {
      throw new BadRequestException("Current organization not selected");
    }

    request.organizationContext = organizationContext;
    return true;
  }
}
