"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { type CreateOrganizationInput, OrganizationSocialPlatform } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { FormSection } from "../../_components/form-section";
import { Badge } from "@orgatick/ui/components/badge";
import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
  IconPlus,
  IconShare,
  IconWorld,
} from "@tabler/icons-react";
import { SocialLinkItem } from "./social-link-item";

export function getSocialIcon(platform: OrganizationSocialPlatform) {
  switch (platform) {
    case OrganizationSocialPlatform.WEBSITE:
      return <IconWorld className="size-4 text-primary" />;
    case OrganizationSocialPlatform.TWITTER:
      return <IconBrandX className="size-4 text-foreground" />;
    case OrganizationSocialPlatform.INSTAGRAM:
      return <IconBrandInstagram className="size-4 text-primary" />;
    case OrganizationSocialPlatform.FACEBOOK:
      return <IconBrandFacebook className="size-4 text-primary" />;
    case OrganizationSocialPlatform.LINKEDIN:
      return <IconBrandLinkedin className="size-4 text-primary" />;
    case OrganizationSocialPlatform.YOUTUBE:
      return <IconBrandYoutube className="size-4 text-destructive" />;
    case OrganizationSocialPlatform.GITHUB:
      return <IconBrandGithub className="size-4 text-foreground" />;
    case OrganizationSocialPlatform.DISCORD:
      return <IconBrandDiscord className="size-4 text-primary" />;
    case OrganizationSocialPlatform.TELEGRAM:
      return <IconBrandTelegram className="size-4 text-primary" />;
    default:
      return <IconLink className="size-4 text-muted-foreground" />;
  }
}

const POPULAR_PLATFORMS = [
  { platform: OrganizationSocialPlatform.WEBSITE, label: "Website" },
  { platform: OrganizationSocialPlatform.INSTAGRAM, label: "Instagram" },
  { platform: OrganizationSocialPlatform.LINKEDIN, label: "LinkedIn" },
  { platform: OrganizationSocialPlatform.TWITTER, label: "X / Twitter" },
  { platform: OrganizationSocialPlatform.YOUTUBE, label: "YouTube" },
];

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
  const usedPlatforms = socialLinks.map((s) => s.platform);

  const handleAddSocial = () => {
    if (socialFields.length >= 6) return;
    const allPlatforms = Object.values(OrganizationSocialPlatform);
    const nextPlatform = allPlatforms.find((p) => !usedPlatforms.includes(p)) || OrganizationSocialPlatform.WEBSITE;

    appendSocial({ platform: nextPlatform, url: "" });
  };

  const unaddedPopular = POPULAR_PLATFORMS.filter((p) => !usedPlatforms.includes(p.platform));

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

        {unaddedPopular.length > 0 && socialFields.length < 6 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick add:
            </span>
            {unaddedPopular.slice(0, 4).map((p) => (
              <Button
                key={p.platform}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendSocial({ platform: p.platform, url: "" })}
                className="h-7 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                {getSocialIcon(p.platform)}
                <span>+ {p.label}</span>
              </Button>
            ))}
          </div>
        )}

        {socialFields.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSocial}
            className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
          >
            <IconPlus data-icon="inline-start" />
            Add Another Social Link ({socialFields.length}/6)
          </Button>
        )}
      </div>
    </FormSection>
  );
}
