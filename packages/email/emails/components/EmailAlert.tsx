import { Section, Text } from "react-email";

export type AlertType = "info" | "warning" | "destructive" | "success";

export interface EmailAlertProps {
  children: React.ReactNode;
  type?: AlertType;
  title?: string;
  className?: string;
}

const alertStyles: Record<AlertType, { border: string; bg: string; text: string; titleColor: string }> = {
  info: {
    border: "border-info",
    bg: "bg-background",
    text: "text-foreground",
    titleColor: "text-info",
  },
  warning: {
    border: "border-warning",
    bg: "bg-background",
    text: "text-foreground",
    titleColor: "text-foreground",
  },
  destructive: {
    border: "border-destructive",
    bg: "bg-background",
    text: "text-foreground",
    titleColor: "text-destructive",
  },
  success: {
    border: "border-success",
    bg: "bg-background",
    text: "text-foreground",
    titleColor: "text-success",
  },
};

/**
 * Reusable Alert / Callout box for system alerts, warnings, and informational banners.
 */
export const EmailAlert = ({ children, type = "info", title, className = "" }: EmailAlertProps) => {
  const style = alertStyles[type];

  return (
    <Section className={`border-l-4 border-solid ${style.border} ${style.bg} rounded-r-[10px] p-4 my-4 ${className}`}>
      {title && <Text className={`text-[14px] font-bold ${style.titleColor} m-0 mb-1`}>{title}</Text>}
      <Text className={`text-[13px] leading-[20px] ${style.text} m-0`}>{children}</Text>
    </Section>
  );
};

export default EmailAlert;
