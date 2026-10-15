import type { TicketCanvasConfig } from "./editor-types";

export const CANVAS_PRESETS: Record<string, TicketCanvasConfig> = {
  HORIZONTAL_STANDARD: {
    width: 1200,
    height: 600,
    backgroundColor: "#0f172a",
    presetName: "Horizontal Pass (1200 × 600)",
  },
  VERTICAL_BADGE: {
    width: 600,
    height: 900,
    backgroundColor: "#0f172a",
    presetName: "Event Badge (600 × 900)",
  },
  COMPACT_WRISTBAND: {
    width: 1200,
    height: 320,
    backgroundColor: "#0f172a",
    presetName: "Wristband / Slip (1200 × 320)",
  },
};

export const DEFAULT_CANVAS_CONFIG: TicketCanvasConfig = CANVAS_PRESETS.HORIZONTAL_STANDARD;
