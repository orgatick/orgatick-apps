"use client";

import type { CategoryResponse } from "@orgatick/contracts";
import { CommandItem } from "@orgatick/ui/components/command";
import { cn } from "@orgatick/ui/lib/utils";

interface CategoryRowProps {
  category: CategoryResponse;
  selected: boolean;
  onSelect: () => void;
}

export function CategoryRow({ category, selected, onSelect }: CategoryRowProps) {
  return (
    <CommandItem
      value={`${Number(category.id)}-${category.name}`.toLowerCase()}
      onSelect={onSelect}
      className={cn("flex w-full flex-col items-start gap-0.5 py-2", selected && "bg-accent")}
    >
      <span className="flex w-full items-center gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-[3px] bg-muted text-[0.65rem] font-semibold text-muted-foreground ring-1 ring-border tabular-nums">
          {category.level}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
      </span>
      {category.description ? (
        <span className="line-clamp-1 pl-7 text-xs text-muted-foreground">{category.description}</span>
      ) : (
        <span className="line-clamp-1 pl-7 text-xs text-muted-foreground/60">#{category.slug}</span>
      )}
    </CommandItem>
  );
}
