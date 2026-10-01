import type { IPermissionDefinition } from "../interface/permission.interface";

export type PermissionScope = "organization" | "event";

export type PermissionCategory =
  | "organization"
  | "organization_member"
  | "organization_document"
  | "organization_setting"
  | "event"
  | "ticket"
  | "registration"
  | "session"
  | "checkin"
  | "certificate"
  | "coupon"
  | "referral"
  | "analytics"
  | "communication"
  | "payment";

export type PermissionDefinition = IPermissionDefinition;
