import { InvoiceItemType, TaxType } from "@orgatick/contracts";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { SubscriptionAddon } from "./subscription-addon.entity";
import { SubscriptionInvoice } from "./subscription-invoice.entity";
import { SubscriptionPlan } from "./subscription-plan.entity";
import { SubscriptionPrice } from "./subscription-price.entity";

@Entity({ name: "subscription_invoice_items", schema: "subscription" })
@Index("IDX_subscription_invoice_items_invoice_id", ["invoiceId"])
export class SubscriptionInvoiceItem {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id!: bigint;

  @Column({ name: "invoice_id", type: "bigint" })
  invoiceId!: bigint;

  @Column({
    name: "item_type",
    type: "varchar",
    length: 30,
  })
  itemType!: InvoiceItemType;

  @Column({ type: "varchar", length: 255 })
  description!: string;

  @Column({ name: "plan_id", type: "bigint", nullable: true })
  planId?: bigint | null;

  @Column({ name: "addon_id", type: "bigint", nullable: true })
  addonId?: bigint | null;

  @Column({ name: "price_id", type: "bigint", nullable: true })
  priceId?: bigint | null;

  @Column({ type: "integer", default: 1 })
  quantity!: number;

  @Column({ name: "unit_price_minor_units", type: "bigint", default: 0 })
  unitPriceMinorUnits!: bigint;

  @Column({ name: "subtotal_minor_units", type: "bigint", default: 0 })
  subtotalMinorUnits!: bigint;

  @Column({
    name: "tax_type",
    type: "varchar",
    length: 50,
    default: TaxType.GST,
  })
  taxType!: TaxType;

  @Column({ name: "tax_rate_bps", type: "integer" })
  taxRateBps!: number;

  @Column({ name: "tax_amount_minor_units", type: "bigint", default: 0 })
  taxAmountMinorUnits!: bigint;

  @Column({ name: "total_minor_units", type: "bigint", default: 0 })
  totalMinorUnits!: bigint;

  @Column({ name: "period_start", type: "timestamptz" })
  periodStart!: Date;

  @Column({ name: "period_end", type: "timestamptz" })
  periodEnd!: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @ManyToOne(
    () => SubscriptionInvoice,
    (invoice) => invoice.items,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "invoice_id" })
  invoice!: SubscriptionInvoice;

  @ManyToOne(() => SubscriptionPlan, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "plan_id" })
  plan?: SubscriptionPlan | null;

  @ManyToOne(() => SubscriptionAddon, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "addon_id" })
  addon?: SubscriptionAddon | null;

  @ManyToOne(() => SubscriptionPrice, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "price_id" })
  price?: SubscriptionPrice | null;
}
