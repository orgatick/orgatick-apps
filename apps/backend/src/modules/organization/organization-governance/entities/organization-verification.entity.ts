import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../../users/entities/user.entity";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_verifications", schema: "organization" })
@Index("IDX_organization_verifications_status", ["status"])
export class OrganizationVerification {
  @PrimaryColumn({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationVerificationStatus.PENDING,
  })
  status!: OrganizationVerificationStatus;

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt?: Date | null;

  @Column({ name: "verified_by", type: "bigint", nullable: true })
  verifiedBy?: bigint | null;

  @Column({ name: "rejection_reason", type: "text", nullable: true })
  rejectionReason?: string | null;

  @Column({ name: "last_checked_by", type: "bigint", nullable: true })
  lastCheckedBy?: bigint | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.verification,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @OneToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "verified_by" })
  verifier?: User | null;

  @OneToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "last_checked_by" })
  lastChecker?: User | null;
}
