import type { ConfigService } from "@nestjs/config";

/**
 * Base URL for every link the backend puts into a newsletter email.
 *
 * `APP_URL` is the canonical public origin of the app, so it is the default: confirmation,
 * unsubscribe and preference links are all served by the web app, not by the API. Setting
 * them to the API origin would hand recipients a JSON endpoint instead of a page.
 *
 * `NEWSLETTER_PUBLIC_BASE_URL` stays available as an override for a deployment that serves
 * the newsletter surface from a different host. Trailing slashes are stripped so callers can
 * append a path directly.
 */
export function resolveNewsletterBaseUrl(configService: ConfigService): string {
  const baseUrl =
    configService.get<string>("NEWSLETTER_PUBLIC_BASE_URL") ?? configService.getOrThrow<string>("APP_URL");

  return baseUrl.replace(/\/+$/, "");
}
