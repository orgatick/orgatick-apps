import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import type { Response } from "express";
import type { OrganizationScopedRequest } from "../../context/types/organization-context.types";
import { SelectOrganizationSchema, type SelectOrganizationDto } from "../dto/select-organization.dto";
import { OrganizationSessionService } from "../services/organization-session.service";

@Controller("session")
export class OrganizationSessionController {
  constructor(private readonly sessionService: OrganizationSessionService) {}

  /**
   * GET /session/organizations
   * Lists the organizations the authenticated user actively belongs to,
   * together with the currently selected organization (from the HttpOnly cookie).
   */
  @Get("organizations")
  async listOrganizations(@Req() request: OrganizationScopedRequest, @Res({ passthrough: true }) response: Response) {
    return await this.sessionService.listOrganizations(request, response);
  }

  /**
   * POST /session/organization
   * Switches the current organization and stores it in an HttpOnly cookie.
   */
  @Post("organization")
  @HttpCode(HttpStatus.OK)
  async selectOrganization(
    @Req() request: OrganizationScopedRequest,
    @Body({ schema: SelectOrganizationSchema }) dto: SelectOrganizationDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.sessionService.selectOrganization(BigInt(request.user.id), BigInt(dto.organizationId), response);
  }

  /**
   * GET /session/organization
   * Returns the single currently selected organization. When the HttpOnly cookie
   * is missing, malformed or stale, an organization is auto-selected
   * (highest role first, then earliest membership) and persisted in the cookie.
   * Responds with null when the user has no active membership.
   */
  @Get("organization")
  async getCurrentOrganization(
    @Req() request: OrganizationScopedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    return await this.sessionService.getCurrentOrganization(request, response);
  }
}
