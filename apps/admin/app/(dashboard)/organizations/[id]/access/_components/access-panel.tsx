"use client";

import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Label } from "@orgatick/ui/components/label";
import { Textarea } from "@orgatick/ui/components/textarea";
import { Badge } from "@orgatick/ui/components/badge";
import { useState } from "react";
import type { AdminOrganization } from "@/lib/types";
import {
  archiveOrganization,
  blockOrganization,
  hideOrganization,
  restoreOrganization,
  showOrganization,
  unblockOrganization,
} from "@/lib/org-admin.api";
import { dangerButton, useOrgAction } from "../../_components/use-org-action";

interface AccessPanelProps {
  organization: AdminOrganization;
}

export function AccessPanel({ organization }: AccessPanelProps) {
  const { pending, run } = useOrgAction({ successMessage: "Access state updated" });
  const [reason, setReason] = useState("");
  const state = organization.adminState;
  const id = String(organization.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Access control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant={state?.blocked ? "destructive" : "secondary"}>Blocked: {state?.blocked ? "yes" : "no"}</Badge>
          <Badge variant={state?.hidden ? "destructive" : "secondary"}>Hidden: {state?.hidden ? "yes" : "no"}</Badge>
          <Badge variant={state?.archived ? "destructive" : "secondary"}>
            Archived: {state?.archived ? "yes" : "no"}
          </Badge>
        </div>

        <div className="space-y-2">
          <Label htmlFor="access-reason" className="text-xs">
            Reason <span className="font-normal text-muted-foreground">(for block, hide and archive)</span>
          </Label>
          <Textarea
            id="access-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why is this action being taken?"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2 rounded-xl border border-border/60 p-3">
            <p className="text-sm font-semibold">Blocking</p>
            <p className="text-xs text-muted-foreground truncate">
              {state?.blocked ? `Blocked: ${state.blockReason ?? "—"}` : "Block access to the organization."}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className={dangerButton}
                disabled={pending || state?.blocked}
                onClick={() => run(() => blockOrganization(id, reason.trim()))}
              >
                Block
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pending || !state?.blocked}
                onClick={() => run(() => unblockOrganization(id))}
              >
                Unblock
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 p-3">
            <p className="text-sm font-semibold">Visibility</p>
            <p className="text-xs text-muted-foreground truncate">
              {state?.hidden ? `Hidden: ${state.hiddenReason ?? "—"}` : "Hide organization content."}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pending || state?.hidden}
                onClick={() => run(() => hideOrganization(id, reason.trim()))}
              >
                Hide
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pending || !state?.hidden}
                onClick={() => run(() => showOrganization(id))}
              >
                Show
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 p-3">
            <p className="text-sm font-semibold">Archive</p>
            <p className="text-xs text-muted-foreground truncate">
              {state?.archived ? `Archived: ${state.archivedReason ?? "—"}` : "Archive the organization."}
            </p>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className={dangerButton}
                disabled={pending || state?.archived}
                onClick={() => run(() => archiveOrganization(id, reason.trim()))}
              >
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pending || !state?.archived}
                onClick={() => run(() => restoreOrganization(id))}
              >
                Restore
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
