"use client";

import React from "react";
import {
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconLayersIntersect,
  IconLock,
  IconLockOpen,
  IconQrcode,
  IconTrash,
  IconTypography,
} from "@tabler/icons-react";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";

export function EditorLayersPanel() {
  const elements = useTicketEditorStore((s) => s.elements);
  const selectedElementId = useTicketEditorStore((s) => s.selectedElementId);
  const setSelectedElementId = useTicketEditorStore((s) => s.setSelectedElementId);
  const removeElement = useTicketEditorStore((s) => s.removeElement);
  const moveElementLayer = useTicketEditorStore((s) => s.moveElementLayer);
  const toggleElementLock = useTicketEditorStore((s) => s.toggleElementLock);
  const toggleElementHidden = useTicketEditorStore((s) => s.toggleElementHidden);

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<{ id: string; position: "above" | "below" } | null>(null);

  // Top-most layer first (Figma/Photoshop convention)
  const layers = React.useMemo(() => {
    return [...elements].sort((a, b) => b.zIndex - a.zIndex);
  }, [elements]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const isAbove = e.clientY - rect.top < rect.height / 2;
    setDropTarget({ id: targetId, position: isAbove ? "above" : "below" });
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !dropTarget) return;

    moveElementLayer(draggedId, targetId, dropTarget.position);
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
          <IconLayersIntersect className="size-3.5 text-primary" />
          Layers Stack ({elements.length})
        </h3>
        {selectedElementId && (
          <button
            type="button"
            onClick={() => setSelectedElementId(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground font-mono transition-colors"
          >
            Deselect
          </button>
        )}
      </div>

      {layers.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground/60 border border-dashed border-border rounded-lg p-4">
          No layers added yet. Click fields in the toolbox to place them on the ticket.
        </div>
      ) : (
        <div className="space-y-1">
          {layers.map((el, idx) => {
            const isSelected = selectedElementId === el.id;
            const isDragging = draggedId === el.id;
            const isTarget = dropTarget?.id === el.id;
            const TypeIcon = el.type === "qr" ? IconQrcode : IconTypography;

            return (
              <div
                key={el.id}
                draggable={!el.locked}
                onDragStart={(e) => handleDragStart(e, el.id)}
                onDragOver={(e) => handleDragOver(e, el.id)}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => handleDrop(e, el.id)}
                onDragEnd={handleDragEnd}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setSelectedElementId(el.id);
                  }
                }}
                onClick={() => setSelectedElementId(el.id)}
                className={`relative flex items-center justify-between p-2 rounded-lg border text-xs transition-all group ${
                  isSelected
                    ? "bg-primary/10 border-primary text-foreground shadow-xs"
                    : "bg-muted/20 border-border/50 text-foreground/90 hover:bg-muted/50"
                } ${isDragging ? "opacity-35 scale-[0.98]" : "opacity-100"} ${
                  isTarget && dropTarget.position === "above" ? "border-t-2 border-t-primary" : ""
                } ${isTarget && dropTarget.position === "below" ? "border-b-2 border-b-primary" : ""} ${
                  el.hidden ? "opacity-45" : ""
                }`}
              >
                {/* Left: Drag Handle, Icon, Name */}
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span
                    className={`cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground ${
                      el.locked ? "opacity-20 pointer-events-none" : ""
                    }`}
                    title={el.locked ? "Layer is locked" : "Drag to rearrange layer"}
                  >
                    <IconGripVertical className="size-3.5" />
                  </span>
                  <TypeIcon className="size-3.5 text-primary shrink-0" />
                  <span className={`truncate font-medium ${el.hidden ? "line-through text-muted-foreground" : ""}`}>
                    {el.label}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground/70 shrink-0 ml-1">
                    #{layers.length - idx}
                  </span>
                </div>

                {/* Right: Actions (Visibility, Lock, Delete) */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementHidden(el.id);
                    }}
                    className={`p-1 rounded hover:bg-muted transition-colors ${
                      el.hidden ? "text-muted-foreground" : "text-foreground"
                    }`}
                    title={el.hidden ? "Unhide layer" : "Hide layer"}
                  >
                    {el.hidden ? <IconEyeOff className="size-3" /> : <IconEye className="size-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleElementLock(el.id);
                    }}
                    className={`p-1 rounded hover:bg-muted transition-colors ${
                      el.locked ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={el.locked ? "Unlock layer" : "Lock layer"}
                  >
                    {el.locked ? <IconLock className="size-3" /> : <IconLockOpen className="size-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(el.id);
                    }}
                    className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete layer"
                  >
                    <IconTrash className="size-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
