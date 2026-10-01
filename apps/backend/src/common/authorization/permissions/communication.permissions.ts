import type { PermissionDefinition } from "../types/permission.types";

export const COMMUNICATION_PERMISSIONS = {
  ORGANIZATION_TEMPLATE_MANAGE: "organization:communication:template_manage",
  EVENT_VIEW: "event:communication:view",
  EVENT_SEND: "event:communication:send",
  EVENT_SCHEDULE: "event:communication:schedule",
} as const;

export type CommunicationPermission = (typeof COMMUNICATION_PERMISSIONS)[keyof typeof COMMUNICATION_PERMISSIONS];

export const COMMUNICATION_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: COMMUNICATION_PERMISSIONS.ORGANIZATION_TEMPLATE_MANAGE,
    name: "Manage Communication Templates",
    description: "Allows creating and editing organization-level email/SMS notification templates",
    resource: "communication",
    action: "template_manage",
    scope: "organization",
    category: "communication",
  },
  {
    key: COMMUNICATION_PERMISSIONS.EVENT_VIEW,
    name: "View Event Communications",
    description: "Allows viewing message dispatch history and communication delivery logs",
    resource: "communication",
    action: "view",
    scope: "event",
    category: "communication",
  },
  {
    key: COMMUNICATION_PERMISSIONS.EVENT_SEND,
    name: "Send Event Announcements",
    description: "Allows sending broadcast emails, SMS updates, and alerts to attendees",
    resource: "communication",
    action: "send",
    scope: "event",
    category: "communication",
  },
  {
    key: COMMUNICATION_PERMISSIONS.EVENT_SCHEDULE,
    name: "Schedule Event Communications",
    description: "Allows scheduling automated reminders and announcements before/after events",
    resource: "communication",
    action: "schedule",
    scope: "event",
    category: "communication",
  },
] as const;
