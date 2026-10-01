import type { PermissionDefinition } from "../types/permission.types";

export const COUPON_PERMISSIONS = {
  CREATE: "event:coupon:create",
  VIEW: "event:coupon:view",
  UPDATE: "event:coupon:update",
  DELETE: "event:coupon:delete",
} as const;

export type CouponPermission = (typeof COUPON_PERMISSIONS)[keyof typeof COUPON_PERMISSIONS];

export const COUPON_PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  {
    key: COUPON_PERMISSIONS.CREATE,
    name: "Create Coupon",
    description: "Allows creating discount codes, promotions, and voucher campaigns",
    resource: "coupon",
    action: "create",
    scope: "event",
    category: "coupon",
  },
  {
    key: COUPON_PERMISSIONS.VIEW,
    name: "View Coupons",
    description: "Allows viewing discount codes, redemption stats, and active coupons",
    resource: "coupon",
    action: "view",
    scope: "event",
    category: "coupon",
  },
  {
    key: COUPON_PERMISSIONS.UPDATE,
    name: "Update Coupon",
    description: "Allows modifying coupon rules, discount percentages, dates, and limits",
    resource: "coupon",
    action: "update",
    scope: "event",
    category: "coupon",
  },
  {
    key: COUPON_PERMISSIONS.DELETE,
    name: "Delete Coupon",
    description: "Allows deleting or deactivating discount coupons",
    resource: "coupon",
    action: "delete",
    scope: "event",
    category: "coupon",
  },
] as const;
