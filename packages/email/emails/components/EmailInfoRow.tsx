import { Row, Section, Text } from "react-email";

export interface EmailInfoRowProps {
  label: string;
  value: React.ReactNode;
  labelWidth?: number | string;
  isMono?: boolean;
  className?: string;
}

/**
 * Reusable key-value row for displaying metadata (Time, IP, Device, Order ID, etc.)
 */
export const EmailInfoRow = ({
  label,
  value,
  labelWidth = 110,
  isMono = false,
  className = "mb-2",
}: EmailInfoRowProps) => {
  const widthStyle = typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth;

  return (
    <Section className={className}>
      <Row>
        <td className="text-[13px] text-muted-foreground font-medium py-1 align-top" style={{ width: widthStyle }}>
          {label}:
        </td>
        <td
          className={`text-[13px] text-foreground py-1 align-top ${isMono ? "font-mono font-medium" : "font-semibold"}`}
        >
          {typeof value === "string" ? (
            <Text className="m-0 p-0 text-[13px] leading-[18px] inline">{value}</Text>
          ) : (
            value
          )}
        </td>
      </Row>
    </Section>
  );
};

export default EmailInfoRow;
