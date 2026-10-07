"use client";

import { useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Checkbox } from "@orgatick/ui/components/checkbox";
import { Label } from "@orgatick/ui/components/label";
import { Switch } from "@orgatick/ui/components/switch";
import { Textarea } from "@orgatick/ui/components/textarea";
import type { OwnershipDisputeRef } from "@/lib/types";
import { rejectDispute, resolveDispute, setDisputeFrozen, updateDisputeStatus } from "@/lib/admin.api";
import { useAdminAction } from "@/components/use-admin-action";

interface DisputeDetailActionsProps {
  dispute: OwnershipDisputeRef;
}

export function DisputeDetailActions({ dispute }: DisputeDetailActionsProps) {
  const { pending, run } = useAdminAction({ successMessage: "Dispute updated" });
  const [resolution, setResolution] = useState("");
  const [transferOwnership, setTransferOwnership] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const id = String(dispute.id);
  const terminal = dispute.status === "resolved" || dispute.status === "rejected";
  const investigating = dispute.status === "investigating";
  const disputantId = dispute.disputant?.id;
  const resolutionReady = resolution.trim().length >= 3;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {!terminal && (
            <Button
              variant="outline"
              size="sm"
              disabled={pending || investigating}
              onClick={() => run(() => updateDisputeStatus(id, "investigating"))}
            >
              Start investigating
            </Button>
          )}
          {investigating && (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => run(() => updateDisputeStatus(id, "open"))}
            >
              Reopen
            </Button>
          )}
          {terminal && (
            <span className="font-mono text-xs text-muted-foreground">This dispute is closed ({dispute.status}).</span>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/60 px-3 py-2.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Freeze ownership</p>
            <p className="text-xs text-muted-foreground">
              Blocks ownership transfers while the dispute is under review.
            </p>
          </div>
          <Switch
            checked={dispute.freezeOwnership}
            disabled={pending || terminal}
            onCheckedChange={(frozen) => run(() => setDisputeFrozen(id, frozen))}
            aria-label="Toggle ownership freeze"
          />
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4">
          <Label htmlFor="dispute-resolution">Resolution notes</Label>
          <Textarea
            id="dispute-resolution"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Document how this dispute was resolved."
            rows={3}
          />
          {disputantId !== undefined && investigateOwnerOption(dispute, transferOwnership, setTransferOwnership)}
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
            disabled={pending || terminal || !resolutionReady}
            onClick={() => {
              const note = resolution.trim();
              setResolution("");
              setTransferOwnership(false);
              run(() => resolveDispute(id, note, transferOwnership ? Number(disputantId) : undefined));
            }}
          >
            Resolve dispute
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispute-rejection">Rejection reason</Label>
          <Textarea
            id="dispute-rejection"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Why is this dispute being rejected?"
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
            disabled={pending || terminal || rejectionReason.trim().length < 3}
            onClick={() => {
              const reason = rejectionReason.trim();
              setRejectionReason("");
              run(() => rejectDispute(id, reason));
            }}
          >
            Reject dispute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function investigateOwnerOption(dispute: OwnershipDisputeRef, checked: boolean, onChange: (next: boolean) => void) {
  if (dispute.status === "resolved" || dispute.status === "rejected") return null;
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <Checkbox
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        aria-label="Transfer ownership to the disputant"
      />
      <span>
        Transfer ownership to the disputant{" "}
        <span className="text-xs text-muted-foreground">({dispute.disputant?.name ?? "member"})</span>
      </span>
    </div>
  );
}
