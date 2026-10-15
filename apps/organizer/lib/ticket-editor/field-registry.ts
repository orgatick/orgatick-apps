import type { DynamicFieldDefinition } from "./editor-types";
import { ATTENDEE_AND_EVENT_FIELDS } from "./fields-attendee-event";
import { TICKET_AND_SEATING_FIELDS } from "./fields-ticket-seating";

export const DYNAMIC_FIELD_REGISTRY: DynamicFieldDefinition[] = [
  ...ATTENDEE_AND_EVENT_FIELDS,
  ...TICKET_AND_SEATING_FIELDS,
];

export function getFieldDefinition(fieldKey: string): DynamicFieldDefinition | undefined {
  return DYNAMIC_FIELD_REGISTRY.find((f) => f.fieldKey === fieldKey);
}
