"use client";

import { Button } from "@orgatick/ui/components/button";
import { Label } from "@orgatick/ui/components/label";
import { Input } from "@orgatick/ui/components/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@orgatick/ui/components/dialog";
import { IconPlayerPause, IconPlayerPlay, IconRefresh, IconSend, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { NewsletterAction, type NewsletterStatus } from "@orgatick/contracts";
import { performNewsletterAction } from "@/lib/newsletter.api";
import { handleApiError } from "@/lib/apis/api-error";

interface CampaignActionsProps {
  campaignId: string;
  status: NewsletterStatus;
}

/**
 * Lifecycle controls for a campaign.
 *
 * The visible buttons are derived from the campaign status rather than hidden by the API,
 * so the UI always offers exactly the transitions the backend will accept.
 */
export function CampaignActions({ campaignId, status }: CampaignActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<"send" | "schedule" | "cancel" | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");

  const run = (action: NewsletterAction, payload?: { scheduledAt?: string }) => {
    startTransition(async () => {
      try {
        await performNewsletterAction(campaignId, action, payload);
        setDialog(null);
        router.refresh();
        toast.success(action === NewsletterAction.SEND ? "Campaign queued for sending" : `Action "${action}" applied`);
      } catch (error) {
        handleApiError(error, "Failed to apply campaign action");
      }
    });
  };

  if (status === "sent" || status === "cancelled") {
    return (
      <Button variant="outline" size="sm" onClick={() => run(NewsletterAction.RETRY_FAILED)} disabled={pending}>
        <IconRefresh className="size-4" />
        Retry failed
      </Button>
    );
  }

  if (status === "sending") {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => run(NewsletterAction.PAUSE)} disabled={pending}>
          <IconPlayerPause className="size-4" />
          Pause
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialog("cancel")} disabled={pending}>
          <IconX className="size-4" />
          Cancel
        </Button>
      </>
    );
  }

  if (status === "paused") {
    return (
      <>
        <Button size="sm" onClick={() => run(NewsletterAction.RESUME)} disabled={pending}>
          <IconPlayerPlay className="size-4" />
          Resume
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDialog("cancel")} disabled={pending}>
          <IconX className="size-4" />
          Cancel
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setDialog("schedule")} disabled={pending}>
        Schedule
      </Button>
      <Button size="sm" onClick={() => setDialog("send")} disabled={pending}>
        <IconSend className="size-4" />
        Send now
      </Button>

      <Dialog open={dialog === "send"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send this campaign now?</DialogTitle>
            <DialogDescription>
              The audience is locked and delivery starts immediately. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Keep as draft
            </Button>
            <Button onClick={() => run(NewsletterAction.SEND)} disabled={pending}>
              Send now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "schedule"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule campaign</DialogTitle>
            <DialogDescription>Delivery starts automatically at the chosen time.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Send at</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => run(NewsletterAction.SCHEDULE, { scheduledAt: new Date(scheduledAt).toISOString() })}
              disabled={pending || !scheduledAt}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "cancel"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this campaign?</DialogTitle>
            <DialogDescription>
              Queued recipients that have not been delivered yet will be skipped. Emails already delivered stay
              delivered.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Keep sending
            </Button>
            <Button variant="destructive" onClick={() => run(NewsletterAction.CANCEL)} disabled={pending}>
              Cancel campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
