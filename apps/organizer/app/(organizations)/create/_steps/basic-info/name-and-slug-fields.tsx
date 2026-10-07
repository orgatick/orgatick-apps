"use client";

import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { Field, FieldError, FieldLabel } from "@orgatick/ui/components/field";
import { Button } from "@orgatick/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orgatick/ui/components/input-group";
import { IconBuilding, IconLink, IconSparkles } from "@tabler/icons-react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NameAndSlugFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const organizationName = watch("basicInfo.name");
  const basicErrors = errors.basicInfo;

  const handleGenerateSlug = () => {
    if (organizationName) {
      const generated = slugify(organizationName);
      setValue("basicInfo.slug", generated, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field data-invalid={Boolean(basicErrors?.name)}>
        <FieldLabel htmlFor="basicInfo.name">
          Organization Name <span className="text-destructive">*</span>
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="basicInfo.name"
            placeholder="e.g. Acme Entertainment Group"
            aria-invalid={Boolean(basicErrors?.name)}
            {...register("basicInfo.name")}
          />
          <InputGroupAddon>
            <IconBuilding />
          </InputGroupAddon>
        </InputGroup>
        <FieldError errors={[basicErrors?.name]} />
      </Field>

      <Field data-invalid={Boolean(basicErrors?.slug)}>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor="basicInfo.slug">Public URL Slug</FieldLabel>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={handleGenerateSlug}
            className="h-auto p-0 text-primary"
          >
            <IconSparkles data-icon="inline-start" />
            Auto-fill
          </Button>
        </div>
        <InputGroup>
          <InputGroupInput
            id="basicInfo.slug"
            placeholder="e.g. acme-entertainment-group"
            aria-invalid={Boolean(basicErrors?.slug)}
            {...register("basicInfo.slug")}
          />
          <InputGroupAddon>
            <IconLink />
          </InputGroupAddon>
        </InputGroup>
        <FieldError errors={[basicErrors?.slug]} />
      </Field>
    </div>
  );
}
