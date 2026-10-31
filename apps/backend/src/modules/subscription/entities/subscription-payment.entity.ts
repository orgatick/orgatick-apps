import { SubscriptionPaymentStatus } from "@orgatick/contracts";
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
import { Organization } from "../../organization/organization/entities/organization.entity";
import { SubscriptionInvoice } from "./subscription-invoice.entity";

@Entity({ name: "subscription_payments", schema: "subscription" })
@Index("IDX_subscription_payments_invoice_status", ["invoiceId", "status"])
@Index("IDX_subscription_payments_payment_order_id", ["paymentOrderId"])
export class SubscriptionPayment {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "invoice_id", type: "bigint" })
  invoiceId!: bigint;

  @Column({ name: "organization_id", type: "bigint" })
  organizationId!: bigint;

  @Column({ name: "payment_order_id", type: "bigint", nullable: true })
  paymentOrderId?: bigint | null;

  @Column({ name: "amount_minor_units", type: "bigint" })
  amountMinorUnits!: bigint;

  @Column({ type: "varchar", length: 3, default: "INR" })
  currency!: string;

  @Column({
    type: "varchar",
    length: 30,
    default: SubscriptionPaymentStatus.PENDING,
  })
  status!: SubscriptionPaymentStatus;

  @Column({ name: "idempotency_key", type: "varchar", length: 255, unique: true })
  idempotencyKey!: string;

  @Column({ name: "error_code", type: "varchar", length: 100, nullable: true })
  errorCode?: string | null;

  @Column({ name: "error_description", type: "text", nullable: true })
  errorDescription?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @ManyToOne(
    () => SubscriptionInvoice,
    (invoice) => invoice.payments,
    { onDelete: "RESTRICT" },
  )
  @JoinColumn({ name: "invoice_id" })
  invoice!: SubscriptionInvoice;

  @ManyToOne(() => Organization, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "organization_id" })
  organization!: Organization;
}
