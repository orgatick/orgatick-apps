"use client";

import { Button } from "@orgatick/ui/components/button";
import { Slider } from "@orgatick/ui/components/slider";
import {
  IconFlipHorizontal,
  IconRefresh,
  IconRotate2,
  IconRotateClockwise,
  IconZoomIn,
  IconZoomOut,
} from "@tabler/icons-react";
import type { CropState } from "../lib/image-crop-utils";

interface ImageCropperControlsProps {
  cropState: CropState;
  onStateChange: (updater: (prev: CropState) => CropState) => void;
  onReset: () => void;
}

export function ImageCropperControls({ cropState, onStateChange, onReset }: ImageCropperControlsProps) {
  const handleZoomChange = (value: number) => {
    onStateChange((prev) => ({
      ...prev,
      zoom: Math.min(3, Math.max(1, value)),
    }));
  };

  const handleRotate = (deltaDegrees: number) => {
    onStateChange((prev) => ({
      ...prev,
      rotation: (prev.rotation + deltaDegrees + 360) % 360,
    }));
  };

  const handleToggleFlip = () => {
    onStateChange((prev) => ({
      ...prev,
      flipH: !prev.flipH,
    }));
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-3 shadow-2xs">
      {/* Zoom control row */}
      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => handleZoomChange(cropState.zoom - 0.15)}
          disabled={cropState.zoom <= 1}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <IconZoomOut className="size-3.5" />
        </Button>

        <div className="flex-1">
          <Slider
            value={[cropState.zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={(val) => {
              const num = Array.isArray(val) ? val[0] : val;
              if (typeof num === "number") handleZoomChange(num);
            }}
            aria-label="Image zoom level"
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => handleZoomChange(cropState.zoom + 0.15)}
          disabled={cropState.zoom >= 3}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <IconZoomIn className="size-3.5" />
        </Button>

        <span className="min-w-10 text-end font-mono text-[11px] font-semibold text-muted-foreground tabular-nums">
          {Math.round(cropState.zoom * 100)}%
        </span>
      </div>

      {/* Action buttons row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRotate(-90)}
            className="h-8 gap-1.5 px-2.5 text-xs"
            title="Rotate 90° counter-clockwise"
          >
            <IconRotate2 className="size-3.5" />
            <span className="hidden sm:inline">Rotate -90°</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleRotate(90)}
            className="h-8 gap-1.5 px-2.5 text-xs"
            title="Rotate 90° clockwise"
          >
            <IconRotateClockwise className="size-3.5" />
            <span className="hidden sm:inline">Rotate +90°</span>
          </Button>

          <Button
            type="button"
            variant={cropState.flipH ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggleFlip}
            className="h-8 gap-1.5 px-2.5 text-xs"
            title="Flip horizontally"
          >
            <IconFlipHorizontal className="size-3.5" />
            <span className="hidden sm:inline">Flip</span>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          title="Reset zoom, pan, and rotation"
        >
          <IconRefresh className="size-3.5" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
}
