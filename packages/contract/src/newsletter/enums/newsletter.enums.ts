/**
 * Newsletter domain enums.
 *
 * These string values are persisted as `varchar` columns, so they are the single
 * source of truth shared by the backend entities, the Zod contracts and the apps.
 */

/** Lifecycle of a newsletter campaign. */
export enum NewsletterStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  SENDING = "sending",
  PAUSED = "paused",
  SENT = "sent",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

/** Subscription state of a single subscriber on a list. */
export enum NewsletterSubscriberStatus {
  PENDING = "pending",
  SUBSCRIBED = "subscribed",
  UNSUBSCRIBED = "unsubscribed",
  BOUNCED = "bounced",
  COMPLAINED = "complained",
}

/** Per-recipient delivery state of a campaign send. */
export enum NewsletterRecipientStatus {
  QUEUED = "queued",
  /** Claimed by a worker and being sent right now. Never terminal. */
  PROCESSING = "processing",
  SENT = "sent",
  DELIVERED = "delivered",
  OPENED = "opened",
  CLICKED = "clicked",
  UNSUBSCRIBED = "unsubscribed",
  BOUNCED = "bounced",
  COMPLAINED = "complained",
  FAILED = "failed",
  SKIPPED = "skipped",
}

/** Tracked engagement / deliverability events. */
export enum NewsletterEventType {
  DELIVERY = "delivery",
  OPEN = "open",
  CLICK = "click",
  BOUNCE = "bounce",
  COMPLAINT = "complaint",
  UNSUBSCRIBE = "unsubscribe",
}

/** Who owns a mailing list. */
export enum NewsletterListScope {
  PLATFORM = "platform",
  ORGANIZATION = "organization",
}

/** Publication state of a reusable newsletter template. */
export enum NewsletterTemplateStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

/** Lifecycle transitions an admin can trigger on a campaign. */
export enum NewsletterAction {
  SEND = "send",
  SCHEDULE = "schedule",
  RESCHEDULE = "reschedule",
  PAUSE = "pause",
  RESUME = "resume",
  CANCEL = "cancel",
  RETRY_FAILED = "retry_failed",
}

/** Where a subscription came from (attribution for reporting). */
export enum NewsletterSubscriberSource {
  FOOTER = "footer",
  LANDING_PAGE = "landing_page",
  DASHBOARD = "dashboard",
  CHECKOUT = "checkout",
  IMPORT = "import",
  API = "api",
  /** Added by a platform admin from the admin UI. */
  ADMIN = "admin",
}
