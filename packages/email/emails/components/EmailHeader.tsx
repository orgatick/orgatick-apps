import { Img, Link, Section } from "react-email";

export interface EmailHeaderProps {
  logoUrl?: string;
  homeUrl?: string;
  companyName?: string;
  logoSize?: number;
  className?: string;
}

/**
 * Standard ORGATICK Header component with brand icon and link.
 */
export const EmailHeader = ({
  logoUrl = "https://assets.orgatick.in/public/icons/icon-512.png",
  homeUrl = "https://orgatick.in",
  companyName = "Orgatick",
  logoSize = 56,
  className = "px-8 pt-8 pb-4 text-center",
}: EmailHeaderProps) => {
  return (
    <Section className={className}>
      <Link href={homeUrl} target="_blank">
        <Img
          src={logoUrl}
          alt={`${companyName} Logo`}
          width={logoSize.toString()}
          height={logoSize.toString()}
          className="mx-auto rounded-[10px] block"
        />
      </Link>
    </Section>
  );
};

export default EmailHeader;
