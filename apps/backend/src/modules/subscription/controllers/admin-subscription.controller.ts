import { BadRequestException, Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import {
  CreateEntitlementOverrideRequestSchema,
  CreatePlanSchema,
  type CreateEntitlementOverrideRequest,
  type CreatePlanInput,
} from "@orgatick/contracts";
import { PlatformAdminGuard } from "../../../common/authorization/guards/platform-admin.guard";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { EntitlementService, SubscriptionCatalogService, SubscriptionLifecycleService } from "../services";

@Controller("admin/subscriptions")
@UseGuards(PlatformAdminGuard)
export class AdminSubscriptionController {
  constructor(
    private readonly catalogService: SubscriptionCatalogService,
    private readonly entitlementService: EntitlementService,
    private readonly lifecycleService: SubscriptionLifecycleService,
  ) {}

  @Get("plans")
  async getPlans() {
    return await this.catalogService.listPlans(false);
  }

  @Post("plans")
  async createPlan(@Body({ schema: CreatePlanSchema }) body: CreatePlanInput) {
    return await this.catalogService.createPlan(body);
  }

  @Get("plans/:id")
  async getPlanById(@Param("id") id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException("Invalid plan ID format");
    }
    return await this.catalogService.getPlanById(BigInt(id));
  }

  @Get("features")
  async getFeatures() {
    return await this.catalogService.listFeatures();
  }

  @Get("limits")
  async getLimitDefinitions() {
    return await this.catalogService.listLimitDefinitions();
  }

  @Get("addons")
  async getAddons() {
    return await this.catalogService.listAddons();
  }

  @Get("organizations/:orgId")
  async getOrganizationSubscription(@Param("orgId") orgId: string) {
    if (!/^\d+$/.test(orgId)) {
      throw new BadRequestException("Invalid organization ID format");
    }
    const organizationId = BigInt(orgId);
    const subscription = await this.lifecycleService.getActiveSubscription(organizationId);
    const entitlements = await this.entitlementService.getEffectiveEntitlements(organizationId);
    return {
      subscription,
      entitlements,
    };
  }

  @Post("organizations/:orgId/assign")
  async assignPlan(
    @Param("orgId") orgId: string,
    @Req() req: AuthRequest,
    @Body() body: { planId: string; reason?: string },
  ) {
    if (!/^\d+$/.test(orgId) || !body.planId || !/^\d+$/.test(body.planId)) {
      throw new BadRequestException("Valid numeric orgId and planId are required");
    }
    return await this.lifecycleService.assignPlanDirectly(
      BigInt(orgId),
      BigInt(body.planId),
      BigInt(req.user.id),
      body.reason,
    );
  }

  @Post("organizations/:orgId/overrides")
  async createOverride(
    @Param("orgId") orgId: string,
    @Req() req: AuthRequest,
    @Body({ schema: CreateEntitlementOverrideRequestSchema }) body: CreateEntitlementOverrideRequest,
  ) {
    if (!/^\d+$/.test(orgId)) {
      throw new BadRequestException("Invalid organization ID format");
    }
    return await this.lifecycleService.createEntitlementOverride(BigInt(orgId), body, BigInt(req.user.id));
  }
}
