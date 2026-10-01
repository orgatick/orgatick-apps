import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { OrganizationContext, OrganizationScopedRequest } from "../types/organization-context.types";

export const CurrentOrganization = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): OrganizationContext | undefined => {
    const request = ctx.switchToHttp().getRequest<OrganizationScopedRequest>();
    return request.organizationContext;
  },
);
