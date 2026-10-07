"use client";

import { useFormContext, Controller } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { Field, FieldError, FieldLabel, FieldDescription } from "@orgatick/ui/components/field";
import { CategorySelect } from "@/components/category-select";

export function CategoryFields() {
  const { control, watch, setValue, clearErrors } = useFormContext<CreateOrganizationInput>();

  const selectedCategoryId = (watch("basicInfo.categoryId") as number | undefined) ?? undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name="basicInfo.categoryId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="basicInfo.categoryId">Primary Industry Category</FieldLabel>
            <CategorySelect
              id="basicInfo.categoryId"
              value={(field.value as number | null | undefined) ?? null}
              onValueChange={(id) => {
                field.onChange(id);
                setValue("basicInfo.subCategoryId", undefined as never, {
                  shouldValidate: false,
                  shouldDirty: true,
                });
                clearErrors("basicInfo.subCategoryId");
              }}
              level={1}
              placeholder="Select a category"
              ariaInvalid={fieldState.invalid}
            />
            <FieldDescription>Choose the primary sector your events fall under.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="basicInfo.subCategoryId"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="basicInfo.subCategoryId">
              Sub-Category <span className="text-destructive">*</span>
            </FieldLabel>
            <CategorySelect
              id="basicInfo.subCategoryId"
              value={(field.value as number | null | undefined) ?? null}
              onValueChange={field.onChange}
              level={2}
              parentId={selectedCategoryId}
              placeholder="Select a sub-category"
              disabled={!selectedCategoryId}
              disabledReason={!selectedCategoryId ? "Select a primary category first" : null}
              ariaInvalid={fieldState.invalid}
            />
            <FieldDescription>Specialized domain for better event discovery.</FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  );
}
