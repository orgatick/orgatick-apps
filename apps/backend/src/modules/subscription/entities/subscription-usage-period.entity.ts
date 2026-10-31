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

@Entity({ name: "subscription_usage_periods", schema: "subscription" })
@Index("UQ_subscription_usage_periods_window", ["organizationId", "limitDefId", "periodStart", "periodEnd"], {
  unique: true,
})
export class SubscriptionUsagePeriod {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "limit_def_id", type: "bigint" })
  limitDefId!: bigint;

  @Column({ name: "period_start", type: "timestamptz" })
  periodStart!: Date;

  @Column({ name: "period_end", type: "timestamptz" })
  periodEnd!: Date;

  @Column({ name: "usage_count", type: "bigint", default: 0 })
  usageCount!: bigint;

  @Column({ name: "limit_snapshot", type: "bigint", nullable: true })
  limitSnapshot?: bigint | null;

  @Column({ name: "is_unlimited", type: "boolean", default: false })
  isUnlimited!: boolean;

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
