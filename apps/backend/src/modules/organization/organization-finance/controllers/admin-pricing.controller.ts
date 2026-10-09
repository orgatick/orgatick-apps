import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { PlatformAdminGuard } from "@/common/authorization";
import type { AuthRequest } from "@/common/types/auth-request.types";
import { UpdateOrganizationPricingControlSchema, type UpdateOrganizationPricingControlDto } from "@orgatick/contracts";
import { OrganizationPricingService } from "../services/pricing.service";

@UseGuards(PlatformAdminGuard)
@Controller("admin/organizations/:id/pricing")
export class AdminPricingController {
  constructor(private readonly pricingService: OrganizationPricingService) {}

  @Get()
  async getPricing(@Param("id") id: string) {
    const orgId = BigInt(id);
    const [setting, eligibility] = await Promise.all([
      this.pricingService.getPricingSetting(orgId),
      this.pricingService.checkEligibility(orgId),
    ]);

    return {
      setting: {
        organizationId: String(setting.organizationId),
        paidEventsEnabled: setting.paidEventsEnabled,
        requireBankDetails: setting.requireBankDetails,
        disabledReason: setting.disabledReason ?? null,
        updatedBy: setting.updatedBy ? String(setting.updatedBy) : null,
        createdAt: setting.createdAt.toISOString(),
        updatedAt: setting.updatedAt.toISOString(),
      },
      eligibility,
    };
  }

  @Patch()
  async updatePricing(
    @Req() req: AuthRequest,
    @Param("id") id: string,
    @Body({ schema: UpdateOrganizationPricingControlSchema })
    dto: UpdateOrganizationPricingControlDto,
  ) {
    const orgId = BigInt(id);
    const actor = req.user ? { id: BigInt(req.user.id), name: req.user.name } : null;

    const setting = await this.pricingService.updatePricingSetting(orgId, dto, actor);
    const eligibility = await this.pricingService.checkEligibility(orgId);

    return {
      setting: {
        organizationId: String(setting.organizationId),
        paidEventsEnabled: setting.paidEventsEnabled,
        requireBankDetails: setting.requireBankDetails,
        disabledReason: setting.disabledReason ?? null,
        updatedBy: setting.updatedBy ? String(setting.updatedBy) : null,
        createdAt: setting.createdAt.toISOString(),
        updatedAt: setting.updatedAt.toISOString(),
      },
      eligibility,
    };
  }
}
