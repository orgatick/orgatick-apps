import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import {
  CancelSubscriptionRequestSchema,
  PurchaseAddonRequestSchema,
  ScheduleDowngradeRequestSchema,
  UpgradeSubscriptionRequestSchema,
  type CancelSubscriptionRequest,
  type PurchaseAddonRequest,
  type ScheduleDowngradeRequest,
  type UpgradeSubscriptionRequest,
} from "@orgatick/contracts";
import type { AuthRequest } from "../../../common/types/auth-request.types";
import { CurrentOrganization } from "../../organization/context/decorators/current-organization.decorator";
import { OrganizationContextGuard } from "../../organization/context/guards/organization-context.guard";
import type { OrganizationContext } from "../../organization/context/types/organization-context.types";
import { EntitlementService, SubscriptionCatalogService, SubscriptionLifecycleService } from "../services";

@Controller("organizations/current/subscription")
@UseGuards(OrganizationContextGuard)
export class OrganizationSubscriptionController {
  constructor(
    private readonly catalogService: SubscriptionCatalogService,
    private readonly entitlementService: EntitlementService,
    private readonly lifecycleService: SubscriptionLifecycleService,
  ) {}

  @Get()
  async getSubscription(@CurrentOrganization() org: OrganizationContext) {
    return await this.lifecycleService.getActiveSubscription(org.organizationId);
  }

  @Get("entitlements")
  async getEntitlements(@CurrentOrganization() org: OrganizationContext) {
    return await this.entitlementService.getEffectiveEntitlements(org.organizationId);
  }

  @Get("plans")
  async getPlans() {
    return await this.catalogService.getPublicCatalog();
  }

  @Get("upgrade-preview")
  async previewUpgrade(
    @CurrentOrganization() org: OrganizationContext,
    @Query("targetPlanId") targetPlanId?: string,
    @Query("targetPriceId") targetPriceId?: string,
  ) {
    if (!targetPlanId || !targetPriceId || !/^\d+$/.test(targetPlanId) || !/^\d+$/.test(targetPriceId)) {
      throw new BadRequestException("Valid numeric targetPlanId and targetPriceId are required");
    }
    return await this.lifecycleService.calculateProration(
      org.organizationId,
      BigInt(targetPlanId),
      BigInt(targetPriceId),
    );
  }

  @Post("upgrade")
  async upgrade(
    @CurrentOrganization() org: OrganizationContext,
    @Req() req: AuthRequest,
    @Body({ schema: UpgradeSubscriptionRequestSchema }) body: UpgradeSubscriptionRequest,
  ) {
    return await this.lifecycleService.upgradeSubscription(
      org.organizationId,
      BigInt(body.targetPlanId),
      BigInt(body.targetPriceId),
      body.preserveCycle,
      BigInt(req.user.id),
    );
  }

  @Post("downgrade")
  async downgrade(
    @CurrentOrganization() org: OrganizationContext,
    @Req() req: AuthRequest,
    @Body({ schema: ScheduleDowngradeRequestSchema }) body: ScheduleDowngradeRequest,
  ) {
    return await this.lifecycleService.scheduleDowngrade(
      org.organizationId,
      BigInt(body.targetPlanId),
      body.targetPriceId ? BigInt(body.targetPriceId) : undefined,
      BigInt(req.user.id),
    );
  }

  @Post("cancel")
  async cancel(
    @CurrentOrganization() org: OrganizationContext,
    @Req() req: AuthRequest,
    @Body({ schema: CancelSubscriptionRequestSchema }) body: CancelSubscriptionRequest,
  ) {
    return await this.lifecycleService.cancelSubscription(org.organizationId, body.reason, BigInt(req.user.id));
  }

  @Post("addons")
  async purchaseAddon(
    @CurrentOrganization() org: OrganizationContext,
    @Req() req: AuthRequest,
    @Body({ schema: PurchaseAddonRequestSchema }) body: PurchaseAddonRequest,
  ) {
    return await this.lifecycleService.purchaseAddon(
      org.organizationId,
      BigInt(body.addonId),
      body.quantity,
      BigInt(req.user.id),
    );
  }

  @Get("invoices")
  async getInvoices(@CurrentOrganization() org: OrganizationContext) {
    return await this.lifecycleService.getInvoices(org.organizationId);
  }

  @Get("invoices/:invoiceId")
  async getInvoice(@CurrentOrganization() org: OrganizationContext, @Param("invoiceId") invoiceId: string) {
    if (!/^\d+$/.test(invoiceId)) {
      throw new BadRequestException("Invalid invoice ID format");
    }
    return await this.lifecycleService.getInvoiceById(org.organizationId, BigInt(invoiceId));
  }
}
