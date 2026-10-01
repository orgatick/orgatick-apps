"use client";

import { IconAlertTriangle, IconMailFast } from "@tabler/icons-react";
import * as motion from "motion/react-client";
import { Button } from "@orgatick/ui/components/button";
import { Spinner } from "@orgatick/ui/components/spinner";
import { LinkButton } from "@/components/ui/link-button";

interface ErrorStateProps {
  title: string;
  message: string;
  /** Present when the visitor can fix it themselves by re-requesting the email. */
  onResubscribe?: () => void;
  isResubscribing?: boolean;
  resubscribed?: boolean;
  /** Softens the styling when nothing is actually wrong, e.g. a stripped token. */
  isNoticeOnly?: boolean;
}

export default function ErrorState({
  title,
  message,
  onResubscribe,
  isResubscribing = false,
  resubscribed = false,
  isNoticeOnly = false,
}: ErrorStateProps) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`space-y-5 rounded-xl bg-card p-6 text-center ring-1 sm:p-8 ${
        isNoticeOnly ? "ring-primary/30" : "ring-destructive/30"
      }`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className={`mx-auto flex size-16 items-center justify-center rounded-full ${
          isNoticeOnly ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
        }`}
      >
        {isNoticeOnly ? <IconMailFast className="size-8" /> : <IconAlertTriangle className="size-8" />}
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      {resubscribed && (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          We have sent a fresh confirmation link. Check your inbox.
        </p>
      )}

      <div className="space-y-3 pt-1">
        {onResubscribe && !resubscribed && (
          <Button onClick={onResubscribe} disabled={isResubscribing} className="w-full">
            {isResubscribing && <Spinner />}
            {isResubscribing ? "Sending" : "Send me a new link"}
          </Button>
        )}

        <LinkButton href="/" variant="outline" className="w-full">
          Back to Orgatick
        </LinkButton>
      </div>
    </motion.div>
  );
}
