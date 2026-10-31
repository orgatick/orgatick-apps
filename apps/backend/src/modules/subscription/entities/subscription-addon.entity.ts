import { AddonType, BillingInterval } from "@orgatick/contracts";
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
import { SubscriptionFeature } from "./subscription-feature.entity";
import { SubscriptionLimitDefinition } from "./subscription-limit-definition.entity";

@Entity({ name: "subscription_addons", schema: "subscription" })
@Index("IDX_subscription_addons_active_type", ["isActive", "addonType"])
export class SubscriptionAddon {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "varchar", length: 100, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({
    name: "addon_type",
    type: "varchar",
    length: 30,
  })
  addonType!: AddonType;

  @Column({ name: "target_limit_def_id", type: "bigint", nullable: true })
  targetLimitDefId?: bigint | null;

  @Column({ name: "target_feature_id", type: "bigint", nullable: true })
  targetFeatureId?: bigint | null;

  @Column({ name: "is_unlimited", type: "boolean", default: false })
  isUnlimited!: boolean;

  @Column({ name: "increase_value", type: "bigint", nullable: true })
  increaseValue?: bigint | null;

  @Column({ type: "varchar", length: 3, default: "INR" })
  currency!: string;

  @Column({
    name: "billing_interval",
    type: "varchar",
    length: 20,
    default: BillingInterval.MONTH,
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

  @ManyToOne(() => SubscriptionLimitDefinition, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "target_limit_def_id" })
  targetLimitDefinition?: SubscriptionLimitDefinition | null;

  @ManyToOne(() => SubscriptionFeature, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "target_feature_id" })
  targetFeature?: SubscriptionFeature | null;
}
