import type { PermissionDefinition } from "../types/permission.types";

export const REGISTRATION_PERMISSIONS = {
  VIEW: "event:registration:view",
  CREATE: "event:registration:create",
  UPDATE: "event:registration:update",
  CANCEL: "event:registration:cancel",
  REFUND: "event:registration:refund",
  TRANSFER: "event:registration:transfer",
  EXPORT: "event:registration:export",
  RESEND_CONFIRMATION: "event:registration:resend_confirmation",
} as const;

export type RegistrationPermission = (typeof REGISTRATION_PERMISSIONS)[keyof typeof REGISTRATION_PERMISSIONS];

export const REGISTRATION_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: REGISTRATION_PERMISSIONS.VIEW,
    name: "View Registrations",
    description: "Allows viewing attendee registration records, details, and order info",
    resource: "registration",
    action: "view",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.CREATE,
    name: "Create Registration",
    description: "Allows manually registering attendees or creating offline/comp registrations",
    resource: "registration",
    action: "create",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.UPDATE,
    name: "Update Registration",
    description: "Allows modifying attendee information and custom registration form responses",
    resource: "registration",
    action: "update",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.CANCEL,
    name: "Cancel Registration",
    description: "Allows cancelling attendee registrations and voiding issued tickets",
    resource: "registration",
    action: "cancel",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.REFUND,
    name: "Refund Registration",
    description: "Allows initiating and processing ticket refunds for registrations",
    resource: "registration",
    action: "refund",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.TRANSFER,
    name: "Transfer Registration",
    description: "Allows reassigning or transferring a ticket to another person",
    resource: "registration",
    action: "transfer",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.EXPORT,
    name: "Export Registrations",
    description: "Allows downloading CSV/Excel exports of attendee registrations",
    resource: "registration",
    action: "export",
    scope: "event",
    category: "registration",
  },
  {
    key: REGISTRATION_PERMISSIONS.RESEND_CONFIRMATION,
    name: "Resend Confirmation",
    description: "Allows re-sending registration confirmations, receipts, and e-tickets to attendees",
    resource: "registration",
    action: "resend_confirmation",
    scope: "event",
    category: "registration",
  },
] as const;
