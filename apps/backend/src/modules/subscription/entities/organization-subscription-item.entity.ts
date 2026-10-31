import { SubscriptionItemType } from "@orgatick/contracts";
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
import { OrganizationSubscription } from "./organization-subscription.entity";
import { SubscriptionAddon } from "./subscription-addon.entity";
import { SubscriptionPlan } from "./subscription-plan.entity";

@Entity({ name: "organization_subscription_items", schema: "subscription" })
@Index("IDX_subscription_items_active", ["subscriptionId", "isActive"])
export class OrganizationSubscriptionItem {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "subscription_id", type: "bigint" })
  subscriptionId!: bigint;

  @Column({
    name: "item_type",
    type: "varchar",
    length: 30,
  })
  itemType!: SubscriptionItemType;

  @Column({ name: "plan_id", type: "bigint", nullable: true })
  planId?: bigint | null;

  @Column({ name: "addon_id", type: "bigint", nullable: true })
  addonId?: bigint | null;

  @Column({ type: "integer", default: 1 })
  quantity!: number;

  @Column({ name: "unit_price_minor_units", type: "bigint", default: 0 })
  unitPriceMinorUnits!: bigint;

  @Column({ type: "varchar", length: 3, default: "INR" })
  currency!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @Column({ name: "started_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  startedAt!: Date;

  @Column({ name: "ended_at", type: "timestamptz", nullable: true })
  endedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(
    () => OrganizationSubscription,
    (sub) => sub.items,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "subscription_id" })
  subscription!: OrganizationSubscription;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "plan_id" })
  plan?: SubscriptionPlan | null;

  @ManyToOne(() => SubscriptionAddon, { nullable: true, onDelete: "RESTRICT" })
  @JoinColumn({ name: "addon_id" })
  addon?: SubscriptionAddon | null;
}
