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
import { TeamInvitationsCard } from "./_components/team-invitations-card";
import { TeamMembersCard } from "./_components/team-members-card";

export const metadata: Metadata = {
  title: "Team | Orgatick Organizer",
  description: "Invite teammates, assign roles, and manage who can help run your organization.",
};

export default async function TeamPage() {
  const api = await serverApi();
  const membership = await getCurrentOrganization(api);

  if (!membership) redirect("/");

  const organization = membership.organization;

  const load = async <T,>(path: string): Promise<T | null> => {
    try {
      const response = await api.get(path);
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

  const permissionKeys = permissions?.permissions ?? [];
  const canView = permissions?.permissions.includes(TEAM_PERMISSIONS.view) ?? true;
  const canInvite = permissionKeys.includes(TEAM_PERMISSIONS.invite);
  const canUpdate = permissionKeys.includes(TEAM_PERMISSIONS.update);
  const canRemove = permissionKeys.includes(TEAM_PERMISSIONS.remove);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-1">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-[11px] font-semibold tracking-widest text-primary uppercase">Organization</p>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Team</h1>
        <p className="text-sm text-muted-foreground">
          Invite teammates and decide who can help manage{" "}
          <span className="font-medium text-foreground">{organization.name}</span>.
        </p>
      </div>

      {!canView ? (
        <Card>
          <CardContent>
            <Empty className="border border-border/60">
              <EmptyMedia variant="icon">
                <IconLock />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>You can&apos;t view the team roster</EmptyTitle>
                <EmptyDescription>
                  Ask an owner or admin of {organization.name} to give you a role with team access.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <TeamMembersCard
            members={members ?? []}
            roles={roles ?? []}
            canInvite={canInvite}
            canUpdate={canUpdate}
            canRemove={canRemove}
          />

          <TeamInvitationsCard
            invitations={invitations ?? []}
            roles={roles ?? []}
            canInvite={canInvite}
            canRemove={canRemove}
          />
        </>
      )}
    </div>
  );
}
