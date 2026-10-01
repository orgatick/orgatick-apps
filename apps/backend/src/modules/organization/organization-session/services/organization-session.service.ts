import { ForbiddenException, Injectable } from "@nestjs/common";
import type { Response } from "express";
import { DEFAULT_ROLE_KEYS } from "../../../../common/authorization/roles/default-roles";
import { OrganizationContextCookieService } from "../../context/services/organization-context-cookie.service";
import { OrganizationContextService } from "../../context/services/organization-context.service";
import type { OrganizationScopedRequest } from "../../context/types/organization-context.types";
import type { OrganizationMember } from "../../organization-member/entities/organization-member.entity";
import { OrganizationMemberRepository } from "../../organization-member/repositories/member.repository";
import type { OrganizationListResponse, OrganizationSessionSummary } from "../types/organization-session.types";

const ROLE_PRIORITY: Readonly<Record<string, number>> = {
  [DEFAULT_ROLE_KEYS.OWNER]: 0,
  [DEFAULT_ROLE_KEYS.ADMIN]: 1,
  [DEFAULT_ROLE_KEYS.EVENT_MANAGER]: 2,
  [DEFAULT_ROLE_KEYS.VOLUNTEER]: 3,
};
const UNKNOWN_ROLE_PRIORITY = Number.MAX_SAFE_INTEGER;

@Injectable()
export class OrganizationSessionService {
  constructor(
    private readonly memberRepository: OrganizationMemberRepository,
    private readonly contextService: OrganizationContextService,
    private readonly cookieService: OrganizationContextCookieService,
  ) {}

  async listOrganizations(request: OrganizationScopedRequest, response: Response): Promise<OrganizationListResponse> {
    const userId = BigInt(request.user.id);
    const memberships = await this.memberRepository.findActiveMembershipsByUser(userId);

    const organizations = memberships;

    const currentOrganizationId = await this.resolveCurrentOrganizationId(userId, memberships, request, response);

    return { organizations, currentOrganizationId };
  }

  /**
   * Returns the single currently selected organization, auto-selecting one
   * when the HttpOnly cookie is missing, malformed or stale.
   * Resolves to null only when the user has no active membership at all.
   */
  async getCurrentOrganization(
    request: OrganizationScopedRequest,
    response: Response,
  ): Promise<OrganizationSessionSummary | null> {
    const userId = BigInt(request.user.id);
    const memberships = await this.memberRepository.findActiveMembershipsByUser(userId);

    const currentOrganizationId = await this.resolveCurrentOrganizationId(userId, memberships, request, response);
    if (!currentOrganizationId) return null;

    const membership = memberships.find((item) => item.organizationId.toString() === currentOrganizationId);
    return membership ? this.toSessionSummary(membership) : null;
  }

  async selectOrganization(
    userId: bigint,
    organizationId: bigint,
    response: Response,
  ): Promise<OrganizationSessionSummary> {
    const membership = await this.memberRepository.findActiveMembership(organizationId, userId);
    if (!membership) {
      throw new ForbiddenException("You are not an active member of this organization");
    }

    await this.contextService.warmMembershipCache(userId, organizationId, membership);
    this.cookieService.setOrganizationId(response, organizationId);

    return this.toSessionSummary(membership);
  }

  private toSessionSummary(membership: OrganizationMember): OrganizationSessionSummary {
    return {
      id: String(membership.organizationId),
      name: membership.organization.name,
    };
  }

  /**
   * Resolves the current organization for the session.
   * The HttpOnly cookie always wins when it points at an active membership.
   * When the cookie is missing, malformed or stale, an organization is picked
   * automatically so the session is never left without a current organization.
   */
  private async resolveCurrentOrganizationId(
    userId: bigint,
    memberships: OrganizationMember[],
    request: OrganizationScopedRequest,
    response: Response,
  ): Promise<string | null> {
    const raw = this.cookieService.getOrganizationId(request);
    if (raw) {
      const context = await this.contextService.resolveContext(userId, BigInt(raw));
      if (context) {
        return context.organizationId.toString();
      }

      this.cookieService.clearOrganizationId(response);
    }

    return await this.autoSelectOrganizationId(userId, memberships, response);
  }

  /**
   * Persists an automatically picked organization: highest role first
   * (owner > admin > event_manager > volunteer), then the earliest membership,
   * so the selection stays stable across requests.
   */
  private async autoSelectOrganizationId(
    userId: bigint,
    memberships: OrganizationMember[],
    response: Response,
  ): Promise<string | null> {
    const preferred = memberships.reduce<OrganizationMember | null>((best, current) => {
      if (!best) return current;
      if (this.rolePriority(current) !== this.rolePriority(best)) {
        return this.rolePriority(current) < this.rolePriority(best) ? current : best;
      }
      return current.createdAt < best.createdAt ? current : best;
    }, null);

    if (!preferred) return null;

    const organizationId = BigInt(preferred.organizationId);
    await this.contextService.warmMembershipCache(userId, organizationId, preferred);
    this.cookieService.setOrganizationId(response, organizationId);
    return organizationId.toString();
  }

  private rolePriority(membership: OrganizationMember): number {
    return ROLE_PRIORITY[membership.role?.key ?? ""] ?? UNKNOWN_ROLE_PRIORITY;
  }
}
