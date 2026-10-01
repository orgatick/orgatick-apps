import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { NewsletterBlock, NewsletterContent, NewsletterLeafBlock } from "@orgatick/contracts";
import type { NewsletterRenderContext } from "../types/newsletter.types";
import { resolveNewsletterBaseUrl } from "../utils/newsletter-base-url";

const ALIGN: Record<string, string> = {
  left: "left",
  center: "center",
  right: "right",
};

const SPACER_HEIGHTS: Record<string, string> = { sm: "12px", md: "24px", lg: "40px" };

/**
 * Tags allowed inside a `text` block. Everything else is dropped, including
 * attributes, which is why block content is preferred over raw HTML.
 */
const ALLOWED_INLINE_TAGS = new Set([
  "a",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "br",
  "span",
  "small",
  "sup",
  "sub",
  "code",
]);

/** URL schemes permitted in content links. Anything else (javascript:, data:) is stripped. */
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/)/i;

/**
 * Renders structured newsletter blocks into email HTML plus a plain-text alternative.
 *
 * Output is deliberately table-based with inline styles and no flexbox/grid: that is
 * the only markup Outlook and the Gmail web client both render predictably. Every
 * link is routed through the click tracker and the open pixel is appended by the
 * render service.
 */
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
    return content.map((block) => this.renderBlock(block, context, trackingEnabled)).join("");
  }

  /** Plain-text alternative, required by every major provider for deliverability. */
  renderText(content: NewsletterContent, context: NewsletterRenderContext): string {
    const parts: string[] = [];

    for (const block of content) {
      switch (block.type) {
        case "heading":
          parts.push(block.text.toUpperCase(), "=".repeat(Math.min(block.text.length, 60)));
          break;
        case "paragraph":
          parts.push(block.text);
          break;
        case "text":
          parts.push(block.html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""));
          break;
        case "image":
          parts.push(block.href ? `${block.alt || block.src} (${block.href})` : block.alt || block.src);
          break;
        case "button":
          parts.push(`${block.text}: ${block.href}`);
          break;
        case "divider":
          parts.push("-".repeat(40));
          break;
        case "spacer":
          break;
        case "list":
          parts.push(
            block.items
              .map(
                (item, index) =>
                  `${block.style === "number" ? `${index + 1}.` : "-"} ${item.text}${item.href ? ` (${item.href})` : ""}`,
              )
              .join("\n"),
          );
          break;
        case "columns":
          for (const column of block.columns) {
            parts.push(this.renderText(column.blocks as NewsletterContent, context));
          }
          break;
        default:
          break;
      }
    }

    parts.push(`Unsubscribe: ${context.unsubscribeUrl}`, `Manage preferences: ${context.preferencesUrl}`);
    return parts.filter(Boolean).join("\n\n");
  }

  /** Replaces `{{ merge_tag }}` occurrences. Text values are escaped, URLs are not. */
  applyMergeTags(value: string, context: NewsletterRenderContext, options?: { raw?: boolean }): string {
    const tags: Record<string, string> = {
      first_name: context.firstName,
      email: context.email,
      list_name: context.listName,
      current_year: String(new Date().getFullYear()),
      preferences_url: context.preferencesUrl,
      unsubscribe_url: context.unsubscribeUrl,
      view_in_browser_url: context.viewInBrowserUrl,
    };

    return value.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (match, key: string) => {
      const replacement = tags[key.toLowerCase()];
      if (replacement === undefined) return match;
      return options?.raw ? replacement : this.escapeHtml(replacement);
    });
  }

  /**
   * Strips every tag outside the inline allow-list, drops event handlers and
   * javascript: URLs, and escapes any stray `<` that is not part of a real tag.
   */
  sanitizeInlineHtml(html: string): string {
    // Escape `<` that does not open a well-formed tag, so text like "a < b" is safe.
    const escaped = html.replace(/<(?!\/?[a-z][a-z0-9]*(\s[^<>]*?)?\/?>)/gi, "&lt;");

    return escaped.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_match, closing: string, tag: string, attrs: string) => {
      const name = tag.toLowerCase();
      if (!ALLOWED_INLINE_TAGS.has(name)) return "";

      if (closing === "/") return `</${name}>`;
      if (name === "br") return "<br />";

      if (name === "a") {
        const href = this.extractAttribute(attrs, "href") ?? "";
        if (!SAFE_URL.test(href.trim())) {
          // Neutralise the anchor but keep its children.
          return `<span${sanitizeAttributes(attrs)}>`;
        }
        return `<a href="${this.escapeAttribute(href.trim())}" target="_blank" rel="noopener noreferrer"${sanitizeAttributes(attrs, ["href"])}>`;
      }

      return `<${name}${sanitizeAttributes(attrs)}>`;
    });
  }

  escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private extractAttribute(attrs: string, name: string): string | null {
    const pattern = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
    const match = pattern.exec(attrs);
    return match ? (match[2] ?? match[3] ?? match[4] ?? "") : null;
  }

  private escapeAttribute(value: string): string {
    return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  private renderBlock(block: NewsletterBlock, context: NewsletterRenderContext, trackingEnabled: boolean): string {
    if (block.type === "columns") {
      return this.renderColumns(
        block.columns.map((column) => column.blocks),
        context,
        trackingEnabled,
      );
    }
    return this.renderLeafBlock(block as NewsletterLeafBlock, context, trackingEnabled);
  }

  private renderLeafBlock(
    block: NewsletterLeafBlock,
    context: NewsletterRenderContext,
    trackingEnabled: boolean,
  ): string {
    // `divider` and `spacer` carry no alignment.
    const align = ("align" in block && ALIGN[block.align]) || "left";
    const cell = `align="${align}" valign="top" style="padding:8px 40px;font-family:Arial,Helvetica,sans-serif;color:#1a2b4c;"`;

    switch (block.type) {
      case "heading": {
        const sizes: Record<string, [string, string]> = {
          h1: ["24px", "28px"],
          h2: ["20px", "26px"],
          h3: ["17px", "22px"],
        };
        const [size, lineHeight] = sizes[block.level] ?? sizes.h2;
        return `<tr><td ${cell}><h${block.level === "h1" ? 1 : block.level === "h3" ? 3 : 2} style="margin:16px 0 8px;font-size:${size};line-height:${lineHeight};font-weight:700;text-align:${align};color:#1a2b4c;">${this.applyMergeTags(block.text, context)}</h${block.level === "h1" ? 1 : block.level === "h3" ? 3 : 2}></td></tr>`;
      }
      case "paragraph":
        return `<tr><td ${cell}><p style="margin:0 0 12px;font-size:15px;line-height:25px;text-align:${align};color:#6c7480;">${this.applyMergeTags(block.text, context)}</p></td></tr>`;
      case "text":
        return `<tr><td ${cell}><p style="margin:0 0 12px;font-size:15px;line-height:25px;text-align:${align};color:#6c7480;">${this.applyMergeTags(this.sanitizeInlineHtml(block.html), context, { raw: true })}</p></td></tr>`;
      case "image": {
        const href = block.href
          ? `<a href="${this.escapeAttribute(this.buildTrackedUrl(block.href, context, trackingEnabled))}" target="_blank" style="text-decoration:none;">`
          : "";
        const close = href ? "</a>" : "";
        const width = block.width ? ` width="${block.width}"` : "";
        return `<tr><td ${cell}><p style="margin:0 0 12px;text-align:${align};">${href}<img src="${this.escapeAttribute(block.src)}" alt="${this.escapeAttribute(this.applyMergeTags(block.alt, context))}"${width} style="display:block;margin:0 auto;max-width:100%;height:auto;border:0;border-radius:10px;" />${close}</p></td></tr>`;
      }
      case "button": {
        const href = this.buildTrackedUrl(block.href, context, trackingEnabled);
        const background = block.variant === "outline" ? "transparent" : "#204b90";
        const color = block.variant === "outline" ? "#204b90" : "#ffffff";
        const border = block.variant === "outline" ? "border:1px solid #204b90;" : "";
        return `<tr><td ${cell}><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}"><tr><td align="${align}" bgcolor="${background}" style="${border}border-radius:10px;"><a href="${this.escapeAttribute(href)}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;line-height:20px;color:${color};text-decoration:none;border-radius:10px;">${this.applyMergeTags(block.text, context)}</a></td></tr></table></td></tr>`;
      }
      case "divider":
        return `<tr><td style="padding:16px 40px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-top:1px solid #e7ecf3;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>`;
      case "spacer":
        return `<tr><td style="padding:0 40px;height:${SPACER_HEIGHTS[block.size] ?? SPACER_HEIGHTS.md};font-size:0;line-height:0;">&nbsp;</td></tr>`;
      case "list": {
        const items = block.items
          .map((item, index) => {
            const bullet = block.style === "number" ? `${index + 1}.` : "•";
            const text = this.applyMergeTags(item.text, context);
            const label = item.href
              ? `<a href="${this.escapeAttribute(this.buildTrackedUrl(item.href, context, trackingEnabled))}" target="_blank" style="color:#204b90;text-decoration:underline;">${text}</a>`
              : text;
            return `<li style="margin:0 0 8px;font-size:15px;line-height:24px;color:#6c7480;">${bullet} ${label}</li>`;
          })
          .join("");
        const tag = block.style === "number" ? "ol" : "ul";
        return `<tr><td ${cell}><${tag} style="margin:0 0 12px;padding-left:20px;">${items}</${tag}></td></tr>`;
      }
      default:
        return "";
    }
  }

  private renderColumns(
    columns: NewsletterLeafBlock[][],
    context: NewsletterRenderContext,
    trackingEnabled: boolean,
  ): string {
    const width = Math.floor(100 / columns.length);
    const cells = columns
      .map((columnBlocks, index) => {
        const inner = columnBlocks.map((block) => this.renderLeafBlock(block, context, trackingEnabled)).join("");
        const padding = index === 0 ? "padding:8px 12px 8px 40px;" : "padding:8px 40px 8px 12px;";
        return `<td valign="top" width="${width}%" style="${padding}font-family:Arial,Helvetica,sans-serif;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">${inner}</table></td>`;
      })
      .join("");

    return `<tr><td style="padding:8px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>${cells}</tr></table></td></tr>`;
  }
}

/** Keeps class/style/title attributes and drops event handlers and javascript: URLs. */
function sanitizeAttributes(attrs: string, omit: string[] = []): string {
  const allowed = /^(class|style|title|lang|dir|target|rel|width|height|align|valign|bgcolor)$/i;
  const pattern = /([a-z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  const kept: string[] = [];
  let match = pattern.exec(attrs);

  while (match) {
    const name = match[1];
    const value = match[3] ?? match[4] ?? match[5] ?? "";
    if (allowed.test(name) && !omit.includes(name.toLowerCase()) && !/javascript:|on\w+/i.test(value)) {
      kept.push(`${name.toLowerCase()}="${value.replace(/"/g, "&quot;")}"`);
    }
    match = pattern.exec(attrs);
  }

  return kept.length > 0 ? ` ${kept.join(" ")}` : "";
}
