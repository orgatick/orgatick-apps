import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import {
  BillingInterval,
  InvoiceBillingReason,
  InvoiceItemType,
  InvoiceStatus,
  SubscriptionHistoryEventType,
  SubscriptionItemType,
  SubscriptionStatus,
  TaxType,
  type CreateEntitlementOverrideRequest,
  type ProrationPreview,
} from "@orgatick/contracts";
import {
  OrganizationEntitlementOverride,
  OrganizationSubscription,
  OrganizationSubscriptionItem,
  SubscriptionAddon,
  SubscriptionHistory,
  SubscriptionInvoice,
  SubscriptionInvoiceItem,
  SubscriptionPrice,
} from "../entities";
import { EntitlementCacheService } from "./entitlement-cache.service";
import { SubscriptionCatalogService } from "./subscription-catalog.service";
import { SubscriptionUsageService } from "./subscription-usage.service";

@Injectable()
export class SubscriptionLifecycleService {
  constructor(
    private readonly cacheService: EntitlementCacheService,
    private readonly catalogService: SubscriptionCatalogService,
    private readonly usageService: SubscriptionUsageService,
    @InjectRepository(OrganizationSubscription)
    private readonly subRepo: Repository<OrganizationSubscription>,
    @InjectRepository(OrganizationSubscriptionItem)
    private readonly itemRepo: Repository<OrganizationSubscriptionItem>,
    @InjectRepository(OrganizationEntitlementOverride)
    private readonly overrideRepo: Repository<OrganizationEntitlementOverride>,
    @InjectRepository(SubscriptionHistory)
    private readonly historyRepo: Repository<SubscriptionHistory>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
    @InjectRepository(SubscriptionInvoiceItem)
    private readonly invoiceItemRepo: Repository<SubscriptionInvoiceItem>,
    @InjectRepository(SubscriptionPrice)
    private readonly priceRepo: Repository<SubscriptionPrice>,
    @InjectRepository(SubscriptionAddon)
    private readonly addonRepo: Repository<SubscriptionAddon>,
  ) {}

  async getActiveSubscription(organizationId: bigint): Promise<OrganizationSubscription> {
    const sub = await this.subRepo.findOne({
      where: {
        organizationId,
        status: In([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIALING,
          SubscriptionStatus.PAST_DUE,
          SubscriptionStatus.GRACE_PERIOD,
        ]),
      },
      relations: {
        plan: true,
        price: true,
        pendingPlan: true,
        items: { addon: true, plan: true },
      },
    });

    if (!sub) {
      return this.assignFreeSubscription(organizationId);
    }
    return sub;
  }

  async assignFreeSubscription(organizationId: bigint): Promise<OrganizationSubscription> {
    const freePlan = await this.catalogService.getPlanByCode("free");

    // Check if active subscription already exists
    const existing = await this.subRepo.findOne({
      where: {
        organizationId,
        status: In([
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.TRIALING,
          SubscriptionStatus.PAST_DUE,
          SubscriptionStatus.GRACE_PERIOD,
        ]),
      },
      relations: { plan: true, price: true },
    });
    if (existing) return existing;

    const sub = this.subRepo.create({
      organizationId,
      planId: freePlan.id,
      status: SubscriptionStatus.ACTIVE,
      billingInterval: BillingInterval.NONE,
      currency: "INR",
      currentPeriodStart: new Date(),
      currentPeriodEnd: null, // perpetual
      autoRenew: true,
      entitlementsVersion: 1,
    });

    const saved = await this.subRepo.save(sub);

    // Initial usage sync
    await this.usageService.syncAllCounters(organizationId);

    // Log history
    await this.logHistory({
      organizationId,
      subscriptionId: saved.id,
      eventType: SubscriptionHistoryEventType.CREATED,
      toPlanId: freePlan.id,
      toStatus: SubscriptionStatus.ACTIVE,
      reason: "Initial Free plan assigned upon organization onboarding",
    });

    await this.cacheService.invalidate(organizationId);
    return saved;
  }

