import { OrganizationBankAccountStatus, OrganizationBankAccountType } from "@orgatick/contracts";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_bank_accounts", schema: "organization" })
@Index("IDX_organization_bank_accounts_org_id", ["organizationId"], { unique: true })
@Index("IDX_organization_bank_accounts_status", ["status"])
export class OrganizationBankAccount {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint", unique: true })
  organizationId!: bigint;

  @Column({ name: "account_holder_name", type: "varchar", length: 255 })
  accountHolderName!: string;

  @Column({ name: "account_number", type: "varchar", length: 100 })
  accountNumber!: string;

  @Column({ name: "ifsc_code", type: "varchar", length: 20 })
  ifscCode!: string;

  @Column({ name: "bank_name", type: "varchar", length: 255 })
  bankName!: string;

  @Column({ name: "branch_name", type: "varchar", length: 255, nullable: true })
  branchName?: string | null;

  @Column({
    name: "account_type",
    type: "varchar",
    length: 30,
    default: OrganizationBankAccountType.CURRENT,
  })
  accountType!: OrganizationBankAccountType;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationBankAccountStatus.PENDING,
  })
  status!: OrganizationBankAccountStatus;

  @Column({ name: "verification_notes", type: "varchar", length: 500, nullable: true })
  verificationNotes?: string | null;

  @Column({ name: "document_id", type: "bigint", nullable: true })
  documentId?: bigint | null;

  @Column({ name: "verified_by", type: "bigint", nullable: true })
  verifiedBy?: bigint | null;

  @Column({ name: "verified_at", type: "timestamp", nullable: true })
  verifiedAt?: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @OneToOne(
    () => Organization,
    (org) => org.bankAccount,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
