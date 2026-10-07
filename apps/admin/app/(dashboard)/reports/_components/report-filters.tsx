"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ALL = "all";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const CATEGORY_OPTIONS = [
  { value: "scam_fraud", label: "Scam / fraud" },
  { value: "illegal_content", label: "Illegal content" },
  { value: "harassment", label: "Harassment" },
  { value: "fake_organization", label: "Fake organization" },
  { value: "privacy", label: "Privacy" },
  { value: "other", label: "Other" },
];

function useQueryUpdater(key: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (next: string | null) => {
    if (!next) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) {
      params.delete(key);
    } else {
      params.set(key, next);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
}

export function ReportFilters({ status, category }: { status?: string; category?: string }) {
  const updateStatus = useQueryUpdater("status");
  const updateCategory = useQueryUpdater("category");

  return (
    <>
      <Select value={status ?? ALL} onValueChange={updateStatus}>
        <SelectTrigger className="h-8 w-40 font-mono text-xs" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} className="font-mono text-xs">
            All statuses
          </SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="font-mono text-xs capitalize">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category ?? ALL} onValueChange={updateCategory}>
        <SelectTrigger className="h-8 w-44 font-mono text-xs" aria-label="Filter by category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} className="font-mono text-xs">
            All categories
          </SelectItem>
          {CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="font-mono text-xs capitalize">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
