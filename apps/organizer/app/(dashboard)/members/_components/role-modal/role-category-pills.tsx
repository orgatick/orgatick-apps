"use client";

import { IconChecklist } from "@tabler/icons-react";
import { cn } from "@orgatick/ui/lib/utils";
import { getCategoryMeta } from "./role-modal-types";
import { useRoleModalStore } from "./role-modal.store";

interface RoleCategoryPillsProps {
  categories: string[];
  categoryStats: Record<string, { total: number; selected: number }>;
}

export function RoleCategoryPills({ categories, categoryStats }: RoleCategoryPillsProps) {
  const activeCategory = useRoleModalStore((s) => s.activeCategory);
  const setActiveCategory = useRoleModalStore((s) => s.setActiveCategory);
  const selectedCount = useRoleModalStore((s) => s.selectedPermissions.size);
  const totalCount = useRoleModalStore((s) => s.availablePermissions.length);

  return (
    <div className="flex md:hidden items-center gap-1.5 overflow-x-auto px-3.5 py-2 border-b border-border/50 bg-muted/20 shrink-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button
        type="button"
        onClick={() => setActiveCategory("all")}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer",
          activeCategory === "all"
            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
            : "bg-background text-muted-foreground border border-border/60 hover:text-foreground",
        )}
      >
        <IconChecklist className="size-3.5" />
        <span>All</span>
        <span className="font-mono text-[10px] opacity-80">
          {selectedCount}/{totalCount}
        </span>
      </button>

      {categories.map((catKey) => {
        const meta = getCategoryMeta(catKey);
        const Icon = meta.icon;
        const stats = categoryStats[catKey] ?? { total: 0, selected: 0 };
        const isActive = activeCategory === catKey;

        return (
          <button
            key={catKey}
            type="button"
            onClick={() => setActiveCategory(catKey)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "bg-background text-muted-foreground border border-border/60 hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            <span>{meta.label}</span>
            <span
              className={cn(
                "font-mono text-[10px] px-1 py-0.2 rounded-full",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : stats.selected > 0
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground/60",
              )}
            >
              {stats.selected > 0 ? `${stats.selected}/${stats.total}` : stats.total}
            </span>
          </button>
        );
      })}
    </div>
  );
}
