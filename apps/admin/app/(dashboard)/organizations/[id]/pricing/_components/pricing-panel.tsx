"use client";

import { useState } from "react";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconCoin,
  IconInfoCircle,
  IconLock,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Switch } from "@orgatick/ui/components/switch";
import { Textarea } from "@orgatick/ui/components/textarea";
import type {
  AdminBankAccount,
  AdminOrganization,
  OrganizationPricingEligibility,
  OrganizationPricingSetting,
} from "@/lib/types";
import { updateOrganizationPricing, verifyOrganizationBankAccount } from "@/lib/org-admin.api";
import { useOrgAction } from "../../_components/use-org-action";

interface PricingPanelProps {
  organization: AdminOrganization;
  initialSetting: OrganizationPricingSetting;
  initialEligibility: OrganizationPricingEligibility;
  initialBankAccount?: AdminBankAccount | null;
}

export function PricingPanel({
  organization,
  initialSetting,
  initialEligibility,
  initialBankAccount,
}: PricingPanelProps) {
  const { pending, run } = useOrgAction({ successMessage: "Organization pricing controls updated" });

  const [paidEventsEnabled, setPaidEventsEnabled] = useState(initialSetting.paidEventsEnabled);
  const [requireBankDetails, setRequireBankDetails] = useState(initialSetting.requireBankDetails);
  const [disabledReason, setDisabledReason] = useState(initialSetting.disabledReason ?? "");

  // Bank account verification state
  const [bankAccount, setBankAccount] = useState<AdminBankAccount | null>(initialBankAccount ?? null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const id = String(organization.id);
  const bankVerified = initialEligibility.bankDetailsVerified || bankAccount?.status === "verified";

  const isDirty =
    paidEventsEnabled !== initialSetting.paidEventsEnabled ||
    requireBankDetails !== initialSetting.requireBankDetails ||
    (disabledReason || "") !== (initialSetting.disabledReason || "");

  const handleReset = () => {
    setPaidEventsEnabled(initialSetting.paidEventsEnabled);
    setRequireBankDetails(initialSetting.requireBankDetails);
    setDisabledReason(initialSetting.disabledReason ?? "");
  };

  const handleSave = () => {
    run(() =>
      updateOrganizationPricing(id, {
        paidEventsEnabled,
        requireBankDetails,
        disabledReason: paidEventsEnabled ? null : disabledReason.trim() || null,
      }),
    );
  };

  const handleVerifyBank = () => {
    run(async () => {
      const updated = await verifyOrganizationBankAccount(id, "verified");
      setBankAccount(updated);
    });
  };

  const handleRejectBank = () => {
    if (!rejectReason.trim()) return;
    run(async () => {
      const updated = await verifyOrganizationBankAccount(id, "rejected", rejectReason.trim());
      setBankAccount(updated);
      setShowRejectForm(false);
      setRejectReason("");
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Status Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconCoin className="size-5 text-primary" />
                Organization Pricing & Paid Event Controls
              </CardTitle>
              <CardDescription className="text-xs">
                Configure whether {organization.name} is permitted to publish paid ticketed events and enforce bank
                account verification.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={initialSetting.paidEventsEnabled ? "default" : "destructive"}>
                {initialSetting.paidEventsEnabled ? "Paid Events: Enabled" : "Paid Events: Disabled"}
              </Badge>
              <Badge variant={initialSetting.requireBankDetails ? "secondary" : "outline"}>
                {initialSetting.requireBankDetails ? "Bank Details: Mandatory" : "Bank Details: Optional"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Diagnostic Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Status 1: Paid Event Permission */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <div
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  initialSetting.paidEventsEnabled ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                }`}
              >
                {initialSetting.paidEventsEnabled ? <IconCheck className="size-4" /> : <IconX className="size-4" />}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Paid Event Permission</p>
                <p className="text-sm font-semibold text-foreground">
                  {initialSetting.paidEventsEnabled ? "Allowed" : "Restricted"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {initialSetting.paidEventsEnabled
                    ? "Organization is permitted to host paid events"
                    : "Blocked from hosting paid events by admin"}
                </p>
              </div>
            </div>

            {/* Status 2: Bank Account Verification */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <div
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  bankVerified ? "bg-primary/10 text-primary" : "bg-warning/10 text-warning"
                }`}
              >
                <IconBuildingBank className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bank Account Verification</p>
                <p className="text-sm font-semibold text-foreground">
                  {bankVerified ? "Verified on File" : "No Verified Bank"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {bankVerified
                    ? "Active settlement payout account connected"
                    : "No approved bank payout details or KYC proof"}
                </p>
              </div>
            </div>

            {/* Status 3: Live Eligibility */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <div
                className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  initialEligibility.eligibleForPaidEvents
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {initialEligibility.eligibleForPaidEvents ? (
                  <IconShieldCheck className="size-4" />
                ) : (
                  <IconLock className="size-4" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Live Paid Eligibility</p>
                <p className="text-sm font-semibold text-foreground">
                  {initialEligibility.eligibleForPaidEvents ? "Eligible" : "Ineligible"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {initialEligibility.eligibleForPaidEvents
                    ? "Organization satisfies all paid ticket conditions"
                    : "Prerequisites unmet for paid event ticketing"}
                </p>
              </div>
            </div>
          </div>

          {/* If ineligible, show reasons banner */}
          {!initialEligibility.eligibleForPaidEvents && initialEligibility.reasons.length > 0 && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
              <div className="space-y-1">
                <span className="font-semibold">Current Eligibility Barriers:</span>
                <ul className="list-inside list-disc space-y-0.5">
                  {initialEligibility.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Bank Account Review & Moderation Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconBuildingBank className="size-5 text-primary" />
                Payout Bank Account Details
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect and approve bank account details submitted by {organization.name} for ticket payouts.
              </CardDescription>
            </div>
            <div>
              {bankAccount ? (
                bankAccount.status === "verified" ? (
                  <Badge variant="default" className="gap-1.5">
                    <IconShieldCheck className="size-3.5" />
                    Verified
                  </Badge>
                ) : bankAccount.status === "pending" ? (
                  <Badge variant="secondary" className="gap-1.5">
                    <IconClock className="size-3.5" />
                    Pending Review
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1.5">
                    <IconAlertTriangle className="size-3.5" />
                    Rejected
                  </Badge>
                )
              ) : (
                <Badge variant="outline">Not Submitted</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankAccount ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <p className="text-xs font-medium text-muted-foreground">Bank Name</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{bankAccount.bankName}</p>
                  {bankAccount.branchName && (
                    <p className="text-[11px] text-muted-foreground truncate">{bankAccount.branchName}</p>
                  )}
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <p className="text-xs font-medium text-muted-foreground">Account Holder</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">
                    {bankAccount.accountHolderName}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase">{bankAccount.accountType}</p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <p className="text-xs font-medium text-muted-foreground">Account Number</p>
                  <p className="font-mono text-sm font-semibold text-foreground mt-0.5 tracking-wider">
                    {bankAccount.accountNumber || bankAccount.accountNumberMasked}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  <p className="text-xs font-medium text-muted-foreground">IFSC / Routing Code</p>
                  <p className="font-mono text-sm font-semibold text-foreground mt-0.5">{bankAccount.ifscCode}</p>
                </div>
              </div>

              {bankAccount.verificationNotes && (
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs">
                  <p className="font-semibold text-muted-foreground">Moderation Notes:</p>
                  <p className="text-foreground mt-0.5">{bankAccount.verificationNotes}</p>
                </div>
              )}

              {/* Admin Moderation Actions */}
              <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-3">
                {bankAccount.status !== "verified" && (
                  <Button size="sm" onClick={handleVerifyBank} disabled={pending} className="gap-1.5">
                    <IconCheck className="size-3.5" />
                    <span>Approve & Verify Bank Details</span>
                  </Button>
                )}

                {bankAccount.status !== "rejected" && !showRejectForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectForm(true)}
                    disabled={pending}
                    className="gap-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <IconX className="size-3.5" />
                    <span>Reject Bank Details</span>
                  </Button>
                )}
              </div>

              {showRejectForm && (
                <div className="space-y-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <Label htmlFor="reject-bank-reason" className="text-xs font-semibold text-destructive">
                    Reason for Rejection (Displayed to Organizer)
                  </Label>
                  <Input
                    id="reject-bank-reason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g., Account holder name does not match legal entity PAN."
                    disabled={pending}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRejectBank}
                      disabled={pending || !rejectReason.trim()}
                    >
                      Confirm Rejection
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowRejectForm(false)} disabled={pending}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
              <IconBuildingBank className="mx-auto size-8 text-muted-foreground/50 mb-2" />
              <p className="font-medium text-foreground">No Bank Account Configured</p>
              <p className="mt-1">
                The organization operator has not yet submitted payout bank details in their organization settings.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Toggles & Reason Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Control Settings</CardTitle>
          <CardDescription className="text-xs">
            Toggle platform permissions and enforcement rules for this organization.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Toggle 1: Allow Paid Events */}
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="toggle-paid-events" className="text-sm font-semibold cursor-pointer">
                  Allow Paid Event Creation
                </Label>
                <Badge variant={paidEventsEnabled ? "default" : "secondary"} className="text-[10px]">
                  {paidEventsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, organizers in this organization can create paid ticket tiers and accept attendee payments.
                When disabled, organizers can only host free registration events.
              </p>
            </div>
            <Switch
              id="toggle-paid-events"
              checked={paidEventsEnabled}
              onCheckedChange={setPaidEventsEnabled}
              disabled={pending}
            />
          </div>

          {/* Toggle 2: Require Bank Details */}
          <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/30">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="toggle-require-bank" className="text-sm font-semibold cursor-pointer">
                  Require Verified Bank Details
                </Label>
                <Badge variant={requireBankDetails ? "secondary" : "outline"} className="text-[10px]">
                  {requireBankDetails ? "Mandatory" : "Optional"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                When enabled, the organization must add and verify their payout bank details before publishing paid
                events. If disabled, organizers can publish paid events immediately without prior bank verification.
              </p>
            </div>
            <Switch
              id="toggle-require-bank"
              checked={requireBankDetails}
              onCheckedChange={setRequireBankDetails}
              disabled={pending}
            />
          </div>

          {/* Reason Input (displayed when paid events disabled) */}
          {!paidEventsEnabled && (
            <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="disabled-reason" className="text-xs font-semibold">
                  Reason for Disabling Paid Events
                </Label>
                <span className="text-[11px] text-muted-foreground">(Displayed to organizer & sent via email)</span>
              </div>
              <Textarea
                id="disabled-reason"
                value={disabledReason}
                onChange={(e) => setDisabledReason(e.target.value)}
                placeholder="e.g., Pending GST document review, high dispute rate, or tax residency compliance check."
                rows={3}
                disabled={pending}
              />
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <IconInfoCircle className="size-3.5 shrink-0" />
                This explanation will be included in the automated notification email sent to the organization owner.
              </p>
            </div>
          )}

          {/* Save / Discard Actions */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div className="text-xs text-muted-foreground">
              {isDirty ? (
                <span className="text-foreground font-medium">You have unsaved changes.</span>
              ) : (
                <span>All changes are saved.</span>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={pending || !isDirty}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={pending || !isDirty}>
                {pending ? "Saving..." : "Save Pricing Controls"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
