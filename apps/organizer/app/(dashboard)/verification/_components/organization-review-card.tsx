import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Badge } from "@orgatick/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { IconCalendar, IconMail, IconMapPin, IconPhone, IconShieldCheck, IconWorld } from "@tabler/icons-react";
import type { SidebarOrganization } from "@/lib/sidebar/nav-config";
import { formatVerificationDate } from "./verification-types";

interface OrganizationReviewCardProps {
  membership: SidebarOrganization;
}

function buildAddress(address: SidebarOrganization["organization"]["address"]): string | null {
  if (!address) return null;
  if (address.formattedAddress) return address.formattedAddress;

  const parts = [address.addressLine1, address.addressLine2, address.landmark, address.postalCode].filter(
    (part): part is string => Boolean(part),
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

export function OrganizationReviewCard({ membership }: OrganizationReviewCardProps) {
  const { organization, role, joinedAt } = membership;
  const address = buildAddress(organization.address);
  const category = organization.subCategory?.name ?? organization.category?.name ?? null;
  const createdOn = formatVerificationDate(organization.createdAt);
  const joinedOn = formatVerificationDate(joinedAt);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Avatar className="size-11 rounded-xl">
            {organization.logo && <AvatarImage src={organization.logo} alt={organization.name} />}
            <AvatarFallback className="rounded-xl bg-primary/15 text-sm font-bold text-primary">
              {organization.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-semibold truncate">{organization.name}</CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className="gap-1 text-[10px] uppercase">
                <IconShieldCheck className="size-3" />
                {role.name}
              </Badge>
              {category && <span className="text-xs text-muted-foreground">· {category}</span>}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {organization.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{organization.description}</p>
        )}

        <div className="grid gap-3 text-xs sm:grid-cols-2">
          {organization.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconMail className="size-3.5 shrink-0 text-foreground/70" />
              <a href={`mailto:${organization.email}`} className="truncate hover:text-foreground">
                {organization.email}
              </a>
            </div>
          )}

          {organization.phoneNumber && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconPhone className="size-3.5 shrink-0 text-foreground/70" />
              <a href={`tel:${organization.phoneNumber}`} className="truncate hover:text-foreground">
                {organization.phoneNumber}
              </a>
            </div>
          )}

          {address && (
            <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
              <IconMapPin className="size-3.5 shrink-0 text-foreground/70 mt-0.5" />
              <span className="line-clamp-2">{address}</span>
            </div>
          )}

          {createdOn && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconCalendar className="size-3.5 shrink-0 text-foreground/70" />
              <span>Created {createdOn}</span>
            </div>
          )}

          {joinedOn && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconWorld className="size-3.5 shrink-0 text-foreground/70" />
              <span>Member since {joinedOn}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
