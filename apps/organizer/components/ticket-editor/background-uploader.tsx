"use client";

import React from "react";
import { IconAlertCircle, IconCheck, IconUpload } from "@tabler/icons-react";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function BackgroundUploader() {
  const applyBaseImage = useTicketEditorStore((s) => s.applyBaseImage);

  const [error, setError] = React.useState<string | null>(null);
  const [successInfo, setSuccessInfo] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setSuccessInfo(null);

    // Validate 5MB max upload size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (PNG, JPEG, WebP).");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const width = img.naturalWidth || 1200;
      const height = img.naturalHeight || 600;

      // The uploaded image strictly dictates the ticket dimensions
      applyBaseImage(objectUrl, width, height, true);
      setSuccessInfo(`✓ Ticket dimensions set to ${width} × ${height}px`);
    };

    img.onerror = () => {
      setError("Failed to decode uploaded image.");
    };

    img.src = objectUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-foreground">Upload Background Design (Max 5MB)</div>

      <button
        type="button"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="w-full border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center group-hover:scale-105 transition-transform">
          <IconUpload className="size-5" />
        </div>
        <div className="mt-2 text-xs font-semibold text-foreground">Click or drag image here</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          PNG, JPEG, WebP up to 5MB • Automatically sets canvas dimensions
        </div>
      </button>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 p-2 rounded-md">
          <IconAlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successInfo && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-md font-medium">
          <IconCheck className="size-4 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}
    </div>
  );
}
