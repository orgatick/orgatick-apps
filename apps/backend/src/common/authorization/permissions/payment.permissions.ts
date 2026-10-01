import type { PermissionDefinition } from "../types/permission.types";

export const PAYMENT_PERMISSIONS = {
  ORGANIZATION_VIEW: "organization:payment:view",
  EVENT_VIEW: "event:payment:view",
  EVENT_REFUND_APPROVE: "event:payment:refund_approve",
} as const;

export type PaymentPermission = (typeof PAYMENT_PERMISSIONS)[keyof typeof PAYMENT_PERMISSIONS];

export const PAYMENT_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: PAYMENT_PERMISSIONS.ORGANIZATION_VIEW,
    name: "View Organization Payments",
    description: "Allows viewing organization balance, billing history, and fee statements",
    resource: "payment",
    action: "view",
    scope: "organization",
    category: "payment",
  },
  {
    key: PAYMENT_PERMISSIONS.EVENT_VIEW,
    name: "View Event Payments",
    description: "Allows viewing payment gateway transactions, platform fees, and order payments",
    resource: "payment",
    action: "view",
    scope: "event",
    category: "payment",
  },
  {
    key: PAYMENT_PERMISSIONS.EVENT_REFUND_APPROVE,
    name: "Approve Refund Requests",
    description: "Allows approving or authorizing high-value refunds and payment dispute resolutions",
    resource: "payment",
    action: "refund_approve",
    scope: "event",
    category: "payment",
  },
] as const;
