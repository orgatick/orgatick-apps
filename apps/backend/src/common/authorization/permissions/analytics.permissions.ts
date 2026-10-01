import type { PermissionDefinition } from "../types/permission.types";

export const ANALYTICS_PERMISSIONS = {
  ORGANIZATION_VIEW: "organization:analytics:view",
  ORGANIZATION_EXPORT: "organization:analytics:export",
  EVENT_VIEW: "event:analytics:view",
  EVENT_EXPORT: "event:analytics:export",
} as const;

export type AnalyticsPermission = (typeof ANALYTICS_PERMISSIONS)[keyof typeof ANALYTICS_PERMISSIONS];

export const ANALYTICS_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: ANALYTICS_PERMISSIONS.ORGANIZATION_VIEW,
    name: "View Organization Analytics",
    description: "Allows viewing aggregated revenue, event metrics, and organizer analytics",
    resource: "analytics",
    action: "view",
    scope: "organization",
    category: "analytics",
  },
  {
    key: ANALYTICS_PERMISSIONS.ORGANIZATION_EXPORT,
    name: "Export Organization Analytics",
    description: "Allows exporting organization-level financial summaries and reports",
    resource: "analytics",
    action: "export",
    scope: "organization",
    category: "analytics",
  },
  {
    key: ANALYTICS_PERMISSIONS.EVENT_VIEW,
    name: "View Event Analytics",
    description: "Allows viewing event-specific sales graphs, conversion funnels, and attendance metrics",
    resource: "analytics",
    action: "view",
    scope: "event",
    category: "analytics",
  },
  {
    key: ANALYTICS_PERMISSIONS.EVENT_EXPORT,
    name: "Export Event Analytics",
    description: "Allows exporting event performance analytics and demographic reports",
    resource: "analytics",
    action: "export",
    scope: "event",
    category: "analytics",
  },
] as const;
