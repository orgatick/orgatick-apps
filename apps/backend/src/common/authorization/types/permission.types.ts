import type { IPermissionDefinition } from "../interface/permission.interface";

export type PermissionScope = "organization" | "event" | "platform";

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
  | "newsletter"
  | "payment";

export type PermissionDefinition = IPermissionDefinition;
