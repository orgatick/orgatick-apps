import { z } from "zod";
import {
  InvoiceBillingReason,
  InvoiceItemType,
  InvoiceStatus,
  SubscriptionPaymentStatus,
  TaxType,
} from "../enums/subscription.enums.js";

export const SubscriptionInvoiceItemSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  itemType: z.nativeEnum(InvoiceItemType),
  description: z.string(),
  planId: z.string().nullable().optional(),
  addonId: z.string().nullable().optional(),
  priceId: z.string().nullable().optional(),
  quantity: z.number().int(),
  unitPriceMinorUnits: z.string(),
  subtotalMinorUnits: z.string(),
  taxType: z.nativeEnum(TaxType),
  taxRateBps: z.number().int(),
  taxAmountMinorUnits: z.string(),
  totalMinorUnits: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
});
export type SubscriptionInvoiceItem = z.infer<typeof SubscriptionInvoiceItemSchema>;

export const SubscriptionPaymentSchema = z.object({
  id: z.string(),
  invoiceId: z.string(),
  organizationId: z.string(),
  paymentOrderId: z.string().nullable().optional(),
  amountMinorUnits: z.string(),
  currency: z.string().length(3),
  status: z.nativeEnum(SubscriptionPaymentStatus),
  idempotencyKey: z.string(),
  errorCode: z.string().nullable().optional(),
  errorDescription: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
});
export type SubscriptionPayment = z.infer<typeof SubscriptionPaymentSchema>;

export const SubscriptionInvoiceSchema = z.object({
  id: z.string(),
  publicId: z.string(),
  invoiceNumber: z.string(),
  organizationId: z.string(),
  subscriptionId: z.string(),
  billingReason: z.nativeEnum(InvoiceBillingReason),
  status: z.nativeEnum(InvoiceStatus),
  currency: z.string().length(3),
  subtotalMinorUnits: z.string(),
  taxAmountMinorUnits: z.string(),
  totalMinorUnits: z.string(),
  prorationCreditMinorUnits: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  dueDate: z.string().datetime(),
  paidAt: z.string().datetime().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  items: z.array(SubscriptionInvoiceItemSchema).optional(),
  payments: z.array(SubscriptionPaymentSchema).optional(),
  createdAt: z.string().datetime(),
});
export type SubscriptionInvoice = z.infer<typeof SubscriptionInvoiceSchema>;
