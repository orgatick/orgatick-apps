"use client";

import React from "react";
import { EditorHeader } from "./editor-header";
import { EditorFieldLibrary } from "./editor-field-library";
import { EditorCanvas } from "./editor-canvas";
import { EditorInspector } from "./editor-inspector";
import { EditorPreviewModal } from "./editor-preview-modal";
import { EditorBackgroundModal } from "./editor-background-modal";
import { EditorShortcutsModal } from "./editor-shortcuts-modal";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { useEditorShortcuts } from "@/lib/ticket-editor/use-editor-shortcuts";

export function TicketEditor() {
  const [bgModalOpen, setBgModalOpen] = React.useState(false);
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  const previewMode = useTicketEditorStore((s) => s.previewMode);
  const setPreviewMode = useTicketEditorStore((s) => s.setPreviewMode);
  const elements = useTicketEditorStore((s) => s.elements);

  const [notification, setNotification] = React.useState<string | null>(null);

  // Activate keyboard shortcuts
  useEditorShortcuts({
    onOpenHelp: () => setShortcutsOpen((prev) => !prev),
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveDraft = () => {
    showToast("✓ Draft template saved successfully");
  };

  const handlePublish = () => {
    const hasQr = elements.some((el) => el.type === "qr" || el.field === "ticket.verificationQr");
    if (!hasQr) {
      showToast("⚠️ Warning: Please add the Verification QR code before publishing!");
      return;
    }
    showToast("🎉 Template published! Immutable version snapshot created.");
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Action Bar */}
      <EditorHeader
        onSaveClick={handleSaveDraft}
        onPublishClick={handlePublish}
        onShortcutsClick={() => setShortcutsOpen(true)}
      />

      {/* Main Studio 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Tool Library */}
        <EditorFieldLibrary onOpenBackgroundModal={() => setBgModalOpen(true)} />

        {/* Center: Stage Canvas */}
        <EditorCanvas />

        {/* Right: Property Inspector */}
        <EditorInspector />
      </div>

      {/* Live Simulation Preview Modal */}
      <EditorPreviewModal open={previewMode} onClose={() => setPreviewMode(false)} />

      {/* Background & Dimensions Modal */}
      <EditorBackgroundModal open={bgModalOpen} onClose={() => setBgModalOpen(false)} />

      {/* Keyboard Shortcuts Help Modal */}
      <EditorShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-foreground text-background px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          {notification}
        </div>
      )}
    </div>
  );
}
