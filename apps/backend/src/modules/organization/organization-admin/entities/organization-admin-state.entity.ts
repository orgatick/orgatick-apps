import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_admin_state", schema: "organization" })
export class OrganizationAdminState {
  @PrimaryColumn({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "admin_reason", type: "varchar", length: 500, nullable: true })
  adminReason?: string | null;

  @Column({ type: "boolean", default: false })
  blocked!: boolean;

  @Column({ name: "blocked_at", type: "timestamp", nullable: true })
  blockedAt?: Date | null;

  @Column({ name: "block_reason", type: "varchar", length: 500, nullable: true })
  blockReason?: string | null;

  @Column({ name: "blocked_by", type: "bigint", nullable: true })
  blockedBy?: bigint | null;

  @Column({ type: "boolean", default: false })
  hidden!: boolean;

  @Column({ name: "hidden_at", type: "timestamp", nullable: true })
  hiddenAt?: Date | null;

  @Column({ name: "hidden_reason", type: "varchar", length: 500, nullable: true })
  hiddenReason?: string | null;

  @Column({ name: "hidden_by", type: "bigint", nullable: true })
  hiddenBy?: bigint | null;

  @Column({ type: "boolean", default: false })
  archived!: boolean;

  @Column({ name: "archived_at", type: "timestamp", nullable: true })
  archivedAt?: Date | null;

  @Column({ name: "archived_reason", type: "varchar", length: 500, nullable: true })
  archivedReason?: string | null;

  @Column({ name: "archived_by", type: "bigint", nullable: true })
  archivedBy?: bigint | null;

  @Column({ name: "closure_requested_at", type: "timestamp", nullable: true })
  closureRequestedAt?: Date | null;

  @Column({ name: "closure_requested_by", type: "bigint", nullable: true })
  closureRequestedBy?: bigint | null;

  @Column({ name: "closure_reason", type: "varchar", length: 500, nullable: true })
  closureReason?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.adminState,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
