import Link from "next/link";
import { cn } from "@orgatick/ui/lib/utils";
import OrgatickLogo from "@orgatick/ui/assets/logo/orgatick-logo";

export function SidebarBrand({
  collapsed,
  className,
  onClick,
}: {
  collapsed?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn("group flex shrink-0 select-none items-center gap-2.5", collapsed && "justify-center", className)}
    >
      <span className="relative inline-flex">
        <span className="relative flex size-8 items-center justify-center transition-transform duration-300 group-hover:-translate-y-px group-hover:scale-[1.04]">
          <OrgatickLogo className="size-8" />
        </span>
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate font-heading text-sm font-bold leading-tight tracking-tight text-foreground">
            Orgatick
          </span>
          <span className="block truncate font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin Panel
          </span>
        </span>
      )}
    </Link>
  );
}
