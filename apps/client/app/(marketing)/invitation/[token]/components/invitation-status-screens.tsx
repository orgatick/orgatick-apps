"use client";

import { IconAlertCircle, IconArrowRight, IconCalendarClock, IconCheck, IconX } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/link-button";
import type { OrganizationInvitationPreviewResponse } from "@orgatick/contracts";

type PreviewData = OrganizationInvitationPreviewResponse["data"];

const UNUSABLE_COPY: Record<string, { title: string; message: string }> = {
  accepted: {
    title: "Invitation already used",
    message: "This invitation has been used and can no longer be accepted.",
  },
  rejected: { title: "Invitation declined", message: "You declined this invitation and it can no longer be used." },
  cancelled: {
    title: "Invitation cancelled",
    message: "An organizer cancelled this invitation and it can no longer be used.",
  },
  expired: {
    title: "Invitation expired",
    message: "This invitation is no longer valid. Ask the organizer to send a new one.",
  },
};

export function formatRole(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function InvalidInvitationScreen({ notice }: { notice: string }) {
  return (
    <>
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <IconAlertCircle className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Invitation not found</h1>
        <p className="text-sm text-muted-foreground">{notice}</p>
      </div>
      <LinkButton href="/" icon={<IconArrowRight className="size-4" />} className="w-full">
        Back to Orgatick
      </LinkButton>
    </>
  );
}

export function UnusableInvitationScreen({ preview }: { preview: PreviewData }) {
  return (
    <>
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconCalendarClock className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {UNUSABLE_COPY[preview.status]?.title ?? "Invitation unavailable"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {UNUSABLE_COPY[preview.status]?.message ?? "This invitation is no longer available."}
        </p>
      </div>
      <LinkButton href="/" icon={<IconArrowRight className="size-4" />} className="w-full">
        Back to Orgatick
      </LinkButton>
    </>
  );
}

export function AcceptedInvitationScreen({ preview, orgName }: { preview: PreviewData; orgName: string }) {
  return (
    <>
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
        <IconCheck className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">You&apos;re on the team</h1>
        <p className="text-sm text-muted-foreground">
          Welcome aboard. As <span className="font-medium text-foreground">{formatRole(preview.role)}</span> of{" "}
          {orgName}, you can now help with the events and programs it organizes.
        </p>
      </div>
      <LinkButton href="/" icon={<IconArrowRight className="size-4" />} className="w-full">
        Go to Orgatick
      </LinkButton>
    </>
  );
}

export function DeclinedInvitationScreen({ orgName }: { orgName: string }) {
  return (
    <>
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconX className="size-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Invitation declined</h1>
        <p className="text-sm text-muted-foreground">
          You won&apos;t join {orgName}. If you change your mind, an organizer can send you a fresh invitation.
        </p>
      </div>
      <LinkButton href="/" icon={<IconArrowRight className="size-4" />} className="w-full">
        Back to Orgatick
      </LinkButton>
    </>
  );
}
