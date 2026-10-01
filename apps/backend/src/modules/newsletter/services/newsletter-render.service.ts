import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NewsletterAudienceDto, NewsletterContent } from "@orgatick/contracts";
import { NEWSLETTER_BRAND, NEWSLETTER_OPEN_PIXEL_BASE64 } from "../constants/newsletter.constants";
import type { Newsletter } from "../entities/newsletter.entity";
import type { NewsletterRenderContext, RenderedNewsletter } from "../types/newsletter.types";
import { NewsletterContentService } from "./newsletter-content.service";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";

export interface RenderNewsletterInput {
  subject: string;
  previewText?: string | null;
  content: NewsletterContent;
  htmlOverride?: string | null;
  textOverride?: string | null;
  audience?: NewsletterAudienceDto;
  listName: string;
  fromName: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
  viewInBrowserUrl: string;
}

export interface RenderNewsletterOptions {
  trackingEnabled: boolean;
  /** Recipient id used for click routing and the open pixel. Omit for an admin preview. */
  recipientId?: string;
  context?: NewsletterRenderContext;
}

/**
 * Assembles the final email document: subject, preview text, branded shell,
 * rendered blocks, compliance footer and tracking pixel.
 */
@Injectable()
export class NewsletterRenderService {
  private readonly publicBaseUrl: string;
  private readonly trackingEnabled: boolean;

  constructor(
    private readonly contentService: NewsletterContentService,
    configService: ConfigService,
  ) {
    this.publicBaseUrl = resolveNewsletterBaseUrl(configService);
    this.trackingEnabled = configService.get<string>("NEWSLETTER_TRACKING_ENABLED") === "true";
  }

  render(input: RenderNewsletterInput, options: RenderNewsletterOptions): RenderedNewsletter {
    const context: NewsletterRenderContext =
      options.context ??
      ({
        recipientId: options.recipientId ?? "preview",
        firstName: "there",
        email: "",
        listName: input.listName,
        unsubscribeUrl: input.unsubscribeUrl,
        preferencesUrl: input.preferencesUrl,
        viewInBrowserUrl: input.viewInBrowserUrl,
      } satisfies NewsletterRenderContext);

    const subject = this.contentService.applyMergeTags(input.subject, context);
    const previewText = this.contentService.applyMergeTags(input.previewText ?? "", context);

    const bodyHtml = input.htmlOverride?.trim()
      ? this.contentService.sanitizeInlineHtml(input.htmlOverride)
      : this.contentService.renderContent(input.content, context, options.trackingEnabled);

    const bodyText = input.textOverride?.trim()
      ? input.textOverride
      : this.contentService.renderText(input.content, context);

    const html = this.wrapDocument({
      previewText,
      bodyHtml,
      listName: input.listName,
      unsubscribeUrl: context.unsubscribeUrl,
      preferencesUrl: context.preferencesUrl,
      viewInBrowserUrl: context.viewInBrowserUrl,
      pixelUrl:
        options.trackingEnabled && options.recipientId
          ? `${this.publicBaseUrl}/newsletter/track/open/${options.recipientId}`
          : null,
      fromName: input.fromName,
    });

    return { subject, previewText, html, text: bodyText };
  }

  /**
   * Renders a persisted campaign for one recipient.
   *
   * Tracking honours `NEWSLETTER_TRACKING_ENABLED` so a self-hosted instance can disable
   * open/click pixels without touching the send pipeline.
   */
  renderCampaign(campaign: Newsletter, context: NewsletterRenderContext): RenderedNewsletter {
    return this.render(
      {
        subject: campaign.subject,
        previewText: campaign.previewText ?? null,
        content: campaign.content,
        htmlOverride: campaign.htmlOverride ?? null,
        textOverride: campaign.textOverride ?? null,
        audience: campaign.audience,
        listName: campaign.list?.name ?? "Orgatick Newsletter",
        fromName: campaign.fromName,
        unsubscribeUrl: context.unsubscribeUrl,
        preferencesUrl: context.preferencesUrl,
        viewInBrowserUrl: context.viewInBrowserUrl,
      },
      { trackingEnabled: this.trackingEnabled, recipientId: context.recipientId, context },
    );
  }

