"use client";

import { useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import { Spinner } from "@orgatick/ui/components/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@orgatick/ui/components/dropdown-menu";
import { IconCheck, IconChevronDown, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import type { DraftStatus } from "../_store/draft-types";

interface DraftStatusIndicatorProps {
  status: DraftStatus;
  lastSavedAt: Date | null;
  onSave: () => void;
  onDiscard?: () => void;
}

export function DraftStatusIndicator({ status, lastSavedAt, onSave, onDiscard }: DraftStatusIndicatorProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formattedTime = lastSavedAt
    ? new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(lastSavedAt)
    : null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-xs">
        {status === "saving" && (
          <>
            <Spinner className="size-3 text-primary" />
            <span className="font-mono text-[11px] text-muted-foreground">Saving…</span>
          </>
        )}

        {status === "saved" && (
          <>
            <IconCheck className="size-3.5 text-success" />
            <span className="font-mono text-[11px] text-muted-foreground">
              {formattedTime ? `Draft saved · ${formattedTime}` : "Draft saved"}
            </span>
          </>
        )}

        {status === "unsaved" && (
          <>
            <span className="size-1.5 rounded-full bg-warning" />
            <span className="font-mono text-[11px] text-muted-foreground">Unsaved changes</span>
          </>
        )}

        {status === "idle" && (
          <>
            <IconDeviceFloppy className="size-3 text-muted-foreground" />
            <span className="font-mono text-[11px] text-muted-foreground">
              {formattedTime ? `Saved · ${formattedTime}` : "Draft ready"}
            </span>
          </>
        )}
      </div>

      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <IconDeviceFloppy className="size-3.5" />
              <span className="hidden sm:inline">Save Draft</span>
              <IconChevronDown className="size-3 opacity-60" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={onSave} className="gap-2 cursor-pointer">
            <IconDeviceFloppy className="size-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-xs font-medium">Save Draft Now</span>
              <span className="text-[10px] text-muted-foreground">Shortcut: Cmd+S / Ctrl+S</span>
            </div>
          </DropdownMenuItem>

          {onDiscard && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDiscard}
                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <IconTrash className="size-4" />
                <span className="text-xs">Discard Draft & Reset</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
