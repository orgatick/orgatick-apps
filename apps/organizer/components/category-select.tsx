"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { Popover, PopoverTrigger } from "@orgatick/ui/components/popover";
import { useCategoryOptions } from "@/lib/use-category-options";
import { CategorySelectContent } from "./category-select-content";

export interface CategorySelectProps {
  value: number | null | undefined;
  onValueChange: (categoryId: number) => void;
  level: number;
  parentId?: number | null;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string | null;
  ariaInvalid?: boolean;
  id?: string;
}

export function CategorySelect({
  value,
  onValueChange,
  level,
  parentId,
  placeholder = "Select a category",
  disabled,
  disabledReason,
  ariaInvalid,
  id,
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const { items, isLoading, isLoadingMore, error, hasMore, loadMore } = useCategoryOptions({
    level,
    parentId,
    query,
  });

  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => () => ioRef.current?.disconnect(), []);

  const handleSentinelMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        ioRef.current?.disconnect();
        ioRef.current = null;
        return;
      }
      if (!open || !hasMore) return;
      ioRef.current?.disconnect();
      ioRef.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadMoreRef.current();
          }
        },
        { root: null, rootMargin: "0px 0px 200px 0px" },
      );
      ioRef.current.observe(node);
    },
    [open, hasMore],
  );

  const selectedItem = items.find((category) => Number(category.id) === Number(value));
  const displayLabel = selectedItem?.name ?? selectedLabel;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={ariaInvalid}
            disabled={disabled || Boolean(disabledReason)}
            className="w-full justify-between font-normal"
          >
            {disabledReason ? (
              <span className="truncate text-muted-foreground">{disabledReason}</span>
            ) : displayLabel ? (
              <span className="min-w-0 truncate text-foreground">{displayLabel}</span>
            ) : (
              <span className="truncate text-muted-foreground">{placeholder}</span>
            )}
            <IconChevronDown data-icon="inline-end" className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />

      <CategorySelectContent
        query={query}
        onQueryChange={setQuery}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        items={items}
        value={value}
        hasMore={hasMore}
        sentinelRef={handleSentinelMount}
        onSelect={(cat) => {
          onValueChange(Number(cat.id));
          setSelectedLabel(cat.name);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
