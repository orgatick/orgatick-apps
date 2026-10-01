import type { PermissionDefinition } from "../types/permission.types";

export const SESSION_PERMISSIONS = {
  CREATE: "event:session:create",
  VIEW: "event:session:view",
  UPDATE: "event:session:update",
  DELETE: "event:session:delete",
  SPEAKER_MANAGE: "event:session:speaker_manage",
} as const;

export type SessionPermission = (typeof SESSION_PERMISSIONS)[keyof typeof SESSION_PERMISSIONS];

export const SESSION_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: SESSION_PERMISSIONS.CREATE,
    name: "Create Session",
    description: "Allows adding agenda sessions, workshops, keynotes, and track schedules",
    resource: "session",
    action: "create",
    scope: "event",
    category: "session",
  },
  {
    key: SESSION_PERMISSIONS.VIEW,
    name: "View Sessions",
    description: "Allows viewing event sessions, tracks, speaker schedules, and room allocations",
    resource: "session",
    action: "view",
    scope: "event",
    category: "session",
  },
  {
    key: SESSION_PERMISSIONS.UPDATE,
    name: "Update Session",
    description: "Allows editing session times, descriptions, rooms, and assigned speakers",
    resource: "session",
    action: "update",
    scope: "event",
    category: "session",
  },
  {
    key: SESSION_PERMISSIONS.DELETE,
    name: "Delete Session",
    description: "Allows removing sessions and track schedules from the event agenda",
    resource: "session",
    action: "delete",
    scope: "event",
    category: "session",
  },
  {
    key: SESSION_PERMISSIONS.SPEAKER_MANAGE,
    name: "Manage Session Speakers",
    description: "Allows inviting, assigning, and managing speakers and moderators for sessions",
    resource: "session",
    action: "speaker_manage",
    scope: "event",
    category: "session",
  },
] as const;
