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
import { SubscriptionPlan } from "./subscription-plan.entity";

@Entity({ name: "subscription_plan_features", schema: "subscription" })
@Index("UQ_subscription_plan_features_plan_feature", ["planId", "featureId"], { unique: true })
export class SubscriptionPlanFeature {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "plan_id", type: "bigint" })
  planId!: bigint;

  @Column({ name: "feature_id", type: "bigint" })
  featureId!: bigint;

  @Column({ name: "is_included", type: "boolean", default: true })
  isIncluded!: boolean;

  @Column({ name: "feature_level", type: "varchar", length: 50, nullable: true })
  featureLevel?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(
    () => SubscriptionPlan,
    (plan) => plan.features,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "plan_id" })
  plan!: SubscriptionPlan;

  @ManyToOne(
    () => SubscriptionFeature,
    (feature) => feature.planFeatures,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "feature_id" })
  feature!: SubscriptionFeature;
}
