import type { PermissionDefinition } from "../types/permission.types";

export const CERTIFICATE_PERMISSIONS = {
  CREATE: "event:certificate:create",
  VIEW: "event:certificate:view",
  UPDATE: "event:certificate:update",
  DELETE: "event:certificate:delete",
  GENERATE: "event:certificate:generate",
  REVOKE: "event:certificate:revoke",
  EXPORT: "event:certificate:export",
} as const;

export type CertificatePermission = (typeof CERTIFICATE_PERMISSIONS)[keyof typeof CERTIFICATE_PERMISSIONS];

export const CERTIFICATE_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: CERTIFICATE_PERMISSIONS.CREATE,
    name: "Create Certificate Template",
    description: "Allows designing and creating certificate templates and issuance rules",
    resource: "certificate",
    action: "create",
    scope: "event",
    category: "certificate",
  },
  {
    key: CERTIFICATE_PERMISSIONS.VIEW,
    name: "View Certificates",
    description: "Allows viewing certificate templates, issuance history, and recipient lists",
    resource: "certificate",
    action: "view",
    scope: "event",
    category: "certificate",
  },
  {
    key: CERTIFICATE_PERMISSIONS.UPDATE,
    name: "Update Certificate Template",
    description: "Allows updating certificate layout, placeholders, and criteria",
    resource: "certificate",
    action: "update",
    scope: "event",
    category: "certificate",
  },
  {
    key: CERTIFICATE_PERMISSIONS.DELETE,
    name: "Delete Certificate Template",
    description: "Allows deleting certificate templates",
    resource: "certificate",
    action: "delete",
    scope: "event",
    category: "certificate",
  },
  {
    key: CERTIFICATE_PERMISSIONS.GENERATE,
    name: "Generate Certificates",
    description: "Allows generating and issuing certificates to eligible attendees",
    resource: "certificate",
    action: "generate",
    scope: "event",
    category: "certificate",
  },
  {
    key: CERTIFICATE_PERMISSIONS.REVOKE,
    name: "Revoke Certificate",
    description: "Allows revoking previously issued certificates",
    resource: "certificate",
    action: "revoke",
    scope: "event",
    category: "certificate",
  },
  {
    key: CERTIFICATE_PERMISSIONS.EXPORT,
    name: "Export Certificates",
    description: "Allows exporting generated certificates and issuance logs",
    resource: "certificate",
    action: "export",
    scope: "event",
    category: "certificate",
  },
] as const;
