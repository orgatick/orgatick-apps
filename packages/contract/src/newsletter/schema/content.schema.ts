import { z } from "zod";

/**
 * Structured newsletter content blocks.
 *
 * Campaigns and templates store an ordered array of these blocks instead of raw
 * HTML. The backend renders them into email-safe HTML (table based, inline styles)
 * plus a plain-text alternative, which keeps deliverability high and prevents
 * arbitrary markup from reaching inboxes.
 */

const BlockIdSchema = z.string().trim().min(1).max(64).optional();

const TextAlignSchema = z.enum(["left", "center", "right"]).default("left");

const LinkSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => /^(https?:\/\/|mailto:|tel:|\/)/i.test(value), {
    message: "Link must be an absolute http(s), mailto, tel or site-relative URL",
  });

export const NewsletterHeadingBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("heading"),
  text: z.string().trim().min(1).max(300),
  level: z.enum(["h1", "h2", "h3"]).default("h2"),
  align: TextAlignSchema,
});

export const NewsletterParagraphBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("paragraph"),
  text: z.string().trim().min(1).max(5000),
  align: TextAlignSchema,
});

export const NewsletterTextBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("text"),
  /** Pre-sanitised inline HTML (links, <strong>, <em>, <br>). Block level tags are stripped on render. */
  html: z.string().trim().min(1).max(20000),
  align: TextAlignSchema,
});

export const NewsletterImageBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("image"),
  src: z.url("Image must be a valid URL"),
  alt: z.string().trim().max(300).default(""),
  href: LinkSchema.optional(),
  width: z.number().int().min(40).max(1200).optional(),
  align: TextAlignSchema,
});

export const NewsletterButtonBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("button"),
  text: z.string().trim().min(1).max(120),
  href: LinkSchema,
  variant: z.enum(["solid", "outline"]).default("solid"),
  align: TextAlignSchema,
});

export const NewsletterDividerBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("divider"),
});

export const NewsletterSpacerBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("spacer"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export const NewsletterListItemSchema = z.object({
  text: z.string().trim().min(1).max(500),
  href: LinkSchema.optional(),
});

export const NewsletterListBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("list"),
  style: z.enum(["bullet", "number"]).default("bullet"),
  items: z.array(NewsletterListItemSchema).min(1).max(30),
});

export const NewsletterLeafBlockSchema = z.discriminatedUnion("type", [
  NewsletterHeadingBlockSchema,
  NewsletterParagraphBlockSchema,
  NewsletterTextBlockSchema,
  NewsletterImageBlockSchema,
  NewsletterButtonBlockSchema,
  NewsletterDividerBlockSchema,
  NewsletterSpacerBlockSchema,
  NewsletterListBlockSchema,
]);

export const NewsletterColumnSchema = z.object({
  /** Columns hold leaf blocks only; a column cannot nest another columns block. */
  blocks: z.array(NewsletterLeafBlockSchema).min(1).max(8),
});

export const NewsletterColumnsBlockSchema = z.object({
  id: BlockIdSchema,
  type: z.literal("columns"),
  columns: z.array(NewsletterColumnSchema).min(2).max(3),
});

export const NewsletterBlockSchema = z.discriminatedUnion("type", [
  NewsletterHeadingBlockSchema,
  NewsletterParagraphBlockSchema,
  NewsletterTextBlockSchema,
  NewsletterImageBlockSchema,
  NewsletterButtonBlockSchema,
  NewsletterDividerBlockSchema,
  NewsletterSpacerBlockSchema,
  NewsletterListBlockSchema,
  NewsletterColumnsBlockSchema,
]);

/**
 * The block list on its own, without the "at least one block" rule.
 *
 * A template or campaign can be built purely from an HTML override, and that alternative
 * body is explicitly allowed by the API. Such a record legitimately stores no blocks, so
 * storage shape has to permit an empty list.
 */
export const NewsletterContentBlocksSchema = z.array(NewsletterBlockSchema).max(120);

/** Block content that must render something, for example a campaign that is about to be sent. */
export const NewsletterContentSchema = NewsletterContentBlocksSchema.min(1, "Content must have at least one block");

export type NewsletterHeadingBlock = z.infer<typeof NewsletterHeadingBlockSchema>;
export type NewsletterParagraphBlock = z.infer<typeof NewsletterParagraphBlockSchema>;
export type NewsletterTextBlock = z.infer<typeof NewsletterTextBlockSchema>;
export type NewsletterImageBlock = z.infer<typeof NewsletterImageBlockSchema>;
export type NewsletterButtonBlock = z.infer<typeof NewsletterButtonBlockSchema>;
export type NewsletterDividerBlock = z.infer<typeof NewsletterDividerBlockSchema>;
export type NewsletterSpacerBlock = z.infer<typeof NewsletterSpacerBlockSchema>;
export type NewsletterListBlock = z.infer<typeof NewsletterListBlockSchema>;
export type NewsletterColumnsBlock = z.infer<typeof NewsletterColumnsBlockSchema>;
export type NewsletterLeafBlock = z.infer<typeof NewsletterLeafBlockSchema>;
export type NewsletterColumn = z.infer<typeof NewsletterColumnSchema>;
export type NewsletterBlock = z.infer<typeof NewsletterBlockSchema>;
export type NewsletterContent = z.infer<typeof NewsletterContentSchema>;

/** Every block type the renderer understands, for admin editor UIs. */
export const NEWSLETTER_BLOCK_TYPES = [
  "heading",
  "paragraph",
  "text",
  "image",
  "button",
  "divider",
  "spacer",
  "list",
  "columns",
] as const;

export type NewsletterBlockType = (typeof NEWSLETTER_BLOCK_TYPES)[number];

/**
 * Merge tags supported in subjects, preview text and content.
 * The renderer substitutes and HTML-escapes every value except the allow-listed URLs.
 */
export const NEWSLETTER_MERGE_TAGS = [
  "first_name",
  "email",
  "list_name",
  "current_year",
  "preferences_url",
  "unsubscribe_url",
  "view_in_browser_url",
] as const;

export type NewsletterMergeTag = (typeof NEWSLETTER_MERGE_TAGS)[number];
