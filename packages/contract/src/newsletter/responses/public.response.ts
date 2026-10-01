import { z } from "zod";
import { createApiResponseSchema } from "../../common/response.js";
import { NewsletterSubscriberStatus } from "../enums/newsletter.enums.js";
import { NewsletterPreferencesSchema } from "../schema/subscriber.schema.js";

/**
 * Result of a public subscribe call.
 *
 * `pending` means double opt-in: the address is stored but no campaign is sent
 * until the confirmation link is clicked.
 */
export const SubscribeNewsletterResponseSchema = z.object({
  status: z.enum([NewsletterSubscriberStatus.PENDING, NewsletterSubscriberStatus.SUBSCRIBED]),
  email: z.string(),
  message: z.string(),
  /** True when the address was already on the list and the call was a no-op. */
  alreadySubscribed: z.boolean().default(false),
});

export type SubscribeNewsletterResponse = z.infer<typeof SubscribeNewsletterResponseSchema>;

export const UnsubscribeNewsletterResponseSchema = z.object({
  status: z.enum([NewsletterSubscriberStatus.UNSUBSCRIBED, NewsletterSubscriberStatus.SUBSCRIBED]),
  email: z.string(),
  message: z.string(),
  preferences: NewsletterPreferencesSchema.optional(),
});

export type UnsubscribeNewsletterResponse = z.infer<typeof UnsubscribeNewsletterResponseSchema>;

export const ManageSubscriptionResponseSchema = z.object({
  email: z.string(),
  status: z.enum(NewsletterSubscriberStatus),
  preferences: NewsletterPreferencesSchema,
  resubscribeToken: z.string(),
});

export type ManageSubscriptionResponse = z.infer<typeof ManageSubscriptionResponseSchema>;

export const PublicSubscribeEnvelopeSchema = createApiResponseSchema(SubscribeNewsletterResponseSchema);
export type PublicSubscribeEnvelope = z.infer<typeof PublicSubscribeEnvelopeSchema>;

export const PublicUnsubscribeEnvelopeSchema = createApiResponseSchema(UnsubscribeNewsletterResponseSchema);
export type PublicUnsubscribeEnvelope = z.infer<typeof PublicUnsubscribeEnvelopeSchema>;

export const ManageSubscriptionEnvelopeSchema = createApiResponseSchema(ManageSubscriptionResponseSchema);
export type ManageSubscriptionEnvelope = z.infer<typeof ManageSubscriptionEnvelopeSchema>;
