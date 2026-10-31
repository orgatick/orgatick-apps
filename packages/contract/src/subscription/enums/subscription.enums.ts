export enum SubscriptionStatus {
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  GRACE_PERIOD = "grace_period",
  PAUSED = "paused",
  CANCELED = "canceled",
  EXPIRED = "expired",
}

export enum BillingInterval {
  NONE = "none",
  MONTH = "month",
  YEAR = "year",
}

export enum LimitScopeType {
  CONCURRENT = "concurrent",
  TOTAL = "total",
  MONTHLY_QUOTA = "monthly_quota",
  RETENTION_WINDOW = "retention_window",
}

export enum MetricType {
  GAUGE = "gauge",
  COUNTER = "counter",
  TIME_INTERVAL = "time_interval",
}

export enum MetricUnit {
  COUNT = "count",
  BYTES = "bytes",
  DAYS = "days",
  REQUESTS = "requests",
}

export enum AddonType {
  LIMIT_INCREASE = "limit_increase",
  FEATURE_UNLOCK = "feature_unlock",
}

export enum SubscriptionItemType {
  PLAN = "plan",
  ADDON = "addon",
}

export enum OverrideTargetType {
  FEATURE = "feature",
  LIMIT = "limit",
}

export enum SubscriptionHistoryEventType {
  CREATED = "created",
  RENEWED = "renewed",
  UPGRADED = "upgraded",
  DOWNGRADE_SCHEDULED = "downgrade_scheduled",
  DOWNGRADE_EXECUTED = "downgrade_executed",
  CANCELED = "canceled",
  EXPIRED = "expired",
  GRACE_PERIOD_ENTERED = "grace_period_entered",
  PAYMENT_FAILED = "payment_failed",
  ADDON_ADDED = "addon_added",
  ADDON_REMOVED = "addon_removed",
  OVERRIDE_GRANTED = "override_granted",
  OVERRIDE_REVOKED = "override_revoked",
}

export enum InvoiceBillingReason {
  SUBSCRIPTION_CREATE = "subscription_create",
  SUBSCRIPTION_CYCLE = "subscription_cycle",
  SUBSCRIPTION_UPGRADE = "subscription_upgrade",
  ADDON_PURCHASE = "addon_purchase",
  MANUAL_ADJUSTMENT = "manual_adjustment",
}

export enum InvoiceStatus {
  DRAFT = "draft",
  OPEN = "open",
  PAID = "paid",
  UNCOLLECTIBLE = "uncollectible",
  VOID = "void",
}

export enum InvoiceItemType {
  PLAN_SUBSCRIPTION = "plan_subscription",
  ADDON_CHARGE = "addon_charge",
  PRORATION_CREDIT = "proration_credit",
  MANUAL_ADJUSTMENT = "manual_adjustment",
}

export enum TaxType {
  GST = "GST",
  VAT = "VAT",
  SALES_TAX = "SALES_TAX",
  EXEMPT = "EXEMPT",
}

export enum SubscriptionPaymentStatus {
  PENDING = "pending",
  AUTHORIZED = "authorized",
  CAPTURED = "captured",
  FAILED = "failed",
  REFUNDED = "refunded",
}
