import { Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { Public } from "../../../../common/decorators/public.decorator";
import type { AuthRequest } from "../../../../common/types/auth-request.types";
import { OrganizationInvitationService } from "../services/invitation.service";

@Controller("organizations/invitations")
export class OrganizationInvitationTokenController {
  constructor(private readonly invitationService: OrganizationInvitationService) {}

  /**
   * GET /organizations/invitations/:token
   * Public preview of an invitation so the invitee can see what they are joining
   * before signing in.
   */
  @Public()
  @Get(":token")
  async preview(@Param("token") token: string) {
    return await this.invitationService.preview(token);
  }

  /**
   * POST /organizations/invitations/:token/accept
   * Creates the organization membership for the signed-in invitee.
   */
  @Post(":token/accept")
  @HttpCode(HttpStatus.OK)
  async accept(@Param("token") token: string, @Req() req: AuthRequest) {
    return await this.invitationService.accept(token, req.user);
  }

  /**
   * POST /organizations/invitations/:token/reject
   * Marks the invitation as rejected for the signed-in invitee.
   */
  @Post(":token/reject")
  @HttpCode(HttpStatus.OK)
  async reject(@Param("token") token: string, @Req() req: AuthRequest) {
    return await this.invitationService.reject(token, req.user);
  }
}
