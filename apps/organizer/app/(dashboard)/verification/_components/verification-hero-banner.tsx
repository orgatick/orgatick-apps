import { Alert, AlertDescription, AlertTitle } from "@orgatick/ui/components/alert";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconClockHour4,
  IconFileCertificate,
  IconShieldCheck,
} from "@tabler/icons-react";
import { formatVerificationDate } from "./verification-types";
import { RaiseVerificationButton } from "./raise-verification-button";
import { LinkButton } from "@/components/ui/link-button";

interface VerificationHeroBannerProps {
  organizationId: string | number;
  organizationName: string;
  status: OrganizationVerificationStatus;
  rejectionReason?: string | null;
  verifiedAt?: string | null;
  canSubmit: boolean;
  roleName?: string;
}

export function VerificationHeroBanner({
  organizationId,
  organizationName,
  status,
  rejectionReason,
  verifiedAt,
  canSubmit,
  roleName,
}: VerificationHeroBannerProps) {
  const verifiedDateStr = formatVerificationDate(verifiedAt);

  if (status === OrganizationVerificationStatus.VERIFIED) {
    return (
      <Card className="border-success/30 bg-gradient-to-br from-success/10 via-card to-card">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-success/20 text-success">
              <IconShieldCheck className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-success">
                  Active & Compliant
                </span>
                {verifiedDateStr && <span className="text-xs text-muted-foreground">· Verified {verifiedDateStr}</span>}
              </div>
              <h2 className="text-base font-bold text-foreground sm:text-lg">{organizationName} is Fully Verified</h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Platform compliance checks cleared. Public event listing, payments, and verified badges are unlocked.
              </p>
            </div>
          </div>

          <LinkButton size="sm" href="/" className="gap-2 shrink-0">
            Go to Dashboard
            <IconArrowRight className="size-4" />
          </LinkButton>
        </CardContent>
      </Card>
    );
  }

  if (status === OrganizationVerificationStatus.PENDING) {
    return (
      <Card className="border-warning/30 bg-gradient-to-br from-warning/10 via-card to-card">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-warning/20 text-warning">
              <IconClockHour4 className="size-6" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-warning">
                Under Review · 1–2 Business Days SLA
              </span>
              <h2 className="text-base font-bold text-foreground sm:text-lg">Verification Request in Progress</h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Compliance specialists are reviewing the details submitted for{" "}
                <span className="font-medium text-foreground">{organizationName}</span>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 rounded-xl border border-warning/20 bg-background/60 p-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs">
              <IconCheck className="size-4 text-success shrink-0" />
              <span>Details Received</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <IconClockHour4 className="size-4 text-warning shrink-0 animate-spin" />
              <span>Compliance Audit Active</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconFileCertificate className="size-4 shrink-0" />
              <span>Decision Notification</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === OrganizationVerificationStatus.REJECTED) {
    return (
      <Card className="border-destructive/30 bg-gradient-to-br from-destructive/10 via-card to-card">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/20 text-destructive">
                <IconAlertTriangle className="size-6" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-destructive">
                  Action Required · Revisions Requested
                </span>
                <h2 className="text-base font-bold text-foreground sm:text-lg">Verification Needs Attention</h2>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Please update the required business details and resubmit for review.
                </p>
              </div>
            </div>

            <RaiseVerificationButton
              organizationId={organizationId}
              organizationName={organizationName}
              isResubmission={true}
              canSubmit={canSubmit}
              roleName={roleName}
              size="sm"
            />
          </div>

          {rejectionReason && (
            <Alert variant="destructive" className="border-destructive/40 bg-destructive/10">
              <IconAlertTriangle />
              <AlertTitle>Reviewer Feedback</AlertTitle>
              <AlertDescription className="text-xs">{rejectionReason}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconFileCertificate className="size-6" />
          </div>
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
              Ready for Review
            </span>
            <h2 className="text-base font-bold text-foreground sm:text-lg">Verify your organization</h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Enable public ticket sales, automated bank payouts, and official verified badges by submitting for review.
            </p>
          </div>
        </div>

        <RaiseVerificationButton
          organizationId={organizationId}
          organizationName={organizationName}
          isResubmission={false}
          canSubmit={canSubmit}
          roleName={roleName}
        />
      </CardContent>
    </Card>
  );
}