  async calculateProration(
    organizationId: bigint,
    targetPlanId: bigint,
    targetPriceId: bigint,
  ): Promise<ProrationPreview> {
    const currentSub = await this.getActiveSubscription(organizationId);
    const targetPlan = await this.catalogService.getPlanById(targetPlanId);
    const targetPrice = await this.priceRepo.findOne({ where: { id: targetPriceId, planId: targetPlanId } });

    if (!targetPrice) {
      throw new NotFoundException("Target plan price not found");
    }

    const now = new Date();
    const periodEnd = currentSub.currentPeriodEnd
      ? new Date(currentSub.currentPeriodEnd)
      : new Date(now.getTime() + 30 * 86400000);
    const periodStart = new Date(currentSub.currentPeriodStart);

    const totalPeriodMs = Math.max(periodEnd.getTime() - periodStart.getTime(), 1);
    const remainingMs = Math.max(periodEnd.getTime() - now.getTime(), 0);

    const totalDays = Math.ceil(totalPeriodMs / 86400000);
    const daysRemaining = Math.ceil(remainingMs / 86400000);

    const currentPriceAmount = currentSub.price ? BigInt(currentSub.price.priceInMinorUnits) : 0n;
    const targetPriceAmount = BigInt(targetPrice.priceInMinorUnits);

    const ratio = totalDays > 0 ? daysRemaining / totalDays : 0;
    const unusedCredit = BigInt(Math.floor(Number(currentPriceAmount) * ratio));
    const targetCharge = BigInt(Math.floor(Number(targetPriceAmount) * ratio));
    const netPayable = targetCharge > unusedCredit ? targetCharge - unusedCredit : 0n;

    return {
      currentPlanName: currentSub.plan.name,
      targetPlanName: targetPlan.name,
      currency: targetPrice.currency,
      daysRemainingInPeriod: daysRemaining,
      totalDaysInPeriod: totalDays,
      unusedCurrentCreditMinorUnits: unusedCredit.toString(),
      targetPlanProratedChargeMinorUnits: targetCharge.toString(),
      netPayableMinorUnits: netPayable.toString(),
      periodEnd: periodEnd.toISOString(),
    };
  }

