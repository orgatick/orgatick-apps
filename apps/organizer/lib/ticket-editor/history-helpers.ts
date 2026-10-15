import type { TicketBackground, TicketCanvasConfig, TicketElement } from "./editor-types";

export interface HistorySnapshot {
  elements: TicketElement[];
  canvas: TicketCanvasConfig;
  background: TicketBackground | null;
}

export function createSnapshot(
  elements: TicketElement[],
  canvas: TicketCanvasConfig,
  background: TicketBackground | null,
): HistorySnapshot {
  return {
    elements: JSON.parse(JSON.stringify(elements)),
    canvas: { ...canvas },
    background: background ? { ...background } : null,
  };
}
