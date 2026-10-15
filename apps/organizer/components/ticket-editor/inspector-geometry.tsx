"use client";

import { IconArrowDown, IconArrowUp, IconCopy, IconRotateClockwise, IconTrash } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import type { TicketElement } from "@/lib/ticket-editor/editor-types";

interface InspectorGeometryProps {
  element: TicketElement;
}

export function InspectorGeometry({ element }: InspectorGeometryProps) {
  const updateElement = useTicketEditorStore((s) => s.updateElement);
  const removeElement = useTicketEditorStore((s) => s.removeElement);
  const duplicateElement = useTicketEditorStore((s) => s.duplicateElement);
  const reorderElement = useTicketEditorStore((s) => s.reorderElement);

  return (
    <div className="space-y-3.5">
      <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
        Position &amp; Size
      </h3>

      {/* X & Y */}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground font-mono">X (px)</span>
          <input
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => updateElement(element.id, { x: Number(e.target.value) })}
            className="w-full bg-background border border-border rounded-md px-2.5 py-1 text-xs font-mono"
          />
        </label>
        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground font-mono">Y (px)</span>
          <input
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => updateElement(element.id, { y: Number(e.target.value) })}
            className="w-full bg-background border border-border rounded-md px-2.5 py-1 text-xs font-mono"
          />
        </label>
      </div>

      {/* Width & Height */}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground font-mono">Width (W)</span>
          <input
            type="number"
            value={Math.round(element.width)}
            onChange={(e) => updateElement(element.id, { width: Math.max(30, Number(e.target.value)) })}
            className="w-full bg-background border border-border rounded-md px-2.5 py-1 text-xs font-mono"
          />
        </label>
        <label className="text-xs space-y-1 block">
          <span className="text-muted-foreground font-mono">Height (H)</span>
          <input
            type="number"
            value={Math.round(element.height)}
            onChange={(e) => updateElement(element.id, { height: Math.max(20, Number(e.target.value)) })}
            className="w-full bg-background border border-border rounded-md px-2.5 py-1 text-xs font-mono"
          />
        </label>
      </div>

      {/* Rotation */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <IconRotateClockwise className="size-3.5 text-primary" />
          Rotation
        </span>
        <div className="flex items-center gap-1">
          {[0, 90, 180, 270].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => updateElement(element.id, { rotation: deg })}
              className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors ${
                (element.rotation ?? 0) === deg
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>

      {/* Layers & Ordering */}
      <div className="pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Layer Order</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => reorderElement(element.id, "up")}
              title="Bring Forward"
            >
              <IconArrowUp className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => reorderElement(element.id, "down")}
              title="Send Backward"
            >
              <IconArrowDown className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons: Duplicate & Delete */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
        <Button variant="outline" size="sm" onClick={() => duplicateElement(element.id)} className="gap-1.5 text-xs">
          <IconCopy className="size-3.5" />
          Duplicate
        </Button>
        <Button variant="destructive" size="sm" onClick={() => removeElement(element.id)} className="gap-1.5 text-xs">
          <IconTrash className="size-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}
