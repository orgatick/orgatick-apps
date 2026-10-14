"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@orgatick/ui/lib/utils";
import { Button } from "@orgatick/ui/components/button";
import { ImageCropDialog } from "@orgatick/ui/components/image-crop-dialog";
import { IconCrop, IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";

export interface ImageUploadProps {
  value?: File | string | null;
  onChange?: (file: File | null) => void;
  aspectRatio?: number;
  cropShape?: "rect" | "round";
  maxSizeMB?: number;
  acceptedTypes?: string[];
  placeholderIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_HELP = "Drag & drop or click to upload. You can zoom, rotate, and frame your image.";

export function ImageUpload({
  value,
  onChange,
  aspectRatio = 1,
  cropShape = "rect",
  maxSizeMB = 5,
  acceptedTypes = DEFAULT_TYPES,
  placeholderIcon,
  label = "Upload Image",
  helperText = DEFAULT_HELP,
  error,
  disabled = false,
  className,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(typeof value === "string" ? value : null);
  }, [value]);

  const handleFilePicked = (file: File | null) => {
    setLocalError(null);
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File size must not exceed ${maxSizeMB}MB`);
      return;
    }
    if (!acceptedTypes.includes(file.type)) {
      setLocalError(`Image must be one of: ${acceptedTypes.map((t) => t.replace("image/", "")).join(", ")}`);
      return;
    }
    setPendingImage(file);
    setCropDialogOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = (croppedFile: File) => {
    onChange?.(croppedFile);
    setPendingImage(null);
  };

  const handleRemove = () => {
    onChange?.(null);
    setPendingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenRecrop = () => {
    setPendingImage(value instanceof File ? value : previewUrl);
    setCropDialogOpen(true);
  };

  const handleDrag = (e: React.DragEvent, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(dragging);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files?.[0]) handleFilePicked(e.dataTransfer.files[0]);
  };

  const activeError = localError || error;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        disabled={disabled}
        className="hidden"
        onChange={(e) => handleFilePicked(e.target.files?.[0] || null)}
      />

      <div
        role="region"
        aria-label="Image upload and drop area"
        onDragOver={(e) => handleDrag(e, true)}
        onDragLeave={(e) => handleDrag(e, false)}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col gap-4 rounded-xl border border-dashed p-4 transition-colors duration-200 sm:flex-row sm:items-center",
          isDragging
            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
            : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/30",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {/* Thumbnail Preview or Placeholder */}
        <div
          className={cn(
            "relative flex size-20 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted shadow-xs",
            cropShape === "round" ? "rounded-full" : "rounded-xl",
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="Upload preview" className="size-full object-cover" />
          ) : (
            placeholderIcon || <IconPhoto className="size-8 text-muted-foreground" />
          )}
        </div>

        {/* Info & Action Controls */}
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">(Max {maxSizeMB}MB)</span>
            {isDragging && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Drop image here
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{helperText}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              <IconUpload data-icon="inline-start" />
              {previewUrl ? "Change Image" : "Upload Image"}
            </Button>

            {previewUrl && (
              <>
                <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={handleOpenRecrop}>
                  <IconCrop data-icon="inline-start" />
                  Crop & Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={handleRemove}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <IconTrash data-icon="inline-start" />
                  Remove
                </Button>
              </>
            )}
          </div>
          {activeError && <p className="text-xs text-destructive">{activeError}</p>}
        </div>
      </div>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        image={pendingImage}
        aspectRatio={aspectRatio}
        cropShape={cropShape}
        title={`Edit & Crop ${label}`}
        description="Position, zoom, and rotate your image to look balanced and clear."
        onCropComplete={handleCropComplete}
        onCancel={() => setPendingImage(null)}
      />
    </div>
  );
}
