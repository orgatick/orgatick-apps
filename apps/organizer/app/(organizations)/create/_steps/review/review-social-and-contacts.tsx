"use client";

import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { FormSection } from "../../_components/form-section";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Separator } from "@orgatick/ui/components/separator";
import { IconShare, IconEdit, IconCrown } from "@tabler/icons-react";
import { getSocialIcon } from "../contacts/social-links-section";

interface ReviewSocialAndContactsProps {
  onEdit: () => void;
}

export function ReviewSocialAndContacts({ onEdit }: ReviewSocialAndContactsProps) {
  const { watch } = useFormContext<CreateOrganizationInput>();
  const socialLinks = watch("socialLinks") || [];
  const supportContacts = watch("supportContacts") || [];

  return (
    <FormSection
      title={
        <span className="flex items-center gap-2">
          <IconShare className="size-4 text-primary" />
          Social Links & Support Team
        </span>
      }
      action={
        <Button type="button" variant="ghost" size="sm" onClick={onEdit} className="text-primary hover:bg-primary/10">
          <IconEdit data-icon="inline-start" />
          Edit
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <span className="mb-2 block text-xs font-semibold text-foreground">Connected Channels</span>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((s) => (
              <div
                key={s.platform}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 shadow-2xs text-xs"
              >
                {getSocialIcon(s.platform)}
                <span className="font-medium capitalize text-foreground">{s.platform}:</span>
                <span className="max-w-[150px] truncate text-primary">{s.url || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <span className="mb-2 block text-xs font-semibold text-foreground">Support Contacts</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {supportContacts.map((contact) => (
              <div
                key={contact.name || contact.email}
                className="flex flex-col gap-1 rounded-lg border border-border bg-muted/20 p-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{contact.name || "—"}</span>
                  {contact.isPrimary && (
                    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                      <IconCrown className="size-3" />
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{contact.email || "—"}</p>
                <p className="text-muted-foreground">{contact.phoneNumber || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
}
