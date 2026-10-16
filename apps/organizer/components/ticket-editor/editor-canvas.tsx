"use client";

import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { EditorElementView } from "./editor-element-view";
import Image from "next/image";

export function EditorCanvas() {
  const canvas = useTicketEditorStore((s) => s.canvas);
  const background = useTicketEditorStore((s) => s.background);
  const elements = useTicketEditorStore((s) => s.elements);
  const zoom = useTicketEditorStore((s) => s.zoom);
  const showGrid = useTicketEditorStore((s) => s.showGrid);
  const gridSize = useTicketEditorStore((s) => s.gridSize);
  const setSelectedElementId = useTicketEditorStore((s) => s.setSelectedElementId);

  return (
    <div className="flex-1 overflow-auto bg-muted/20 relative flex items-center justify-center p-8 select-none">
      {/* Background Click to Deselect */}
      <button
        type="button"
        aria-label="Deselect elements"
        tabIndex={-1}
        onClick={() => setSelectedElementId(null)}
        className="absolute inset-0 size-full cursor-default bg-transparent border-0 p-0 outline-none"
      />

      {/* Outer Scaled Container - establishes the exact scaled visual footprint */}
      <div
        style={{
          width: Math.round(canvas.width * zoom),
          height: Math.round(canvas.height * zoom),
        }}
        className="relative shrink-0 flex-none pointer-events-auto"
      >
        {/* Actual Logical Canvas - locked to strict dimensions and never shrunk by flex */}
        <div
          style={{
            width: `${canvas.width}px`,
            height: `${canvas.height}px`,
            minWidth: `${canvas.width}px`,
            maxWidth: `${canvas.width}px`,
            minHeight: `${canvas.height}px`,
            maxHeight: `${canvas.height}px`,
            backgroundColor: canvas.backgroundColor,
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
          className="absolute top-0 left-0 shadow-2xl rounded-xl overflow-hidden border border-border/80 flex-none"
        >
          {/* Background Image Layer */}
          {background?.url && (
            <Image
              src={background.url}
              alt="Ticket background"
              style={{ opacity: background.opacity ?? 1 }}
              className={`absolute inset-0 size-full pointer-events-none ${
                background.fit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
          )}

          {/* Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, #94a3b8 1px, transparent 1px), linear-gradient(to bottom, #94a3b8 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}

          {/* Canvas Center Guides */}
          <div className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-primary/20 pointer-events-none" />
          <div className="absolute inset-x-0 top-1/2 h-px border-t border-dashed border-primary/20 pointer-events-none" />

          {/* Visual Elements Layer */}
          {elements.map((el) => (
            <EditorElementView key={el.id} element={el} />
          ))}
        </div>
      </div>

      {/* Floating Canvas Info Badge (docked to bottom-left of editor view) */}
      <div className="absolute bottom-3 left-4 pointer-events-none text-[10px] font-mono text-muted-foreground/80 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-md border border-border/60 shadow-xs z-10">
        {canvas.width} × {canvas.height} px
        {background?.naturalWidth ? " • Auto-sized to image" : ""}
      </div>
    </div>
  );
}
