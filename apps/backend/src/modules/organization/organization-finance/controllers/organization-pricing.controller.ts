import { Controller, ForbiddenException, Get, Param, Req } from "@nestjs/common";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { PlatformRole } from "@/modules/users/enums/platform-role.enums";
import { OrganizationMemberRepository } from "../../organization-member/repositories/member.repository";
import { OrganizationPricingService } from "../services/pricing.service";

@Controller("organizations/:id/pricing-eligibility")
export class OrganizationPricingController {
  constructor(
    private readonly pricingService: OrganizationPricingService,
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  @Get()
  async getEligibility(@Req() req: AuthRequest, @Param("id") id: string) {
    const orgId = BigInt(id);
    const userId = BigInt(req.user.id);

    // Platform admin can view any org eligibility
    if (req.user.role !== PlatformRole.ADMIN) {
      const membership = await this.memberRepository.findActiveMembership(orgId, userId);
      if (!membership) {
        throw new ForbiddenException("You are not an active member of this organization");
      }
    }

    return this.pricingService.checkEligibility(orgId);
  }
}
