import type { SidebarOrganization } from "@/lib/sidebar/nav-config";

export interface VerificationReadinessItem {
  key: string;
  label: string;
  isComplete: boolean;
  value?: string | null;
  helperText: string;
}

export function computeReadinessItems(organization: SidebarOrganization["organization"]): {
  items: VerificationReadinessItem[];
  completedCount: number;
  totalCount: number;
  scorePercentage: number;
} {
  const hasAddress = Boolean(
    organization.address?.formattedAddress || organization.address?.addressLine1 || organization.address?.postalCode,
  );

  const items: VerificationReadinessItem[] = [
    {
      key: "name",
      label: "Official Organization Name",
      isComplete: Boolean(organization.name && organization.name.trim().length > 0),
      value: organization.name,
      helperText: "Primary legal or trade name for compliance.",
    },
    {
      key: "category",
      label: "Primary Industry & Category",
      isComplete: Boolean(organization.category?.name || organization.subCategory?.name),
      value: organization.subCategory?.name ?? organization.category?.name ?? null,
      helperText: "Categorizes the types of events and activities hosted.",
    },
    {
      key: "email",
      label: "Verified Contact Email",
      isComplete: Boolean(organization.email?.includes("@")),
      value: organization.email,
      helperText: "Official email for critical compliance communications.",
    },
    {
      key: "phone",
      label: "Contact Phone Number",
      isComplete: Boolean(organization.phoneNumber && organization.phoneNumber.trim().length > 0),
      value: organization.phoneNumber,
      helperText: "Used for urgent identity and organizer verification.",
    },
    {
      key: "address",
      label: "Physical Registered Address",
      isComplete: hasAddress,
      value: organization.address?.formattedAddress ?? organization.address?.addressLine1 ?? null,
      helperText: "Required for fiscal compliance and automated payouts.",
    },
    {
      key: "logo",
      label: "Brand Logo & Visual Identity",
      isComplete: Boolean(organization.logo && organization.logo.trim().length > 0),
      value: organization.logo ? "Uploaded" : null,
      helperText: "Builds attendee trust on verified event tickets.",
    },
  ];

  const completedCount = items.filter((i) => i.isComplete).length;
  const totalCount = items.length;
  const scorePercentage = Math.round((completedCount / totalCount) * 100);

  return { items, completedCount, totalCount, scorePercentage };
}

export function formatVerificationDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
