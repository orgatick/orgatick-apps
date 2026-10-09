import {
  IconAlertTriangle,
  IconArrowRight,
  IconBuildingBank,
  IconCheck,
  IconCoin,
  IconLock,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { LinkButton } from "@/components/ui/link-button";
import type { OrganizationPricingEligibilityResponse } from "@orgatick/contracts";

interface OrgPricingEligibilityCardProps {
  eligibility: OrganizationPricingEligibilityResponse | null;
}

export function OrgPricingEligibilityCard({ eligibility }: OrgPricingEligibilityCardProps) {
  const paidEnabled = eligibility ? eligibility.paidEventsEnabled : false;
  const requireBank = eligibility ? eligibility.requireBankDetails : true;
  const bankVerified = eligibility ? eligibility.bankDetailsVerified : false;
  const isEligible = eligibility ? eligibility.eligibleForPaidEvents : false;

  return (
    <Card className="rounded-xl border border-border/60 bg-card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <IconCoin className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">Pricing & Paid Events Status</CardTitle>
            </div>
            <CardDescription>
              Review your organization&apos;s eligibility to publish paid tickets, manage pricing tiers, and receive
              payouts.
            </CardDescription>
          </div>
          <div>
            <Badge variant={isEligible ? "default" : "destructive"}>
              {isEligible ? "Paid Ticketing: Active" : "Paid Ticketing: Action Required"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric / Status Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Tile 1: Paid Event Creation */}
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                paidEnabled ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              }`}
            >
              {paidEnabled ? <IconCheck className="size-4" /> : <IconX className="size-4" />}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Paid Event Hosting</p>
              <p className="text-sm font-semibold text-foreground">
                {paidEnabled ? "Permitted" : "Restricted by Admin"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {paidEnabled ? "Approved to create ticketed events" : "Platform admin permission required"}
              </p>
            </div>
          </div>

          {/* Tile 2: Bank Requirement */}
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconBuildingBank className="size-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Bank Account Requirement</p>
              <p className="text-sm font-semibold text-foreground">
                {requireBank ? "Mandatory for Payouts" : "Optional"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {requireBank ? "Must verify bank account before paid launch" : "Can launch before bank verification"}
              </p>
            </div>
          </div>

          {/* Tile 3: Bank Verification Status */}
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
            <div
              className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                bankVerified ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
              }`}
            >
              {bankVerified ? <IconShieldCheck className="size-4" /> : <IconAlertTriangle className="size-4" />}
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Bank Details Verification</p>
              <p className="text-sm font-semibold text-foreground">
                {bankVerified ? "Verified on File" : "Unverified / Pending"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {bankVerified ? "Payout account active & cleared" : "Bank account proof not yet approved"}
              </p>
            </div>
          </div>
        </div>

        {/* Actionable Feedback Banner */}
        {isEligible ? (
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
            <IconShieldCheck className="size-5 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Fully Eligible for Paid Events</p>
              <p className="text-muted-foreground">
                Your organization meets all platform pricing criteria. You can create paid ticket tiers, apply custom
                coupons, and receive direct settlement payouts.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <IconLock className="size-5 shrink-0 text-destructive mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">Paid Event Ticketing is Currently Locked</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {eligibility?.reasons && eligibility.reasons.length > 0 ? (
                    <ul className="list-inside list-disc space-y-1 text-foreground">
                      {eligibility.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>Complete compliance prerequisites to unlock paid event ticket sales.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actionable button */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {requireBank && !bankVerified && (
                <LinkButton size="sm" href="#bank-details" iconRight={<IconArrowRight className="size-3.5" />}>
                  Configure Payout Bank Details
                </LinkButton>
              )}
              {!paidEnabled && (
                <LinkButton
                  variant="outline"
                  size="sm"
                  href="mailto:support@orgatick.in?subject=Paid%20Events%20Privilege%20Request"
                >
                  Contact Platform Support
                </LinkButton>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
