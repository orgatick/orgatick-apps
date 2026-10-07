import { Badge } from "@orgatick/ui/components/badge";
import { IconShieldCheck } from "@tabler/icons-react";

interface DashboardHeaderProps {
  orgName: string;
  roleName: string;
  isVerified: boolean;
}

export function DashboardHeader({ orgName, roleName, isVerified }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
            Organization Dashboard
          </p>
          <span className="text-muted-foreground/40">•</span>
          <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Role: {roleName}
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{orgName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={isVerified ? "default" : "secondary"} className="gap-1.5 py-1 px-3">
          <IconShieldCheck className="size-3.5" />
          <span>{isVerified ? "Verified" : "Pending Verification"}</span>
        </Badge>
      </div>
    </div>
  );
}
