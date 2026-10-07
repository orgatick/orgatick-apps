"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { type CreateOrganizationInput, OrganizationSocialPlatform } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { FormSection } from "../../_components/form-section";
import { Badge } from "@orgatick/ui/components/badge";
import { IconPlus, IconShare, IconWorld } from "@tabler/icons-react";
import { SocialLinkItem } from "./social-link-item";

export function getSocialIcon(_platform: OrganizationSocialPlatform) {
  return <IconWorld className="size-4 text-primary" />;
}

export function SocialLinksSection() {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control,
    name: "socialLinks",
  });

  const socialLinks = watch("socialLinks") || [];
  const socialErrors = errors.socialLinks;

  const handleAddSocial = () => {
    if (socialFields.length >= 6) return;
    const usedPlatforms = socialLinks.map((s) => s.platform);
    const allPlatforms = Object.values(OrganizationSocialPlatform);
    const nextPlatform = allPlatforms.find((p) => !usedPlatforms.includes(p)) || OrganizationSocialPlatform.WEBSITE;

    appendSocial({ platform: nextPlatform, url: "" });
  };

  return (
    <FormSection
      title="Social Media & Online Presence"
      description="Connect your official web channels and social media handles (min 1, max 6)."
      action={
        <Badge variant="outline" className="w-fit gap-1 text-xs">
          <IconShare className="text-primary size-3.5" />
          <span>{socialFields.length} / 6 Links</span>
        </Badge>
      }
    >
      <div className="flex flex-col gap-4">
        {socialErrors && !Array.isArray(socialErrors) && socialErrors.message && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{socialErrors.message}</div>
        )}

        <div className="flex flex-col gap-3">
          {socialFields.map((field, index) => (
            <SocialLinkItem
              key={field.id}
              index={index}
              canRemove={socialFields.length > 1}
              onRemove={() => removeSocial(index)}
            />
          ))}
        </div>

        {socialFields.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSocial}
            className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
          >
            <IconPlus data-icon="inline-start" />
            Add Social Link ({socialFields.length}/6)
          </Button>
        )}
      </div>
    </FormSection>
  );
}
