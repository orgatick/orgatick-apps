"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import type { AdminOrganization } from "@/lib/types";
import { AdminMemberRow } from "./admin-member-row";
import { AddMemberForm, TransferForm } from "./admin-member-forms";

interface MembersPanelProps {
  organization: AdminOrganization;
}

export function MembersPanel({ organization }: MembersPanelProps) {
  const members = organization.members ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {members.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No members.</p>}
          {members.map((member) => (
            <AdminMemberRow key={member.id} organization={organization} member={member} />
          ))}
        </div>
        <AddMemberForm organization={organization} />
        <TransferForm organization={organization} />
      </CardContent>
    </Card>
  );
}
