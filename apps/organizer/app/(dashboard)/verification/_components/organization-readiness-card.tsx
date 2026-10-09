import { cn } from "@orgatick/ui/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@orgatick/ui/components/card";
import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import type { SidebarOrganization } from "@/lib/sidebar/nav-config";
import { computeReadinessItems } from "./verification-types";
import { LinkButton } from "@/components/ui/link-button";

interface OrganizationReadinessCardProps {
  organization: SidebarOrganization["organization"];
  bankAccount?: { bankName?: string; status?: string } | null;
}

export function OrganizationReadinessCard({ organization, bankAccount }: OrganizationReadinessCardProps) {
  const { items, completedCount, totalCount, scorePercentage } = computeReadinessItems(organization, bankAccount);
  const isFullyReady = completedCount === totalCount;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Verification Readiness Audit
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
                isFullyReady ? "bg-success/15 text-success" : "bg-warning/15 text-warning",
              )}
            >
              {completedCount}/{totalCount} Completed
            </span>
          </CardTitle>
          <CardDescription className="text-xs">
            Review the business details submitted to our compliance reviewers.
          </CardDescription>
        </div>

        <LinkButton variant="outline" size="xs" href="/settings" className="gap-1.5 text-xs h-7">
          <IconPencil className="size-3" />
          Edit Details
        </LinkButton>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground font-medium">Compliance Profile Health</span>
            <span className="font-mono font-semibold text-foreground">{scorePercentage}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isFullyReady ? "bg-success" : "bg-primary",
              )}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>

        {/* Audit Checklist */}
        <div className="divide-y divide-border/40 rounded-lg border border-border/50 bg-card/40">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 text-xs">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <span
                  className={cn(
                    "mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-full text-[10px]",
                    item.isComplete ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                  )}
                >
                  {item.isComplete ? <IconCheck className="size-3" /> : <IconX className="size-3" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-muted-foreground truncate">{item.value ?? item.helperText}</p>
                </div>
              </div>

              <span
                className={cn(
                  "shrink-0 font-mono text-[10px] uppercase font-semibold ms-3",
                  item.isComplete ? "text-success" : "text-muted-foreground",
                )}
              >
                {item.isComplete ? "Verified" : "Missing"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
