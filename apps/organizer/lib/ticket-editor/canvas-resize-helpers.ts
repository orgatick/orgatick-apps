import type { TicketElement } from "./editor-types";

/** Calculates comfortable zoom factor so the ticket canvas fits nicely in editor view */
export function calculateFitZoom(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0.85;
  const targetW = 900;
  const targetH = 500;
  const fit = Math.min(targetW / width, targetH / height, 1.0);
  return Math.min(1.5, Math.max(0.35, Number(fit.toFixed(2))));
}

/** Scales all ticket elements proportionally when canvas dimensions change to match a base image */
export function scaleElementsToCanvas(
  elements: TicketElement[],
  oldCanvas: { width: number; height: number },
  newCanvas: { width: number; height: number },
): TicketElement[] {
  if (!oldCanvas.width || !oldCanvas.height) return elements;
  if (oldCanvas.width === newCanvas.width && oldCanvas.height === newCanvas.height) {
    return elements;
  }

  const scaleX = newCanvas.width / oldCanvas.width;
  const scaleY = newCanvas.height / oldCanvas.height;
  const fontScale = (scaleX + scaleY) / 2;

  return elements.map((el) => {
    const newW = Math.max(24, Math.min(newCanvas.width, Math.round(el.width * scaleX)));
    const newH = Math.max(16, Math.min(newCanvas.height, Math.round(el.height * scaleY)));
    const newX = Math.max(0, Math.min(newCanvas.width - newW, Math.round(el.x * scaleX)));
    const newY = Math.max(0, Math.min(newCanvas.height - newH, Math.round(el.y * scaleY)));
    const newFontSize = Math.max(8, Math.min(120, Math.round(el.style.fontSize * fontScale)));

    return {
      ...el,
      x: newX,
      y: newY,
      width: newW,
      height: newH,
      style: {
        ...el.style,
        fontSize: newFontSize,
      },
    };
  });
}

/** Asynchronously inspects image natural dimensions in browser */
export function loadAndInspectImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 1200,
        height: img.naturalHeight || 600,
      });
    };
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}
