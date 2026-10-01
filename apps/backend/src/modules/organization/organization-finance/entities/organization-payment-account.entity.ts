import { OrganizationPaymentAccountStatus } from "@orgatick/contracts";
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
import Organization from "../../organization/entities/organization.entity";

@Entity({ name: "organization_payment_accounts", schema: "organization" })
@Index("IDX_organization_payment_accounts_org_id", ["organizationId"])
@Index("IDX_organization_payment_accounts_provider", ["provider"])
@Index("IDX_organization_payment_accounts_status", ["status"])
export class OrganizationPaymentAccount {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ type: "varchar", length: 100 })
  provider!: string;

  @Column({ name: "account_id", type: "varchar", length: 255 })
  accountId!: string;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationPaymentAccountStatus.PENDING,
  })
  status!: OrganizationPaymentAccountStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(
    () => Organization,
    (org) => org.paymentAccounts,
    { onDelete: "CASCADE", onUpdate: "CASCADE" },
  )
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
