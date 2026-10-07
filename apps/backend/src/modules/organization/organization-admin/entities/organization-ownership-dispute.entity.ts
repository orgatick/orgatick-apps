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
import { User } from "../../../users/entities/user.entity";
import Organization from "../../organization/entities/organization.entity";
import { OwnershipDisputeStatus } from "../enums/ownership-dispute-status.enum";

@Entity({ name: "organization_ownership_disputes", schema: "organization" })
@Index("IDX_organization_ownership_disputes_org_id", ["organizationId"])
@Index("IDX_organization_ownership_disputes_disputant_id", ["disputantId"])
@Index("IDX_organization_ownership_disputes_status", ["status"])
export class OrganizationOwnershipDispute {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "disputant_id", type: "bigint" })
  disputantId!: bigint;

  @Column({ name: "current_owner_id", type: "bigint", nullable: true })
  currentOwnerId?: bigint | null;

  @Column({ type: "text" })
  reason!: string;

  @Column({ name: "evidence_urls", type: "text", array: true, nullable: true })
  evidenceUrls?: string[] | null;

  @Column({ name: "status", type: "varchar", length: 20, default: OwnershipDisputeStatus.OPEN })
  status!: OwnershipDisputeStatus;

  @Column({ name: "freeze_ownership", type: "boolean", default: false })
  freezeOwnership!: boolean;

  @Column({ name: "resolution", type: "text", nullable: true })
  resolution?: string | null;

  @Column({ name: "resolved_by", type: "bigint", nullable: true })
  resolvedBy?: bigint | null;

  @Column({ name: "resolved_at", type: "timestamp", nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.ownershipDisputes,
    {
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "disputant_id" })
  disputant!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "current_owner_id" })
  currentOwner?: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "resolved_by" })
  resolver?: User | null;
}
