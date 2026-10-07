"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconAlertCircle, IconCheck, IconRotateClockwise, IconSend } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orgatick/ui/components/dialog";
import { Spinner } from "@orgatick/ui/components/spinner";
import { handleApiError } from "@/lib/apis/api-error";
import { raiseVerificationRequest } from "@/lib/apis/verification.api";

interface RaiseVerificationButtonProps {
  organizationId: string | number;
  organizationName: string;
  isResubmission?: boolean;
  canSubmit?: boolean;
  roleName?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function RaiseVerificationButton({
  organizationId,
  organizationName,
  isResubmission = false,
  canSubmit = true,
  roleName,
  variant = "default",
  size = "default",
  className,
}: RaiseVerificationButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await raiseVerificationRequest(organizationId);
      toast.success(
        isResubmission ? "Verification request resubmitted" : "Verification request submitted successfully",
        {
          description: "Our compliance team will review your organization details within 1–2 business days.",
        },
      );
      setOpen(false);
      window.location.reload();
    } catch (error) {
      handleApiError(error, "Could not submit verification request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const actionLabel = isResubmission ? "Resubmit for Verification" : "Submit for Verification";

  if (!canSubmit) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={className}
        title={`Only Owners or Admins can submit verification (your role: ${roleName ?? "Member"})`}
      >
        <IconAlertCircle className="size-4 text-muted-foreground" />
        Verification Restricted to Admins
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={variant} size={size} className={className}>
            {isResubmission ? <IconRotateClockwise className="size-4" /> : <IconSend className="size-4" />}
            {actionLabel}
          </Button>
        }
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <IconSend className="size-5" />
          </div>
          <DialogTitle className="text-lg">
            {isResubmission ? "Resubmit Organization Verification" : "Submit for Verification"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            You are submitting <span className="font-medium text-foreground">{organizationName}</span> for compliance
            review.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-border/60 bg-muted/40 p-3.5 text-xs text-muted-foreground space-y-2">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <IconCheck className="size-3.5 text-success" />
            What happens next?
          </p>
          <ul className="list-disc list-inside space-y-1 ps-1">
            <li>Our trust & safety team reviews your business information.</li>
            <li>Typical turnaround time is 1 to 2 business days.</li>
            <li>You will receive an email once the review is completed.</li>
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose
            render={
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            }
          />
          <Button onClick={handleConfirm} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Spinner className="size-4" />
                Submitting…
              </>
            ) : (
              <>
                <IconSend className="size-4" />
                Confirm Submission
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
