import { OverrideTargetType } from "@orgatick/contracts";
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
import { User } from "../../users/entities/user.entity";
import { Organization } from "../../organization/organization/entities/organization.entity";
import { SubscriptionFeature } from "./subscription-feature.entity";
import { SubscriptionLimitDefinition } from "./subscription-limit-definition.entity";

@Entity({ name: "organization_entitlement_overrides", schema: "subscription" })
@Index("IDX_entitlement_overrides_lookup", ["organizationId", "validFrom", "validUntil"])
export class OrganizationEntitlementOverride {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({
    name: "override_target",
    type: "varchar",
    length: 30,
  })
  overrideTarget!: OverrideTargetType;

  @Column({ name: "feature_id", type: "bigint", nullable: true })
  featureId?: bigint | null;

  @Column({ name: "limit_def_id", type: "bigint", nullable: true })
  limitDefId?: bigint | null;

  @Column({ name: "is_unlimited", type: "boolean", default: false })
  isUnlimited!: boolean;

  @Column({ name: "override_limit_value", type: "bigint", nullable: true })
  overrideLimitValue?: bigint | null;

  @Column({ name: "override_boolean_value", type: "boolean", nullable: true })
  overrideBooleanValue?: boolean | null;

  @Column({ type: "varchar", length: 500 })
  reason!: string;

  @Column({ name: "authorized_by", type: "bigint" })
  authorizedBy!: bigint;

  @Column({ name: "valid_from", type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  validFrom!: Date;

  @Column({ name: "valid_until", type: "timestamptz", nullable: true })
  validUntil?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => SubscriptionFeature, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "feature_id" })
  feature?: SubscriptionFeature | null;

  @ManyToOne(() => SubscriptionLimitDefinition, { nullable: true, onDelete: "CASCADE" })
  @JoinColumn({ name: "limit_def_id" })
  limitDefinition?: SubscriptionLimitDefinition | null;

  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "authorized_by" })
  authorizer!: User;
}
