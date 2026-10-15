"use client";

import {
  IconCalendar,
  IconId,
  IconPhoto,
  IconQrcode,
  IconTicket,
  IconTypography,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { ScrollArea } from "@orgatick/ui/components/scroll-area";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { DYNAMIC_FIELD_REGISTRY } from "@/lib/ticket-editor/field-registry";
import type { DynamicFieldDefinition } from "@/lib/ticket-editor/editor-types";

interface EditorFieldLibraryProps {
  onOpenBackgroundModal: () => void;
}

const CATEGORY_META = [
  { key: "attendee", label: "Attendee Data", icon: IconUser },
  { key: "event", label: "Event Details", icon: IconCalendar },
  { key: "ticket", label: "Ticket & Tiers", icon: IconTicket },
  { key: "seating", label: "Seating & Access", icon: IconId },
  { key: "qr", label: "Verification QR", icon: IconQrcode },
  { key: "static", label: "Custom Static Text", icon: IconTypography },
] as const;

export function EditorFieldLibrary({ onOpenBackgroundModal }: EditorFieldLibraryProps) {
  const addElement = useTicketEditorStore((s) => s.addElement);
  const elements = useTicketEditorStore((s) => s.elements);
  const canvas = useTicketEditorStore((s) => s.canvas);

  const handleAddField = (fieldDef: DynamicFieldDefinition) => {
    // Offset slightly if previous element exists at same spot
    const offset = (elements.length % 5) * 20;
    const initialX = Math.min(60 + offset, canvas.width - fieldDef.defaultWidth - 20);
    const initialY = Math.min(100 + offset, canvas.height - fieldDef.defaultHeight - 20);

    addElement({
      type: fieldDef.category === "qr" ? "qr" : "text",
      field: fieldDef.fieldKey,
      label: fieldDef.label,
      x: Math.max(20, initialX),
      y: Math.max(20, initialY),
      width: fieldDef.defaultWidth,
      height: fieldDef.defaultHeight,
      rotation: 0,
      style: { ...fieldDef.defaultStyle },
      qrConfig:
        fieldDef.category === "qr"
          ? {
              colorDark: "#000000",
              colorLight: "#ffffff",
              includeMargin: true,
              errorCorrectionLevel: "M",
            }
          : undefined,
    });
  };

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col h-full select-none">
      <div className="p-3 border-b border-border/60">
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Design Toolbox
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenBackgroundModal}
          className="w-full mt-2.5 gap-2 text-xs justify-start"
        >
          <IconPhoto className="size-4 text-primary" />
          <span>Canvas &amp; Background Setup</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {CATEGORY_META.map((category) => {
            const CategoryIcon = category.icon;
            const fields = DYNAMIC_FIELD_REGISTRY.filter((f) => f.category === category.key);

            if (fields.length === 0) return null;

            return (
              <div key={category.key} className="space-y-1.5">
                <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-foreground/80">
                  <CategoryIcon className="size-3.5 text-primary" />
                  <span>{category.label}</span>
                </div>

                <div className="space-y-1">
                  {fields.map((field) => (
                    <button
                      key={field.fieldKey}
                      type="button"
                      onClick={() => handleAddField(field)}
                      className="w-full flex items-center justify-between p-2 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/70 hover:border-primary/40 transition-colors text-left group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-medium text-foreground truncate">{field.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{field.sampleValue}</div>
                      </div>
                      <span className="grid size-5 place-items-center rounded bg-background border border-border/60 text-muted-foreground group-hover:text-primary shrink-0">
                        <IconPlus className="size-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
