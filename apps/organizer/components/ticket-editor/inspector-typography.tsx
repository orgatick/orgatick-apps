"use client";

import { IconAlignCenter, IconAlignLeft, IconAlignRight } from "@tabler/icons-react";
import { ColorPicker } from "@orgatick/ui/components/color-picker";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import type { TicketElement } from "@/lib/ticket-editor/editor-types";

interface InspectorTypographyProps {
  element: TicketElement;
}

const COLOR_SWATCHES = [
  "#FFFFFF",
  "#F8FAFC",
  "#CBD5E1",
  "#94A3B8",
  "#38BDF8",
  "#4ADE80",
  "#FBBF24",
  "#F87171",
  "#A855F7",
  "#000000",
];

export function InspectorTypography({ element }: InspectorTypographyProps) {
  const updateElement = useTicketEditorStore((s) => s.updateElement);
  const style = element.style;

  const updateStyle = (updates: Partial<typeof style>) => {
    updateElement(element.id, {
      style: { ...style, ...updates },
    });
  };

  return (
    <div className="space-y-3.5 pt-3 border-t border-border/60">
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
        Typography &amp; Style
      </h3>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground font-mono">Font Size</span>
          <input
            type="number"
            min={10}
            max={120}
            value={style.fontSize}
            onChange={(e) => updateStyle({ fontSize: Math.max(8, Number(e.target.value)) })}
            className="w-full bg-background border border-border rounded-md px-2.5 py-1 text-xs font-mono"
          />
        </label>

        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground font-mono">Weight</span>
          <select
            value={style.fontWeight}
            onChange={(e) => updateStyle({ fontWeight: Number(e.target.value) })}
            className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs"
          >
            <option value={400}>Regular (400)</option>
            <option value={500}>Medium (500)</option>
            <option value={600}>Semibold (600)</option>
            <option value={700}>Bold (700)</option>
          </select>
        </label>
      </div>

      {/* Text Alignment & Transform */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">Align</span>
        <div className="flex items-center gap-1">
          {(["left", "center", "right"] as const).map((align) => {
            const Icon = align === "left" ? IconAlignLeft : align === "center" ? IconAlignCenter : IconAlignRight;
            return (
              <button
                key={align}
                type="button"
                onClick={() => updateStyle({ textAlign: align })}
                className={`p-1.5 rounded border transition-colors ${
                  style.textAlign === align
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-3.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Color Picker */}
      <div className="space-y-1.5">
        <div className="text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Text Color</span>
          <ColorPicker
            value={style.color}
            onValueChange={(val) => val && updateStyle({ color: val })}
            swatches={COLOR_SWATCHES}
            aria-label="Text Color"
            className="w-full"
          />
        </div>
      </div>

      {/* Background Fill / Pill */}
      <div className="space-y-1.5 pt-1">
        <div className="text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Background Pill Color (Optional)</span>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ColorPicker
                value={style.backgroundColor ?? null}
                onValueChange={(val) => updateStyle({ backgroundColor: val ?? undefined })}
                alpha
                swatches={COLOR_SWATCHES}
                aria-label="Background pill color"
                className="w-full"
                placeholder="Transparent (none)"
              />
            </div>
            {style.backgroundColor && (
              <button
                type="button"
                onClick={() => updateStyle({ backgroundColor: undefined })}
                className="text-xs text-destructive hover:underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
