"use client";

import type { NewsletterBlock } from "@orgatick/contracts";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { IconArrowDown, IconArrowUp, IconChevronDown, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { DEFAULTS, MENU_ITEMS, type BlockEditorProps } from "./block-editor/block-editor-types";
import { ColumnsFields, LeafFields } from "./block-editor/block-columns-fields";

export function BlockEditor({ value, onChange, error }: BlockEditorProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const replace = (index: number, block: NewsletterBlock) => {
    const next = [...value];
    next[index] = block;
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(value.filter((_, position) => position !== index));
    setExpanded(null);
  };

  const move = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [block] = next.splice(index, 1);
    next.splice(target, 0, block);
    onChange(next);
    setExpanded(target);
  };

  const addBlock = (type: (typeof MENU_ITEMS)[number]["type"]) => {
    const block: NewsletterBlock =
      type === "columns"
        ? {
            type: "columns",
            columns: [
              { blocks: [{ ...structuredClone(DEFAULTS.paragraph) }] },
              { blocks: [{ ...structuredClone(DEFAULTS.paragraph) }] },
            ],
          }
        : structuredClone(DEFAULTS[type]);

    onChange([...value, block]);
    setExpanded(value.length);
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      <div className="space-y-2">
        {value.map((block, index) => {
          const isExpanded = expanded === index;
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks do not carry persistent IDs
              key={`block-${index}`}
              className="rounded-lg border border-border/60 bg-card/40 transition-colors hover:border-border"
            >
              <div className="flex items-center justify-between gap-3 p-3">
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : index)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <IconChevronDown
                    className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                  <Badge variant="outline" className="shrink-0 text-[10px] font-semibold uppercase">
                    {block.type}
                  </Badge>
                  <span className="truncate text-xs text-muted-foreground">
                    {"text" in block && block.text
                      ? block.text
                      : "html" in block && block.html
                        ? block.html.replace(/<[^>]+>/g, "").slice(0, 40)
                        : "src" in block
                          ? block.src
                          : ""}
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label="Move block up"
                  >
                    <IconArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label="Move block down"
                  >
                    <IconArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    aria-label="Delete block"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/40 p-4">
                  {block.type === "columns" ? (
                    <ColumnsFields block={block} onChange={(next) => replace(index, next)} />
                  ) : (
                    <LeafFields block={block} onChange={(next) => replace(index, next)} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="sm" className="w-full">
              <IconPlus className="size-3.5" />
              Add block
            </Button>
          }
        />
        <DropdownMenuContent align="center" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Content blocks</DropdownMenuLabel>
            {MENU_ITEMS.map((item) => (
              <DropdownMenuItem key={item.type} onClick={() => addBlock(item.type)}>
                <item.icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export * from "./block-editor/block-editor-types";
