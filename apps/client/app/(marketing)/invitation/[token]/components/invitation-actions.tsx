"use client";

import { IconAlertCircle, IconCheck, IconLoader, IconX } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { LinkButton } from "@/components/ui/link-button";
interface InvitationActionsProps {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: { email: string } | null;
  targetEmail: string;
  loginUrl: string;
  action: "accept" | "decline" | null;
  onRespond: (which: "accept" | "decline") => void;
  onSwitchAccount: () => void;
}

export function InvitationActions({
  isInitialized,
  isAuthenticated,
  user,
  targetEmail,
  loginUrl,
  action,
  onRespond,
  onSwitchAccount,
}: InvitationActionsProps) {
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center gap-2 py-1 text-sm text-muted-foreground" role="status">
        <IconLoader className="size-4 animate-spin" />
        <span>Checking your session…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <LinkButton href={loginUrl} className="w-full">
          Sign in to respond
        </LinkButton>
        <p className="text-xs text-muted-foreground">
          The invitation was sent to <span className="font-medium text-foreground">{targetEmail}</span>.
        </p>
      </div>
    );
  }

  const isEmailMismatch = user && user.email.trim().toLowerCase() !== targetEmail.trim().toLowerCase();

  if (isEmailMismatch) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg bg-warning/10 p-3 text-left text-sm">
          <IconAlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            This invitation is for <span className="font-medium">{targetEmail}</span>, but you are signed in as{" "}
            <span className="font-medium">{user.email}</span>. Switch accounts to respond.
          </p>
        </div>
        <Button onClick={onSwitchAccount} className="w-full">
          Switch account
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button onClick={() => onRespond("accept")} disabled={action !== null} className="w-full">
        {action === "accept" ? <IconLoader className="size-4 animate-spin" /> : <IconCheck className="size-4" />}
        Accept invitation
      </Button>
      <Button variant="ghost" onClick={() => onRespond("decline")} disabled={action !== null} className="w-full">
        {action === "decline" ? <IconLoader className="size-4 animate-spin" /> : <IconX className="size-4" />}
        Decline
      </Button>
    </div>
  );
}
