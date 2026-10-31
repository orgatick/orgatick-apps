import { BillingInterval } from "@orgatick/contracts";
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
import { SubscriptionPlan } from "./subscription-plan.entity";

@Entity({ name: "subscription_prices", schema: "subscription" })
@Index("UQ_subscription_prices_temporal", ["planId", "currency", "billingInterval", "validFrom"], { unique: true })
@Index("IDX_subscription_prices_plan_active", ["planId", "isActive"])
export class SubscriptionPrice {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "plan_id", type: "bigint" })
  planId!: bigint;

  @Column({ type: "varchar", length: 3, default: "INR" })
  currency!: string;

  @Column({
    name: "billing_interval",
    type: "varchar",
    length: 20,
  })
  billingInterval!: BillingInterval;

  @Column({ name: "price_in_minor_units", type: "bigint" })
  priceInMinorUnits!: bigint;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "valid_from", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  validFrom!: Date;

  @Column({ name: "valid_to", type: "timestamptz", nullable: true })
  validTo?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(
    () => SubscriptionPlan,
    (plan) => plan.prices,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "plan_id" })
  plan!: SubscriptionPlan;
}
