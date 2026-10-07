import { Badge } from "@orgatick/ui/components/badge";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { IconClockHour4, IconShieldCheck, IconX } from "@tabler/icons-react";
import { RaiseVerificationButton } from "./raise-verification-button";

interface VerificationHeaderProps {
  organizationId: string | number;
  organizationName: string;
  status: OrganizationVerificationStatus;
  canSubmit: boolean;
  roleName?: string;
}

export function VerificationHeader({
  organizationId,
  organizationName,
  status,
  canSubmit,
  roleName,
}: VerificationHeaderProps) {
  const isVerified = status === OrganizationVerificationStatus.VERIFIED;
  const isPending = status === OrganizationVerificationStatus.PENDING;
  const isRejected = status === OrganizationVerificationStatus.REJECTED;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
            Trust & Compliance
          </p>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs text-muted-foreground">{organizationName}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Verification</h1>

          {isVerified && (
            <Badge variant="outline" className="border-success/30 bg-success/10 text-success gap-1 text-xs">
              <IconShieldCheck className="size-3.5" />
              Verified Organization
            </Badge>
          )}

          {isPending && (
            <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning gap-1 text-xs">
              <IconClockHour4 className="size-3.5" />
              In Review
            </Badge>
          )}

          {isRejected && (
            <Badge variant="destructive" className="gap-1 text-xs">
              <IconX className="size-3.5" />
              Action Required
            </Badge>
          )}

          {!isVerified && !isPending && !isRejected && (
            <Badge variant="secondary" className="text-xs">
              Unverified
            </Badge>
          )}
        </div>

        <p className="text-sm text-muted-foreground max-w-2xl">
          Complete organizational verification to enable ticket sales, automated bank payouts, and public marketplace
          discovery.
        </p>
      </div>

      {!isVerified && (
        <div className="flex shrink-0 items-center gap-2">
          <RaiseVerificationButton
            organizationId={organizationId}
            organizationName={organizationName}
            isResubmission={isRejected}
            canSubmit={canSubmit}
            roleName={roleName}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
