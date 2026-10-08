import OrgatickLogo from "@orgatick/ui/assets/logo/orgatick-logo";
import Link from "next/link";
import { cn } from "@orgatick/ui/lib/utils";

export function SidebarBrand({ collapsed, className }: { collapsed?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex shrink-0 select-none items-center gap-2.5", collapsed && "justify-center", className)}
    >
      <span className="relative inline-flex">
        <span className="relative flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-px group-hover:scale-[1.04]">
          <OrgatickLogo className="size-8" />
        </span>
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate font-heading text-sm font-bold leading-tight tracking-tight text-foreground">
            Orgatick
          </span>
          <span className="block truncate font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Organizer
          </span>
        </span>
      )}
    </Link>
  );
}