  /**
   * Renders a campaign for the admin preview.
   *
   * Tracking is disabled and placeholder self-service links are used, so previewing a
   * campaign never records engagement or unsubscribes the admin who is looking at it.
   */
  previewCampaign(campaign: Newsletter, trackingEnabled: boolean): RenderedNewsletter {
    return this.render(
      {
        subject: campaign.subject,
        previewText: campaign.previewText ?? null,
        content: campaign.content,
        htmlOverride: campaign.htmlOverride ?? null,
        textOverride: campaign.textOverride ?? null,
        audience: campaign.audience,
        listName: campaign.list?.name ?? "Orgatick Newsletter",
        fromName: campaign.fromName,
        unsubscribeUrl: `${this.publicBaseUrl}/newsletter/preview`,
        preferencesUrl: `${this.publicBaseUrl}/newsletter/preview`,
        viewInBrowserUrl: `${this.publicBaseUrl}/newsletter/campaign/${campaign.uuid}`,
      },
      { trackingEnabled },
    );
  }

  /** 1x1 GIF body used by the open-tracking endpoint. */
  static openPixelDataUri(): string {
    return `data:image/gif;base64,${NEWSLETTER_OPEN_PIXEL_BASE64}`;
  }

  private wrapDocument(input: {
    previewText: string;
    bodyHtml: string;
    listName: string;
    unsubscribeUrl: string;
    preferencesUrl: string;
    viewInBrowserUrl: string;
    pixelUrl: string | null;
    fromName: string;
  }): string {
    const { colors, logoUrl, siteUrl, address, name } = NEWSLETTER_BRAND;
    const font = "font-family:Arial,Helvetica,sans-serif;";

    // Hidden preheader: the inbox snippet, kept off-screen but readable by clients.
    const preheader = input.previewText
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${input.previewText}</div>`
      : "";

    const pixel = input.pixelUrl
      ? `<img src="${input.pixelUrl}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;" />`
      : "";

    return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${this.contentService.escapeHtml(name)}</title>
</head>
<body style="margin:0;padding:0;background-color:${colors.background};">
${preheader}
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:${colors.background};">
<tr><td align="center" style="padding:32px 8px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background-color:${colors.card};border:1px solid ${colors.border};border-radius:10px;">
<tr><td align="center" style="padding:28px 16px 12px;">
<a href="${siteUrl}" target="_blank" style="text-decoration:none;"><img src="${logoUrl}" alt="${name}" width="56" height="56" style="display:block;margin:0 auto;border:0;border-radius:10px;" /></a>
</td></tr>
<tr><td style="${font}font-size:11px;line-height:16px;letter-spacing:0.08em;text-transform:uppercase;text-align:center;color:${colors.muted};padding:0 40px 8px;">
${this.contentService.escapeHtml(input.listName)}
</td></tr>
<tr><td>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
${input.bodyHtml}
</table>
</td></tr>
<tr><td style="padding:8px 40px 24px;">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-top:1px solid ${colors.border};font-size:1px;line-height:1px;">&nbsp;</td></tr></table>
</td></tr>
<tr><td align="center" style="${font}font-size:12px;line-height:19px;text-align:center;color:${colors.muted};padding:0 40px 28px;">
You are receiving this because you subscribed to ${this.contentService.escapeHtml(input.listName)} from ${this.contentService.escapeHtml(input.fromName)}.
<br /><br />
<a href="${input.viewInBrowserUrl}" target="_blank" style="color:${colors.primary};text-decoration:underline;">View in browser</a>
&nbsp;&bull;&nbsp;
<a href="${input.preferencesUrl}" target="_blank" style="color:${colors.primary};text-decoration:underline;">Manage preferences</a>
&nbsp;&bull;&nbsp;
<a href="${input.unsubscribeUrl}" target="_blank" style="color:${colors.primary};text-decoration:underline;">Unsubscribe</a>
<br /><br />
${this.contentService.escapeHtml(address)}
<br />
&copy; ${new Date().getFullYear()} ${this.contentService.escapeHtml(name)}. All rights reserved.
</td></tr>
</table>
${pixel}
</td></tr>
</table>
</body>
</html>`;
  }
}
