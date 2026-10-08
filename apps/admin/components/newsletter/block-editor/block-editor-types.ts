import type { NewsletterBlock, NewsletterLeafBlock } from "@orgatick/contracts";
import {
  IconColumns,
  IconCreditCard,
  IconHeading,
  IconList,
  IconMinus,
  IconPhoto,
  IconQuote,
  IconSeparator,
  IconTypography,
} from "@tabler/icons-react";

export type Align = "left" | "center" | "right";

export interface BlockEditorProps {
  value: NewsletterBlock[];
  onChange: (blocks: NewsletterBlock[]) => void;
  error?: string;
}

export const DEFAULTS: Record<
  "heading" | "paragraph" | "text" | "image" | "button" | "divider" | "spacer" | "list",
  NewsletterLeafBlock
> = {
  heading: { type: "heading", text: "A headline worth reading", level: "h2", align: "left" },
  paragraph: {
    type: "paragraph",
    text: "Explain what happened and why it matters for the reader in one or two sentences.",
    align: "left",
  },
  text: {
    type: "text",
    html: '<p>Rich text with <strong>bold</strong> and <a href="https://orgatick.in">links</a>.</p>',
    align: "left",
  },
  image: { type: "image", src: "https://placehold.co/1200x600", alt: "Campaign hero image", align: "center" },
  button: { type: "button", text: "Read more", href: "https://orgatick.in", variant: "solid", align: "left" },
  divider: { type: "divider" },
  spacer: { type: "spacer", size: "md" },
  list: { type: "list", style: "bullet", items: [{ text: "First point" }, { text: "Second point" }] },
};

export const MENU_ITEMS = [
  { type: "heading", label: "Heading", icon: IconHeading },
  { type: "paragraph", label: "Paragraph", icon: IconTypography },
  { type: "text", label: "Rich text", icon: IconQuote },
  { type: "image", label: "Image", icon: IconPhoto },
  { type: "button", label: "Button", icon: IconCreditCard },
  { type: "list", label: "List", icon: IconList },
  { type: "divider", label: "Divider", icon: IconSeparator },
  { type: "spacer", label: "Spacer", icon: IconMinus },
  { type: "columns", label: "Columns", icon: IconColumns },
] as const;
