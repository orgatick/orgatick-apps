import type { NewsletterContent } from "@orgatick/contracts";
import type { NewsletterRenderContext } from "../types/newsletter.types";

/** Allowed HTML tags inside rich-text blocks. All others stripped. */
export const ALLOWED_INLINE_TAGS = new Set([
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

export const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/)/i;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sanitizeAttributes(attrs: string, omit: string[] = []): string {
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

export function renderPlainText(content: NewsletterContent, context: NewsletterRenderContext): string {
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
          parts.push(renderPlainText(column.blocks as NewsletterContent, context));
        }
        break;
      default:
        break;
    }
  }

  parts.push(`Unsubscribe: ${context.unsubscribeUrl}`, `Manage preferences: ${context.preferencesUrl}`);
  return parts.filter(Boolean).join("\n\n");
}
