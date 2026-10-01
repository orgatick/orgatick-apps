import { Img, Link, Section, Text } from "react-email";

export interface SocialLink {
  platform: "facebook" | "x" | "instagram" | "linkedin" | "github" | "youtube";
  url: string;
  iconUrl?: string;
}

export interface EmailFooterProps {
  companyName?: string;
  tagline?: string;
  logoUrl?: string;
  logoSize?: number;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: SocialLink[];
  year?: number;
  note?: string;
  showPreferences?: boolean;
  securityCenter?: boolean;
  privacyUrl?: string;
  termsUrl?: string;
  preferencesUrl?: string;
  securityUrl?: string;
  className?: string;
}

const defaultSocialIcons: Record<string, { icon: string; name: string }> = {
  facebook: {
    icon: "https://assets.orgatick.in/icons/facebook-logo.png",
    name: "Facebook",
  },
  x: {
    icon: "https://assets.orgatick.in/icons/x-logo.png",
    name: "X",
  },
  instagram: {
    icon: "https://assets.orgatick.in/icons/instagram-logo.png",
    name: "Instagram",
  },
  linkedin: {
    icon: "https://assets.orgatick.in/icons/linkedin-logo.png",
    name: "LinkedIn",
  },
  github: {
    icon: "https://assets.orgatick.in/icons/github-logo.png",
    name: "GitHub",
  },
};

/**
 * Rich ORGATICK Footer component with brand icon, company name, tagline,
 * social links row, address & contact information, and compliance links.
 */
export const EmailFooter = ({
  companyName = "Orgatick",
  tagline = "Smart, simple, and organized workflows.",
  logoUrl = "https://assets.orgatick.in/public/icons/icon-512.png",
  logoSize = 36,
  address,
  contactEmail = "support@orgatick.in",
  contactPhone,
  socialLinks = [
    { platform: "instagram", url: "https://instagram.com/orgatick.in" },
    { platform: "facebook", url: "https://facebook.com/orgatick" },
    { platform: "x", url: "https://x.com/orgatick" },
  ],
  year = 2026,
  note,
  showPreferences = true,
  securityCenter = false,
  privacyUrl = "https://orgatick.in/privacy",
  termsUrl = "https://orgatick.in/terms",
  preferencesUrl = "https://orgatick.in/settings/notifications",
  securityUrl = "https://orgatick.in/security",
  className = "",
}: EmailFooterProps) => {
  return (
    <Section
      className={`bg-background border-none border-t border-solid border-muted px-8 py-8 text-center ${className}`}
    >
      <table className="w-full" border={0} cellPadding={0} cellSpacing={0} role="presentation">
        {/* Brand Logo */}
        {logoUrl && (
          <tr className="w-full">
            <td align="center" className="pb-2">
              <Link href="https://orgatick.in" target="_blank">
                <Img
                  alt={`${companyName} logo`}
                  height={logoSize.toString()}
                  src={logoUrl}
                  width={logoSize.toString()}
                  className="rounded-lg mx-auto block"
                />
              </Link>
            </td>
          </tr>
        )}

        {/* Company Name & Tagline */}
        <tr className="w-full">
          <td align="center" className="pb-3">
            <Text className="my-[4px] font-bold text-[15px] text-foreground leading-[22px]">{companyName}</Text>
            {tagline && (
              <Text className="mt-[2px] mb-0 text-[13px] text-muted-foreground leading-[20px]">{tagline}</Text>
            )}
          </td>
        </tr>

        {/* Social Icons Row */}
        {socialLinks && socialLinks.length > 0 && (
          <tr>
            <td align="center" className="py-2">
              <table border={0} cellPadding={0} cellSpacing={0} role="presentation" className="mx-auto">
                <tr>
                  {socialLinks.map((social, index) => {
                    const iconMeta = defaultSocialIcons[social.platform];
                    const iconSrc = social.iconUrl || iconMeta?.icon;
                    const altName = iconMeta?.name || social.platform;

                    if (!iconSrc) return null;

                    return (
                      <td key={social.platform} className={index < socialLinks.length - 1 ? "pr-[10px]" : ""}>
                        <Link href={social.url} target="_blank">
                          <Img alt={altName} height="32" width="32" src={iconSrc} className="block" />
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              </table>
            </td>
          </tr>
        )}

        {/* Address & Contact Info */}
        {(address || contactEmail || contactPhone) && (
          <tr>
            <td align="center" className="pt-3 pb-2">
              {address && <Text className="my-[3px] text-[13px] text-muted-foreground leading-[20px]">{address}</Text>}
              {(contactEmail || contactPhone) && (
                <Text className="mt-[2px] mb-0 text-[13px] text-muted-foreground leading-[20px]">
                  {contactEmail && (
                    <Link href={`mailto:${contactEmail}`} className="text-primary underline">
                      {contactEmail}
                    </Link>
                  )}
                  {contactEmail && contactPhone && <span> &bull; </span>}
                  {contactPhone && <span>{contactPhone}</span>}
                </Text>
              )}
            </td>
          </tr>
        )}

        {/* Security / Transactional Custom Note */}
        {note && (
          <tr>
            <td align="center" className="pt-2">
              <Text className="text-[12px] leading-[18px] text-muted-foreground m-0">{note}</Text>
            </td>
          </tr>
        )}

        {/* Legal & Preferences Links */}
        <tr>
          <td align="center" className="pt-3">
            <Text className="text-[12px] leading-[18px] text-muted-foreground m-0">
              &copy; {year} {companyName}. All rights reserved.
            </Text>
            <Text className="text-[12px] leading-[18px] text-muted-foreground m-0 mt-1.5">
              <Link href={privacyUrl} target="_blank" className="text-muted-foreground underline mx-1.5">
                Privacy Policy
              </Link>
              &bull;
              <Link href={termsUrl} target="_blank" className="text-muted-foreground underline mx-1.5">
                Terms of Service
              </Link>
              {securityCenter && (
                <>
                  &bull;
                  <Link href={securityUrl} target="_blank" className="text-muted-foreground underline mx-1.5">
                    Security Center
                  </Link>
                </>
              )}
              {showPreferences && !securityCenter && (
                <>
                  &bull;
                  <Link href={preferencesUrl} target="_blank" className="text-muted-foreground underline mx-1.5">
                    Preferences
                  </Link>
                </>
              )}
            </Text>
          </td>
        </tr>
      </table>
    </Section>
  );
};

export default EmailFooter;
