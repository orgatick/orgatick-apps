import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SubscriptionLimitDefinition } from "./subscription-limit-definition.entity";
import { SubscriptionPlan } from "./subscription-plan.entity";

@Entity({ name: "subscription_plan_limits", schema: "subscription" })
@Index("UQ_subscription_plan_limits_plan_limit_def", ["planId", "limitDefId"], { unique: true })
export class SubscriptionPlanLimit {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "plan_id", type: "bigint" })
  planId!: bigint;

  @Column({ name: "limit_def_id", type: "bigint" })
  limitDefId!: bigint;

  @Column({ name: "is_unlimited", type: "boolean", default: false })
  isUnlimited!: boolean;

  @Column({ name: "limit_value", type: "bigint", nullable: true })
  limitValue?: bigint | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(
    () => SubscriptionPlan,
    (plan) => plan.limits,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "plan_id" })
  plan!: SubscriptionPlan;

  @ManyToOne(() => SubscriptionLimitDefinition, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "limit_def_id" })
  limitDefinition!: SubscriptionLimitDefinition;
}