  async upgradeSubscription(
    organizationId: bigint,
    targetPlanId: bigint,
    targetPriceId: bigint,
    preserveCycle = true,
    actorId?: bigint,
  ): Promise<OrganizationSubscription> {
    const currentSub = await this.getActiveSubscription(organizationId);
    const targetPlan = await this.catalogService.getPlanById(targetPlanId);
    const targetPrice = await this.priceRepo.findOne({ where: { id: targetPriceId, planId: targetPlanId } });

    if (!targetPrice) {
      throw new NotFoundException("Target plan price not found");
    }

    if (targetPlan.tierLevel <= currentSub.plan.tierLevel && currentSub.status === SubscriptionStatus.ACTIVE) {
      throw new BadRequestException("Target plan must be a higher tier than current plan for an upgrade");
    }

    const proration = await this.calculateProration(organizationId, targetPlanId, targetPriceId);

    // 1. Generate Invoice with line items
    const now = new Date();
    const invoiceNumber = `INV-SUB-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const invoice = this.invoiceRepo.create({
      publicId: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      invoiceNumber,
      organizationId,
      subscriptionId: currentSub.id,
      billingReason: InvoiceBillingReason.SUBSCRIPTION_UPGRADE,
      status: InvoiceStatus.PAID, // Simulated immediate settlement in Stage 1
      currency: targetPrice.currency,
      subtotalMinorUnits: BigInt(proration.targetPlanProratedChargeMinorUnits),
      prorationCreditMinorUnits: BigInt(proration.unusedCurrentCreditMinorUnits),
      taxAmountMinorUnits: 0n,
      totalMinorUnits: BigInt(proration.netPayableMinorUnits),
      periodStart: now,
      periodEnd: new Date(proration.periodEnd),
      dueDate: now,
      paidAt: now,
    });
    const savedInvoice = await this.invoiceRepo.save(invoice);

    // Line item: target plan charge
    await this.invoiceItemRepo.save(
      this.invoiceItemRepo.create({
        invoiceId: savedInvoice.id,
        itemType: InvoiceItemType.PLAN_SUBSCRIPTION,
        description: `${targetPlan.name} (${proration.daysRemainingInPeriod} days remaining)`,
        planId: targetPlan.id,
        priceId: targetPrice.id,
        quantity: 1,
        unitPriceMinorUnits: BigInt(proration.targetPlanProratedChargeMinorUnits),
        subtotalMinorUnits: BigInt(proration.targetPlanProratedChargeMinorUnits),
        taxType: TaxType.GST,
        taxRateBps: 0,
        taxAmountMinorUnits: 0n,
        totalMinorUnits: BigInt(proration.targetPlanProratedChargeMinorUnits),
        periodStart: now,
        periodEnd: new Date(proration.periodEnd),
      }),
    );

    // Line item: proration credit offset
    if (BigInt(proration.unusedCurrentCreditMinorUnits) > 0n) {
      await this.invoiceItemRepo.save(
        this.invoiceItemRepo.create({
          invoiceId: savedInvoice.id,
          itemType: InvoiceItemType.PRORATION_CREDIT,
          description: `Unused credit from ${currentSub.plan.name}`,
          planId: currentSub.planId,
          quantity: 1,
          unitPriceMinorUnits: -BigInt(proration.unusedCurrentCreditMinorUnits),
          subtotalMinorUnits: -BigInt(proration.unusedCurrentCreditMinorUnits),
          taxType: TaxType.EXEMPT,
          taxRateBps: 0,
          taxAmountMinorUnits: 0n,
          totalMinorUnits: -BigInt(proration.unusedCurrentCreditMinorUnits),
          periodStart: now,
          periodEnd: new Date(proration.periodEnd),
        }),
      );
    }

    // 2. Update Subscription state
    const previousPlanId = currentSub.planId;
    currentSub.planId = targetPlan.id;
    currentSub.priceId = targetPrice.id;
    currentSub.billingInterval = targetPrice.billingInterval;
    currentSub.currency = targetPrice.currency;
    currentSub.status = SubscriptionStatus.ACTIVE;
    currentSub.entitlementsVersion += 1;

    if (!preserveCycle || !currentSub.currentPeriodEnd) {
      const intervalDays = targetPrice.billingInterval === BillingInterval.YEAR ? 365 : 30;
      currentSub.currentPeriodStart = now;
      currentSub.currentPeriodEnd = new Date(now.getTime() + intervalDays * 86400000);
    }

    currentSub.pendingPlanId = null;
    currentSub.pendingPriceId = null;
    currentSub.pendingChangeEffectiveAt = null;

    const updated = await this.subRepo.save(currentSub);

    // 3. Log history
    await this.logHistory({
      organizationId,
      subscriptionId: currentSub.id,
      eventType: SubscriptionHistoryEventType.UPGRADED,
      fromPlanId: previousPlanId,
      toPlanId: targetPlan.id,
      fromStatus: currentSub.status,
      toStatus: SubscriptionStatus.ACTIVE,
      reason: `Upgraded to ${targetPlan.name} with proration applied`,
      actorId,
    });

    await this.cacheService.invalidate(organizationId);
    return updated;
  }

  async scheduleDowngrade(
    organizationId: bigint,
    targetPlanId: bigint,
    targetPriceId?: bigint,
    actorId?: bigint,
  ): Promise<OrganizationSubscription> {
    const currentSub = await this.getActiveSubscription(organizationId);
    const targetPlan = await this.catalogService.getPlanById(targetPlanId);

    if (targetPlan.tierLevel >= currentSub.plan.tierLevel) {
      throw new BadRequestException("Target plan must be a lower tier than current plan for a downgrade");
    }

    currentSub.pendingPlanId = targetPlan.id;
    currentSub.pendingPriceId = targetPriceId ?? null;
    currentSub.pendingChangeEffectiveAt = currentSub.currentPeriodEnd ?? new Date();

    const updated = await this.subRepo.save(currentSub);

    await this.logHistory({
      organizationId,
      subscriptionId: currentSub.id,
      eventType: SubscriptionHistoryEventType.DOWNGRADE_SCHEDULED,
      fromPlanId: currentSub.planId,
      toPlanId: targetPlan.id,
      reason: `Scheduled downgrade to ${targetPlan.name} at period end`,
      actorId,
    });

    return updated;
  }

  async cancelSubscription(
    organizationId: bigint,
    reason?: string,
    actorId?: bigint,
  ): Promise<OrganizationSubscription> {
    const currentSub = await this.getActiveSubscription(organizationId);
    if (currentSub.billingInterval === BillingInterval.NONE) {
      throw new BadRequestException("Free subscription cannot be canceled");
    }

    currentSub.cancelAtPeriodEnd = true;
    currentSub.canceledAt = new Date();
    currentSub.cancellationReason = reason ?? null;

    const updated = await this.subRepo.save(currentSub);

    await this.logHistory({
      organizationId,
      subscriptionId: currentSub.id,
      eventType: SubscriptionHistoryEventType.CANCELED,
      reason: reason ?? "Subscription set to cancel at period end",
      actorId,
    });

    return updated;
  }

  async purchaseAddon(
    organizationId: bigint,
    addonId: bigint,
    quantity = 1,
    actorId?: bigint,
  ): Promise<OrganizationSubscriptionItem> {
    const currentSub = await this.getActiveSubscription(organizationId);
    const addon = await this.addonRepo.findOne({ where: { id: addonId, isActive: true } });
    if (!addon) {
      throw new NotFoundException("Add-on not found or inactive");
    }

    const item = this.itemRepo.create({
      subscriptionId: currentSub.id,
      itemType: SubscriptionItemType.ADDON,
      addonId: addon.id,
      quantity,
      unitPriceMinorUnits: addon.priceInMinorUnits,
      currency: addon.currency,
      isActive: true,
      startedAt: new Date(),
    });
    const saved = await this.itemRepo.save(item);

    // Increment entitlement version and invalidate cache
    currentSub.entitlementsVersion += 1;
    await this.subRepo.save(currentSub);

    await this.logHistory({
      organizationId,
      subscriptionId: currentSub.id,
      eventType: SubscriptionHistoryEventType.ADDON_ADDED,
      reason: `Purchased add-on: ${addon.name} (qty: ${quantity})`,
      actorId,
    });

    await this.cacheService.invalidate(organizationId);
    return saved;
  }

  async createEntitlementOverride(
    organizationId: bigint,
    dto: CreateEntitlementOverrideRequest,
    authorizerId: bigint,
  ): Promise<OrganizationEntitlementOverride> {
    const override = this.overrideRepo.create({
      organizationId,
      overrideTarget: dto.overrideTarget,
      featureId: dto.featureId ? BigInt(dto.featureId) : null,
      limitDefId: dto.limitDefId ? BigInt(dto.limitDefId) : null,
      isUnlimited: dto.isUnlimited,
      overrideLimitValue: dto.overrideLimitValue ? BigInt(dto.overrideLimitValue) : null,
      overrideBooleanValue: dto.overrideBooleanValue ?? null,
      reason: dto.reason,
      authorizedBy: authorizerId,
      validFrom: new Date(),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
    });

    const saved = await this.overrideRepo.save(override);

    const currentSub = await this.getActiveSubscription(organizationId);
    currentSub.entitlementsVersion += 1;
    await this.subRepo.save(currentSub);

    await this.logHistory({
      organizationId,
      subscriptionId: currentSub.id,
      eventType: SubscriptionHistoryEventType.OVERRIDE_GRANTED,
      reason: `Admin override granted: ${dto.reason}`,
      actorId: authorizerId,
    });

    await this.cacheService.invalidate(organizationId);
    return saved;
  }

  private async logHistory(params: {
    organizationId: bigint;
    subscriptionId: bigint;
    eventType: SubscriptionHistoryEventType;
    fromPlanId?: bigint | null;
    toPlanId?: bigint | null;
    fromStatus?: SubscriptionStatus | null;
    toStatus?: SubscriptionStatus | null;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
    actorId?: bigint | null;
    actorName?: string | null;
  }): Promise<void> {
    const history = this.historyRepo.create({
      organizationId: params.organizationId,
      subscriptionId: params.subscriptionId,
      eventType: params.eventType,
      fromPlanId: params.fromPlanId ?? null,
      toPlanId: params.toPlanId ?? null,
      fromStatus: params.fromStatus ?? null,
      toStatus: params.toStatus ?? null,
      reason: params.reason ?? null,
      metadata: params.metadata ?? null,
      actorType: params.actorId ? "user" : "system",
      actorId: params.actorId ?? null,
      actorName: params.actorName ?? null,
    });
    await this.historyRepo.save(history);
  }
}
