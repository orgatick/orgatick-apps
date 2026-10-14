"use client";

import { motion } from "motion/react";
import { Button } from "@orgatick/ui/components/button";
import { IconArrowRight, IconClock, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { ORGANIZATION_FORM_STEPS } from "../_constents/form-steps";
import type { DraftInfo } from "../_store/draft-types";

interface DraftRestoreBannerProps {
  draftInfo: DraftInfo;
  onResume: () => void;
  onDiscard: () => void;
}

export function DraftRestoreBanner({ draftInfo, onResume, onDiscard }: DraftRestoreBannerProps) {
  const stepConfig = ORGANIZATION_FORM_STEPS[draftInfo.step] ?? ORGANIZATION_FORM_STEPS[0];
  const formattedTime = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(draftInfo.savedAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex flex-col gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <IconClock className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
              Unfinished Draft Found
            </span>
            <span className="text-xs text-muted-foreground">· Saved {formattedTime}</span>
          </div>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            Continue application for{" "}
            <span className="font-semibold text-primary">{draftInfo.name || "Untitled Organization"}</span> at{" "}
            <span className="font-semibold">{stepConfig.title}</span> (Step {draftInfo.step + 1} of{" "}
            {ORGANIZATION_FORM_STEPS.length})?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:shrink-0">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onDiscard}
          className="text-muted-foreground hover:text-destructive"
        >
          <IconTrash data-icon="inline-start" />
          Discard
        </Button>

        <Button type="button" size="sm" onClick={onResume} className="gap-1.5 shadow-sm">
          <IconDeviceFloppy data-icon="inline-start" />
          Resume Draft
          <IconArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </motion.div>
  );
}
