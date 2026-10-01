import {
  BadRequestException,
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import { OrganizationContextCookieService } from "../services/organization-context-cookie.service";
import { OrganizationContextService } from "../services/organization-context.service";
import type { OrganizationScopedRequest } from "../types/organization-context.types";

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

    const organizationIdRaw = this.cookieService.getOrganizationId(request);
    if (!organizationIdRaw) {
      throw new BadRequestException("Current organization not selected");
    }

    const organizationId = BigInt(organizationIdRaw);
    const organizationContext = await this.contextService.resolveContext(BigInt(request.user.id), organizationId);

    if (!organizationContext) {
      this.cookieService.clearOrganizationId(response);
      throw new ForbiddenException("You are not an active member of this organization");
    }

    request.organizationContext = organizationContext;
    return true;
  }
}
