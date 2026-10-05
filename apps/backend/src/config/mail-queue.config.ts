/**
 * Mail queue tuning.
 *
 * None of this is a secret and none of it should differ per deployment, so it lives in code
 * instead of the environment: an operator should not have to keep a dozen variables in sync
 * with values the app already has a sensible opinion about. Only credentials belong in `.env`.
 *
 * Change a value here when the workload genuinely calls for it, not per environment.
 */
export const MAIL_QUEUE_CONFIG = {
  /** Deliver mail through Redis rather than inside the request. */
  enabled: true,
  /** Automatic tries per message before a recipient is recorded as failed. */
  attempts: 3,
  /** Base delay of the exponential backoff between those tries. */
  backoffMs: 5_000,
  /** Messages one worker delivers at the same time. */
  concurrency: 5,
  /**
   * How long a recipient may sit queued before its job is assumed lost and re-queued. Covers
   * a job evicted from Redis or removed before it ran; see the campaign reconciler.
   */
  reconcileGraceMs: 120_000,
  /** Key prefix for every BullMQ queue in the app. */
  queuePrefix: "bull",
  /** Keep a small tail of finished jobs for debugging, drop the rest so Redis stays flat. */
  removeOnCompleteCount: 500,
  removeOnFailCount: 500,
} as const;
