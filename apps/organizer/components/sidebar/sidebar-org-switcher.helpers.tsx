import { cn } from "@orgatick/ui/lib/utils";

export function orgInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export type Tone = "success" | "warning" | "destructive" | "muted";

export const DOT_TONE: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/50",
};

export const CHIP_TONE: Record<Tone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  muted: "bg-muted text-muted-foreground",
};

export function verificationTone(status?: string): Tone {
  if (status === "verified") return "success";
  if (status === "rejected") return "destructive";
  if (status === "pending") return "warning";
  return "muted";
}

export function membershipTone(status?: string): Tone {
  if (status === "active") return "success";
  if (status === "pending") return "warning";
  if (status === "rejected" || status === "inactive") return "destructive";
  return "muted";
}

export function formatCount(value: number | undefined): string {
  if (!value) return "0";
  if (value < 1000) return String(value);
  if (value < 1000000) return `${(value / 1000).toFixed(value < 10000 ? 1 : 0).replace(/\.0$/, "")}k`;
  return `${(value / 1000000).toFixed(1).replace(/\.0$/, "")}m`;
}

export function StatusChip({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-px font-mono text-[9px] font-semibold uppercase leading-normal tracking-wider",
        CHIP_TONE[tone],
      )}
    >
      <span className={cn("size-1 rounded-full", DOT_TONE[tone])} />
      {label}
    </span>
  );
}
