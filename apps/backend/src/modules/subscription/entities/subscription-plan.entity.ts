import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { SubscriptionPlanFeature } from "./subscription-plan-feature.entity";
import type { SubscriptionPlanLimit } from "./subscription-plan-limit.entity";
import type { SubscriptionPrice } from "./subscription-price.entity";

@Entity({ name: "subscription_plans", schema: "subscription" })
@Index("IDX_subscription_plans_active_public", ["isActive", "isPublic"])
@Index("IDX_subscription_plans_tier_level", ["tierLevel"])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "varchar", length: 50, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ name: "tier_level", type: "integer" })
  tierLevel!: number;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "is_public", type: "boolean", default: true })
  isPublic!: boolean;

  @Column({ name: "trial_period_days", type: "integer", default: 0 })
  trialPeriodDays!: number;

  @Column({ name: "sort_order", type: "integer", default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany("SubscriptionPrice", (price: SubscriptionPrice) => price.plan)
  prices?: SubscriptionPrice[];

  @OneToMany("SubscriptionPlanFeature", (planFeature: SubscriptionPlanFeature) => planFeature.plan)
  features?: SubscriptionPlanFeature[];

  @OneToMany("SubscriptionPlanLimit", (planLimit: SubscriptionPlanLimit) => planLimit.plan)
  limits?: SubscriptionPlanLimit[];
}
