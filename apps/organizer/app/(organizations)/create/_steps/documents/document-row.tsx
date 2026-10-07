"use client";

import { useFormContext, Controller } from "react-hook-form";
import { type CreateOrganizationInput, OrganizationDocumentType } from "@orgatick/contracts";
import { Field, FieldError, FieldLabel, FieldDescription } from "@orgatick/ui/components/field";
import { Button } from "@orgatick/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orgatick/ui/components/select";
import { IconFileCheck, IconFileUpload, IconTrash, IconX } from "@tabler/icons-react";
import { DOCUMENT_TYPE_LABELS, formatFileSize } from "./document-constants";

interface DocumentRowProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
  onFileChange: (file: File | null) => void;
}

export function DocumentRow({ index, canRemove, onRemove, onFileChange }: DocumentRowProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const currentDoc = watch(`document.${index}`);
  const docFile = currentDoc?.file;
  const docErrors = Array.isArray(errors.document) ? errors.document[index] : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-foreground">Document {index + 1}</span>
        </div>

        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-muted-foreground hover:text-destructive"
          >
            <IconTrash className="size-4" />
            Remove
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(docErrors?.type)}>
          <FieldLabel>
            Document Type <span className="text-destructive">*</span>
          </FieldLabel>
          <Controller
            control={control}
            name={`document.${index}.type`}
            render={({ field: controllerField, fieldState }) => (
              <Select
                name={controllerField.name}
                value={String(controllerField.value ?? "")}
                onValueChange={controllerField.onChange}
              >
                <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(OrganizationDocumentType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {DOCUMENT_TYPE_LABELS[type]?.label || type}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldDescription>
            {DOCUMENT_TYPE_LABELS[currentDoc?.type as OrganizationDocumentType]?.desc}
          </FieldDescription>
          <FieldError errors={[docErrors?.type]} />
        </Field>

        <Field data-invalid={Boolean(docErrors?.file)}>
          <FieldLabel>Attach Document File</FieldLabel>
          <div>
            {docFile instanceof File ? (
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <IconFileCheck className="size-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{docFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatFileSize(docFile.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileChange(null)}
                  className="size-7 p-0 text-muted-foreground hover:text-destructive"
                  aria-label="Remove file"
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ) : (
              <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/20 px-3 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary">
                <IconFileUpload className="size-4" />
                <span>Upload PDF, DOC, or DOCX (Max 5MB)</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>
          <FieldError errors={[docErrors?.file]} />
        </Field>
      </div>
    </div>
  );
}
