import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { SubscriptionPlanFeature } from "./subscription-plan-feature.entity";

@Entity({ name: "subscription_features", schema: "subscription" })
@Index("IDX_subscription_features_category_active", ["category", "isActive"])
export class SubscriptionFeature {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "varchar", length: 100, unique: true })
  code!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 50 })
  category!: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany("SubscriptionPlanFeature", (planFeature: SubscriptionPlanFeature) => planFeature.feature)
  planFeatures?: SubscriptionPlanFeature[];
}
