"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@orgatick/ui/components/dialog";
import { Button } from "@orgatick/ui/components/button";
import { Spinner } from "@orgatick/ui/components/spinner";
import { IconCheck, IconCrop } from "@tabler/icons-react";
import { ImageCropper } from "./image-cropper";
import { ImageCropperControls } from "./image-cropper-controls";
import {
  type CropDimensions,
  type CropState,
  DEFAULT_CROP_STATE,
  createCroppedImageFile,
  readFileAsDataUrl,
} from "../lib/image-crop-utils";

export interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: File | string | null;
  aspectRatio?: number;
  cropShape?: "rect" | "round";
  title?: string;
  description?: string;
  outputFileName?: string;
  targetOutputSize?: number;
  onCropComplete: (file: File, previewUrl: string) => void;
  onCancel?: () => void;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  image,
  aspectRatio = 1,
  cropShape = "rect",
  title = "Edit & Crop Image",
  description = "Adjust framing, zoom, and orientation before saving.",
  outputFileName = "image.webp",
  targetOutputSize = 800,
  onCropComplete,
  onCancel,
}: ImageCropDialogProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [cropState, setCropState] = useState<CropState>(DEFAULT_CROP_STATE);
  const [cropDimensions, setCropDimensions] = useState<CropDimensions | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!image) {
      setDataUrl(null);
      return;
    }
    if (typeof image === "string") {
      setDataUrl(image);
      setCropState(DEFAULT_CROP_STATE);
    } else {
      let isMounted = true;
      void readFileAsDataUrl(image).then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setCropState(DEFAULT_CROP_STATE);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [image]);

  const handleApply = async () => {
    if (!dataUrl || !cropDimensions || isApplying) return;
    setIsApplying(true);
    try {
      const { file, dataUrl: croppedUrl } = await createCroppedImageFile({
        imageSrc: dataUrl,
        cropState,
        cropDimensions,
        fileName: outputFileName,
        mimeType: "image/webp",
        quality: 0.92,
        targetOutputSize,
      });
      onCropComplete(file, croppedUrl);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to crop image:", err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleClose = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <IconCrop className="size-4" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {dataUrl && (
          <div className="flex flex-col gap-3 py-1">
            <ImageCropper
              imageSrc={dataUrl}
              cropState={cropState}
              onCropStateChange={setCropState}
              aspectRatio={aspectRatio}
              cropShape={cropShape}
              onDimensionsReady={setCropDimensions}
            />

            <ImageCropperControls
              cropState={cropState}
              onStateChange={setCropState}
              onReset={() => setCropState(DEFAULT_CROP_STATE)}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleApply()} disabled={isApplying || !dataUrl}>
            {isApplying ? (
              <>
                <Spinner data-icon="inline-start" />
                Processing...
              </>
            ) : (
              <>
                <IconCheck data-icon="inline-start" />
                Apply Crop
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
