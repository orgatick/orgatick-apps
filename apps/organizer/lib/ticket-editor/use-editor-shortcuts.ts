"use client";

import React from "react";
import { useTicketEditorStore } from "./editor.store";
import { calculateFitZoom } from "./canvas-resize-helpers";

interface UseEditorShortcutsProps {
  onOpenHelp?: () => void;
}

export function useEditorShortcuts({ onOpenHelp }: UseEditorShortcutsProps = {}) {
  const elements = useTicketEditorStore((s) => s.elements);
  const selectedElementId = useTicketEditorStore((s) => s.selectedElementId);
  const setSelectedElementId = useTicketEditorStore((s) => s.setSelectedElementId);
  const updateElement = useTicketEditorStore((s) => s.updateElement);
  const removeElement = useTicketEditorStore((s) => s.removeElement);
  const duplicateElement = useTicketEditorStore((s) => s.duplicateElement);
  const undo = useTicketEditorStore((s) => s.undo);
  const redo = useTicketEditorStore((s) => s.redo);
  const zoom = useTicketEditorStore((s) => s.zoom);
  const setZoom = useTicketEditorStore((s) => s.setZoom);
  const canvas = useTicketEditorStore((s) => s.canvas);
  const gridSnap = useTicketEditorStore((s) => s.gridSnap);
  const setGridSnap = useTicketEditorStore((s) => s.setGridSnap);
  const previewMode = useTicketEditorStore((s) => s.previewMode);
  const setPreviewMode = useTicketEditorStore((s) => s.setPreviewMode);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const tag = active?.tagName.toLowerCase();
      const isInputActive =
        tag === "input" || tag === "textarea" || tag === "select" || (active as HTMLElement)?.isContentEditable;

      const isMod = e.ctrlKey || e.metaKey;

      // 1. History: Undo / Redo
      if (isMod && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (isMod && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      // 2. Duplicate selected element: Ctrl+D
      if (isMod && (e.key === "d" || e.key === "D")) {
        if (selectedElementId) {
          e.preventDefault();
          duplicateElement(selectedElementId);
        }
        return;
      }

      // 3. Zoom controls: Ctrl + / Ctrl - / Ctrl 0
      if (isMod && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoom(zoom + 0.1);
        return;
      }
      if (isMod && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        setZoom(zoom - 0.1);
        return;
      }
      if (isMod && e.key === "0") {
        e.preventDefault();
        setZoom(calculateFitZoom(canvas.width, canvas.height));
        return;
      }

      // Skip non-input-safe shortcuts if user is typing in a form field
      if (isInputActive) return;

      // 4. Delete element
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId) {
          e.preventDefault();
          removeElement(selectedElementId);
        }
        return;
      }

      // 5. Deselect
      if (e.key === "Escape") {
        setSelectedElementId(null);
        return;
      }

      // 6. Nudge position with arrow keys
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedElementId) {
        const target = elements.find((el) => el.id === selectedElementId);
        if (!target) return;

        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let newX = target.x;
        let newY = target.y;

        if (e.key === "ArrowUp") newY = Math.max(0, target.y - step);
        if (e.key === "ArrowDown") newY = Math.min(canvas.height - target.height, target.y + step);
        if (e.key === "ArrowLeft") newX = Math.max(0, target.x - step);
        if (e.key === "ArrowRight") newX = Math.min(canvas.width - target.width, target.x + step);

        updateElement(selectedElementId, { x: newX, y: newY });
        return;
      }

      // 7. Grid Toggle (G or Ctrl+G)
      if ((isMod && (e.key === "g" || e.key === "G")) || e.key === "g" || e.key === "G") {
        e.preventDefault();
        setGridSnap(!gridSnap);
        return;
      }

      // 8. Preview Toggle (P or Ctrl+P)
      if ((isMod && (e.key === "p" || e.key === "P")) || e.key === "p" || e.key === "P") {
        e.preventDefault();
        setPreviewMode(!previewMode);
        return;
      }

      // 9. Shortcuts Help: ?
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        onOpenHelp?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    elements,
    selectedElementId,
    zoom,
    canvas,
    gridSnap,
    previewMode,
    undo,
    redo,
    removeElement,
    duplicateElement,
    updateElement,
    setZoom,
    setGridSnap,
    setPreviewMode,
    setSelectedElementId,
    onOpenHelp,
  ]);
}
