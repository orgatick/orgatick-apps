import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NewsletterContent } from "@orgatick/contracts";
import type { NewsletterRenderContext } from "../types/newsletter.types";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";
import { applyMergeTags, renderBlockHtml, sanitizeInlineHtml } from "../utils/newsletter-block-html";
import { SAFE_URL, escapeAttribute, escapeHtml, renderPlainText } from "../utils/newsletter-block-text";

@Injectable()
export class NewsletterContentService {
  private readonly publicBaseUrl: string;

  constructor(configService: ConfigService) {
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
  }

  /** Absolute URL for a campaign link, or the original when tracking is off or it is unsafe. */
  buildTrackedUrl(url: string, context: NewsletterRenderContext, trackingEnabled: boolean): string {
    if (!SAFE_URL.test(url)) return "#";

    if (!trackingEnabled || url.startsWith("mailto:") || url.startsWith("tel:")) {
      return url;
    }

    const absolute = url.startsWith("/") ? `${this.publicBaseUrl}${url}` : url;
    return `${this.publicBaseUrl}/newsletter/track/click/${context.recipientId}?url=${encodeURIComponent(absolute)}`;
  }

  /** HTML for the block list. */
  renderContent(content: NewsletterContent, context: NewsletterRenderContext, trackingEnabled: boolean): string {
    const urlBuilder = (url: string) => this.buildTrackedUrl(url, context, trackingEnabled);
    return content.map((block) => renderBlockHtml(block, context, urlBuilder)).join("");
  }

  /** Plain-text alternative, required by every major provider for deliverability. */
  renderText(content: NewsletterContent, context: NewsletterRenderContext): string {
    return renderPlainText(content, context);
  }

  /** Replaces `{{ merge_tag }}` occurrences. Text values are escaped, URLs are not. */
  applyMergeTags(value: string, context: NewsletterRenderContext, options?: { raw?: boolean }): string {
    return applyMergeTags(value, context, options);
  }

  sanitizeInlineHtml(html: string): string {
    return sanitizeInlineHtml(html);
  }

  escapeHtml(value: string): string {
    return escapeHtml(value);
  }

  escapeAttribute(value: string): string {
    return escapeAttribute(value);
  }
}
