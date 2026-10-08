import type { NewsletterBlock, NewsletterLeafBlock } from "@orgatick/contracts";
import type { NewsletterRenderContext } from "../types/newsletter.types";
import {
  ALLOWED_INLINE_TAGS,
  SAFE_URL,
  escapeAttribute,
  escapeHtml,
  sanitizeAttributes,
} from "./newsletter-block-text";

const ALIGN: Record<string, string> = { left: "left", center: "center", right: "right" };
const SPACER_HEIGHTS: Record<string, string> = { sm: "12px", md: "24px", lg: "40px" };

export function applyMergeTags(value: string, context: NewsletterRenderContext, options?: { raw?: boolean }): string {
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
    return options?.raw ? replacement : escapeHtml(replacement);
  });
}

export function sanitizeInlineHtml(html: string): string {
  const escaped = html.replace(/<(?!\/?[a-z][a-z0-9]*(\s[^<>]*?)?\/?>)/gi, "&lt;");

  return escaped.replace(/<(\/?)([a-z0-9]+)([^>]*)>/gi, (_match, closing: string, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_INLINE_TAGS.has(name)) return "";
    if (closing === "/") return `</${name}>`;
    if (name === "br") return "<br />";

    if (name === "a") {
      const match = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
      const href = match ? (match[2] ?? match[3] ?? match[4] ?? "") : "";
      if (!SAFE_URL.test(href.trim())) {
        return `<span${sanitizeAttributes(attrs)}>`;
      }
      return `<a href="${escapeAttribute(href.trim())}" target="_blank" rel="noopener noreferrer"${sanitizeAttributes(attrs, ["href"])}>`;
    }

    return `<${name}${sanitizeAttributes(attrs)}>`;
  });
}

export function renderLeafBlockHtml(
  block: NewsletterLeafBlock,
  context: NewsletterRenderContext,
  trackingUrlBuilder: (url: string) => string,
): string {
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
      return `<tr><td ${cell}><h${block.level === "h1" ? 1 : block.level === "h3" ? 3 : 2} style="margin:16px 0 8px;font-size:${size};line-height:${lineHeight};font-weight:700;text-align:${align};color:#1a2b4c;">${applyMergeTags(block.text, context)}</h${block.level === "h1" ? 1 : block.level === "h3" ? 3 : 2}></td></tr>`;
    }
    case "paragraph":
      return `<tr><td ${cell}><p style="margin:0 0 12px;font-size:15px;line-height:25px;text-align:${align};color:#6c7480;">${applyMergeTags(block.text, context)}</p></td></tr>`;
    case "text":
      return `<tr><td ${cell}><p style="margin:0 0 12px;font-size:15px;line-height:25px;text-align:${align};color:#6c7480;">${applyMergeTags(sanitizeInlineHtml(block.html), context, { raw: true })}</p></td></tr>`;
    case "image": {
      const href = block.href
        ? `<a href="${escapeAttribute(trackingUrlBuilder(block.href))}" target="_blank" style="text-decoration:none;">`
        : "";
      const close = href ? "</a>" : "";
      const width = block.width ? ` width="${block.width}"` : "";
      return `<tr><td ${cell}><p style="margin:0 0 12px;text-align:${align};">${href}<img src="${escapeAttribute(block.src)}" alt="${escapeAttribute(applyMergeTags(block.alt, context))}"${width} style="display:block;margin:0 auto;max-width:100%;height:auto;border:0;border-radius:10px;" />${close}</p></td></tr>`;
    }
    case "button": {
      const href = trackingUrlBuilder(block.href);
      const background = block.variant === "outline" ? "transparent" : "#204b90";
      const color = block.variant === "outline" ? "#204b90" : "#ffffff";
      const border = block.variant === "outline" ? "border:1px solid #204b90;" : "";
      return `<tr><td ${cell}><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}"><tr><td align="${align}" bgcolor="${background}" style="${border}border-radius:10px;"><a href="${escapeAttribute(href)}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;line-height:20px;color:${color};text-decoration:none;border-radius:10px;">${applyMergeTags(block.text, context)}</a></td></tr></table></td></tr>`;
    }
    case "divider":
      return `<tr><td style="padding:16px 40px;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="border-top:1px solid #e7ecf3;font-size:1px;line-height:1px;">&nbsp;</td></tr></table></td></tr>`;
    case "spacer":
      return `<tr><td style="padding:0 40px;height:${SPACER_HEIGHTS[block.size] ?? SPACER_HEIGHTS.md};font-size:0;line-height:0;">&nbsp;</td></tr>`;
    case "list": {
      const items = block.items
        .map((item, index) => {
          const bullet = block.style === "number" ? `${index + 1}.` : "•";
          const text = applyMergeTags(item.text, context);
          const label = item.href
            ? `<a href="${escapeAttribute(trackingUrlBuilder(item.href))}" target="_blank" style="color:#204b90;text-decoration:underline;">${text}</a>`
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

export function renderBlockHtml(
  block: NewsletterBlock,
  context: NewsletterRenderContext,
  trackingUrlBuilder: (url: string) => string,
): string {
  if (block.type === "columns") {
    const width = Math.floor(100 / block.columns.length);
    const cells = block.columns
      .map((column, index) => {
        const inner = column.blocks.map((b) => renderLeafBlockHtml(b, context, trackingUrlBuilder)).join("");
        const padding = index === 0 ? "padding:8px 12px 8px 40px;" : "padding:8px 40px 8px 12px;";
        return `<td valign="top" width="${width}%" style="${padding}font-family:Arial,Helvetica,sans-serif;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">${inner}</table></td>`;
      })
      .join("");
    return `<tr><td style="padding:8px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr>${cells}</tr></table></td></tr>`;
  }
  return renderLeafBlockHtml(block, context, trackingUrlBuilder);
}
