/** Redis key held while a replica is dispatching campaigns. Only one replica dispatches at a time. */
export const NEWSLETTER_DISPATCH_LOCK_KEY = "newsletter:dispatch:lock";

/** Lock TTL. Kept well above one batch so a slow batch does not overlap with the next tick. */
export const NEWSLETTER_DISPATCH_LOCK_TTL_MS = 60_000;

/** Guard against a runaway retry loop on a single address. */
export const NEWSLETTER_MAX_SEND_ATTEMPTS = 3;

/** Resend message tag used to correlate provider-side events back to a campaign. */
export const NEWSLETTER_TAG_NAME = "newsletter_campaign";

/** 1x1 transparent GIF served by the open-tracking pixel route. */
export const NEWSLETTER_OPEN_PIXEL_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

export const NEWSLETTER_SUPPORT_EMAIL = "support@orgatick.in";

/** Fallback sender when `NEWSLETTER_FROM_EMAIL` is absent; mirrors the env validation default. */
export const NEWSLETTER_FROM_EMAIL = "newsletter@orgatick.in";

export const NEWSLETTER_BRAND = {
  name: "Orgatick",
  siteUrl: "https://orgatick.in",
  logoUrl: "https://assets.orgatick.in/public/icons/icon-512.png",
  address: "Orgatick, Bengaluru, Karnataka, India",
  colors: {
    background: "#f4f7fc",
    foreground: "#1a2b4c",
    card: "#ffffff",
    muted: "#6c7480",
    border: "#e7ecf3",
    primary: "#204b90",
    primaryDark: "#1c458f",
  },
} as const;

export function newsletterStatsCacheKey(newsletterId: bigint | string): string {
  return `newsletter:stats:${newsletterId}`;
}

export function newsletterUnsubscribeTokenKey(subscriberId: bigint | string): string {
  return `newsletter:unsubscribe:${subscriberId}`;
}
