import type { PermissionDefinition } from "../types/permission.types";

export const CHECKIN_PERMISSIONS = {
  VIEW: "event:checkin:view",
  SCAN: "event:checkin:scan",
  MANUAL: "event:checkin:manual",
  OVERRIDE: "event:checkin:override",
  EXPORT: "event:checkin:export",
} as const;

export type CheckinPermission = (typeof CHECKIN_PERMISSIONS)[keyof typeof CHECKIN_PERMISSIONS];

export const CHECKIN_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: CHECKIN_PERMISSIONS.VIEW,
    name: "View Check-in",
    description: "Allows viewing live check-in rosters, attendance counts, and entry logs",
    resource: "checkin",
    action: "view",
    scope: "event",
    category: "checkin",
  },
  {
    key: CHECKIN_PERMISSIONS.SCAN,
    name: "Scan Check-in",
    description: "Allows scanning QR codes and badges to check in attendees at venue access points",
    resource: "checkin",
    action: "scan",
    scope: "event",
    category: "checkin",
  },
  {
    key: CHECKIN_PERMISSIONS.MANUAL,
    name: "Manual Check-in",
    description: "Allows manually marking attendees as checked-in or checked-out",
    resource: "checkin",
    action: "manual",
    scope: "event",
    category: "checkin",
  },
  {
    key: CHECKIN_PERMISSIONS.OVERRIDE,
    name: "Override Check-in",
    description: "Allows overriding check-in errors, invalid timestamps, or duplicate entry warnings",
    resource: "checkin",
    action: "override",
    scope: "event",
    category: "checkin",
  },
  {
    key: CHECKIN_PERMISSIONS.EXPORT,
    name: "Export Check-in Data",
    description: "Allows exporting check-in logs and real-time attendance rosters",
    resource: "checkin",
    action: "export",
    scope: "event",
    category: "checkin",
  },
] as const;
