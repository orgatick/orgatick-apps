import type { PermissionDefinition } from "../types/permission.types";

export const EVENT_PERMISSIONS = {
  CREATE: "event:create",
  VIEW: "event:view",
  UPDATE: "event:update",
  DELETE: "event:delete",
  PUBLISH: "event:publish",
  UNPUBLISH: "event:unpublish",
  CANCEL: "event:cancel",
  ARCHIVE: "event:archive",
} as const;

export type EventPermission = (typeof EVENT_PERMISSIONS)[keyof typeof EVENT_PERMISSIONS];

export const EVENT_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: EVENT_PERMISSIONS.CREATE,
    name: "Create Event",
    description: "Allows creating new events under the organization",
    resource: "event",
    action: "create",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.VIEW,
    name: "View Event",
    description: "Allows viewing event details, settings, and management dashboard",
    resource: "event",
    action: "view",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.UPDATE,
    name: "Update Event",
    description: "Allows modifying event information, schedule, venue, and settings",
    resource: "event",
    action: "update",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.DELETE,
    name: "Delete Event",
    description: "Allows permanently deleting draft or cancelled events",
    resource: "event",
    action: "delete",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.PUBLISH,
    name: "Publish Event",
    description: "Allows publishing an event to make it live and discoverable",
    resource: "event",
    action: "publish",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.UNPUBLISH,
    name: "Unpublish Event",
    description: "Allows unpublishing a live event to take it offline",
    resource: "event",
    action: "unpublish",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.CANCEL,
    name: "Cancel Event",
    description: "Allows cancelling an active event and triggering cancellation workflows",
    resource: "event",
    action: "cancel",
    scope: "event",
    category: "event",
  },
  {
    key: EVENT_PERMISSIONS.ARCHIVE,
    name: "Archive Event",
    description: "Allows archiving past completed events",
    resource: "event",
    action: "archive",
    scope: "event",
    category: "event",
  },
] as const;
