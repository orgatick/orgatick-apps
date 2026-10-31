import { InvoiceBillingReason, InvoiceStatus } from "@orgatick/contracts";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Organization } from "../../organization/organization/entities/organization.entity";
import { OrganizationSubscription } from "./organization-subscription.entity";
import type { SubscriptionInvoiceItem } from "./subscription-invoice-item.entity";
import type { SubscriptionPayment } from "./subscription-payment.entity";

@Entity({ name: "subscription_invoices", schema: "subscription" })
@Index("IDX_subscription_invoices_org_status", ["organizationId", "status"])
@Index("IDX_subscription_invoices_due_date_status", ["dueDate", "status"])
export class SubscriptionInvoice {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "public_id", type: "varchar", length: 36, unique: true })
  publicId!: string;

  @Column({ name: "invoice_number", type: "varchar", length: 100, unique: true })
  invoiceNumber!: string;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "subscription_id", type: "bigint" })
  subscriptionId!: bigint;

  @Column({
    name: "billing_reason",
    type: "varchar",
    length: 50,
  })
  billingReason!: InvoiceBillingReason;

  @Column({
    type: "varchar",
    length: 30,
    default: InvoiceStatus.DRAFT,
  })
  status!: InvoiceStatus;

  @Column({ type: "varchar", length: 3, default: "INR" })
  currency!: string;

  @Column({ name: "subtotal_minor_units", type: "bigint", default: 0 })
  subtotalMinorUnits!: bigint;

  @Column({ name: "tax_amount_minor_units", type: "bigint", default: 0 })
  taxAmountMinorUnits!: bigint;

  @Column({ name: "total_minor_units", type: "bigint", default: 0 })
  totalMinorUnits!: bigint;

  @Column({ name: "proration_credit_minor_units", type: "bigint", default: 0 })
  prorationCreditMinorUnits!: bigint;

  @Column({ name: "period_start", type: "timestamptz" })
  periodStart!: Date;

  @Column({ name: "period_end", type: "timestamptz" })
  periodEnd!: Date;

  @Column({ name: "due_date", type: "timestamptz" })
  dueDate!: Date;

  @Column({ name: "paid_at", type: "timestamptz", nullable: true })
  paidAt?: Date | null;

  @Column({ name: "pdf_url", type: "varchar", length: 1000, nullable: true })
  pdfUrl?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(() => Organization, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;

  @ManyToOne(() => OrganizationSubscription, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "subscription_id" })
  subscription!: OrganizationSubscription;

  @OneToMany("SubscriptionInvoiceItem", (item: SubscriptionInvoiceItem) => item.invoice)
  items?: SubscriptionInvoiceItem[];

  @OneToMany("SubscriptionPayment", (payment: SubscriptionPayment) => payment.invoice)
  payments?: SubscriptionPayment[];
}
