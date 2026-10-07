"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { type CreateOrganizationInput, OrganizationDocumentType } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { FormSection } from "../_components/form-section";
import { Badge } from "@orgatick/ui/components/badge";
import { Alert, AlertTitle, AlertDescription } from "@orgatick/ui/components/alert";
import { IconPlus, IconAlertCircle, IconFileCertificate } from "@tabler/icons-react";
import { DocumentRow } from "./documents/document-row";

export function DocumentsStep() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "document",
  });

  const documents = watch("document") || [];
  const documentErrors = errors.document;

  const handleAddDocument = () => {
    if (fields.length >= 5) return;
    const usedTypes = documents.map((d) => d.type);
    const allTypes = Object.values(OrganizationDocumentType);
    const nextType = allTypes.find((t) => !usedTypes.includes(t)) || OrganizationDocumentType.MSME;

    append({ type: nextType, file: null });
  };

  const handleFileChange = (index: number, file: File | null) => {
    setValue(`document.${index}.file`, file, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <FormSection
      title="Verification & Compliance Documents"
      description="Upload official regulatory documents to verify your business identity and activate payouts."
      action={
        <Badge variant="outline" className="w-fit gap-1 text-xs">
          <IconFileCertificate className="text-primary size-3.5" />
          <span>{documents.length} / 5 Documents</span>
        </Badge>
      }
    >
      <div className="flex flex-col gap-5">
        <Alert>
          <IconAlertCircle className="size-4" />
          <AlertTitle>Compliance Requirements</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-disc pl-4 text-xs text-muted-foreground">
              <li>Minimum of 2 valid verification documents required (maximum 5).</li>
              <li>Accepted formats: PDF, Word document (.doc, .docx).</li>
              <li>Maximum file size per document is 5 MB.</li>
            </ul>
          </AlertDescription>
        </Alert>

        {documentErrors && !Array.isArray(documentErrors) && documentErrors.message && (
          <Alert variant="destructive">
            <IconAlertCircle className="size-4" />
            <AlertTitle>{documentErrors.message}</AlertTitle>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <DocumentRow
              key={field.id}
              index={index}
              canRemove={fields.length > 2}
              onRemove={() => remove(index)}
              onFileChange={(file) => handleFileChange(index, file)}
            />
          ))}
        </div>

        {fields.length < 5 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddDocument}
            className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
          >
            <IconPlus data-icon="inline-start" />
            Add Another Document ({fields.length}/5)
          </Button>
        )}
      </div>
    </FormSection>
  );
}
