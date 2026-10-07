import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ORGANIZATION_PERMISSIONS, RequirePermission } from "../../../../common/authorization";
import type { AuthRequest } from "../../../../common/types/auth-request.types";
import { CurrentOrganization } from "../../context/decorators/current-organization.decorator";
import { OrganizationContextGuard } from "../../context/guards/organization-context.guard";
import type { OrganizationContext } from "../../context/types/organization-context.types";
import type { OrganizationInvitation } from "../../organization-invitation/entities/organization-invitation.entity";
import type { OrganizationInvitationStatus } from "../../organization-invitation/enums/organization-invitation-status.enum";
import { OrganizationInvitationService } from "../../organization-invitation/services/invitation.service";
import { OrganizationPermissionGuard } from "../../organization-member/guards/organization-permission.guard";
import {
  CreateOrganizationInvitationSchema,
  OrganizationInvitationQuerySchema,
  type CreateOrganizationInvitationDto,
  type OrganizationInvitationQueryDto,
} from "../dto";

@UseGuards(OrganizationContextGuard, OrganizationPermissionGuard)
@Controller("organizations/current")
export class TeamInvitationController {
  constructor(private readonly invitationService: OrganizationInvitationService) {}

  private toInvitationResponse(invitation: OrganizationInvitation) {
    return {
      id: invitation.id.toString(),
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
      rejectedAt: invitation.rejectedAt ? invitation.rejectedAt.toISOString() : null,
      cancelledAt: invitation.cancelledAt ? invitation.cancelledAt.toISOString() : null,
      createdAt: invitation.createdAt.toISOString(),
      invitedBy: invitation.inviter
        ? {
            id: invitation.inviter.id.toString(),
            name: invitation.inviter.name,
            email: invitation.inviter.email,
          }
        : null,
    };
  }

  /**
   * GET /organizations/current/invitations
   * Invitation history for the current organization, optionally filtered by status.
   * Defaults to pending invitations.
   */
  @Get("invitations")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_VIEW)
  async listInvitations(
    @CurrentOrganization() context: OrganizationContext,
    @Query({ schema: OrganizationInvitationQuerySchema }) query: OrganizationInvitationQueryDto,
  ) {
    const list = await this.invitationService.list(
      context.organizationId,
      (query.status as OrganizationInvitationStatus | undefined) ?? undefined,
    );
    return list.map((inv) => this.toInvitationResponse(inv));
  }

  /**
   * POST /organizations/current/invitations
   * Creates an invitation for the given email + role and sends the invite email.
   */
  @Post("invitations")
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_INVITE)
  async createInvitation(
    @CurrentOrganization() context: OrganizationContext,
    @Req() req: AuthRequest,
    @Body({ schema: CreateOrganizationInvitationSchema }) dto: CreateOrganizationInvitationDto,
  ) {
    const invitation = await this.invitationService.create(
      context.organizationId,
      {
        id: BigInt(req.user.id),
        name: req.user.name,
      },
      dto,
    );
    return this.toInvitationResponse(invitation);
  }

  /**
   * POST /organizations/current/invitations/:invitationId/resend
   * Rotates the token, extends expiry, and resends the invitation email.
   */
  @Post("invitations/:invitationId/resend")
  @HttpCode(HttpStatus.OK)
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_INVITE)
  async resendInvitation(
    @CurrentOrganization() context: OrganizationContext,
    @Param("invitationId") invitationId: string,
  ) {
    const invitation = await this.invitationService.resend(context.organizationId, BigInt(invitationId));
    return this.toInvitationResponse(invitation);
  }

  /**
   * DELETE /organizations/current/invitations/:invitationId
   * Cancels a pending invitation.
   */
  @Delete("invitations/:invitationId")
  @HttpCode(HttpStatus.OK)
  @RequirePermission(ORGANIZATION_PERMISSIONS.MEMBER_REMOVE)
  async cancelInvitation(
    @CurrentOrganization() context: OrganizationContext,
    @Param("invitationId") invitationId: string,
  ) {
    const invitation = await this.invitationService.cancel(context.organizationId, BigInt(invitationId));
    return this.toInvitationResponse(invitation);
  }
}
