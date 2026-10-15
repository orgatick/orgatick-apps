"use client";

import React from "react";
import { Rnd } from "react-rnd";
import QRCode from "react-qr-code";
import type { TicketElement } from "@/lib/ticket-editor/editor-types";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { SAMPLE_ATTENDEE_PROFILES } from "@/lib/ticket-editor/sample-attendees";

interface EditorElementViewProps {
  element: TicketElement;
}

export function EditorElementView({ element }: EditorElementViewProps) {
  const selectedElementId = useTicketEditorStore((s) => s.selectedElementId);
  const setSelectedElementId = useTicketEditorStore((s) => s.setSelectedElementId);
  const updateElement = useTicketEditorStore((s) => s.updateElement);
  const previewMode = useTicketEditorStore((s) => s.previewMode);
  const selectedAttendeeProfileId = useTicketEditorStore((s) => s.selectedAttendeeProfileId);
  const zoom = useTicketEditorStore((s) => s.zoom);
  const gridSnap = useTicketEditorStore((s) => s.gridSnap);
  const gridSize = useTicketEditorStore((s) => s.gridSize);

  const isSelected = selectedElementId === element.id;

  const previewData = React.useMemo(() => {
    const profile = SAMPLE_ATTENDEE_PROFILES.find((p) => p.id === selectedAttendeeProfileId);
    return profile?.data ?? SAMPLE_ATTENDEE_PROFILES[0].data;
  }, [selectedAttendeeProfileId]);

  const displayValue = React.useMemo(() => {
    if (element.staticContent) return element.staticContent;
    if (element.field && previewData[element.field]) {
      return previewData[element.field];
    }
    return element.label;
  }, [element.staticContent, element.field, element.label, previewData]);

  if (element.hidden) return null;

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      scale={zoom}
      bounds="parent"
      grid={[gridSnap ? gridSize : 1, gridSnap ? gridSize : 1]}
      disableDragging={previewMode || element.locked}
      enableResizing={!previewMode && !element.locked && isSelected}
      onDragStart={() => setSelectedElementId(element.id)}
      onDragStop={(_, d) => {
        updateElement(element.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        updateElement(element.id, {
          width: Math.round(Number.parseFloat(ref.style.width)),
          height: Math.round(Number.parseFloat(ref.style.height)),
          ...position,
        });
      }}
      style={{
        zIndex: element.zIndex,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
      }}
      className={`group select-none transition-shadow ${
        isSelected && !previewMode
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
          : "hover:ring-1 hover:ring-primary/40"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedElementId(element.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation();
            setSelectedElementId(element.id);
          }
        }}
        className={`size-full overflow-hidden flex items-center justify-center relative ${
          element.locked ? "cursor-default" : "cursor-move"
        }`}
      >
        {element.type === "qr" ? (
          <div
            className="size-full flex items-center justify-center p-1 rounded"
            style={{ backgroundColor: element.qrConfig?.colorLight ?? "#ffffff" }}
          >
            <QRCode
              value={displayValue}
              size={Math.min(element.width, element.height) - 8}
              fgColor={element.qrConfig?.colorDark ?? "#000000"}
              bgColor={element.qrConfig?.colorLight ?? "#ffffff"}
              className="size-full object-contain"
            />
          </div>
        ) : (
          <div
            style={{
              fontFamily: element.style.fontFamily,
              fontSize: `${element.style.fontSize}px`,
              fontWeight: element.style.fontWeight,
              color: element.style.color,
              textAlign: element.style.textAlign,
              textTransform: element.style.textTransform,
              letterSpacing: element.style.letterSpacing ? `${element.style.letterSpacing}px` : undefined,
              backgroundColor: element.style.backgroundColor,
              borderRadius: element.style.borderRadius ? `${element.style.borderRadius}px` : undefined,
              padding: element.style.padding ? `${element.style.padding}px` : undefined,
            }}
            className="size-full flex items-center overflow-hidden truncate"
          >
            <span className="truncate w-full leading-tight">{displayValue}</span>
          </div>
        )}

        {/* Live dimension badge when active */}
        {isSelected && !previewMode && (
          <div className="absolute -top-5 left-0 font-mono text-[9px] bg-primary text-primary-foreground px-1 py-0.5 rounded shadow-xs pointer-events-none">
            {Math.round(element.width)} × {Math.round(element.height)}
          </div>
        )}
      </div>
    </Rnd>
  );
}
