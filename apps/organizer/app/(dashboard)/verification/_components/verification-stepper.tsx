import { cn } from "@orgatick/ui/lib/utils";
import { OrganizationVerificationStatus } from "@orgatick/contracts";
import { IconCheck, IconClockHour4, IconFileCheck, IconShieldCheck, IconX } from "@tabler/icons-react";

interface VerificationStepperProps {
  status: OrganizationVerificationStatus;
}

export function VerificationStepper({ status }: VerificationStepperProps) {
  const isVerified = status === OrganizationVerificationStatus.VERIFIED;
  const isPending = status === OrganizationVerificationStatus.PENDING;
  const isRejected = status === OrganizationVerificationStatus.REJECTED;

  const steps = [
    {
      index: 1,
      title: "Organization Profile",
      desc: "Business identity & contact details",
      isDone: true,
      isActive: !isPending && !isVerified && !isRejected,
      icon: IconFileCheck,
    },
    {
      index: 2,
      title: "Trust & Safety Review",
      desc: isVerified
        ? "Approved by compliance team"
        : isPending
          ? "Under review (1–2 days SLA)"
          : isRejected
            ? "Revisions required"
            : "Awaiting submission",
      isDone: isVerified,
      isActive: isPending,
      isError: isRejected,
      icon: isRejected ? IconX : isPending ? IconClockHour4 : IconShieldCheck,
    },
    {
      index: 3,
      title: "Marketplace Clearance",
      desc: isVerified ? "Live payouts & public discovery active" : "Unlocks publishing & ticket sales",
      isDone: isVerified,
      isActive: false,
      icon: IconCheck,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {steps.map((step) => {
        const Icon = step.icon;
        return (
          <div
            key={step.index}
            className={cn(
              "relative flex items-start gap-3 rounded-xl border p-3.5 transition-colors",
              step.isDone && "border-success/30 bg-success/5",
              step.isActive && "border-warning/30 bg-warning/5 ring-1 ring-warning/20",
              step.isError && "border-destructive/30 bg-destructive/5 ring-1 ring-destructive/20",
              !step.isDone && !step.isActive && !step.isError && "border-border/60 bg-card/60",
            )}
          >
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold",
                step.isDone && "bg-success text-success-foreground",
                step.isActive && "bg-warning text-warning-foreground animate-pulse",
                step.isError && "bg-destructive text-destructive-foreground",
                !step.isDone && !step.isActive && !step.isError && "bg-muted text-muted-foreground",
              )}
            >
              {step.isDone ? <IconCheck className="size-4" /> : <Icon className="size-4" />}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">Step 0{step.index}</p>
              <p className="truncate text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
