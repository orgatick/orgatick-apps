"use client";

import { IconCommand, IconX } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { EDITOR_SHORTCUTS, type ShortcutItem } from "@/lib/ticket-editor/shortcuts-config";

interface EditorShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: Array<ShortcutItem["category"]> = ["Element", "History", "Canvas", "View"];

export function EditorShortcutsModal({ open, onClose }: EditorShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCommand className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Keyboard Shortcuts</h2>
              <p className="text-[11px] text-muted-foreground">Speed up your ticket design workflow</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close shortcuts">
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Content categorized */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const items = EDITOR_SHORTCUTS.filter((s) => s.category === cat);
            if (items.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  {cat}
                </h3>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div
                      key={item.description}
                      className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors text-xs"
                    >
                      <span className="text-foreground">{item.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded text-foreground font-medium shadow-2xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-muted/20 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Press <kbd className="px-1 py-0.5 text-[10px] bg-muted border border-border rounded font-mono">?</kbd>{" "}
            anytime to toggle
          </span>
          <Button variant="default" size="sm" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
