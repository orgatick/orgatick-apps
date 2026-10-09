"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconEdit,
  IconLoader2,
  IconLock,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { toast } from "sonner";
import {
  OrganizationBankAccountStatus,
  OrganizationBankAccountType,
  type OrganizationBankAccountResponse,
} from "@orgatick/contracts";
import { saveOrganizationBankAccount } from "@/lib/apis/organization.api";

interface OrgBankDetailsCardProps {
  organizationId: string;
  initialAccount: OrganizationBankAccountResponse | null;
  isOwnerOrAdmin: boolean;
}

export function OrgBankDetailsCard({ organizationId, initialAccount, isOwnerOrAdmin }: OrgBankDetailsCardProps) {
  const router = useRouter();
  const [account, setAccount] = useState<OrganizationBankAccountResponse | null>(initialAccount);
  const [isEditing, setIsEditing] = useState<boolean>(!initialAccount);

  // Form states
  const [accountHolderName, setAccountHolderName] = useState(initialAccount?.accountHolderName ?? "");
  const [bankName, setBankName] = useState(initialAccount?.bankName ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState(initialAccount?.ifscCode ?? "");
  const [branchName, setBranchName] = useState(initialAccount?.branchName ?? "");
  const [accountType, setAccountType] = useState<OrganizationBankAccountType>(
    (initialAccount?.accountType as OrganizationBankAccountType) ?? OrganizationBankAccountType.CURRENT,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartEdit = () => {
    if (account) {
      setAccountHolderName(account.accountHolderName);
      setBankName(account.bankName);
      setIfscCode(account.ifscCode);
      setBranchName(account.branchName ?? "");
      setAccountType((account.accountType as OrganizationBankAccountType) ?? OrganizationBankAccountType.CURRENT);
      setAccountNumber("");
      setConfirmAccountNumber("");
    }
    setError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (account) {
      setIsEditing(false);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accountHolderName.trim()) {
      setError("Account holder name is required");
      return;
    }
    if (!bankName.trim()) {
      setError("Bank name is required");
      return;
    }
    if (!accountNumber.trim()) {
      setError("Bank account number is required");
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setError("Bank account numbers do not match");
      return;
    }
    if (!ifscCode.trim()) {
      setError("IFSC / Branch routing code is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await saveOrganizationBankAccount(organizationId, {
        accountHolderName: accountHolderName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        branchName: branchName.trim() || undefined,
        accountType,
      });

      setAccount(saved);
      setIsEditing(false);
      setAccountNumber("");
      setConfirmAccountNumber("");
      toast.success("Bank account details saved and submitted for review");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save bank details";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerified = account?.status === OrganizationBankAccountStatus.VERIFIED;
  const isPending = account?.status === OrganizationBankAccountStatus.PENDING;
  const isRejected = account?.status === OrganizationBankAccountStatus.REJECTED;

  return (
    <Card id="bank-details" className="rounded-xl border border-border/60 bg-card">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <IconBuildingBank className="size-5 text-primary" />
              <CardTitle className="text-base font-semibold">Payout Bank Account</CardTitle>
            </div>
            <CardDescription>
              Bank account details used for ticketing settlement, automated payouts, and revenue deposits.
            </CardDescription>
          </div>
          <div>
            {account ? (
              isVerified ? (
                <Badge variant="default" className="gap-1.5">
                  <IconShieldCheck className="size-3.5" />
                  Verified on File
                </Badge>
              ) : isPending ? (
                <Badge variant="secondary" className="gap-1.5">
                  <IconClock className="size-3.5" />
                  Pending Review
                </Badge>
              ) : isRejected ? (
                <Badge variant="destructive" className="gap-1.5">
                  <IconAlertTriangle className="size-3.5" />
                  Action Required
                </Badge>
              ) : (
                <Badge variant="outline">{account.status}</Badge>
              )
            ) : (
              <Badge variant="destructive" className="gap-1.5">
                <IconAlertCircle className="size-3.5" />
                Missing Bank Account
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {!isEditing && account ? (
        <CardContent className="space-y-4">
          {/* Diagnostic Info Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Bank Name</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{account.bankName}</p>
              {account.branchName && <p className="text-[11px] text-muted-foreground truncate">{account.branchName}</p>}
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Account Holder</p>
              <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{account.accountHolderName}</p>
              <p className="text-[11px] text-muted-foreground capitalize">
                {account.accountType === OrganizationBankAccountType.CURRENT ? "Current Account" : "Savings Account"}
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Account Number</p>
              <p className="font-mono text-sm font-semibold text-foreground mt-0.5 tracking-wider">
                {account.accountNumberMasked}
              </p>
              <p className="text-[11px] text-muted-foreground">Encrypted on file</p>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">IFSC / Routing Code</p>
              <p className="font-mono text-sm font-semibold text-foreground mt-0.5">{account.ifscCode}</p>
              <p className="text-[11px] text-muted-foreground">Branch identifier</p>
            </div>
          </div>

          {/* Feedback Banners */}
          {isVerified && (
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground">
              <IconShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Settlement Account Cleared</p>
                <p className="text-muted-foreground">
                  Your bank account has been verified by platform compliance. All net revenues from paid ticket sales
                  will settle directly to this account according to your organization&apos;s settlement schedule.
                </p>
              </div>
            </div>
          )}

          {isPending && (
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-xs text-foreground">
              <IconClock className="size-5 shrink-0 text-warning mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Verification in Progress</p>
                <p className="text-muted-foreground">
                  Our compliance team is verifying your banking details. Once cleared, direct automated payouts and paid
                  ticketing will be enabled.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="space-y-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive">
              <div className="flex items-start gap-2.5">
                <IconAlertTriangle className="size-5 shrink-0 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Bank Details Verification Rejected</p>
                  <p className="text-muted-foreground">
                    {account.verificationNotes ||
                      "The bank details provided could not be verified against the official regulatory records. Please review and update your details below."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Row */}
          {isOwnerOrAdmin && (
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={handleStartEdit} className="gap-1.5">
                <IconEdit className="size-3.5" />
                <span>Update Bank Details</span>
              </Button>
            </div>
          )}
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!account && (
              <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground">
                <IconLock className="size-4 shrink-0 text-primary mt-0.5" />
                <p>
                  Add your organization&apos;s official bank account details to enable automated ticket sale payouts and
                  unlock paid event publishing.
                </p>
              </div>
            )}

            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="account-holder">Account Holder Name *</FieldLabel>
                <Input
                  id="account-holder"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g., Acme Technologies Pvt Ltd"
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="bank-name">Bank Name *</FieldLabel>
                <Input
                  id="bank-name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g., HDFC Bank, State Bank of India"
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="account-number">Account Number *</FieldLabel>
                <Input
                  id="account-number"
                  type="password"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter full bank account number"
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-account-number">Confirm Account Number *</FieldLabel>
                <Input
                  id="confirm-account-number"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value)}
                  placeholder="Re-enter bank account number"
                  required
                  disabled={isSubmitting}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="ifsc-code">IFSC / Branch Routing Code *</FieldLabel>
                <Input
                  id="ifsc-code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g., HDFC0001234"
                  required
                  disabled={isSubmitting}
                  className="font-mono uppercase"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="branch-name">Branch Name (Optional)</FieldLabel>
                <Input
                  id="branch-name"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g., Indiranagar Branch, Bengaluru"
                  disabled={isSubmitting}
                />
              </Field>
            </FieldGroup>

            {/* Account Type Toggle */}
            <div className="space-y-1.5">
              <FieldLabel>Account Type</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={accountType === OrganizationBankAccountType.CURRENT ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAccountType(OrganizationBankAccountType.CURRENT)}
                  disabled={isSubmitting}
                >
                  Current Account (Business)
                </Button>
                <Button
                  type="button"
                  variant={accountType === OrganizationBankAccountType.SAVINGS ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAccountType(OrganizationBankAccountType.SAVINGS)}
                  disabled={isSubmitting}
                >
                  Savings Account
                </Button>
              </div>
            </div>

            {error && <FieldError>{error}</FieldError>}
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-border/40 pt-4">
            <div>
              {account && (
                <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSubmitting}>
                  <IconX className="size-4" />
                  <span>Cancel</span>
                </Button>
              )}
            </div>

            <Button type="submit" size="sm" disabled={isSubmitting || !isOwnerOrAdmin}>
              {isSubmitting ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>Saving Bank Details...</span>
                </>
              ) : (
                <>
                  <IconCheck className="size-4" />
                  <span>Save & Submit for Verification</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
