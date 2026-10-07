import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ORGANIZATION_PERMISSIONS, RequirePermission } from "../../../../common/authorization";
import type { AuthRequest } from "../../../../common/types/auth-request.types";
import { CurrentOrganization } from "../../context/decorators/current-organization.decorator";
import { OrganizationContextGuard } from "../../context/guards/organization-context.guard";
import type { OrganizationContext } from "../../context/types/organization-context.types";
import { OrganizationPermissionGuard } from "../../organization-member/guards/organization-permission.guard";
import type { OrganizationMemberStatus } from "../../organization-member/enums/organization-member-status.enum";
import { OrganizationMemberService } from "../../organization-member/services/member.service";
import { OrganizationPermissionService } from "../../organization-member/services/organization-permission.service";
import {
  AddOrganizationMemberSchema,
  OrganizationMemberQuerySchema,
  UpdateMemberRoleSchema,
  UpdateMemberStatusSchema,
  type AddOrganizationMemberDto,
  type OrganizationMemberQueryDto,
  type UpdateMemberRoleDto,
  type UpdateMemberStatusDto,
} from "../dto";

@UseGuards(OrganizationContextGuard, OrganizationPermissionGuard)
@Controller("organizations/current")
export class TeamMemberController {
  constructor(
    private readonly memberService: OrganizationMemberService,
    private readonly permissionService: OrganizationPermissionService,
  ) {}

  /**
   * POST /organizations/current/members
   * Directly adds an existing user to the organization by email.
   */
  @Post("members")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_INVITE)
  async addMember(
    @CurrentOrganization() context: OrganizationContext,
    @Body({ schema: AddOrganizationMemberSchema }) dto: AddOrganizationMemberDto,
  ) {
    return await this.memberService.addMemberByEmail(context.organizationId, dto);
  }

  /**
   * GET /organizations/current/members
   * Team member list for the current organization, with optional search/status filter.
   */
  @Get("members")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_VIEW)
  async listMembers(
    @CurrentOrganization() context: OrganizationContext,
    @Query({ schema: OrganizationMemberQuerySchema }) query: OrganizationMemberQueryDto,
  ) {
    return await this.memberService.listMembers(context.organizationId, query);
  }

  /**
   * GET /organizations/current/roles
   * Assignable roles: organization-scoped roles plus the platform defaults.
   */
  @Get("roles")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_VIEW)
  async listRoles(@CurrentOrganization() context: OrganizationContext) {
    return await this.memberService.getAvailableRoles(context.organizationId);
  }

  /**
   * GET /organizations/current/permissions
   * The caller's effective role and permission keys for the current organization.
   */
  @Get("permissions")
  async effectivePermissions(@CurrentOrganization() context: OrganizationContext, @Req() req: AuthRequest) {
    const role = await this.permissionService.getEffectiveRole(BigInt(req.user.id), context.organizationId);
    return {
      role: role ? { id: role.id.toString(), key: role.key, name: role.name } : null,
      permissions: await this.permissionService.getEffectivePermissions(BigInt(req.user.id), context.organizationId),
    };
  }

  /**
   * PATCH /organizations/current/members/:memberId/role
   * Changes a member's role (owner guard rails are enforced in the service).
   */
  @Patch("members/:memberId/role")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_UPDATE)
  async changeRole(
    @CurrentOrganization() context: OrganizationContext,
    @Param("memberId") memberId: string,
    @Body({ schema: UpdateMemberRoleSchema }) dto: UpdateMemberRoleDto,
  ) {
    return await this.memberService.changeRole(context.organizationId, BigInt(memberId), dto.role);
  }

  /**
   * PATCH /organizations/current/members/:memberId/status
   * Suspends (inactive) or restores (active) a member's organization access.
   */
  @Patch("members/:memberId/status")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_UPDATE)
  async changeStatus(
    @CurrentOrganization() context: OrganizationContext,
    @Param("memberId") memberId: string,
    @Body({ schema: UpdateMemberStatusSchema }) dto: UpdateMemberStatusDto,
  ) {
    return await this.memberService.changeStatus(
      context.organizationId,
      BigInt(memberId),
      dto.status as OrganizationMemberStatus,
    );
  }

  /**
   * DELETE /organizations/current/members/:memberId
   * Removes a member from the organization.
   */
  @Delete("members/:memberId")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_REMOVE)
  async removeMember(@CurrentOrganization() context: OrganizationContext, @Param("memberId") memberId: string) {
    return await this.memberService.removeMember(context.organizationId, BigInt(memberId));
  }
}
