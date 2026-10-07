import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IconLock } from "@tabler/icons-react";
import type {
  EffectivePermissionsResponse,
  OrganizationInvitationResponse,
  OrganizationMemberResponse,
  OrganizationRoleOptionResponse,
} from "@orgatick/contracts";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import serverApi from "@/lib/apis/server-auth-api";
import { TEAM_PERMISSIONS } from "@/lib/apis/organization.api";
import { getCurrentOrganization } from "@/lib/organization/current-organization";
import { MembersContainer } from "./_components/members-container";
import { MembersHeader } from "./_components/members-header";

export const metadata: Metadata = {
  title: "Members | Orgatick Organizer",
  description: "Manage organization members, assign roles, and handle team invitations.",
};

const DEFAULT_ROLES: OrganizationRoleOptionResponse[] = [
  { id: "admin", key: "admin", name: "Admin", description: "Full operational access" },
  { id: "event_manager", key: "event_manager", name: "Event Manager", description: "Manage events and attendees" },
  { id: "volunteer", key: "volunteer", name: "Volunteer", description: "Check-in and assistance" },
];

export default async function MembersPage() {
  const api = await serverApi();
  const membership = await getCurrentOrganization(api);

  if (!membership) redirect("/");

  const organization = membership.organization;

  const load = async <T,>(path: string): Promise<T | null> => {
    try {
      const response = await api.get(path, {
        headers: { "x-organization-id": String(organization.id) },
      });
      return (response.data?.data ?? null) as T | null;
    } catch {
      return null;
    }
  };

  const [members, roles, invitations, permissions] = await Promise.all([
    load<OrganizationMemberResponse[]>("/organizations/current/members"),
    load<OrganizationRoleOptionResponse[]>("/organizations/current/roles"),
    load<OrganizationInvitationResponse[]>("/organizations/current/invitations"),
    load<EffectivePermissionsResponse>("/organizations/current/permissions"),
  ]);

  const roleKey = membership.role?.key?.toLowerCase();
  const isOwnerOrAdmin = roleKey === "owner" || roleKey === "admin" || !roleKey;
  const permissionKeys = permissions?.permissions ?? [];

  const canView = isOwnerOrAdmin || (permissions?.permissions.includes(TEAM_PERMISSIONS.view) ?? true);
  const canInvite = isOwnerOrAdmin || permissionKeys.includes(TEAM_PERMISSIONS.invite) || permissionKeys.length === 0;
  const canUpdate = isOwnerOrAdmin || permissionKeys.includes(TEAM_PERMISSIONS.update) || permissionKeys.length === 0;
  const canRemove = isOwnerOrAdmin || permissionKeys.includes(TEAM_PERMISSIONS.remove) || permissionKeys.length === 0;

  const effectiveRoles = roles && roles.length > 0 ? roles : DEFAULT_ROLES;

  return (
    <div className="flex min-h-full w-full flex-col gap-6">
      <MembersHeader organizationName={organization.name} roles={effectiveRoles} canInvite={canInvite} />

      {!canView ? (
        <Card className="border-border/60">
          <CardContent>
            <Empty className="py-12 border border-border/40">
              <EmptyMedia variant="icon">
                <IconLock className="size-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>You can&apos;t view organization members</EmptyTitle>
                <EmptyDescription>
                  Ask an owner or administrator of {organization.name} to grant you member view access.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <MembersContainer
          members={members ?? []}
          roles={effectiveRoles}
          invitations={invitations ?? []}
          canInvite={canInvite}
          canUpdate={canUpdate}
          canRemove={canRemove}
        />
      )}
    </div>
  );
}
