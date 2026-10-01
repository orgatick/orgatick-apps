"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NEWSLETTER_STATUS_OPTIONS } from "./status-badge";

const ALL = "all";

interface CampaignStatusFilterProps {
  lists?: { id: string; name: string }[];
  className?: string;
}

function useReplaceParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== ALL) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
}

export function CampaignStatusFilter({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const replaceParam = useReplaceParam();
  const value = searchParams.get("status") ?? ALL;

  return (
    <Select value={value} onValueChange={(next) => replaceParam("status", next ?? ALL)}>
      <SelectTrigger className={`w-40 ${className ?? ""}`} aria-label="Campaign status">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All statuses</SelectItem>
        {NEWSLETTER_STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="capitalize">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CampaignListFilter({ lists = [] }: CampaignStatusFilterProps) {
  const searchParams = useSearchParams();
  const replaceParam = useReplaceParam();
  const value = searchParams.get("listId") ?? ALL;

  return (
    <Select value={value} onValueChange={(next) => replaceParam("listId", next ?? ALL)}>
      <SelectTrigger className="w-56" aria-label="Mailing list">
        <SelectValue placeholder="All lists" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All lists</SelectItem>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SubscriberStatusFilter({ className }: { className?: string }) {
  const searchParams = useSearchParams();
  const replaceParam = useReplaceParam();
  const value = searchParams.get("status") ?? ALL;

  return (
    <Select value={value} onValueChange={(next) => replaceParam("status", next ?? ALL)}>
      <SelectTrigger className={`w-44 ${className ?? ""}`} aria-label="Subscriber status">
        <SelectValue placeholder="All statuses" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All statuses</SelectItem>
        {SUBSCRIBER_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value} className="capitalize">
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SubscriberListFilter({ lists = [] }: CampaignStatusFilterProps) {
  const searchParams = useSearchParams();
  const replaceParam = useReplaceParam();
  const value = searchParams.get("listId") ?? ALL;

  return (
    <Select value={value} onValueChange={(next) => replaceParam("listId", next ?? ALL)}>
      <SelectTrigger className="w-56" aria-label="Mailing list">
        <SelectValue placeholder="All lists" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All lists</SelectItem>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const SUBSCRIBER_STATUSES = [
  { value: "subscribed", label: "Subscribed" },
  { value: "pending", label: "Pending" },
  { value: "unsubscribed", label: "Unsubscribed" },
  { value: "bounced", label: "Bounced" },
  { value: "complained", label: "Complained" },
];
