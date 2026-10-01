"use client";

import { IconCheck, IconMailOpened } from "@tabler/icons-react";
import * as motion from "motion/react-client";
import { LinkButton } from "@/components/ui/link-button";

interface ConfirmedStateProps {
  email: string;
  /** True when the address was already confirmed, so this is a repeat visit. */
  alreadyConfirmed: boolean;
}

export default function ConfirmedState({ email, alreadyConfirmed }: ConfirmedStateProps) {
  return (
    <motion.div
      key="confirmed"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10 sm:p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success"
      >
        <IconCheck className="size-8" />
      </motion.div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {alreadyConfirmed ? "Already subscribed" : "Subscription confirmed"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {alreadyConfirmed
            ? "This address was already on the list, so nothing changed. Your next issue is already on its way."
            : "You are on the list. The next issue lands in your inbox at the start of the month."}
        </p>
      </div>

      <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm font-medium break-all">{email}</p>

      <div className="space-y-3 pt-1">
        <LinkButton href="/" icon={<IconMailOpened className="size-4" />} className="w-full">
          Back to Orgatick
        </LinkButton>
        <p className="text-xs text-muted-foreground">
          Changed your mind? Every email has a one-click unsubscribe link at the bottom.
        </p>
      </div>
    </motion.div>
  );
}
