import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../../../users/entities/user.entity";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_risks", schema: "organization" })
@Index("IDX_organization_risks_is_flagged", ["isFlagged"])
export class OrganizationRisk {
  @PrimaryColumn({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "trust_score", type: "numeric", precision: 5, scale: 2, default: 100.0 })
  trustScore!: number;

  @Column({ name: "is_flagged", type: "boolean", default: false })
  isFlagged!: boolean;

  @Column({ name: "flagged_reason", type: "text", nullable: true })
  flaggedReason?: string | null;

  @Column({ name: "reviewed_by", type: "bigint", nullable: true })
  reviewedBy?: bigint | null;

  @Column({ name: "reviewed_at", type: "timestamp", nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.risk,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "reviewed_by" })
  reviewer?: User | null;
}
