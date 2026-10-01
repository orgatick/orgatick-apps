import { Column, Img, Link, Row, Section, Text } from "react-email";

/**
 * React Email building blocks for a newsletter issue.
 *
 * These mirror the `NewsletterBlock` union in `@orgatick/contracts` one-to-one, so
 * an issue can be composed by hand in the React Email preview server while the
 * backend renders the same shapes to HTML for automated sends.
 */

export type BlockAlign = "left" | "center" | "right";

const alignClass: Record<BlockAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const spacerHeights: Record<"sm" | "md" | "lg", string> = {
  sm: "py-3",
  md: "py-5",
  lg: "py-8",
};

export interface NewsletterHeadingProps {
  text: string;
  level?: "h1" | "h2" | "h3";
  align?: BlockAlign;
}

export function NewsletterHeading({ text, level = "h2", align = "left" }: NewsletterHeadingProps) {
  const sizes = { h1: "text-[24px]", h2: "text-[20px]", h3: "text-[17px]" };
  return (
    <Text className={`${sizes[level]} font-bold tracking-tight text-foreground m-0 ${alignClass[align]}`}>{text}</Text>
  );
}

export interface NewsletterParagraphProps {
  text: string;
  align?: BlockAlign;
}

export function NewsletterParagraph({ text, align = "left" }: NewsletterParagraphProps) {
  return <Text className={`text-[15px] leading-[25px] text-muted-foreground m-0 ${alignClass[align]}`}>{text}</Text>;
}

export interface NewsletterImageProps {
  src: string;
  alt?: string;
  width?: number;
  href?: string;
  align?: BlockAlign;
}

export function NewsletterImage({ src, alt = "", width = 520, href, align = "center" }: NewsletterImageProps) {
  const image = (
    <Img
      src={src}
      alt={alt}
      width={String(width)}
      className="block rounded-[10px] border-none"
      style={{ width: "100%", maxWidth: `${width}px`, height: "auto" }}
    />
  );

  return (
    <Section className={`py-3 ${alignClass[align]}`}>
      {href ? (
        <Link href={href} target="_blank">
          {image}
        </Link>
      ) : (
        image
      )}
    </Section>
  );
}

export interface NewsletterBulletListProps {
  items: string[];
  style?: "bullet" | "number";
}

export function NewsletterBulletList({ items, style = "bullet" }: NewsletterBulletListProps) {
  return (
    <Section className="py-2">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: one-shot render, list items are never reordered
        <Text key={index} className="text-[15px] leading-[24px] text-muted-foreground m-0 mb-1.5">
          <span className="font-bold text-primary">{style === "number" ? `${index + 1}.` : "\u2022"}</span> {item}
        </Text>
      ))}
    </Section>
  );
}

export interface NewsletterTwoColumnProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function NewsletterTwoColumn({ left, right }: NewsletterTwoColumnProps) {
  return (
    <Row className="py-2">
      <Column className="w-1/2 align-top pe-2">{left}</Column>
      <Column className="w-1/2 align-top ps-2">{right}</Column>
    </Row>
  );
}

export interface NewsletterDividerProps {
  margin?: string;
}

export function NewsletterDivider({ margin = "my-2" }: NewsletterDividerProps) {
  return (
    <Section className={margin}>
      <table width="100%" border={0} cellPadding={0} cellSpacing={0} role="presentation">
        <tr>
          <td style={{ borderTop: "1px solid #e7ecf3", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</td>
        </tr>
      </table>
    </Section>
  );
}

export interface NewsletterSpacerProps {
  size?: "sm" | "md" | "lg";
}

export function NewsletterSpacer({ size = "md" }: NewsletterSpacerProps) {
  return <Section className={spacerHeights[size]} />;
}
