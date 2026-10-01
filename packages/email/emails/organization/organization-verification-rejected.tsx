import { Heading, Link, Row, Section, Text } from "react-email";
import {
  EmailAlert,
  EmailButton,
  EmailCard,
  EmailDivider,
  EmailFooter,
  EmailHeader,
  EmailInfoRow,
  EmailLayout,
} from "../components";

export type RejectionType = "missing_information" | "mismatch" | "other";

export interface OrganizationVerificationRejectedEmailProps {
  ownerName?: string;
  organizationName?: string;
  reason?: string;
  rejectionType?: RejectionType;
  canReapply?: boolean;
  reapplyUrl?: string;
  dashboardUrl?: string;
  adminEmail?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

const rejectionTypeLabels: Record<RejectionType, string> = {
  missing_information: "Missing Information",
  mismatch: "Information Mismatch",
  other: "Other",
};

export const OrganizationVerificationRejectedEmail = ({
  ownerName = "{{{ownerName}}}",
  organizationName = "{{{organizationName}}}",
  reason = "{{{reason}}}",
  rejectionType = "other",
  canReapply = true,
  reapplyUrl = "{{{reapplyUrl}}}",
  dashboardUrl = "{{{dashboardUrl}}}",
  adminEmail = "{{{adminEmail}}}",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: OrganizationVerificationRejectedEmailProps) => {
  const previewText = `Update on ${organizationName}: your verification request could not be approved.`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} />

      {/* Main Message */}
      <Section className="pt-2 pb-4 text-center px-2">
        <Heading as="h1" className="text-[24px] font-bold tracking-tight text-foreground m-0 mb-3">
          Organization Verification Rejected
        </Heading>
        <Text className="text-[15px] leading-[24px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{ownerName}</strong>, we were unable to verify{" "}
          <strong className="text-foreground">{organizationName}</strong> at this time. Don&apos;t worry - here&apos;s
          what happened and how you can resolve it.
        </Text>
      </Section>

      {/* Rejection Details Card */}
      <Section className="px-8 pb-4">
        <EmailCard variant="default">
          <Heading as="h2" className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground m-0 mb-3">
            Rejection Details
          </Heading>
          <EmailInfoRow label="Organization" value={organizationName} />
          <EmailInfoRow label="Issue type" value={rejectionTypeLabels[rejectionType]} />
          <EmailAlert type="destructive" title="Reason" className="mt-4 mb-0">
            {reason}
          </EmailAlert>
        </EmailCard>
      </Section>

      {/* Guidance */}
      <Section className="px-8 pb-4">
        <Heading as="h2" className="text-[17px] font-bold text-foreground m-0 mb-3">
          How to resolve this
        </Heading>
        <Text className="text-[14px] leading-[22px] text-muted-foreground m-0 mb-3">
          Please review the information you provided for your{" "}
          <strong className="text-foreground">{organizationName}</strong> verification request:
        </Text>
        <Section className="mb-2">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                &bull;
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Check for missing information
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Make sure all required fields and documents are complete and up to date.
              </Text>
            </td>
          </Row>
        </Section>
        <Section className="mb-3">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                &bull;
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Correct any mismatched details
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Ensure the details you provide match your official records and documents.
              </Text>
            </td>
          </Row>
        </Section>
      </Section>

      {/* Conditional Re-issue Option */}
      <Section className="px-8 pb-4">
        {canReapply ? (
          <>
            <EmailAlert type="info" title="You can re-apply for verification">
              Our administrators have allowed your organization to submit a new verification request. Right the
              information that was missing or mismatched, then re-issue your request. Our team will try to respond
              within 24 hours.
            </EmailAlert>
            <EmailButton href={reapplyUrl} variant="primary">
              Re-issue Verification Request &rarr;
            </EmailButton>
          </>
        ) : (
          <EmailAlert type="warning" title="Re-issue is not currently available">
            A decision on re-issuing your verification has been made by our administrators, and re-application is not
            allowed for this request. If you believe this is a mistake, please contact our team and we&apos;ll look into
            it.
          </EmailAlert>
        )}
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Contact */}
      <Section className="px-8 pb-8 pt-2">
        <EmailCard variant="muted" className="p-3.5 text-center">
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0">
            Need help with your application?{" "}
            {adminEmail ? (
              <>
                Contact us at{" "}
                <Link href={`mailto:${adminEmail}`} className="text-primary underline font-medium">
                  {adminEmail}
                </Link>
              </>
            ) : (
              <>
                Reach us at{" "}
                <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
                  {supportEmail}
                </Link>
              </>
            )}{" "}
            or{" "}
            <Link href={dashboardUrl} className="text-primary underline font-medium">
              visit your dashboard
            </Link>
            .
          </Text>
        </EmailCard>
      </Section>

      {/* Footer */}
      <EmailFooter
        companyName={companyName}
        year={year}
        note={`This is an update regarding the verification request for ${organizationName}.`}
      />
    </EmailLayout>
  );
};

OrganizationVerificationRejectedEmail.PreviewProps = {
  ownerName: "{{{ownerName}}}",
  organizationName: "{{{organizationName}}}",
  reason: "Some of the information provided was incomplete or mismatched with your official records.",
  rejectionType: "mismatch",
  canReapply: true,
  reapplyUrl: "{{{reapplyUrl}}}",
  dashboardUrl: "{{{dashboardUrl}}}",
  adminEmail: "{{{adminEmail}}}",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies OrganizationVerificationRejectedEmailProps;

export default OrganizationVerificationRejectedEmail;
