"use client";

import { IconLoader2 } from "@tabler/icons-react";
import * as motion from "motion/react-client";

/**
 * Shown while the confirmation request is in flight.
 *
 * An infinite loader is one of the sanctioned uses of a looping animation: the state is
 * genuinely pending and resolves on its own, so the page must not look idle.
 */
export default function ConfirmingState() {
  return (
    <motion.div
      key="confirming"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="space-y-5 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10 sm:p-8"
    >
      <div className="relative mx-auto flex size-16 items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary/20"
        />
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconLoader2 className="size-7 animate-spin" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Confirming your subscription</h1>
        <p className="text-sm text-muted-foreground">
          One moment while we activate your subscription to the Orgatick newsletter.
        </p>
      </div>
    </motion.div>
  );
}
