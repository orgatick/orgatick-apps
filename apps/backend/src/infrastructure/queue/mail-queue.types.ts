import type { SendHtmlOptions } from "../mail/mail.service";

/**
 * Data carried by a mail job.
 *
 * Everything is a string or a plain object because jobs are serialised into Redis, so bigint
 * ids are stringified. A campaign job carries ids only: the message is rendered by the
 * worker so tracking links, merge tags and unsubscribe preferences reflect the moment it is
 * actually sent.
 */
export interface MailJobData {
  /** Rendered message. Omitted for campaign jobs, which render themselves. */
  message?: SendHtmlOptions;
  campaign?: {
    newsletterId: string;
    recipientId: string;
    /**
     * Distinguishes a manual retry from the original send. Completed jobs are kept for a
     * while, and BullMQ refuses to add a job whose id already exists, so a retry would
     * otherwise be swallowed. The recipient ledger still guards against double sends.
     */
    retryNonce?: number;
  };
}
