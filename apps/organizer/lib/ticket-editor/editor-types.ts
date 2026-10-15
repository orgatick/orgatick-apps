export type TicketElementType = "text" | "qr" | "image";

export type DynamicFieldCategory = "attendee" | "event" | "ticket" | "seating" | "static" | "qr";

export interface TicketElementStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: number;
  lineHeight?: number;
  opacity?: number;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
}

export interface TicketQrConfig {
  colorDark: string;
  colorLight: string;
  includeMargin: boolean;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
}

export interface TicketElement {
  id: string;
  type: TicketElementType;
  field?: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  style: TicketElementStyle;
  staticContent?: string;
  qrConfig?: TicketQrConfig;
  locked?: boolean;
  hidden?: boolean;
}

export interface TicketCanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  presetName: string;
}

export interface TicketBackground {
  url?: string;
  assetKey?: string;
  fit: "cover" | "contain" | "stretch";
  opacity: number;
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface DynamicFieldDefinition {
  fieldKey: string;
  category: DynamicFieldCategory;
  label: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultStyle: TicketElementStyle;
  sampleValue: string;
}

export interface SampleAttendeeProfile {
  id: string;
  name: string;
  description: string;
  badge: string;
  data: Record<string, string>;
}
