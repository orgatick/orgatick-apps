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
import type { OrganizationDocumentType } from "@orgatick/contracts";
import { OrganizationDocumentStatus } from "../../organization/enums/organization-document-status.enum";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_documents", schema: "organization" })
@Index("IDX_organization_documents_org_id", ["organizationId"])
@Index("IDX_organization_documents_uploaded_by", ["uploadedBy"])
@Index("IDX_organization_documents_status", ["status"])
export class OrganizationDocument {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({
    name: "document_type",
    type: "varchar",
    length: 100,
  })
  type!: OrganizationDocumentType;

  @Column({ name: "document_url", type: "varchar", length: 1000 })
  fileUrl!: string;

  @Column({ name: "uploaded_by", type: "bigint" })
  uploadedBy!: bigint;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationDocumentStatus.PENDING,
  })
  status!: OrganizationDocumentStatus;

  @Column({ name: "reviewed_by", type: "bigint", nullable: true })
  reviewedBy?: bigint | null;

  @Column({ name: "reviewed_at", type: "timestamp", nullable: true })
  reviewedAt?: Date | null;

  @Column({ name: "review_note", type: "varchar", length: 500, nullable: true })
  reviewNote?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.documents,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => User, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "uploaded_by" })
  uploader!: User;

  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "reviewed_by" })
  reviewer?: User | null;
}
