import { Section } from "react-email";

export interface EmailCardProps {
  children: React.ReactNode;
  variant?: "default" | "muted" | "outline";
  className?: string;
}

const cardVariants = {
  default: "bg-background border border-solid border-border",
  muted: "bg-background border border-solid border-muted",
  outline: "bg-card border border-solid border-border",
};

/**
 * Reusable Card / Box container for grouping related content within an email.
 */
export const EmailCard = ({ children, variant = "default", className = "" }: EmailCardProps) => {
  return <Section className={`rounded-[10px] p-5 ${cardVariants[variant]} ${className}`}>{children}</Section>;
};

export default EmailCard;
