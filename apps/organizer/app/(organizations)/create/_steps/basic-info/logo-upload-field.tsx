"use client";

import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { FormSection } from "../../_components/form-section";
import { IconBuilding, IconUpload, IconX } from "@tabler/icons-react";
import Image from "next/image";

export function LogoUploadField() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentLogo = watch("basicInfo.logo");

  useEffect(() => {
    if (currentLogo instanceof File) {
      const objectUrl = URL.createObjectURL(currentLogo);
      setLogoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [currentLogo]);

  const handleLogoChange = (file: File | null) => {
    setLogoError(null);
    if (!file) {
      setValue("basicInfo.logo", null, { shouldValidate: true, shouldDirty: true });
      setLogoPreview(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Logo must not exceed 5MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Logo must be a JPEG, PNG, or WebP image");
      return;
    }
    setValue("basicInfo.logo", file, { shouldValidate: true, shouldDirty: true });
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const errorMsg = logoError || errors.basicInfo?.logo?.message;

  return (
    <FormSection
      title="Organization Logo"
      description="Upload a square logo (JPEG, PNG, or WebP) to display across your tickets, invoices, and organizer page. Optional, max 5MB."
    >
      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
        <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted shadow-xs">
          {logoPreview ? (
            <Image
              src={logoPreview}
              alt="Organization Logo"
              className="size-full object-cover"
              width={100}
              height={100}
            />
          ) : (
            <IconBuilding className="size-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Organization Logo</span>
            <span className="text-xs text-muted-foreground">(Optional, max 5MB)</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Upload a square logo to display across your tickets, invoices, and organizer page.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => handleLogoChange(e.target.files?.[0] || null)}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <IconUpload data-icon="inline-start" />
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </Button>
            {logoPreview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleLogoChange(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-destructive hover:bg-destructive/10"
              >
                <IconX data-icon="inline-start" />
                Remove
              </Button>
            )}
          </div>
          {errorMsg && <p className="text-xs text-destructive">{errorMsg}</p>}
        </div>
      </div>
    </FormSection>
  );
}
