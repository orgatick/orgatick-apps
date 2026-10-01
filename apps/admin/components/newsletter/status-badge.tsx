import { Badge } from "@orgatick/ui/components/badge";
import { NewsletterStatus, NewsletterSubscriberStatus, NewsletterTemplateStatus } from "@orgatick/contracts";
import type { Icon } from "@tabler/icons-react";
import {
  IconAddressBook,
  IconCircleCheck,
  IconClockPause,
  IconFileDescription,
  IconMailForward,
  IconMailOpened,
  IconPlayerPause,
  IconSend,
  IconTemplate,
  IconUserCheck,
  IconUserX,
  IconX,
} from "@tabler/icons-react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface Tone {
  label: string;
  variant: BadgeVariant;
  icon?: Icon;
}

const CAMPAIGN_TONES: Record<NewsletterStatus, Tone> = {
  [NewsletterStatus.DRAFT]: { label: "Draft", variant: "secondary", icon: IconFileDescription },
  [NewsletterStatus.SCHEDULED]: { label: "Scheduled", variant: "outline", icon: IconClockPause },
  [NewsletterStatus.SENDING]: { label: "Sending", variant: "default", icon: IconSend },
  [NewsletterStatus.PAUSED]: { label: "Paused", variant: "outline", icon: IconPlayerPause },
  [NewsletterStatus.SENT]: { label: "Sent", variant: "default", icon: IconCircleCheck },
  [NewsletterStatus.CANCELLED]: { label: "Cancelled", variant: "secondary", icon: IconX },
  [NewsletterStatus.FAILED]: { label: "Failed", variant: "destructive", icon: IconX },
};

const SUBSCRIBER_TONES: Record<NewsletterSubscriberStatus, Tone> = {
  [NewsletterSubscriberStatus.PENDING]: { label: "Pending", variant: "outline", icon: IconClockPause },
  [NewsletterSubscriberStatus.SUBSCRIBED]: { label: "Subscribed", variant: "default", icon: IconUserCheck },
  [NewsletterSubscriberStatus.UNSUBSCRIBED]: { label: "Unsubscribed", variant: "secondary", icon: IconUserX },
  [NewsletterSubscriberStatus.BOUNCED]: { label: "Bounced", variant: "destructive", icon: IconX },
  [NewsletterSubscriberStatus.COMPLAINED]: { label: "Complained", variant: "destructive", icon: IconX },
};

const TEMPLATE_TONES: Record<NewsletterTemplateStatus, Tone> = {
  [NewsletterTemplateStatus.DRAFT]: { label: "Draft", variant: "secondary", icon: IconFileDescription },
  [NewsletterTemplateStatus.ACTIVE]: { label: "Active", variant: "default", icon: IconTemplate },
  [NewsletterTemplateStatus.ARCHIVED]: { label: "Archived", variant: "outline", icon: IconX },
};

const RECIPIENT_TONES: Record<string, Tone> = {
  queued: { label: "Queued", variant: "outline", icon: IconClockPause },
  sent: { label: "Sent", variant: "secondary", icon: IconSend },
  delivered: { label: "Delivered", variant: "default", icon: IconMailForward },
  opened: { label: "Opened", variant: "default", icon: IconMailOpened },
  clicked: { label: "Clicked", variant: "default", icon: IconMailOpened },
  bounced: { label: "Bounced", variant: "destructive", icon: IconX },
  complained: { label: "Complained", variant: "destructive", icon: IconX },
  unsubscribed: { label: "Unsubscribed", variant: "secondary", icon: IconUserX },
  failed: { label: "Failed", variant: "destructive", icon: IconX },
  skipped: { label: "Skipped", variant: "outline", icon: IconX },
};

export function CampaignStatusBadge({ status }: { status: NewsletterStatus }) {
  return <StatusPill tone={CAMPAIGN_TONES[status] ?? { label: status, variant: "secondary" }} />;
}

export function SubscriberStatusBadge({ status }: { status: NewsletterSubscriberStatus }) {
  return <StatusPill tone={SUBSCRIBER_TONES[status] ?? { label: status, variant: "secondary" }} />;
}

export function TemplateStatusBadge({ status }: { status: NewsletterTemplateStatus }) {
  return <StatusPill tone={TEMPLATE_TONES[status] ?? { label: status, variant: "secondary" }} />;
}

export function ListStatusBadge({ isActive, isDefault }: { isActive: boolean; isDefault: boolean }) {
  if (isDefault) return <StatusPill tone={{ label: "Default", variant: "default", icon: IconAddressBook }} />;
  return (
    <StatusPill
      tone={
        isActive
          ? { label: "Active", variant: "secondary", icon: IconCircleCheck }
          : { label: "Paused", variant: "outline", icon: IconClockPause }
      }
    />
  );
}

export function RecipientStatusBadge({ status }: { status: string }) {
  return <StatusPill tone={RECIPIENT_TONES[status] ?? { label: status, variant: "outline" }} />;
}

function StatusPill({ tone }: { tone: Tone }) {
  const Icon = tone.icon;

  return (
    <Badge variant={tone.variant} className="gap-1 text-[10px] font-medium uppercase tracking-wider">
      {Icon && <Icon className="size-3" />}
      {tone.label}
    </Badge>
  );
}

export const NEWSLETTER_STATUS_OPTIONS = Object.values(NewsletterStatus).map((status) => ({
  value: status,
  label: CAMPAIGN_TONES[status].label,
}));

export const SUBSCRIBER_STATUS_OPTIONS = Object.values(NewsletterSubscriberStatus).map((status) => ({
  value: status,
  label: SUBSCRIBER_TONES[status].label,
}));
