"use client";

import React from "react";
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconArrowLeft,
  IconDeviceFloppy,
  IconEye,
  IconGridDots,
  IconKeyboard,
  IconSend,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { Badge } from "@orgatick/ui/components/badge";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { LinkButton } from "../ui/link-button";

interface EditorHeaderProps {
  onPublishClick?: () => void;
  onSaveClick?: () => void;
  onShortcutsClick?: () => void;
}

export function EditorHeader({ onPublishClick, onSaveClick, onShortcutsClick }: EditorHeaderProps) {
  const templateName = useTicketEditorStore((s) => s.templateName);
  const setTemplateName = useTicketEditorStore((s) => s.setTemplateName);
  const status = useTicketEditorStore((s) => s.status);
  const canvas = useTicketEditorStore((s) => s.canvas);
  const isDirty = useTicketEditorStore((s) => s.isDirty);
  const zoom = useTicketEditorStore((s) => s.zoom);
  const setZoom = useTicketEditorStore((s) => s.setZoom);
  const gridSnap = useTicketEditorStore((s) => s.gridSnap);
  const setGridSnap = useTicketEditorStore((s) => s.setGridSnap);
  const _showGrid = useTicketEditorStore((s) => s.showGrid);
  const _setShowGrid = useTicketEditorStore((s) => s.setShowGrid);
  const previewMode = useTicketEditorStore((s) => s.previewMode);
  const setPreviewMode = useTicketEditorStore((s) => s.setPreviewMode);
  const pastCount = useTicketEditorStore((s) => s.past.length);
  const futureCount = useTicketEditorStore((s) => s.future.length);
  const undo = useTicketEditorStore((s) => s.undo);
  const redo = useTicketEditorStore((s) => s.redo);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [titleInput, setTitleInput] = React.useState(templateName);

  const handleSaveTitle = () => {
    if (titleInput.trim()) {
      setTemplateName(titleInput.trim());
    } else {
      setTitleInput(templateName);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <LinkButton variant="ghost" size="icon" href="/ticket-templates" aria-label="Back">
          <IconArrowLeft className="size-4" />
        </LinkButton>

        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
              className="text-sm font-semibold bg-background border border-primary/50 rounded px-2 py-0.5 text-foreground focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-foreground hover:text-primary truncate transition-colors text-left"
              title="Click to rename"
            >
              {templateName}
            </button>
          )}

          <Badge variant={status === "published" ? "default" : "secondary"}>{status}</Badge>
          <Badge variant="outline" className="font-mono text-[10px] hidden sm:inline-flex">
            {canvas.width} × {canvas.height} px
          </Badge>
          {isDirty && <span className="text-[10px] text-muted-foreground/80 font-mono tracking-wider">(Unsaved)</span>}
        </div>
      </div>

      {/* Center: History & Canvas Tools */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={pastCount === 0}
          title={`Undo (Ctrl+Z) - ${pastCount} states`}
        >
          <IconArrowBackUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={futureCount === 0}
          title={`Redo (Ctrl+Shift+Z) - ${futureCount} states`}
        >
          <IconArrowForwardUp className="size-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Zoom Controls */}
        <Button variant="ghost" size="icon" onClick={() => setZoom(zoom - 0.1)} disabled={zoom <= 0.4} title="Zoom Out">
          <IconZoomOut className="size-4" />
        </Button>
        <span className="font-mono text-xs w-11 text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" onClick={() => setZoom(zoom + 0.1)} disabled={zoom >= 2.0} title="Zoom In">
          <IconZoomIn className="size-4" />
        </Button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Snap & Grid */}
        <Button
          variant={gridSnap ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setGridSnap(!gridSnap)}
          title={`Snap to Grid: ${gridSnap ? "ON" : "OFF"} (G)`}
        >
          <IconGridDots className="size-4" />
        </Button>

        {/* Shortcuts Help */}
        <Button variant="ghost" size="icon" onClick={onShortcutsClick} title="Keyboard Shortcuts (?)">
          <IconKeyboard className="size-4" />
        </Button>
      </div>

      {/* Right: Preview & Save Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant={previewMode ? "secondary" : "outline"}
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
          className="gap-1.5"
        >
          <IconEye className="size-4" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        <Button variant="outline" size="sm" onClick={onSaveClick} className="gap-1.5">
          <IconDeviceFloppy className="size-4" />
          <span className="hidden sm:inline">Save Draft</span>
        </Button>

        <Button variant="default" size="sm" onClick={onPublishClick} className="gap-1.5">
          <IconSend className="size-4" />
          <span>Publish</span>
        </Button>
      </div>
    </header>
  );
}
