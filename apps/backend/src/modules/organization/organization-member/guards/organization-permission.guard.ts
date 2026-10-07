import {
  BadRequestException,
  type CanActivate,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY, type PermissionKey } from "../../../../common/authorization";
import type { OrganizationScopedRequest } from "../../context/types/organization-context.types";
import { OrganizationPermissionService } from "../services/organization-permission.service";

/**
 * Enforces `@RequirePermission(...)` metadata against the caller's effective
 * organization permissions (membership role → role permissions). Requires the
 * request to carry `organizationContext` (set by `OrganizationContextGuard`).
 */
@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionService: OrganizationPermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<string>() !== "http") return true;

    const requiredPermissions = this.reflector.getAllAndOverride<PermissionKey[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    const request = context.switchToHttp().getRequest<OrganizationScopedRequest>();
    if (!request.user) {
      throw new UnauthorizedException("Authentication required");
    }

    const organizationId = request.organizationContext?.organizationId;
    if (!organizationId) {
      throw new BadRequestException("Current organization not selected");
    }

    const permissions = await this.permissionService.getEffectivePermissions(BigInt(request.user.id), organizationId);
    const missing = requiredPermissions.filter((permission) => !permissions.includes(permission));

    if (missing.length > 0) {
      throw new ForbiddenException(`Missing required permission: ${missing.join(", ")}`);
    }

    return true;
  }
}
