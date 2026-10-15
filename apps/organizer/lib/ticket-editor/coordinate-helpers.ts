import type { TicketElement } from "./editor-types";

export interface CanvasPoint {
  x: number;
  y: number;
}

/** Converts viewport pointer coordinates into logical canvas coordinate space */
export function screenToCanvasCoordinates(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  zoomFactor: number,
): CanvasPoint {
  const rawX = (clientX - canvasRect.left) / zoomFactor;
  const rawY = (clientY - canvasRect.top) / zoomFactor;
  return {
    x: Math.round(rawX),
    y: Math.round(rawY),
  };
}

/** Snaps a coordinate value to nearest grid pitch if snapping is enabled */
export function snapCoordinate(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) return Math.round(value);
  return Math.round(value / gridSize) * gridSize;
}

/** Clamps an element completely inside canvas boundaries */
export function clampToCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number; width: number; height: number } {
  const minW = 20;
  const minH = 20;
  const clampedWidth = Math.max(minW, Math.min(width, canvasWidth));
  const clampedHeight = Math.max(minH, Math.min(height, canvasHeight));
  const clampedX = Math.max(0, Math.min(x, canvasWidth - clampedWidth));
  const clampedY = Math.max(0, Math.min(y, canvasHeight - clampedHeight));

  return {
    x: clampedX,
    y: clampedY,
    width: clampedWidth,
    height: clampedHeight,
  };
}

/** Alignment guidelines for snap-to-center and sibling alignment */
export interface AlignmentGuide {
  type: "vertical" | "horizontal";
  position: number;
}

export function detectAlignmentGuides(
  target: { x: number; y: number; width: number; height: number },
  _elements: TicketElement[],
  canvasWidth: number,
  canvasHeight: number,
  threshold = 6,
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = [];
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;

  // Snap to Canvas Center
  if (Math.abs(targetCenterX - canvasWidth / 2) < threshold) {
    guides.push({ type: "vertical", position: canvasWidth / 2 });
  }
  if (Math.abs(targetCenterY - canvasHeight / 2) < threshold) {
    guides.push({ type: "horizontal", position: canvasHeight / 2 });
  }

  return guides;
}
