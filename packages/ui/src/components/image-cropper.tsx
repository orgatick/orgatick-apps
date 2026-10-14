"use client";

import { useRef, useState } from "react";
import { cn } from "@orgatick/ui/lib/utils";
import { type CropDimensions, type CropState, calculateInitialFit } from "../lib/image-crop-utils";

export interface ImageCropperProps {
  imageSrc: string;
  cropState: CropState;
  onCropStateChange: (updater: (prev: CropState) => CropState) => void;
  aspectRatio?: number;
  cropShape?: "rect" | "round";
  onDimensionsReady?: (dims: CropDimensions) => void;
  className?: string;
}

export function ImageCropper({
  imageSrc,
  cropState,
  onCropStateChange,
  aspectRatio = 1,
  cropShape = "rect",
  onDimensionsReady,
  className,
}: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // Compute crop box dimensions based on aspect ratio
  const baseBoxSize = 260;
  const cropWidth = aspectRatio >= 1 ? baseBoxSize : Math.round(baseBoxSize * aspectRatio);
  const cropHeight = aspectRatio >= 1 ? Math.round(baseBoxSize / aspectRatio) : baseBoxSize;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    if (onDimensionsReady) {
      onDimensionsReady({
        cropWidth,
        cropHeight,
        imageNaturalWidth: naturalWidth,
        imageNaturalHeight: naturalHeight,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    setIsInteracting(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: cropState.pan.x,
      panY: cropState.pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    onCropStateChange((prev) => ({
      ...prev,
      pan: {
        x: dragStart.current.panX + deltaX,
        y: dragStart.current.panY + deltaY,
      },
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    isDragging.current = false;
    setIsInteracting(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    onCropStateChange((prev) => ({
      ...prev,
      zoom: Math.min(3, Math.max(1, Number((prev.zoom + delta).toFixed(2)))),
    }));
  };

  const handleDoubleClick = () => {
    onCropStateChange((prev) => ({
      ...prev,
      zoom: prev.zoom > 1.2 ? 1 : 2,
      pan: { x: 0, y: 0 },
    }));
  };

  const fitSize = calculateInitialFit(naturalSize.width, naturalSize.height, cropWidth, cropHeight);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      className={cn(
        "relative flex h-72 w-full touch-none select-none items-center justify-center overflow-hidden rounded-xl bg-black/95 sm:h-80",
        isInteracting ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      role="region"
      aria-label="Image crop preview workspace. Drag to reposition, wheel to zoom."
    >
      {/* Centered Image with transform */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt="Crop target preview"
        onLoad={handleImageLoad}
        draggable={false}
        style={{
          width: fitSize.width ? `${fitSize.width}px` : "auto",
          height: fitSize.height ? `${fitSize.height}px` : "auto",
          transform: `translate(${cropState.pan.x}px, ${cropState.pan.y}px) scale(${cropState.zoom}) rotate(${cropState.rotation}deg) scaleX(${cropState.flipH ? -1 : 1})`,
          transformOrigin: "center center",
        }}
        className="pointer-events-none absolute max-w-none transition-transform duration-75 ease-out select-none"
      />

      {/* Vignette mask & crop window */}
      <div
        style={{
          width: `${cropWidth}px`,
          height: `${cropHeight}px`,
        }}
        className={cn(
          "pointer-events-none relative z-10 border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.65)]",
          cropShape === "round" ? "rounded-full" : "rounded-lg",
        )}
      >
        {/* Rule of thirds grid lines */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-200",
            isInteracting ? "opacity-60" : "opacity-25",
          )}
        >
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-r border-b border-white/50" />
          <div className="border-b border-white/50" />
          <div className="border-r border-white/50" />
          <div className="border-r border-white/50" />
          <div />
        </div>
      </div>

      {/* Helpful overlay hint */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-2.5 z-20 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-xs"
      >
        Drag to reposition · Scroll or slider to zoom
      </div>
    </div>
  );
}
