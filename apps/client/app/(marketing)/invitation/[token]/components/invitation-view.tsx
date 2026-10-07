"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { OrganizationInvitationPreviewResponse } from "@orgatick/contracts";
import {
  IconAlertCircle,
  IconArrowRight,
  IconCalendarClock,
  IconCheck,
  IconLoader,
  IconMail,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import * as motion from "motion/react-client";
import { Button } from "@orgatick/ui/components/button";
import { useAuthStore } from "@/app/(auth)/_store";
import { LinkButton } from "@/components/ui/link-button";
import { getApiErrorMessage, handleApiError } from "@/lib/apis/api-error";
import { acceptInvitation, declineInvitation, fetchInvitationPreview } from "@/lib/apis/invitation.api";

type PreviewData = OrganizationInvitationPreviewResponse["data"];

type ViewStatus = "loading" | "ready" | "invalid" | "unusable" | "accepted" | "declined";

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

/** The backend stores the role key; turn `event_manager` into "Event manager" for display. */
function formatRole(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

interface InvitationViewProps {
  token: string;
}

export default function InvitationView({ token }: InvitationViewProps) {
  const router = useRouter();
  const { isInitialized, isAuthenticated, user, logout } = useAuthStore();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [status, setStatus] = useState<ViewStatus>("loading");
  const [notice, setNotice] = useState("");
  const [action, setAction] = useState<"accept" | "decline" | null>(null);

  // Strict mode double-invokes effects in development, but the preview is a simple GET.
  const hasRequested = useRef(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;

    const load = async () => {
      try {
        const data = await fetchInvitationPreview(token);
        setPreview(data);
        setStatus(data.status === "pending" ? "ready" : "unusable");
      } catch (error) {
        setNotice(getApiErrorMessage(error, "This invitation link is not valid."));
        setStatus("invalid");
      }
    };

    void load();
  }, [token]);

  const handleRespond = async (which: "accept" | "decline") => {
    setAction(which);
    try {
      if (which === "accept") {
        await acceptInvitation(token);
        setStatus("accepted");
      } else {
        await declineInvitation(token);
        setStatus("declined");
      }
    } catch (error) {
      handleApiError(error, `Could not ${which} this invitation.`);
    } finally {
      setAction(null);
    }
  };

  const handleSwitchAccount = async () => {
    await logout();
    router.push(`/login?callbackUrl=${encodeURIComponent(`/invitation/${token}`)}`);
    router.refresh();
  };

  const orgName = preview?.organization.name ?? "the organization";
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/invitation/${token}`)}`;

  return (
    <div className="w-full max-w-md">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="space-y-5 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10 sm:p-8"
      >
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6" role="status" aria-label="Loading invitation">
            <IconLoader className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {status === "invalid" && (
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
        )}

        {status === "unusable" && preview && (
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
        )}

        {status === "ready" && preview && (
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

            {!isInitialized && (
              <div className="flex items-center justify-center gap-2 py-1 text-sm text-muted-foreground" role="status">
                <IconLoader className="size-4 animate-spin" />
                <span>Checking your session…</span>
              </div>
            )}

            {isInitialized && !isAuthenticated && (
              <div className="space-y-3">
                <LinkButton href={loginUrl} className="w-full">
                  Sign in to respond
                </LinkButton>
                <p className="text-xs text-muted-foreground">
                  The invitation was sent to <span className="font-medium text-foreground">{preview.email}</span>.
                </p>
              </div>
            )}

            {isInitialized &&
              isAuthenticated &&
              user &&
              user.email.trim().toLowerCase() !== preview.email.trim().toLowerCase() && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3 text-left text-sm">
                    <IconAlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
                    <p>
                      This invitation is for <span className="font-medium">{preview.email}</span>, but you are signed in
                      as <span className="font-medium">{user.email}</span>. Switch accounts to respond.
                    </p>
                  </div>
                  <Button onClick={handleSwitchAccount} className="w-full">
                    Switch account
                  </Button>
                </div>
              )}

            {isInitialized &&
              isAuthenticated &&
              user &&
              user.email.trim().toLowerCase() === preview.email.trim().toLowerCase() && (
                <div className="flex w-full flex-col gap-2">
                  <Button onClick={() => handleRespond("accept")} disabled={action !== null} className="w-full">
                    {action === "accept" ? (
                      <IconLoader className="size-4 animate-spin" />
                    ) : (
                      <IconCheck className="size-4" />
                    )}
                    Accept invitation
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleRespond("decline")}
                    disabled={action !== null}
                    className="w-full"
                  >
                    {action === "decline" ? (
                      <IconLoader className="size-4 animate-spin" />
                    ) : (
                      <IconX className="size-4" />
                    )}
                    Decline
                  </Button>
                </div>
              )}
          </>
        )}

        {status === "accepted" && preview && (
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
        )}

        {status === "declined" && (
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
        )}
      </motion.div>
    </div>
  );
}
