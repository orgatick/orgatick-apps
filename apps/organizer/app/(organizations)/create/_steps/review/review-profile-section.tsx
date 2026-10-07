"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { FormSection } from "../../_components/form-section";
import { Button } from "@orgatick/ui/components/button";
import { Separator } from "@orgatick/ui/components/separator";
import { IconBuilding, IconEdit } from "@tabler/icons-react";
import { CategoryNames } from "@/components/category-names";

interface ReviewProfileSectionProps {
  onEdit: () => void;
}

export function ReviewProfileSection({ onEdit }: ReviewProfileSectionProps) {
  const { watch } = useFormContext<CreateOrganizationInput>();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const basicInfo = watch("basicInfo");
  const logoFile = basicInfo?.logo;

  useEffect(() => {
    if (logoFile instanceof File) {
      const objectUrl = URL.createObjectURL(logoFile);
      setLogoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setLogoPreview(null);
  }, [logoFile]);

  return (
    <FormSection
      title={
        <span className="flex items-center gap-2">
          <IconBuilding className="size-4 text-primary" />
          Organization Profile
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
        <div className="flex items-start gap-4">
          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {logoPreview ? (
              // biome-ignore lint/performance/noImgElement: user-uploaded preview
              <img src={logoPreview} alt="Logo Preview" className="size-full object-cover" />
            ) : (
              <IconBuilding className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-foreground">{basicInfo?.name || "Untitled Organization"}</h4>
            {basicInfo?.slug && (
              <p className="font-mono text-xs text-muted-foreground">orgatick.com/{basicInfo.slug}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              <CategoryNames
                categoryId={(basicInfo?.categoryId as number | undefined) ?? null}
                subCategoryId={(basicInfo?.subCategoryId as number | undefined) ?? null}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className="text-xs text-muted-foreground">Official Email:</span>
            <p className="text-sm font-medium text-foreground">{basicInfo?.email || "—"}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Official Phone:</span>
            <p className="text-sm font-medium text-foreground">{basicInfo?.phoneNumber || "—"}</p>
          </div>
        </div>

        {basicInfo?.description && (
          <div>
            <span className="text-xs text-muted-foreground">Overview:</span>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{basicInfo.description}</p>
          </div>
        )}
      </div>
    </FormSection>
  );
}
