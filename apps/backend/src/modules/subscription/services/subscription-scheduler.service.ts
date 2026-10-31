import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import type Redis from "ioredis";
import { In, LessThanOrEqual, Repository } from "typeorm";
import {
  BillingInterval,
  InvoiceBillingReason,
  InvoiceItemType,
  InvoiceStatus,
  SubscriptionHistoryEventType,
  SubscriptionStatus,
  TaxType,
} from "@orgatick/contracts";
import { REDIS_CLIENT } from "../../../infrastructure/redis/redis.constants";
import {
  OrganizationEntitlementOverride,
  OrganizationSubscription,
  SubscriptionHistory,
  SubscriptionInvoice,
  SubscriptionInvoiceItem,
} from "../entities";
import { EntitlementCacheService } from "./entitlement-cache.service";
import { SubscriptionLifecycleService } from "./subscription-lifecycle.service";

@Injectable()
export class SubscriptionSchedulerService {
  private readonly logger = new Logger(SubscriptionSchedulerService.name);
  private readonly LOCK_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
    @InjectRepository(OrganizationSubscription)
    private readonly subRepo: Repository<OrganizationSubscription>,
    @InjectRepository(OrganizationEntitlementOverride)
    private readonly overrideRepo: Repository<OrganizationEntitlementOverride>,
    @InjectRepository(SubscriptionHistory)
    private readonly historyRepo: Repository<SubscriptionHistory>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
    @InjectRepository(SubscriptionInvoiceItem)
    private readonly invoiceItemRepo: Repository<SubscriptionInvoiceItem>,
    private readonly cacheService: EntitlementCacheService,
    private readonly lifecycleService: SubscriptionLifecycleService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleSubscriptionCycleProcessing(): Promise<void> {
    const lockKey = "cron:lock:subscription_cycle_processing";
    const acquired = await this.acquireLock(lockKey);
    if (!acquired) {
      this.logger.debug("Subscription cycle processing lock acquired by another worker. Skipping.");
      return;
    }

    try {
      this.logger.log("Executing scheduled subscription cycle processing...");
      await this.processScheduledDowngrades();
      await this.processExpiredCancellations();
      await this.processAutomatedRenewals();
    } catch (err) {
      this.logger.error("Error occurred during subscription cycle processing", err);
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyCleanup(): Promise<void> {
    const lockKey = "cron:lock:subscription_daily_cleanup";
    const acquired = await this.acquireLock(lockKey);
    if (!acquired) return;

    try {
      this.logger.log("Executing daily expired entitlement overrides cleanup...");
      await this.cleanupExpiredOverrides();
    } catch (err) {
      this.logger.error("Error occurred during subscription daily cleanup", err);
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  private async processScheduledDowngrades(): Promise<void> {
    const now = new Date();
    const subsToDowngrade = await this.subRepo
      .createQueryBuilder("sub")
      .where("sub.pending_plan_id IS NOT NULL")
      .andWhere("sub.pending_change_effective_at <= :now", { now })
      .leftJoinAndSelect("sub.pendingPlan", "pendingPlan")
      .getMany();

    for (const sub of subsToDowngrade) {
      if (!sub.pendingPlanId) continue;

      const fromPlanId = sub.planId;
      const targetPlan = sub.pendingPlan;
      const targetPlanId = sub.pendingPlanId;

      sub.planId = targetPlanId;
      sub.priceId = sub.pendingPriceId ?? null;
      sub.pendingPlanId = null;
      sub.pendingPriceId = null;
      sub.pendingChangeEffectiveAt = null;
      sub.entitlementsVersion += 1;

      await this.subRepo.save(sub);

      await this.logHistory({
        organizationId: sub.organizationId,
        subscriptionId: sub.id,
        eventType: SubscriptionHistoryEventType.DOWNGRADE_EXECUTED,
        fromPlanId,
        toPlanId: targetPlanId,
        reason: `Scheduled downgrade executed for ${targetPlan?.name || "plan"}`,
      });

      await this.cacheService.invalidate(sub.organizationId);
      this.logger.log(`Downgrade executed for org ${sub.organizationId} to plan ${targetPlanId}`);
    }
  }

  private async processExpiredCancellations(): Promise<void> {
    const now = new Date();
    const expiredSubs = await this.subRepo.find({
      where: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: LessThanOrEqual(now),
        status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE]),
      },
      relations: { plan: true },
    });

    for (const sub of expiredSubs) {
      const fromPlanId = sub.planId;
      sub.status = SubscriptionStatus.EXPIRED;
      await this.subRepo.save(sub);

      await this.logHistory({
        organizationId: sub.organizationId,
        subscriptionId: sub.id,
        eventType: SubscriptionHistoryEventType.EXPIRED,
        fromPlanId,
        toStatus: SubscriptionStatus.EXPIRED,
        reason: "Subscription expired following non-renewal at period end",
      });

      // Non-destructive downgrade: assign Free plan perpetually
      await this.lifecycleService.assignFreeSubscription(sub.organizationId);
      await this.cacheService.invalidate(sub.organizationId);
      this.logger.log(`Subscription for org ${sub.organizationId} marked expired and assigned Free tier`);
    }
  }

  private async processAutomatedRenewals(): Promise<void> {
    const now = new Date();
    const subsToRenew = await this.subRepo.find({
      where: {
        autoRenew: true,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: LessThanOrEqual(now),
        status: SubscriptionStatus.ACTIVE,
        billingInterval: In([BillingInterval.MONTH, BillingInterval.YEAR]),
      },
      relations: { plan: true, price: true },
    });

    for (const sub of subsToRenew) {
      if (!sub.currentPeriodEnd) continue;

      const newStart = new Date(sub.currentPeriodEnd);
      const daysToAdd = sub.billingInterval === BillingInterval.YEAR ? 365 : 30;
      const newEnd = new Date(newStart.getTime() + daysToAdd * 86400000);

      const priceAmount = sub.price ? BigInt(sub.price.priceInMinorUnits) : 0n;

      // Create renewal invoice
      const invoiceNumber = `INV-REN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      const invoice = this.invoiceRepo.create({
        publicId: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        invoiceNumber,
        organizationId: sub.organizationId,
        subscriptionId: sub.id,
        billingReason: InvoiceBillingReason.SUBSCRIPTION_CYCLE,
        status: InvoiceStatus.PAID, // Simulated immediate settlement
        currency: sub.currency,
        subtotalMinorUnits: priceAmount,
        prorationCreditMinorUnits: 0n,
        taxAmountMinorUnits: 0n,
        totalMinorUnits: priceAmount,
        periodStart: newStart,
        periodEnd: newEnd,
        dueDate: newStart,
        paidAt: now,
      });
      const savedInvoice = await this.invoiceRepo.save(invoice);

      if (priceAmount > 0n) {
        await this.invoiceItemRepo.save(
          this.invoiceItemRepo.create({
            invoiceId: savedInvoice.id,
            itemType: InvoiceItemType.PLAN_SUBSCRIPTION,
            description: `${sub.plan.name} (${sub.billingInterval}ly cycle renewal)`,
            planId: sub.planId,
            priceId: sub.priceId ?? undefined,
            quantity: 1,
            unitPriceMinorUnits: priceAmount,
            subtotalMinorUnits: priceAmount,
            taxType: TaxType.GST,
            taxRateBps: 0,
            taxAmountMinorUnits: 0n,
            totalMinorUnits: priceAmount,
            periodStart: newStart,
            periodEnd: newEnd,
          }),
        );
      }

      sub.currentPeriodStart = newStart;
      sub.currentPeriodEnd = newEnd;
      sub.entitlementsVersion += 1;
      await this.subRepo.save(sub);

      await this.logHistory({
        organizationId: sub.organizationId,
        subscriptionId: sub.id,
        eventType: SubscriptionHistoryEventType.RENEWED,
        toPlanId: sub.planId,
        reason: `Automated cycle renewal for ${sub.billingInterval}ly interval`,
      });

      await this.cacheService.invalidate(sub.organizationId);
      this.logger.log(`Subscription automatically renewed for org ${sub.organizationId} until ${newEnd.toISOString()}`);
    }
  }

  private async cleanupExpiredOverrides(): Promise<void> {
    const now = new Date();
    const expiredOverrides = await this.overrideRepo.find({
      where: {
        validUntil: LessThanOrEqual(now),
      },
    });

    if (expiredOverrides.length === 0) return;

    const affectedOrgIds = new Set<bigint>();
    for (const ov of expiredOverrides) {
      affectedOrgIds.add(ov.organizationId);
    }

    await this.overrideRepo.remove(expiredOverrides);

    for (const orgId of affectedOrgIds) {
      await this.subRepo.increment({ organizationId: orgId }, "entitlementsVersion", 1);
      await this.cacheService.invalidate(orgId);
    }

    this.logger.log(`Purged ${expiredOverrides.length} expired overrides across ${affectedOrgIds.size} organizations`);
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
      actorType: "system",
    });
    await this.historyRepo.save(history);
  }

  private async acquireLock(key: string): Promise<boolean> {
    try {
      const res = await this.redis.set(key, process.pid.toString(), "PX", this.LOCK_TTL_MS, "NX");
      return res === "OK";
    } catch (err) {
      this.logger.warn(`Failed to acquire distributed lock for "${key}": ${err}`);
      return false;
    }
  }

  private async releaseLock(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(`Failed to release lock "${key}": ${err}`);
    }
  }
}
