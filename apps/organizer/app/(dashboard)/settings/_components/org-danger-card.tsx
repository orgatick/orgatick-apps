"use client";

import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { toast } from "sonner";
import { IconAlertTriangle, IconDoorExit, IconExchange } from "@tabler/icons-react";

interface OrgDangerCardProps {
  isOwner: boolean;
}

export function OrgDangerCard({ isOwner }: OrgDangerCardProps) {
  const handleAction = (label: string) => {
    toast.info(`${label} requires contacting platform support.`);
  };

  return (
    <Card className="rounded-xl border border-destructive/30 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive">
          <IconAlertTriangle className="size-5 shrink-0" />
          <CardTitle className="text-base font-semibold">Danger Zone</CardTitle>
        </div>
        <CardDescription>Irreversible actions related to your organization ownership and membership.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isOwner ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border/60 bg-card p-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">Transfer Ownership</p>
              <p className="text-xs text-muted-foreground">
                Transfer the owner role to another active member of the organization.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAction("Transferring ownership")}
              className="shrink-0 gap-1.5"
            >
              <IconExchange className="size-4" />
              <span>Transfer</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border/60 bg-card p-3.5">
            <div>
              <p className="text-sm font-medium text-foreground">Leave Organization</p>
              <p className="text-xs text-muted-foreground">Relinquish your membership and role in this organization.</p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleAction("Leaving organization")}
              className="shrink-0 gap-1.5"
            >
              <IconDoorExit className="size-4" />
              <span>Leave</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
