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
import { OrganizationReportStatus } from "../enums/organization-report-status.enum";

@Entity({ name: "organization_reports", schema: "organization" })
@Index("IDX_organization_reports_org_id", ["organizationId"])
@Index("IDX_organization_reports_reporter_id", ["reporterId"])
@Index("IDX_organization_reports_status", ["status"])
export class OrganizationReport {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "reporter_id", type: "bigint" })
  reporterId!: bigint;

  @Column({ type: "varchar", length: 30 })
  category!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ name: "evidence_urls", type: "text", array: true, nullable: true })
  evidenceUrls?: string[] | null;

  @Column({ name: "status", type: "varchar", length: 20, default: OrganizationReportStatus.OPEN })
  status!: OrganizationReportStatus;

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
    (org) => org.reports,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "reporter_id" })
  reporter!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "resolved_by" })
  resolver?: User | null;
}
