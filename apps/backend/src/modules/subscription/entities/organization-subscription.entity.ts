import { BillingInterval, SubscriptionStatus } from "@orgatick/contracts";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from "typeorm";
import { Organization } from "../../organization/organization/entities/organization.entity";
import type { OrganizationSubscriptionItem } from "./organization-subscription-item.entity";
import { SubscriptionPlan } from "./subscription-plan.entity";
import { SubscriptionPrice } from "./subscription-price.entity";

@Entity({ name: "organization_subscriptions", schema: "subscription" })
@Index("IDX_org_subs_organization_id", ["organizationId"])
@Index("IDX_org_subs_status_period_end", ["status", "currentPeriodEnd"])
@Index("IDX_org_subs_status_grace", ["status", "gracePeriodEnd"])
export class OrganizationSubscription {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "plan_id", type: "bigint" })
  planId!: bigint;

  @Column({ name: "price_id", type: "bigint", nullable: true })
  priceId?: bigint | null;

  @Column({
    type: "varchar",
    length: 30,
    default: SubscriptionStatus.ACTIVE,
  })
  status!: SubscriptionStatus;

  @Column({
    name: "billing_interval",
    type: "varchar",
    length: 20,
    default: BillingInterval.NONE,
  })
  billingInterval!: BillingInterval;

  @Column({ type: "varchar", length: 3, default: "INR" })
  currency!: string;

  @Column({ name: "current_period_start", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  currentPeriodStart!: Date;

  @Column({ name: "current_period_end", type: "timestamptz", nullable: true })
  currentPeriodEnd?: Date | null;

  @Column({ name: "trial_start", type: "timestamptz", nullable: true })
  trialStart?: Date | null;

  @Column({ name: "trial_end", type: "timestamptz", nullable: true })
  trialEnd?: Date | null;

  @Column({ name: "grace_period_end", type: "timestamptz", nullable: true })
  gracePeriodEnd?: Date | null;

  @Column({ name: "cancel_at_period_end", type: "boolean", default: false })
  cancelAtPeriodEnd!: boolean;

  @Column({ name: "canceled_at", type: "timestamptz", nullable: true })
  canceledAt?: Date | null;

  @Column({ name: "cancellation_reason", type: "varchar", length: 500, nullable: true })
  cancellationReason?: string | null;

  @Column({ name: "pending_plan_id", type: "bigint", nullable: true })
  pendingPlanId?: bigint | null;

  @Column({ name: "pending_price_id", type: "bigint", nullable: true })
  pendingPriceId?: bigint | null;

  @Column({ name: "pending_change_effective_at", type: "timestamptz", nullable: true })
  pendingChangeEffectiveAt?: Date | null;

  @Column({ name: "auto_renew", type: "boolean", default: true })
  autoRenew!: boolean;

  @VersionColumn({ default: 1 })
  version!: number;

  @Column({ name: "entitlements_version", type: "integer", default: 1 })
  entitlementsVersion!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Organization, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => SubscriptionPlan, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "plan_id" })
  plan!: SubscriptionPlan;

  @ManyToOne(() => SubscriptionPrice, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "price_id" })
  price?: SubscriptionPrice | null;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "pending_plan_id" })
  pendingPlan?: SubscriptionPlan | null;

  @OneToMany("OrganizationSubscriptionItem", (item: OrganizationSubscriptionItem) => item.subscription)
  items?: OrganizationSubscriptionItem[];
}
