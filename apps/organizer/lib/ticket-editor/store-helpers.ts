import type { TicketCanvasConfig, TicketElement } from "./editor-types";

export function duplicateElementHelper(
  target: TicketElement,
  elements: TicketElement[],
  canvas: TicketCanvasConfig,
): TicketElement {
  const newId = `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const maxZ = elements.reduce((max, item) => Math.max(max, item.zIndex), 0);

  return {
    ...JSON.parse(JSON.stringify(target)),
    id: newId,
    label: `${target.label} (Copy)`,
    x: Math.min(target.x + 24, Math.max(0, canvas.width - target.width)),
    y: Math.min(target.y + 24, Math.max(0, canvas.height - target.height)),
    zIndex: maxZ + 1,
  };
}

export function reorderElementHelper(
  id: string,
  direction: "up" | "down" | "top" | "bottom",
  elements: TicketElement[],
): TicketElement[] {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const index = sorted.findIndex((el) => el.id === id);
  if (index === -1) return elements;

  const [item] = sorted.splice(index, 1);
  if (direction === "up") {
    sorted.splice(Math.min(sorted.length, index + 1), 0, item);
  } else if (direction === "down") {
    sorted.splice(Math.max(0, index - 1), 0, item);
  } else if (direction === "top") {
    sorted.push(item);
  } else if (direction === "bottom") {
    sorted.unshift(item);
  }

  return sorted.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
}

export function moveElementLayerHelper(
  sourceId: string,
  targetId: string,
  position: "above" | "below",
  elements: TicketElement[],
): TicketElement[] {
  if (sourceId === targetId) return elements;
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  const sourceIndex = sorted.findIndex((el) => el.id === sourceId);
  if (sourceIndex === -1) return elements;

  const [sourceElement] = sorted.splice(sourceIndex, 1);
  const targetIndex = sorted.findIndex((el) => el.id === targetId);
  if (targetIndex === -1) return elements;

  const insertIndex = position === "above" ? targetIndex + 1 : targetIndex;
  sorted.splice(insertIndex, 0, sourceElement);

  return sorted.map((el, idx) => ({
    ...el,
    zIndex: idx + 1,
  }));
}
