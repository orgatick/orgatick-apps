"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { toast } from "@/components/ui/sonner";
import { getApiErrorMessage, handleApiError } from "@/lib/apis/api-error";
import { confirmNewsletterSubscription, subscribeNewsletter } from "@/lib/apis/newsletter.api";
import ConfirmingState from "./confirm-subscription/confirming-state";
import ConfirmedState from "./confirm-subscription/confirmed-state";
import ErrorState from "./confirm-subscription/error-state";

type ConfirmStatus = "checking" | "confirmed" | "expired" | "invalid" | "missing_token";

interface ConfirmSubscriptionViewProps {
  token?: string;
}

/** Copied from the backend token service, so an expired link gets its own recovery path. */
const EXPIRED_MESSAGES = ["expired"];

export default function ConfirmSubscriptionView({ token = "" }: ConfirmSubscriptionViewProps) {
  const [status, setStatus] = useState<ConfirmStatus>(token ? "checking" : "missing_token");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);
  const [isResubscribing, setIsResubscribing] = useState(false);
  const [resubscribed, setResubscribed] = useState(false);

  // Strict mode double-invokes effects in development. The endpoint is idempotent, but a
  // ref keeps it to exactly one request and avoids the second one racing the state update.
  const hasRequested = useRef(false);

  useEffect(() => {
    // The token is a bearer credential: drop it from the address bar and history so it is
    // not left in a screenshot, a shared link, or the browser's back list.
    if (typeof window !== "undefined" && token) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (!token || hasRequested.current) return;
    hasRequested.current = true;

    const confirm = async () => {
      try {
        const result = await confirmNewsletterSubscription(token);

        setEmail(result.email);
        setAlreadyConfirmed(result.alreadySubscribed);
        setStatus("confirmed");
      } catch (error) {
        const message = getApiErrorMessage(error, "We could not confirm this subscription.");

        // An expired or already-consumed link is recoverable, so it gets a resend action;
        // a tampered or unknown token is not worth offering.
        const isExpired =
          EXPIRED_MESSAGES.some((needle) => message.toLowerCase().includes(needle)) ||
          message.toLowerCase().includes("no longer valid");

        setErrorMessage(message);
        setStatus(isExpired ? "expired" : "invalid");
      }
    };

    void confirm();
  }, [token]);

  const handleResubscribe = async () => {
    if (!email) return;

    setIsResubscribing(true);
    try {
      const result = await subscribeNewsletter({ email, source: "landing_page" });
      toast.success(result.message);
      setResubscribed(true);
    } catch (error) {
      handleApiError(error, "Could not send a new confirmation link");
    } finally {
      setIsResubscribing(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {status === "checking" && <ConfirmingState key="checking" />}

        {status === "confirmed" && <ConfirmedState email={email} alreadyConfirmed={alreadyConfirmed} key="confirmed" />}

        {status === "expired" && (
          <ErrorState
            title="Link expired"
            message={
              email
                ? `${errorMessage} We can send a fresh link to ${email}.`
                : "This confirmation link has expired. Request a new one with the address you signed up with."
            }
            onResubscribe={email ? handleResubscribe : undefined}
            isResubscribing={isResubscribing}
            resubscribed={resubscribed}
            key="expired"
          />
        )}

        {status === "invalid" && <ErrorState title="Confirmation failed" message={errorMessage} key="invalid" />}

        {status === "missing_token" && (
          <ErrorState
            title="Confirmation link required"
            message="This page needs the link from your confirmation email. Open that email and use the button in it, or subscribe again from the footer."
            isNoticeOnly
            key="missing_token"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
