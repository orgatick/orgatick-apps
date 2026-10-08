"use client";

import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@orgatick/ui/components/dialog";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { IconMailForward } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { sendTestEmail } from "@/lib/newsletter.api";

interface CampaignTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
  defaultEmail?: string;
}

export function CampaignTestDialog({ open, onOpenChange, campaignId, defaultEmail = "" }: CampaignTestDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [pending, startTransition] = useTransition();

  const handleSend = () => {
    if (!campaignId) {
      toast.error("Save campaign draft before sending a test email");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please provide a valid test email address");
      return;
    }

    startTransition(async () => {
      try {
        await sendTestEmail(campaignId, email.trim());
        toast.success(`Test email dispatched to ${email}`);
        onOpenChange(false);
      } catch (err) {
        handleApiError(err, "Failed to send test email");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconMailForward className="size-5 text-primary" />
            Send Test Email
          </DialogTitle>
          <DialogDescription>
            Preview rendered email formatting, merge tags, and subject line directly in your inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="test-recipient-email" className="text-xs">
              Destination Email Address
            </Label>
            <Input
              id="test-recipient-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending || !email.trim()} onClick={handleSend}>
            {pending ? "Sending..." : "Send Test Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
