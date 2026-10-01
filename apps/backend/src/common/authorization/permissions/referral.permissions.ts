import type { PermissionDefinition } from "../types/permission.types";

export const REFERRAL_PERMISSIONS = {
  CREATE: "event:referral:create",
  VIEW: "event:referral:view",
  UPDATE: "event:referral:update",
  DELETE: "event:referral:delete",
  PAYOUT: "event:referral:payout",
} as const;

export type ReferralPermission = (typeof REFERRAL_PERMISSIONS)[keyof typeof REFERRAL_PERMISSIONS];

export const REFERRAL_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: REFERRAL_PERMISSIONS.CREATE,
    name: "Create Referral Campaign",
    description: "Allows setting up affiliate/referral programs and reward structures",
    resource: "referral",
    action: "create",
    scope: "event",
    category: "referral",
  },
  {
    key: REFERRAL_PERMISSIONS.VIEW,
    name: "View Referrals",
    description: "Allows viewing affiliate performance, conversion tracking, and commission logs",
    resource: "referral",
    action: "view",
    scope: "event",
    category: "referral",
  },
  {
    key: REFERRAL_PERMISSIONS.UPDATE,
    name: "Update Referral Campaign",
    description: "Allows editing referral commission rates, rules, and tracking links",
    resource: "referral",
    action: "update",
    scope: "event",
    category: "referral",
  },
  {
    key: REFERRAL_PERMISSIONS.DELETE,
    name: "Delete Referral Campaign",
    description: "Allows deactivating or deleting referral programs",
    resource: "referral",
    action: "delete",
    scope: "event",
    category: "referral",
  },
  {
    key: REFERRAL_PERMISSIONS.PAYOUT,
    name: "Process Referral Payout",
    description: "Allows approving and issuing payouts/rewards to affiliates and referrers",
    resource: "referral",
    action: "payout",
    scope: "event",
    category: "referral",
  },
] as const;
