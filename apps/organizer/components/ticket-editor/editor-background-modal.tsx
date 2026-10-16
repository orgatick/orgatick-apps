"use client";

import React from "react";
import { IconAlertCircle, IconLink, IconPhoto, IconTrash, IconX } from "@tabler/icons-react";
import { Button } from "@orgatick/ui/components/button";
import { useTicketEditorStore } from "@/lib/ticket-editor/editor.store";
import { loadAndInspectImage } from "@/lib/ticket-editor/canvas-resize-helpers";
import { BackgroundUploader } from "./background-uploader";
import Image from "next/image";

interface EditorBackgroundModalProps {
  open: boolean;
  onClose: () => void;
}

const SAMPLE_BACKGROUNDS = [
  {
    name: "Dark Tech Mesh",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 600,
  },
  {
    name: "Vibrant Gradient",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 600,
  },
  {
    name: "Geometric Gold",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    width: 1200,
    height: 600,
  },
];

export function EditorBackgroundModal({ open, onClose }: EditorBackgroundModalProps) {
  const canvas = useTicketEditorStore((s) => s.canvas);
  const background = useTicketEditorStore((s) => s.background);
  const setBackground = useTicketEditorStore((s) => s.setBackground);
  const applyBaseImage = useTicketEditorStore((s) => s.applyBaseImage);

  const [imageUrl, setImageUrl] = React.useState("");
  const [loadingUrl, setLoadingUrl] = React.useState(false);
  const [urlError, setUrlError] = React.useState<string | null>(null);

  if (!open) return null;

  const handleApplyUrl = async () => {
    if (!imageUrl.trim()) return;
    setLoadingUrl(true);
    setUrlError(null);
    try {
      const { width, height } = await loadAndInspectImage(imageUrl.trim());
      applyBaseImage(imageUrl.trim(), width, height, true);
      setImageUrl("");
    } catch {
      setUrlError("Failed to decode image from URL. Check link or CORS.");
    } finally {
      setLoadingUrl(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconPhoto className="size-5 text-primary" />
            <div>
              <h2 className="text-base font-semibold text-foreground">Base Image &amp; Canvas</h2>
              <p className="text-[11px] text-muted-foreground font-mono">
                Current Ticket Size: {canvas.width} × {canvas.height} px
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* File Upload Box (Max 5MB + Auto-Resize) */}
          <BackgroundUploader />

          {/* Image URL Input */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <IconLink className="size-3.5 text-primary" />
              Or Load Base Image from URL
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/ticket-artwork.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyUrl()}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-mono"
              />
              <Button variant="outline" size="sm" onClick={handleApplyUrl} disabled={loadingUrl || !imageUrl.trim()}>
                {loadingUrl ? "Loading..." : "Apply Size"}
              </Button>
            </div>
            {urlError && (
              <div className="flex items-center gap-1 text-[11px] text-destructive">
                <IconAlertCircle className="size-3.5 shrink-0" />
                <span>{urlError}</span>
              </div>
            )}
          </div>

          {/* Sample Background Options */}
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <div className="text-xs font-medium text-muted-foreground">Or Pick Sample Base Artwork</div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_BACKGROUNDS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => applyBaseImage(sample.url, sample.width, sample.height, true)}
                  className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-all text-left"
                >
                  <Image src={sample.url} alt={sample.name} className="size-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white p-1 truncate block font-mono">
                    {sample.width}×{sample.height}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {background?.url && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBackground(null)}
              className="w-full gap-2 text-xs"
            >
              <IconTrash className="size-3.5" />
              Remove Current Background
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-muted/20 border-t border-border flex justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
