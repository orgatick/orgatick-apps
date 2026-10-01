import type { ApiResponse, SubscribeNewsletterResponse } from "@orgatick/contracts";
import api from "./auth.api";

/** Public newsletter endpoints used by the participant app. No credentials are required. */
export interface PublicSubscribePayload {
  email: string;
  name?: string;
  list?: string;
  source?: "footer" | "landing_page" | "dashboard" | "checkout" | "import" | "api";
  preferences?: {
    categories?: string[];
    marketing?: boolean;
  };
  /** Honeypot: hidden from humans, filled in by bots. Always sent empty. */
  website?: string;
}

/** Subscribe and confirm share the same response shape, so the contract defines it once. */
export type PublicSubscribeResult = SubscribeNewsletterResponse;

/**
 * `pending` means double opt-in: nothing is sent until the recipient clicks the
 * confirmation link, so the UI should tell them to check their inbox.
 */
export async function subscribeNewsletter(payload: PublicSubscribePayload): Promise<PublicSubscribeResult> {
  const response = await api.post<ApiResponse<PublicSubscribeResult>>("/newsletter/subscribe", payload);
  return response.data.data;
}

/**
 * Completes the double opt-in handshake from the emailed link.
 *
 * Idempotent on the server, so a second visit is a no-op success rather than an error.
 * Rejects when the token is malformed, tampered with, expired, or already consumed.
 */
export async function confirmNewsletterSubscription(token: string): Promise<PublicSubscribeResult> {
  const response = await api.get<ApiResponse<PublicSubscribeResult>>("/newsletter/confirm", {
    params: { token },
  });
  return response.data.data;
}
