import { Button } from "@orgatick/ui/components/button";
import { Spinner } from "@orgatick/ui/components/spinner";
import { IconArrowLeft, IconArrowRight, IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { motion } from "motion/react";
import type { DraftStatus } from "../_store/draft-types";

interface FormActionBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  isSubmitting: boolean;
  isValidating?: boolean;
  isLastStep: boolean;
  draftStatus?: DraftStatus;
  lastSavedAt?: Date | null;
  onBack: () => void;
  onNext: () => void;
  onRegister?: () => void;
  onSaveDraft?: () => void;
}

export function FormActionBar({
  currentStep,
  totalSteps,
  stepTitle,
  isSubmitting,
  isValidating = false,
  isLastStep,
  draftStatus,
  lastSavedAt,
  onBack,
  onNext,
  onRegister,
  onSaveDraft,
}: FormActionBarProps) {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="sticky bottom-0 z-20 mt-auto border-t border-border/60 bg-background/90 backdrop-blur-md">
      <div aria-hidden className="h-0.5 w-full overflow-hidden bg-border/50">
        <motion.div
          className="h-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={currentStep === 0 ? "ghost" : "outline"}
            onClick={onBack}
            disabled={currentStep === 0 || isSubmitting}
            className="min-w-20 sm:min-w-24"
          >
            <IconArrowLeft data-icon="inline-start" />
            Back
          </Button>

          {onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSubmitting || draftStatus === "saving"}
              className="hidden h-9 gap-1.5 px-3 text-xs text-muted-foreground hover:text-foreground sm:inline-flex"
              title="Shortcut: Cmd+S / Ctrl+S"
            >
              <IconDeviceFloppy className="size-4" />
              <span>{draftStatus === "saving" ? "Saving..." : "Save Draft"}</span>
            </Button>
          )}
        </div>

        <div className="flex min-w-0 flex-col items-center">
          <span className="hidden truncate text-xs font-semibold text-foreground sm:block">
            {isLastStep ? "Ready to submit?" : stepTitle}
          </span>
          {lastSavedAt ? (
            <span className="hidden font-mono text-[10px] text-muted-foreground/80 sm:inline">
              Saved at {new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(lastSavedAt)}
            </span>
          ) : (
            <span className="hidden font-mono text-[10px] text-muted-foreground/80 sm:inline">Auto-saved locally</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSubmitting || draftStatus === "saving"}
              className="h-9 px-2.5 text-xs sm:hidden"
              aria-label="Save draft"
            >
              <IconDeviceFloppy className="size-4" />
            </Button>
          )}

          {isLastStep ? (
            <Button
              key="action-bar-submit"
              type="button"
              onClick={onRegister}
              disabled={isSubmitting}
              className="min-w-28 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Submitting...
                </>
              ) : (
                <>
                  <IconCheck data-icon="inline-start" />
                  Register
                </>
              )}
            </Button>
          ) : (
            <Button
              key="action-bar-next"
              type="button"
              onClick={onNext}
              disabled={isSubmitting || isValidating}
              className="min-w-28 shadow-sm"
            >
              {isValidating ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Validating...
                </>
              ) : (
                <>
                  Continue
                  <IconArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
