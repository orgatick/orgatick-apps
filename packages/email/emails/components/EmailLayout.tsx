import { Body, Container, Head, Html, Preview, Tailwind } from "react-email";
import { orgatickTailwindConfig } from "../theme";

export interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
  lang?: string;
  dir?: "ltr" | "rtl";
  maxWidth?: number | string;
}

/**
 * Standard outer layout wrapper for all ORGATICK emails.
 * Handles HTML boilerplate, Tailwind configuration, head meta tags,
 * preview text, outer body background, and centered responsive card container.
 */
export const EmailLayout = ({ children, previewText, lang = "en", dir = "ltr", maxWidth = 580 }: EmailLayoutProps) => {
  return (
    <Html lang={lang} dir={dir}>
      <Tailwind config={orgatickTailwindConfig}>
        <Head />
        <Body className="bg-background font-sans text-foreground py-10 px-2 my-auto mx-auto">
          {previewText && <Preview>{previewText}</Preview>}
          <Container
            className={`bg-card border border-solid border-border rounded-[10px] mx-auto overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.08)]`}
            style={{
              maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
            }}
          >
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default EmailLayout;
