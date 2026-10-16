import type React from "react";
import {
  IconBuilding,
  IconCalendar,
  IconCertificate,
  IconChartBar,
  IconFileText,
  IconFolder,
  IconMail,
  IconMicrophone,
  IconNews,
  IconQrcode,
  IconSettings,
  IconShare,
  IconTicket,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";

export interface CategoryMeta {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CATEGORY_MAP: Record<string, CategoryMeta> = {
  event: { label: "Events", icon: IconCalendar },
  ticket: { label: "Tickets & Pricing", icon: IconTicket },
  registration: { label: "Registrations", icon: IconUserCheck },
  session: { label: "Sessions & Agenda", icon: IconMicrophone },
  checkin: { label: "Check-in & Scanning", icon: IconQrcode },
  certificate: { label: "Certificates & Badges", icon: IconCertificate },
  referral: { label: "Referral Program", icon: IconShare },
  analytics: { label: "Analytics & Reports", icon: IconChartBar },
  communication: { label: "Communications", icon: IconMail },
  newsletter: { label: "Newsletters", icon: IconNews },
  organization: { label: "Organization Profile", icon: IconBuilding },
  organization_member: { label: "Team & Members", icon: IconUsers },
  organization_setting: { label: "Settings & Payouts", icon: IconSettings },
  organization_document: { label: "Verification Documents", icon: IconFileText },
};

export function getCategoryMeta(key: string): CategoryMeta {
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  const formatted = key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  return { label: formatted, icon: IconFolder };
}
