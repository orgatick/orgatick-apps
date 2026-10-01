import { Heading, Link, Row, Section, Text } from "react-email";
import { EmailButton, EmailCard, EmailDivider, EmailFooter, EmailHeader, EmailLayout } from "../components";

export interface WelcomeEmailProps {
  userName?: string;
  loginUrl?: string;
  supportEmail?: string;
  companyName?: string;
  year?: number;
}

export const WelcomeEmail = ({
  userName = "there",
  loginUrl = "https://orgatick.in/dashboard",
  supportEmail = "support@orgatick.in",
  companyName = "Orgatick",
  year = 2026,
}: WelcomeEmailProps) => {
  const previewText = `Welcome to ${companyName} – Let's get you set up!`;

  return (
    <EmailLayout previewText={previewText}>
      {/* Header / Logo */}
      <EmailHeader companyName={companyName} logoSize={64} />

      {/* Main Welcome Message */}
      <Section className="px-8 pt-2 pb-4 text-center">
        <Heading as="h1" className="text-[26px] font-bold tracking-tight text-foreground m-0 mb-3">
          Welcome to {companyName}!
        </Heading>
        <Text className="text-[16px] leading-[26px] text-muted-foreground m-0">
          Hi <strong className="text-foreground">{userName}</strong>, we&apos;re thrilled to have you on board. Your
          account is ready to go. Let&apos;s help you get started on your journey.
        </Text>
      </Section>

      {/* Primary Action Button */}
      <Section className="px-8 pb-4 text-center">
        <EmailButton href={loginUrl} variant="primary">
          Go to Your Dashboard &rarr;
        </EmailButton>
      </Section>

      <EmailDivider margin="my-2 mx-8" />

      {/* Getting Started Guide */}
      <Section className="px-8 py-6">
        <Heading as="h2" className="text-[17px] font-bold text-foreground m-0 mb-4">
          3 quick steps to get started:
        </Heading>

        <Section className="mb-3.5">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                1
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">
                Complete your profile
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Personalize your settings and set up your workspace preferences.
              </Text>
            </td>
          </Row>
        </Section>

        <Section className="mb-3.5">
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                2
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">Explore your tools</Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Discover our features designed to streamline your daily workflow.
              </Text>
            </td>
          </Row>
        </Section>

        <Section>
          <Row>
            <td className="w-[32px] align-top">
              <span className="w-6 h-6 rounded-full bg-accent-light text-primary font-bold text-[13px] flex items-center justify-center text-center block leading-6">
                3
              </span>
            </td>
            <td className="pl-3 align-top">
              <Text className="text-[14px] leading-[22px] text-foreground font-semibold m-0">Invite your team</Text>
              <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-0.5">
                Collaborate effortlessly by adding teammates to your workspace.
              </Text>
            </td>
          </Row>
        </Section>
      </Section>

      {/* Help & Resources Banner */}
      <Section className="px-8 pb-8">
        <EmailCard variant="muted" className="p-4">
          <Text className="text-[14px] leading-[22px] text-foreground m-0">
            <strong>Need a hand getting started?</strong>
          </Text>
          <Text className="text-[13px] leading-[20px] text-muted-foreground m-0 mt-1">
            Check out our{" "}
            <Link href="https://orgatick.in/docs" target="_blank" className="text-primary underline font-medium">
              documentation
            </Link>{" "}
            or simply reply to this email or reach us at{" "}
            <Link href={`mailto:${supportEmail}`} className="text-primary underline font-medium">
              {supportEmail}
            </Link>
            .
          </Text>
        </EmailCard>
      </Section>

      {/* Footer */}
      <EmailFooter companyName={companyName} year={year} showPreferences />
    </EmailLayout>
  );
};

WelcomeEmail.PreviewProps = {
  userName: "Alex",
  loginUrl: "https://orgatick.in/dashboard",
  supportEmail: "support@orgatick.in",
  companyName: "Orgatick",
  year: 2026,
} satisfies WelcomeEmailProps;

export default WelcomeEmail;
