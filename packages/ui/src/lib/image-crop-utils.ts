export interface CropState {
  zoom: number;
  rotation: number;
  flipH: boolean;
  pan: { x: number; y: number };
}

export interface CropDimensions {
  cropWidth: number;
  cropHeight: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
}

export const DEFAULT_CROP_STATE: CropState = {
  zoom: 1,
  rotation: 0,
  flipH: false,
  pan: { x: 0, y: 0 },
};

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function calculateInitialFit(
  naturalWidth: number,
  naturalHeight: number,
  cropWidth: number,
  cropHeight: number,
): { width: number; height: number } {
  if (naturalWidth === 0 || naturalHeight === 0) {
    return { width: cropWidth, height: cropHeight };
  }
  const scale = Math.max(cropWidth / naturalWidth, cropHeight / naturalHeight);
  return {
    width: naturalWidth * scale,
    height: naturalHeight * scale,
  };
}

export async function createCroppedImageFile({
  imageSrc,
  cropState,
  cropDimensions,
  fileName = "cropped-image.webp",
  mimeType = "image/webp",
  quality = 0.92,
  targetOutputSize = 800,
}: {
  imageSrc: string;
  cropState: CropState;
  cropDimensions: CropDimensions;
  fileName?: string;
  mimeType?: string;
  quality?: number;
  targetOutputSize?: number;
}): Promise<{ file: File; dataUrl: string; blob: Blob }> {
  const img = await loadImageElement(imageSrc);

  const aspect = cropDimensions.cropWidth / (cropDimensions.cropHeight || 1);
  const outputWidth = targetOutputSize;
  const outputHeight = Math.round(targetOutputSize / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas context");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scaleRatio = outputWidth / cropDimensions.cropWidth;
  const { width: fitW, height: fitH } = calculateInitialFit(
    img.naturalWidth,
    img.naturalHeight,
    cropDimensions.cropWidth,
    cropDimensions.cropHeight,
  );

  ctx.translate(outputWidth / 2 + cropState.pan.x * scaleRatio, outputHeight / 2 + cropState.pan.y * scaleRatio);
  ctx.scale(cropState.zoom, cropState.zoom);
  ctx.rotate((cropState.rotation * Math.PI) / 180);
  ctx.scale(cropState.flipH ? -1 : 1, 1);

  const drawW = fitW * scaleRatio;
  const drawH = fitH * scaleRatio;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to generate cropped image blob"));
      },
      mimeType,
      quality,
    );
  });

  const file = new File([blob], fileName, { type: mimeType, lastModified: Date.now() });
  const dataUrl = canvas.toDataURL(mimeType, quality);

  return { file, dataUrl, blob };
}
