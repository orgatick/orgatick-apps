"use client";

import { IconLoader } from "@tabler/icons-react";
import type { CategoryResponse } from "@orgatick/contracts";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@orgatick/ui/components/command";
import { PopoverContent } from "@orgatick/ui/components/popover";
import { CategoryRow } from "./category-row";

interface CategorySelectContentProps {
  query: string;
  onQueryChange: (q: string) => void;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  items: CategoryResponse[];
  value: number | null | undefined;
  hasMore: boolean;
  sentinelRef: (node: HTMLDivElement | null) => void;
  onSelect: (category: CategoryResponse) => void;
}

export function CategorySelectContent({
  query,
  onQueryChange,
  isLoading,
  isLoadingMore,
  error,
  items,
  value,
  hasMore,
  sentinelRef,
  onSelect,
}: CategorySelectContentProps) {
  return (
    <PopoverContent align="start" className="w-(--anchor-width) p-0">
      <Command shouldFilter={false}>
        <CommandInput placeholder="Search categories..." value={query} onValueChange={onQueryChange} />
        <CommandList className="max-h-64">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 px-2 py-6 text-sm text-muted-foreground">
              <IconLoader className="size-4 shrink-0 animate-spin" />
              Loading categories...
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-start gap-2 px-4 py-6 text-sm text-destructive">
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && items.length === 0 && <CommandEmpty>No categories found.</CommandEmpty>}

          {!isLoading && !error && items.length > 0 && (
            <CommandGroup>
              {items.map((cat) => (
                <CategoryRow
                  key={String(cat.id)}
                  category={cat}
                  selected={Number(cat.id) === Number(value)}
                  onSelect={() => onSelect(cat)}
                />
              ))}
            </CommandGroup>
          )}

          {!isLoading && !error && hasMore && (
            <div ref={sentinelRef} className="px-2 py-3">
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <IconLoader className="size-3.5 shrink-0 animate-spin" />
                  Loading more...
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-muted-foreground/70">Scroll for more</div>
              )}
            </div>
          )}
        </CommandList>
      </Command>
    </PopoverContent>
  );
}
