import { LimitScopeType, MetricType, MetricUnit } from "@orgatick/contracts";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "subscription_limit_definitions", schema: "subscription" })
export class SubscriptionLimitDefinition {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "varchar", length: 100, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({
    name: "limit_scope",
    type: "varchar",
    length: 30,
  })
  limitScope!: LimitScopeType;

  @Column({
    name: "metric_type",
    type: "varchar",
    length: 30,
  })
  metricType!: MetricType;

  @Column({
    type: "varchar",
    length: 30,
  })
  unit!: MetricUnit;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
