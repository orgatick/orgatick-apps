import { Hr } from "react-email";

export interface EmailDividerProps {
  className?: string;
  margin?: string;
}

/**
 * Reusable Divider component for ORGATICK emails.
 */
export const EmailDivider = ({ className = "", margin = "my-6 mx-8" }: EmailDividerProps) => {
  return <Hr className={`border-solid border-muted ${margin} ${className}`} />;
};

export default EmailDivider;
