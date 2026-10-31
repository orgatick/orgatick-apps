import { SubscriptionHistoryEventType, SubscriptionStatus } from "@orgatick/contracts";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Organization } from "../../organization/organization/entities/organization.entity";
import { OrganizationSubscription } from "./organization-subscription.entity";
import { SubscriptionPlan } from "./subscription-plan.entity";

@Entity({ name: "subscription_history", schema: "subscription" })
@Index("IDX_subscription_history_org_created", ["organizationId", "createdAt"])
@Index("IDX_subscription_history_sub_created", ["subscriptionId", "createdAt"])
export class SubscriptionHistory {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "subscription_id", type: "bigint" })
  subscriptionId!: bigint;

  @Column({
    name: "event_type",
    type: "varchar",
    length: 50,
  })
  eventType!: SubscriptionHistoryEventType;

  @Column({ name: "from_plan_id", type: "bigint", nullable: true })
  fromPlanId?: bigint | null;

  @Column({ name: "to_plan_id", type: "bigint", nullable: true })
  toPlanId?: bigint | null;

  @Column({
    name: "from_status",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  fromStatus?: SubscriptionStatus | null;

  @Column({
    name: "to_status",
    type: "varchar",
    length: 30,
    nullable: true,
  })
  toStatus?: SubscriptionStatus | null;

  @Column({ type: "varchar", length: 500, nullable: true })
  reason?: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ name: "actor_type", type: "varchar", length: 30, default: "system" })
  actorType!: string;

  @Column({ name: "actor_id", type: "bigint", nullable: true })
  actorId?: bigint | null;

  @Column({ name: "actor_name", type: "varchar", length: 255, nullable: true })
  actorName?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(() => Organization, { onDelete: "CASCADE" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => OrganizationSubscription, { onDelete: "CASCADE" })
  @JoinColumn({ name: "subscription_id" })
  subscription!: OrganizationSubscription;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "from_plan_id" })
  fromPlan?: SubscriptionPlan | null;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "to_plan_id" })
  toPlan?: SubscriptionPlan | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "actor_id" })
  actor?: User | null;
}
