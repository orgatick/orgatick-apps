"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const ALL = "all";
const OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export function VerificationQueueFilter({ value }: { value?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (next: string | null) => {
    if (!next) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) {
      params.delete("status");
    } else {
      params.set("status", next);
    }
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Select value={value ?? ALL} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-40 font-mono text-xs" aria-label="Filter by verification status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL} className="font-mono text-xs">
          All statuses
        </SelectItem>
        {OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value} className="font-mono text-xs capitalize">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
