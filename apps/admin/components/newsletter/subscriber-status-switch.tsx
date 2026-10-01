"use client";

import { NewsletterSubscriberStatus } from "@orgatick/contracts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { updateSubscriberStatus } from "@/lib/newsletter.api";

const OPTIONS: { value: NewsletterSubscriberStatus; label: string }[] = [
  { value: NewsletterSubscriberStatus.SUBSCRIBED, label: "Subscribed" },
  { value: NewsletterSubscriberStatus.PENDING, label: "Pending" },
  { value: NewsletterSubscriberStatus.UNSUBSCRIBED, label: "Unsubscribed" },
];

interface SubscriberStatusSwitchProps {
  subscriberId: string;
  currentStatus: NewsletterSubscriberStatus;
}

/** Admin override for a subscription, used after a support request. */
export function SubscriberStatusSwitch({ subscriberId, currentStatus }: SubscriberStatusSwitchProps) {
  const router = useRouter();
  const [value, setValue] = useState<NewsletterSubscriberStatus>(currentStatus);
  const [pending, startTransition] = useTransition();

  const handleChange = (next: string | null) => {
    if (!next || next === value) return;
    startTransition(async () => {
      try {
        await updateSubscriberStatus(subscriberId, next);
        setValue(next as NewsletterSubscriberStatus);
        router.refresh();
        toast.success(`Subscriber marked as ${next}`);
      } catch (error) {
        handleApiError(error, "Failed to update subscriber status");
      }
    });
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="h-7 w-36 font-mono text-xs" aria-label="Subscriber status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="font-mono text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
