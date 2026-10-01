import { Button, Section } from "react-email";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "outline";

export interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  target?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary hover:bg-primary-dark text-primary-foreground shadow-[0_4px_6px_rgba(0,0,0,0.08)]",
  secondary: "bg-secondary text-secondary-foreground shadow-[0_4px_6px_rgba(0,0,0,0.08)]",
  destructive: "bg-destructive hover:bg-[#c9302c] text-destructive-foreground shadow-[0_4px_6px_rgba(0,0,0,0.08)]",
  outline: "bg-transparent border border-solid border-border text-foreground hover:bg-muted",
};

const alignStyles = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/**
 * Standard Email Button component with Outlook box-border support and Orgatick theme variants.
 */
export const EmailButton = ({
  href,
  children,
  variant = "primary",
  target = "_blank",
  align = "center",
  className = "",
}: EmailButtonProps) => {
  return (
    <Section className={`py-3 ${alignStyles[align]}`}>
      <Button
        href={href}
        target={target}
        className={`text-[15px] font-semibold py-3.5 px-8 rounded-[10px] text-center no-underline inline-block box-border ${variantStyles[variant]} ${className}`}
      >
        {children}
      </Button>
    </Section>
  );
};

export default EmailButton;
