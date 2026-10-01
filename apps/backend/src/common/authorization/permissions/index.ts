import type { PermissionDefinition } from "../types/permission.types";
import {
  ORGANIZATION_PERMISSIONS,
  ORGANIZATION_PERMISSION_DEFINITIONS,
  type OrganizationPermission,
} from "./organization.permissions";
import { EVENT_PERMISSIONS, EVENT_PERMISSION_DEFINITIONS, type EventPermission } from "./event.permissions";
import { TICKET_PERMISSIONS, TICKET_PERMISSION_DEFINITIONS, type TicketPermission } from "./ticket.permissions";
import {
  REGISTRATION_PERMISSIONS,
  REGISTRATION_PERMISSION_DEFINITIONS,
  type RegistrationPermission,
} from "./registration.permissions";
import { SESSION_PERMISSIONS, SESSION_PERMISSION_DEFINITIONS, type SessionPermission } from "./session.permissions";
import { CHECKIN_PERMISSIONS, CHECKIN_PERMISSION_DEFINITIONS, type CheckinPermission } from "./checkin.permissions";
import {
  CERTIFICATE_PERMISSIONS,
  CERTIFICATE_PERMISSION_DEFINITIONS,
  type CertificatePermission,
} from "./certificate.permissions";
import { COUPON_PERMISSIONS, COUPON_PERMISSION_DEFINITIONS, type CouponPermission } from "./coupon.permissions";
import { REFERRAL_PERMISSIONS, REFERRAL_PERMISSION_DEFINITIONS, type ReferralPermission } from "./referral.permissions";
import {
  ANALYTICS_PERMISSIONS,
  ANALYTICS_PERMISSION_DEFINITIONS,
  type AnalyticsPermission,
} from "./analytics.permissions";
import {
  COMMUNICATION_PERMISSIONS,
  COMMUNICATION_PERMISSION_DEFINITIONS,
  type CommunicationPermission,
} from "./communication.permissions";
import {
  NEWSLETTER_PERMISSIONS,
  NEWSLETTER_PERMISSION_DEFINITIONS,
  type NewsletterPermission,
} from "./newsletter.permissions";
import { PAYMENT_PERMISSIONS, PAYMENT_PERMISSION_DEFINITIONS, type PaymentPermission } from "./payment.permissions";

export * from "./organization.permissions";
export * from "./event.permissions";
export * from "./ticket.permissions";
export * from "./registration.permissions";
export * from "./session.permissions";
export * from "./checkin.permissions";
export * from "./certificate.permissions";
export * from "./coupon.permissions";
export * from "./referral.permissions";
export * from "./analytics.permissions";
export * from "./communication.permissions";
export * from "./newsletter.permissions";
export * from "./payment.permissions";

export const PERMISSIONS = {
  ORGANIZATION: ORGANIZATION_PERMISSIONS,
  EVENT: EVENT_PERMISSIONS,
  TICKET: TICKET_PERMISSIONS,
  REGISTRATION: REGISTRATION_PERMISSIONS,
  SESSION: SESSION_PERMISSIONS,
  CHECKIN: CHECKIN_PERMISSIONS,
  CERTIFICATE: CERTIFICATE_PERMISSIONS,
  COUPON: COUPON_PERMISSIONS,
  REFERRAL: REFERRAL_PERMISSIONS,
  ANALYTICS: ANALYTICS_PERMISSIONS,
  COMMUNICATION: COMMUNICATION_PERMISSIONS,
  NEWSLETTER: NEWSLETTER_PERMISSIONS,
  PAYMENT: PAYMENT_PERMISSIONS,
} as const;

export const PERMISSION_DEFINITIONS: readonly PermissionDefinition[] = [
  ...ORGANIZATION_PERMISSION_DEFINITIONS,
  ...EVENT_PERMISSION_DEFINITIONS,
  ...TICKET_PERMISSION_DEFINITIONS,
  ...REGISTRATION_PERMISSION_DEFINITIONS,
  ...SESSION_PERMISSION_DEFINITIONS,
  ...CHECKIN_PERMISSION_DEFINITIONS,
  ...CERTIFICATE_PERMISSION_DEFINITIONS,
  ...COUPON_PERMISSION_DEFINITIONS,
  ...REFERRAL_PERMISSION_DEFINITIONS,
  ...ANALYTICS_PERMISSION_DEFINITIONS,
  ...COMMUNICATION_PERMISSION_DEFINITIONS,
  ...NEWSLETTER_PERMISSION_DEFINITIONS,
  ...PAYMENT_PERMISSION_DEFINITIONS,
] as const;

export type PermissionKey =
  | OrganizationPermission
  | EventPermission
  | TicketPermission
  | RegistrationPermission
  | SessionPermission
  | CheckinPermission
  | CertificatePermission
  | CouponPermission
  | ReferralPermission
  | AnalyticsPermission
  | CommunicationPermission
  | NewsletterPermission
  | PaymentPermission;
