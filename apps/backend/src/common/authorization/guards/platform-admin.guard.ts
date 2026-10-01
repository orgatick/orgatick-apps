import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { AuthRequest } from "../../types/auth-request.types";
import { PlatformRole } from "../../../modules/users/enums/platform-role.enums";

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (!request.user || request.user.role !== PlatformRole.ADMIN) {
      throw new ForbiddenException("Platform admin access required");
    }
    return true;
  }
}
