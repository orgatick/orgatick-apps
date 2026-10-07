"use client";

import type { ReactNode } from "react";
import { IconCalendarClock, IconMail, IconUserPlus, IconUsers } from "@tabler/icons-react";
import type { OrganizationInvitationPreviewResponse } from "@orgatick/contracts";
import { formatRole } from "./invitation-status-screens";

type PreviewData = OrganizationInvitationPreviewResponse["data"];

function formatExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="max-w-[55%] text-right font-medium break-words">{value}</span>
    </div>
  );
}

interface InvitationDetailsCardProps {
  preview: PreviewData;
  orgName: string;
}

export function InvitationDetailsCard({ preview, orgName }: InvitationDetailsCardProps) {
  return (
    <>
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 font-heading text-xl font-bold text-primary">
        {orgName.charAt(0).toUpperCase()}
      </div>
      <div className="space-y-2">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-primary uppercase">Invitation</p>
        <h1 className="text-2xl font-semibold tracking-tight">Join {orgName}</h1>
        <p className="text-sm text-muted-foreground">
          An organizer wants you on the team. Review the details, then accept to get started.
        </p>
      </div>

      <dl className="divide-y divide-border overflow-hidden rounded-lg border border-border/60 text-left text-sm">
        <InfoRow icon={<IconUserPlus className="size-4" />} label="Role" value={formatRole(preview.role)} />
        <InfoRow
          icon={<IconUsers className="size-4" />}
          label="Invited by"
          value={preview.inviterName ?? `A member of ${orgName}`}
        />
        <InfoRow icon={<IconMail className="size-4" />} label="Sent to" value={preview.email} />
        <InfoRow
          icon={<IconCalendarClock className="size-4" />}
          label="Expires"
          value={formatExpiry(preview.expiresAt)}
        />
      </dl>
    </>
  );
}
