"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { CategoryNames } from "@/components/category-names";
import { IconBuilding, IconEye, IconMapPin } from "@tabler/icons-react";
import { getSocialIcon } from "../_steps/contacts/social-links-section";

export function OrganizationLivePreview() {
  const { watch } = useFormContext<CreateOrganizationInput>();
  const basicInfo = watch("basicInfo");
  const address = watch("address");
  const documents = watch("document") || [];
  const socialLinks = watch("socialLinks") || [];
  const supportContacts = watch("supportContacts") || [];

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (basicInfo?.logo instanceof File) {
      const url = URL.createObjectURL(basicInfo.logo);
      setLogoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setLogoPreview(null);
  }, [basicInfo?.logo]);

  // Calculate section completion counts
  const hasBasicInfo = Boolean(basicInfo?.name?.trim() && basicInfo?.email?.trim() && basicInfo?.phoneNumber?.trim());
  const hasAddress = Boolean(address?.addressLine1?.trim());
  const hasDocuments = documents.some((d) => d.file instanceof File);
  const hasContacts =
    socialLinks.some((s) => Boolean(s.url?.trim())) || supportContacts.some((c) => Boolean(c.name?.trim()));
  const completedCount = [hasBasicInfo, hasAddress, hasDocuments, hasContacts].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-4 shadow-xs backdrop-blur-xs">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <IconEye className="size-3.5 text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Live Organizer Card
          </span>
        </div>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background/80 p-3.5 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted shadow-2xs">
            {logoPreview ? (
              // biome-ignore lint/performance/noImgElement: user-uploaded preview
              <img src={logoPreview} alt="Organization Logo" className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center font-mono text-sm font-bold text-muted-foreground">
                {basicInfo?.name?.slice(0, 2).toUpperCase() || <IconBuilding className="size-5" />}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-foreground">
              {basicInfo?.name?.trim() || "Your Organization"}
            </h4>
            <p className="truncate font-mono text-[11px] text-primary">
              orgatick.com/{basicInfo?.slug?.trim() || "your-slug"}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              <CategoryNames
                categoryId={(basicInfo?.categoryId as number | undefined) ?? null}
                subCategoryId={(basicInfo?.subCategoryId as number | undefined) ?? null}
              />
            </div>
          </div>
        </div>

        {basicInfo?.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{basicInfo.description}</p>
        ) : (
          <p className="text-xs italic text-muted-foreground/70">
            Tell your attendees about your events, music festivals, and community.
          </p>
        )}

        <div className="flex flex-col gap-1.5 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 truncate">
            <IconMapPin className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {address?.addressLine1 ? (
                <>
                  {address.addressLine1}
                  {address.postalCode ? `, ${address.postalCode}` : ""}
                </>
              ) : (
                "Address not set yet"
              )}
            </span>
          </div>

          {socialLinks.length > 0 && socialLinks.some((s) => s.url) && (
            <div className="flex items-center gap-1 pt-0.5">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Links:</span>
              <div className="flex items-center gap-1">
                {socialLinks
                  .filter((s) => s.url)
                  .slice(0, 4)
                  .map((s) => (
                    <span
                      key={s.platform}
                      className="flex size-5 items-center justify-center rounded-md border border-border/50 bg-muted/40"
                      title={s.platform}
                    >
                      {getSocialIcon(s.platform)}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>Application readiness:</span>
        <span className="font-mono text-[11px] font-semibold text-primary">{completedCount}/4 sections</span>
      </div>
    </div>
  );
}
