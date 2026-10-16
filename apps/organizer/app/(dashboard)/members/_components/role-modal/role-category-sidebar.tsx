"use client";

import { IconChecklist } from "@tabler/icons-react";
import { ScrollArea } from "@orgatick/ui/components/scroll-area";
import { cn } from "@orgatick/ui/lib/utils";
import { getCategoryMeta } from "./role-modal-types";
import { useRoleModalStore } from "./role-modal.store";

interface RoleCategorySidebarProps {
  categories: string[];
  categoryStats: Record<string, { total: number; selected: number }>;
}

export function RoleCategorySidebar({ categories, categoryStats }: RoleCategorySidebarProps) {
  const activeCategory = useRoleModalStore((s) => s.activeCategory);
  const setActiveCategory = useRoleModalStore((s) => s.setActiveCategory);
  const selectedCount = useRoleModalStore((s) => s.selectedPermissions.size);
  const totalCount = useRoleModalStore((s) => s.availablePermissions.length);

  return (
    <div className="hidden md:flex md:w-60 lg:w-64 shrink-0 border-r border-border/50 bg-muted/15 flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-border/40 flex items-center justify-between shrink-0 bg-muted/30">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Categories
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">{categories.length} modules</span>
      </div>

      <ScrollArea className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {/* All Permissions Tab */}
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
              activeCategory === "all"
                ? "bg-background text-foreground font-semibold shadow-xs border border-border/60"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <IconChecklist className="size-4 shrink-0 text-primary" />
              <span className="truncate">All Permissions</span>
            </div>
            <span
              className={cn(
                "font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0",
                selectedCount > 0 ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground/70",
              )}
            >
              {selectedCount}/{totalCount}
            </span>
          </button>

          <div className="h-px bg-border/40 my-1.5 mx-1" />

          {/* Individual Categories */}
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
                  "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left",
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      isActive || stats.selected > 0 ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="truncate">{meta.label}</span>
                </div>
                <span
                  className={cn(
                    "font-mono text-[11px] px-1.5 py-0.5 rounded shrink-0",
                    stats.selected > 0 ? "bg-primary/15 text-primary font-semibold" : "text-muted-foreground/60",
                  )}
                >
                  {stats.selected > 0 ? `${stats.selected}/${stats.total}` : stats.total}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
