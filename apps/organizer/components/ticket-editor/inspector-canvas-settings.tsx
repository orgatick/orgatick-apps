"use client";

import { ColorPicker } from "@orgatick/ui/components/color-picker";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { CANVAS_PRESETS } from "@/lib/ticket-editor/canvas-presets";
import { EditorLayersPanel } from "./editor-layers-panel";

export function InspectorCanvasSettings() {
  const canvas = useTicketEditorStore((s) => s.canvas);
  const setCanvas = useTicketEditorStore((s) => s.setCanvas);
  const background = useTicketEditorStore((s) => s.background);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
          Canvas Dimensions
        </h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <label className="text-xs space-y-1 block">
            <span className="text-muted-foreground font-mono">Width</span>
            <input
              type="number"
              value={canvas.width}
              onChange={(e) => setCanvas({ width: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-mono"
            />
          </label>
          <label className="text-xs space-y-1 block">
            <span className="text-muted-foreground font-mono">Height</span>
            <input
              type="number"
              value={canvas.height}
              onChange={(e) => setCanvas({ height: Number(e.target.value) })}
              className="w-full bg-background border border-border rounded-md px-2 py-1 text-xs font-mono"
            />
          </label>
        </div>

        {background?.naturalWidth && background?.naturalHeight && (
          <div className="mt-2 p-2 rounded-md bg-primary/5 border border-primary/20 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Base Image Size:</span>
              <span className="font-mono font-medium text-foreground">
                {background.naturalWidth} × {background.naturalHeight} px
              </span>
            </div>
            {(canvas.width !== background.naturalWidth || canvas.height !== background.naturalHeight) && (
              <button
                type="button"
                onClick={() => setCanvas({ width: background.naturalWidth, height: background.naturalHeight })}
                className="text-[10px] text-primary hover:underline font-medium block cursor-pointer"
              >
                ↺ Reset ticket size to base image
              </button>
            )}
          </div>
        )}
      </div>

      {/* Canvas Background Color */}
      <div className="space-y-1.5">
        <div className="text-xs space-y-1">
          <span className="text-muted-foreground font-medium">Canvas Background</span>
          <ColorPicker
            value={canvas.backgroundColor}
            onValueChange={(val) => val && setCanvas({ backgroundColor: val })}
            swatches={["#FFFFFF", "#0F172A", "#1E293B", "#000000", "#18181B", "#F8FAFC"]}
            aria-label="Canvas Background Color"
            className="w-full"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-1.5">
        <span className="text-xs text-muted-foreground font-medium">Dimension Presets</span>
        <div className="space-y-1">
          {Object.entries(CANVAS_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCanvas({ width: preset.width, height: preset.height })}
              className={`w-full text-left px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
                canvas.width === preset.width && canvas.height === preset.height
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              {preset.presetName}
            </button>
          ))}
        </div>
      </div>

      {/* Draggable Layers Stack */}
      <div className="pt-2 border-t border-border/60">
        <EditorLayersPanel />
      </div>
    </div>
  );
}
