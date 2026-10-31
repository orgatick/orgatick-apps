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
import { Organization } from "../../organization/organization/entities/organization.entity";
import { SubscriptionLimitDefinition } from "./subscription-limit-definition.entity";

@Entity({ name: "subscription_usage_counters", schema: "subscription" })
@Index("UQ_subscription_usage_counters_org_limit", ["organizationId", "limitDefId"], { unique: true })
export class SubscriptionUsageCounter {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "limit_def_id", type: "bigint" })
  limitDefId!: bigint;

  @Column({ name: "current_value", type: "bigint", default: 0 })
  currentValue!: bigint;

  @Column({ name: "last_recalculated_at", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  lastRecalculatedAt!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => SubscriptionLimitDefinition, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "limit_def_id" })
  limitDefinition!: SubscriptionLimitDefinition;
}
