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

@Entity({ name: "organization_warnings", schema: "organization" })
@Index("IDX_organization_warnings_org_id", ["organizationId"])
export class OrganizationWarning {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ type: "text" })
  reason!: string;

  @Column({ name: "issued_by", type: "bigint" })
  issuedBy!: bigint;

  @Column({ name: "resolved_at", type: "timestamp", nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.warnings,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "issued_by" })
  issuer!: User;
}
