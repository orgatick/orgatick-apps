import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Badge } from "@orgatick/ui/components/badge";
import { Avatar, AvatarFallback } from "@orgatick/ui/components/avatar";
import type { VerificationQueueItem } from "@/lib/types";

function getVerificationBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "verified") return "default";
  if (status === "rejected") return "destructive";
  return "secondary";
}

function getOrgStatusBadgeVariant(status?: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active") return "default";
  if (status === "suspended") return "destructive";
  return "secondary";
}

export function VerificationTableRow({ item }: { item: VerificationQueueItem }) {
  const ownerInitials = item.ownerName
    ? item.ownerName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
            {item.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.logo} alt="" className="size-7 rounded object-cover" />
            ) : (
              <span className="font-mono text-xs">{item.organizationId}</span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{item.organizationName}</p>
            <p className="truncate text-xs text-muted-foreground">@{item.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {item.ownerName ? (
          <div className="flex items-center gap-2">
            <Avatar className="size-6 shrink-0">
              <AvatarFallback className="bg-primary/15 font-mono text-[8px] font-bold text-primary">
                {ownerInitials}
              </AvatarFallback>
            </Avatar>
            <span className="max-w-40 truncate text-sm text-foreground">{item.ownerName}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={getVerificationBadgeVariant(item.status)}>{item.status}</Badge>
        {item.rejectionReason && (
          <p className="mt-1 max-w-48 truncate text-[11px] text-muted-foreground" title={item.rejectionReason}>
            {item.rejectionReason}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        {item.orgStatus ? (
          <Badge variant={getOrgStatusBadgeVariant(item.orgStatus)}>{item.orgStatus}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{item.documentCount}</span>
      </td>
      <td className="px-4 py-3">
        {item.verifiedAt ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {new Date(item.verifiedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <Link
          href={`/organizations/${item.organizationId}/verification`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Review <IconArrowUpRight className="size-3.5" />
        </Link>
      </td>
    </tr>
  );
}
