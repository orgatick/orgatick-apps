"use client";

import { useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import { Input } from "@orgatick/ui/components/input";
import { Label } from "@orgatick/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import type { AdminOrganization, MemberRoleKey } from "@/lib/types";
import { addOrganizationMember, transferOrganizationOwnership } from "@/lib/org-admin.api";
import { dangerButton, useOrgAction } from "../../_components/use-org-action";
import { ROLES } from "./admin-member-row";

export function AddMemberForm({ organization }: { organization: AdminOrganization }) {
  const { pending, run } = useOrgAction({ successMessage: "Member added" });
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<MemberRoleKey>("member");

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border/60 p-3">
      <div className="min-w-40 flex-1 space-y-1">
        <Label htmlFor="member-user-id" className="text-xs">
          User ID
        </Label>
        <Input
          id="member-user-id"
          type="number"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="e.g. 42"
        />
      </div>
      <div className="w-32 space-y-1">
        <Label className="text-xs">Role</Label>
        <Select value={role} onValueChange={(value) => setRole(value as MemberRoleKey)}>
          <SelectTrigger className="h-8 font-mono text-xs capitalize" aria-label="Role for new member">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((item) => (
              <SelectItem key={item} value={item} className="font-mono text-xs capitalize">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        size="sm"
        disabled={pending || !userId.trim()}
        onClick={() =>
          run(async () => {
            await addOrganizationMember(String(organization.id), Number(userId), role);
            setUserId("");
          })
        }
      >
        Add member
      </Button>
    </div>
  );
}

export function TransferForm({ organization }: { organization: AdminOrganization }) {
  const { pending, run } = useOrgAction({ successMessage: "Ownership transferred" });
  const [toUserId, setToUserId] = useState("");

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-destructive/30 p-3">
      <div className="min-w-40 flex-1 space-y-1">
        <Label htmlFor="owner-user-id" className="text-xs">
          New owner user ID
        </Label>
        <Input
          id="owner-user-id"
          type="number"
          value={toUserId}
          onChange={(event) => setToUserId(event.target.value)}
          placeholder="e.g. 42"
        />
      </div>
      <div className="flex-none">
        <Button
          variant="outline"
          size="sm"
          className={dangerButton}
          disabled={pending || !toUserId.trim()}
          onClick={() =>
            run(async () => {
              await transferOrganizationOwnership(String(organization.id), Number(toUserId));
              setToUserId("");
            })
          }
        >
          Transfer ownership
        </Button>
      </div>
    </div>
  );
}
