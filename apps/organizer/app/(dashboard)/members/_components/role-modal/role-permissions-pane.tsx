"use client";

import { useMemo } from "react";
import { IconChecklist, IconReload, IconSearch, IconX } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { Checkbox } from "@orgatick/ui/components/checkbox";
import { Input } from "@orgatick/ui/components/input";
import { ScrollArea } from "@orgatick/ui/components/scroll-area";
import { cn } from "@orgatick/ui/lib/utils";
import { getCategoryMeta } from "./role-modal-types";
import { useRoleModalStore } from "./role-modal.store";

export function RolePermissionsPane() {
  const activeCategory = useRoleModalStore((s) => s.activeCategory);
  const searchFilter = useRoleModalStore((s) => s.searchFilter);
  const setSearchFilter = useRoleModalStore((s) => s.setSearchFilter);
  const setActiveCategory = useRoleModalStore((s) => s.setActiveCategory);
  const availablePermissions = useRoleModalStore((s) => s.availablePermissions);
  const selectedPermissions = useRoleModalStore((s) => s.selectedPermissions);
  const loadingPermissions = useRoleModalStore((s) => s.loadingPermissions);
  const togglePermission = useRoleModalStore((s) => s.togglePermission);
  const toggleCurrentCategory = useRoleModalStore((s) => s.toggleCurrentCategory);

  const activeCategoryMeta = activeCategory === "all" ? null : getCategoryMeta(activeCategory);

  const filteredPermissions = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return availablePermissions.filter((perm) => {
      if (activeCategory !== "all" && (perm.category || "other") !== activeCategory) {
        return false;
      }
      if (q.length > 0) {
        const matchesName = perm.name.toLowerCase().includes(q);
        const matchesKey = perm.key.toLowerCase().includes(q);
        const matchesDesc = perm.description?.toLowerCase().includes(q) ?? false;
        return matchesName || matchesKey || matchesDesc;
      }
      return true;
    });
  }, [availablePermissions, activeCategory, searchFilter]);

  const isCurrentViewAllSelected =
    filteredPermissions.length > 0 && filteredPermissions.every((p) => selectedPermissions.has(p.key));

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-background overflow-hidden">
      {/* Search & Actions Toolbar */}
      <div className="px-3.5 sm:px-5 py-2 sm:py-2.5 border-b border-border/50 bg-card/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeCategoryMeta ? (
              <>
                <activeCategoryMeta.icon className="size-4 shrink-0 text-primary" />
                <span className="text-xs font-semibold text-foreground truncate">{activeCategoryMeta.label}</span>
              </>
            ) : (
              <>
                <IconChecklist className="size-4 shrink-0 text-primary" />
                <span className="text-xs font-semibold text-foreground">All Permissions</span>
              </>
            )}
            <span className="text-xs text-muted-foreground font-mono">({filteredPermissions.length})</span>
          </div>

          {filteredPermissions.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => toggleCurrentCategory(filteredPermissions)}
              className="h-7 text-xs shrink-0"
            >
              {isCurrentViewAllSelected ? "Deselect all" : "Select all"}
            </Button>
          )}
        </div>

        <div className="relative w-full sm:w-56">
          <IconSearch className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter permissions…"
            className="ps-7 pe-7 text-xs h-7.5 bg-background w-full"
          />
          {searchFilter && (
            <button
              type="button"
              onClick={() => setSearchFilter("")}
              className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
              aria-label="Clear search"
            >
              <IconX className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Permissions Rows Scroll List */}
      <ScrollArea className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {loadingPermissions ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-xs text-muted-foreground">
            <IconReload className="size-5 animate-spin text-primary" />
            <span>Loading available permissions catalog…</span>
          </div>
        ) : filteredPermissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
            <p className="text-xs text-muted-foreground">
              No permissions match &ldquo;{searchFilter}&rdquo;
              {activeCategory !== "all" ? ` in ${activeCategoryMeta?.label}` : ""}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {searchFilter && (
                <Button type="button" variant="outline" size="xs" onClick={() => setSearchFilter("")}>
                  Clear search filter
                </Button>
              )}
              {activeCategory !== "all" && (
                <Button type="button" variant="ghost" size="xs" onClick={() => setActiveCategory("all")}>
                  View all categories
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPermissions.map((perm) => {
              const isChecked = selectedPermissions.has(perm.key);
              const catMeta = getCategoryMeta(perm.category || "other");
              const permInputId = `perm-check-${perm.key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

              return (
                <label
                  key={perm.key}
                  htmlFor={permInputId}
                  className={cn(
                    "group flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg border transition-colors cursor-pointer select-none",
                    isChecked
                      ? "border-primary/40 bg-primary/[0.04]"
                      : "border-border/50 hover:border-border hover:bg-muted/40 bg-card",
                  )}
                >
                  <div className="pt-0.5 shrink-0">
                    <Checkbox
                      id={permInputId}
                      checked={isChecked}
                      onCheckedChange={(checked) => togglePermission(perm.key, Boolean(checked))}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start sm:items-center justify-between gap-1.5 sm:gap-3 flex-col sm:flex-row">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={cn(
                            "text-xs font-semibold leading-tight",
                            isChecked ? "text-primary" : "text-foreground",
                          )}
                        >
                          {perm.name}
                        </span>
                        {activeCategory === "all" && (
                          <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/80 px-1.5 py-0.2 rounded bg-muted border border-border/40 shrink-0">
                            {catMeta.label}
                          </span>
                        )}
                      </div>

                      <code className="font-mono text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/40 shrink-0 select-all">
                        {perm.key}
                      </code>
                    </div>

                    {perm.description && (
                      <p className="text-xs text-muted-foreground mt-1 leading-normal">{perm.description}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
