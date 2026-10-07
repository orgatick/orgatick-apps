"use client";

import { useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Label } from "@orgatick/ui/components/label";
import { Textarea } from "@orgatick/ui/components/textarea";
import type { OrganizationReportRef } from "@/lib/types";
import { rejectReport, resolveReport, updateReportStatus } from "@/lib/admin.api";
import { useAdminAction } from "@/components/use-admin-action";

interface ReportDetailActionsProps {
  report: OrganizationReportRef;
}

export function ReportDetailActions({ report }: ReportDetailActionsProps) {
  const { pending, run } = useAdminAction({ successMessage: "Report updated" });
  const [resolution, setResolution] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const id = String(report.id);
  const terminal = report.status === "resolved" || report.status === "rejected";
  const investigating = report.status === "investigating";

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
              onClick={() => run(() => updateReportStatus(id, "investigating"))}
            >
              Start investigating
            </Button>
          )}
          {investigating && (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => run(() => updateReportStatus(id, "open"))}
            >
              Reopen
            </Button>
          )}
          {terminal && (
            <span className="font-mono text-xs text-muted-foreground">This report is closed ({report.status}).</span>
          )}
        </div>

        <div className="space-y-2 border-t border-border/60 pt-4">
          <Label htmlFor="report-resolution">Resolution notes</Label>
          <Textarea
            id="report-resolution"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Document how this report was resolved."
            rows={3}
          />
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
            disabled={pending || terminal || resolution.trim().length < 3}
            onClick={() => {
              const note = resolution.trim();
              setResolution("");
              run(() => resolveReport(id, note));
            }}
          >
            Resolve report
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-rejection">Rejection reason</Label>
          <Textarea
            id="report-rejection"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Why is this report being rejected?"
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
              run(() => rejectReport(id, reason));
            }}
          >
            Reject report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
