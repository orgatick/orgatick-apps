"use client";

import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import type { SubscriptionInvoiceView } from "@/lib/apis/subscription.api";
import { IconReceipt } from "@tabler/icons-react";

interface InvoicesTableProps {
  invoices: SubscriptionInvoiceView[];
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatPrice(minorUnits: string, currency = "INR"): string {
  const amount = Number(minorUnits) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <Card className="border-border/60 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Billing & Invoices</CardTitle>
          <p className="text-xs text-muted-foreground">
            Historical records of subscription charges and prorated receipts.
          </p>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted-foreground">
          <IconReceipt className="mx-auto size-8 text-muted-foreground/40 mb-2" />
          No subscription invoices recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Billing & Invoices</CardTitle>
        <p className="text-xs text-muted-foreground">
          Historical records of subscription charges and prorated receipts.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground">
                <th className="py-2.5 font-medium">Invoice Number</th>
                <th className="py-2.5 font-medium">Date</th>
                <th className="py-2.5 font-medium">Description</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="py-2.5 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 font-mono font-semibold text-foreground">{inv.invoiceNumber}</td>
                  <td className="py-3 text-muted-foreground">{formatDate(inv.createdAt)}</td>
                  <td className="py-3 text-foreground">
                    {inv.items && inv.items.length > 0
                      ? inv.items.map((it) => it.description).join(", ")
                      : inv.billingReason.replace("_", " ")}
                  </td>
                  <td className="py-3">
                    <Badge variant={inv.status === "paid" ? "outline" : "secondary"} className="capitalize text-[10px]">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 font-mono font-bold text-foreground text-right">
                    {formatPrice(inv.totalMinorUnits, inv.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
