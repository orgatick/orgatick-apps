import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Address } from "../../../address/entities/addresses.entity";
import { User } from "../../../users/entities/user.entity";
import { OrganizationCategory } from "../../organization-category/entities/category.entity";
import { OrganizationInvitation } from "../../organization-invitation/entities/organization-invitation.entity";
import { OrganizationMember } from "../../organization-member/entities/organization-member.entity";
import { OrganizationStatus } from "../enums/organization-status.enum";
import { OrganizationSocialLink } from "./organization-social-link.entity";
import { OrganizationStats } from "./organization-stats.entity";
import { OrganizationSupportContact } from "./organization-support-contact.entity";
import { OrganizationVerification } from "../../organization-governance/entities/organization-verification.entity";
import { OrganizationRisk } from "../../organization-governance/entities/organization-risk.entity";
import { OrganizationReport } from "../../organization-admin/entities/organization-report.entity";
import { OrganizationOwnershipDispute } from "../../organization-admin/entities/organization-ownership-dispute.entity";
import { OrganizationCommissionSetting } from "../../organization-finance/entities/organization-commission-setting.entity";
import { OrganizationPricingSetting } from "../../organization-finance/entities/organization-pricing-setting.entity";
import { OrganizationDocument } from "../../organization-governance/entities/organization-document.entity";
import { OrganizationWarning } from "../../organization-governance/entities/organization-warning.entity";
import { OrganizationPaymentAccount } from "../../organization-finance/entities/organization-payment-account.entity";
import { OrganizationBankAccount } from "../../organization-finance/entities/organization-bank-account.entity";
import { OrganizationAdminState } from "../../organization-admin/entities/organization-admin-state.entity";

/**
 * Organization Aggregate Root
 */
@Entity({ name: "organizations", schema: "organization" })
@Index("IDX_organizations_category_id", ["categoryId"])
@Index("IDX_organizations_sub_category_id", ["subCategoryId"])
@Index("IDX_organizations_address_id", ["addressId"])
@Index("IDX_organizations_created_by", ["createdBy"])
@Index("IDX_organizations_status", ["status"])
export class Organization {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ name: "category_id", type: "bigint", nullable: true })
  categoryId?: bigint | null;

  @Column({ name: "sub_category_id", type: "bigint", nullable: true })
  subCategoryId?: bigint | null;

  @Column({ name: "address_id", type: "bigint", nullable: true })
  addressId?: bigint | null;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "varchar", length: 1000, nullable: true })
  logo?: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  email?: string | null;

  @Column({ name: "phone_number", type: "varchar", length: 30, nullable: true })
  phoneNumber?: string | null;

  @Column({
    type: "varchar",
    length: 30,
    default: OrganizationStatus.ACTIVE,
  })
  status!: OrganizationStatus;

  @Column({ name: "created_by", type: "bigint" })
  createdBy!: bigint;

  @Column({ name: "allow_paid_events", type: "boolean", default: false })
  allowPaidEvents!: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => OrganizationCategory, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "category_id" })
  category?: OrganizationCategory | null;

  @ManyToOne(() => OrganizationCategory, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "sub_category_id" })
  subCategory?: OrganizationCategory | null;

  @ManyToOne(() => Address, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "address_id" })
  address?: Address | null;

  @ManyToOne(() => User, { onDelete: "RESTRICT", onUpdate: "CASCADE" })
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @OneToOne(
    () => OrganizationVerification,
    (verification) => verification.organization,
  )
  verification?: OrganizationVerification;

  @OneToOne(
    () => OrganizationAdminState,
    (state) => state.organization,
  )
  adminState?: OrganizationAdminState;

  @OneToOne(
    () => OrganizationRisk,
    (risk) => risk.organization,
  )
  risk?: OrganizationRisk;

  @OneToOne(
    () => OrganizationStats,
    (stats) => stats.organization,
  )
  stats?: OrganizationStats;

  @OneToOne(
    () => OrganizationCommissionSetting,
    (commissionSetting) => commissionSetting.organization,
  )
  commissionSetting?: OrganizationCommissionSetting;

  @OneToOne(
    () => OrganizationPricingSetting,
    (pricingSetting) => pricingSetting.organization,
  )
  pricingSetting?: OrganizationPricingSetting;

  @OneToMany(
    () => OrganizationMember,
    (member) => member.organization,
  )
  members?: OrganizationMember[];

  @OneToMany(
    () => OrganizationInvitation,
    (invitation) => invitation.organization,
  )
  invitations?: OrganizationInvitation[];

  @OneToMany(
    () => OrganizationSocialLink,
    (link) => link.organization,
  )
  socialLinks?: OrganizationSocialLink[];

  @OneToMany(
    () => OrganizationSupportContact,
    (contact) => contact.organization,
  )
  supportContacts?: OrganizationSupportContact[];

  @OneToMany(
    () => OrganizationDocument,
    (doc) => doc.organization,
  )
  documents?: OrganizationDocument[];

  @OneToMany(
    () => OrganizationWarning,
    (warning) => warning.organization,
  )
  warnings?: OrganizationWarning[];

  @OneToMany(
    () => OrganizationPaymentAccount,
    (account) => account.organization,
  )
  paymentAccounts?: OrganizationPaymentAccount[];

  @OneToOne(
    () => OrganizationBankAccount,
    (account) => account.organization,
  )
  bankAccount?: OrganizationBankAccount;

  @OneToMany(
    () => OrganizationReport,
    (report) => report.organization,
  )
  reports?: OrganizationReport[];

  @OneToMany(
    () => OrganizationOwnershipDispute,
    (dispute) => dispute.organization,
  )
  ownershipDisputes?: OrganizationOwnershipDispute[];
}

export default Organization;
