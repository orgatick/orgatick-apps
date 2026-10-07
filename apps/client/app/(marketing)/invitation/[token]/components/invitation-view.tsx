"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { OrganizationInvitationPreviewResponse } from "@orgatick/contracts";
import { IconLoader } from "@tabler/icons-react";
import * as motion from "motion/react-client";
import { useAuthStore } from "@/app/(auth)/_store";
import { getApiErrorMessage, handleApiError } from "@/lib/apis/api-error";
import { acceptInvitation, declineInvitation, fetchInvitationPreview } from "@/lib/apis/invitation.api";
import {
  AcceptedInvitationScreen,
  DeclinedInvitationScreen,
  InvalidInvitationScreen,
  UnusableInvitationScreen,
} from "./invitation-status-screens";
import { InvitationDetailsCard } from "./invitation-details-card";
import { InvitationActions } from "./invitation-actions";

type PreviewData = OrganizationInvitationPreviewResponse["data"];
type ViewStatus = "loading" | "ready" | "invalid" | "unusable" | "accepted" | "declined";

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

        {status === "invalid" && <InvalidInvitationScreen notice={notice} />}
        {status === "unusable" && preview && <UnusableInvitationScreen preview={preview} />}
        {status === "accepted" && preview && <AcceptedInvitationScreen preview={preview} orgName={orgName} />}
        {status === "declined" && <DeclinedInvitationScreen orgName={orgName} />}

        {status === "ready" && preview && (
          <>
            <InvitationDetailsCard preview={preview} orgName={orgName} />
            <InvitationActions
              isInitialized={isInitialized}
              isAuthenticated={isAuthenticated}
              user={user}
              targetEmail={preview.email}
              loginUrl={loginUrl}
              action={action}
              onRespond={handleRespond}
              onSwitchAccount={handleSwitchAccount}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
