"use client";

import { ColorPicker } from "@orgatick/ui/components/color-picker";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import type { TicketElement } from "@/lib/ticket-editor/editor-types";

interface InspectorQrProps {
  element: TicketElement;
}

export function InspectorQr({ element }: InspectorQrProps) {
  const updateElement = useTicketEditorStore((s) => s.updateElement);
  const qrConfig = element.qrConfig ?? {
    colorDark: "#000000",
    colorLight: "#ffffff",
    includeMargin: true,
    errorCorrectionLevel: "M",
  };

  const updateQr = (updates: Partial<typeof qrConfig>) => {
    updateElement(element.id, {
      qrConfig: { ...qrConfig, ...updates },
    });
  };

  return (
    <div className="space-y-3.5 pt-3 border-t border-border/60">
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
        QR Code Settings
      </h3>

      {/* Colors */}
      <div className="space-y-2">
        <div className="text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Dark / Foreground Color</span>
          <ColorPicker
            value={qrConfig.colorDark}
            onValueChange={(val) => val && updateQr({ colorDark: val })}
            swatches={["#000000", "#1E293B", "#0F172A", "#1E40AF", "#047857", "#B91C1C"]}
            aria-label="QR Dark Color"
            className="w-full"
          />
        </div>

        <div className="text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Light / Background Color</span>
          <ColorPicker
            value={qrConfig.colorLight}
            onValueChange={(val) => val && updateQr({ colorLight: val })}
            swatches={["#FFFFFF", "#F8FAFC", "#F1F5F9", "#FEF3C7", "#DCFCE7", "#E0F2FE"]}
            aria-label="QR Light Color"
            className="w-full"
          />
        </div>
      </div>

      {/* Quiet Zone Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <div className="text-xs font-medium text-foreground">Quiet Zone Margin</div>
          <div className="text-[10px] text-muted-foreground">High contrast scanner padding</div>
        </div>
        <input
          type="checkbox"
          checked={qrConfig.includeMargin}
          onChange={(e) => updateQr({ includeMargin: e.target.checked })}
          className="size-4 accent-primary rounded cursor-pointer"
        />
      </div>

      {/* Error Correction Level */}
      <label className="text-xs space-y-1 block pt-1">
        <span className="text-muted-foreground font-medium">Error Correction</span>
        <select
          value={qrConfig.errorCorrectionLevel}
          onChange={(e) =>
            updateQr({
              errorCorrectionLevel: e.target.value as "L" | "M" | "Q" | "H",
            })
          }
          className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs"
        >
          <option value="L">Low (7% recovery)</option>
          <option value="M">Medium (15% recovery)</option>
          <option value="Q">Quartile (25% recovery)</option>
          <option value="H">High (30% recovery)</option>
        </select>
      </label>
    </div>
  );
}
