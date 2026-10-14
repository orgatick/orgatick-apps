"use client";

import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { ImageUpload } from "@orgatick/ui/components/image-upload";
import { IconBuilding } from "@tabler/icons-react";
import { FormSection } from "../../_components/form-section";

export function LogoUploadField() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const currentLogo = watch("basicInfo.logo");

  const handleLogoChange = (file: File | null) => {
    setValue("basicInfo.logo", file, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <FormSection
      title="Organization Logo"
      description="Upload a square logo (JPEG, PNG, or WebP) to display across tickets, invoices, and your organizer profile. Optional, max 5MB."
    >
      <ImageUpload
        value={currentLogo}
        onChange={handleLogoChange}
        aspectRatio={1}
        cropShape="rect"
        maxSizeMB={5}
        label="Organization Logo"
        helperText="Drag & drop or click to upload. You can zoom, rotate, and frame your logo before saving."
        placeholderIcon={<IconBuilding className="size-8 text-muted-foreground" />}
        error={errors.basicInfo?.logo?.message}
      />
    </FormSection>
  );
}
