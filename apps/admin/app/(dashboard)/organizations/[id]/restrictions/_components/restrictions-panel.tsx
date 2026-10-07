"use client";

import { useState } from "react";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orgatick/ui/components/card";
import { Checkbox } from "@orgatick/ui/components/checkbox";
import { Label } from "@orgatick/ui/components/label";
import { Textarea } from "@orgatick/ui/components/textarea";
import type { AdminOrganization, RestrictedCapability } from "@/lib/types";
import { removeOrganizationCapabilityRestrictions, restrictOrganizationCapabilities } from "@/lib/org-admin.api";
import { useOrgAction } from "../../_components/use-org-action";

interface RestrictionsPanelProps {
  organization: AdminOrganization;
}

const CAPABILITIES: Array<{ value: RestrictedCapability; label: string }> = [
  { value: "event_creation", label: "Event creation" },
  { value: "registrations", label: "Registrations" },
  { value: "ticket_sales", label: "Ticket sales" },
  { value: "invitations", label: "Invitations" },
];

export function RestrictionsPanel({ organization }: RestrictionsPanelProps) {
  const { pending, run } = useOrgAction({ successMessage: "Restrictions updated" });
  const [selected, setSelected] = useState<RestrictedCapability[]>([]);
  const [reason, setReason] = useState("");
  const state = organization.adminState;
  const id = String(organization.id);
  const restricted = state?.restrictedCapabilities ?? [];

  const toggle = (capability: RestrictedCapability) =>
    setSelected((current) =>
      current.includes(capability) ? current.filter((item) => item !== capability) : [...current, capability],
    );

  const clearSelection = () => {
    setSelected([]);
    setReason("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Capability restrictions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Currently restricted</p>
          {restricted.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {restricted.map((capability) => (
                <span
                  key={capability}
                  className="rounded-full bg-destructive/10 px-2.5 py-0.5 font-mono text-[11px] capitalize text-destructive"
                >
                  {capability.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No capabilities are restricted.</p>
          )}
          {state?.restrictionsReason && (
            <p className="pt-1 text-xs text-muted-foreground">
              Reason: <span className="italic">{state.restrictionsReason}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Select capabilities</Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CAPABILITIES.map((capability) => {
              const alreadyRestricted = restricted.includes(capability.value);
              const checked = alreadyRestricted || selected.includes(capability.value);
              return (
                <label
                  key={capability.value}
                  htmlFor={`restrict-${capability.value}`}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    id={`restrict-${capability.value}`}
                    checked={checked}
                    disabled={alreadyRestricted}
                    onCheckedChange={() => toggle(capability.value)}
                  />
                  <span className="capitalize">{capability.label}</span>
                  {alreadyRestricted && (
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">active</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="restrictions-reason">Reason</Label>
          <Textarea
            id="restrictions-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why are these capabilities being restricted?"
            rows={2}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
            disabled={pending || selected.length === 0 || reason.trim().length < 3}
            onClick={() =>
              run(() => restrictOrganizationCapabilities(id, selected, reason.trim()).then(() => clearSelection()))
            }
          >
            Apply restrictions
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pending || restricted.length === 0 || selected.length === 0}
            onClick={() =>
              run(() => removeOrganizationCapabilityRestrictions(id, selected).then(() => clearSelection()))
            }
          >
            Remove selected
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
