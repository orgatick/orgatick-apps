"use client";

import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { FormSection } from "../../_components/form-section";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { IconMapPin, IconFileText, IconEdit } from "@tabler/icons-react";

interface ReviewAddressAndDocsProps {
  onEditAddress: () => void;
  onEditDocs: () => void;
}

export function ReviewAddressAndDocs({ onEditAddress, onEditDocs }: ReviewAddressAndDocsProps) {
  const { watch } = useFormContext<CreateOrganizationInput>();
  const address = watch("address");
  const documents = watch("document") || [];

  return (
    <>
      <FormSection
        title={
          <span className="flex items-center gap-2">
            <IconMapPin className="size-4 text-primary" />
            Registered Office Address
          </span>
        }
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditAddress}
            className="text-primary hover:bg-primary/10"
          >
            <IconEdit data-icon="inline-start" />
            Edit
          </Button>
        }
      >
        <div className="flex flex-col gap-1.5 text-sm">
          <p className="font-medium text-foreground">{address?.addressLine1 || "—"}</p>
          {address?.addressLine2 && <p className="text-muted-foreground">{address.addressLine2}</p>}
          {address?.landmark && <p className="text-muted-foreground">Landmark: {address.landmark}</p>}
          {address?.postalCode && <p className="text-muted-foreground">Postal Code: {address.postalCode}</p>}
        </div>
      </FormSection>

      <FormSection
        title={
          <span className="flex items-center gap-2">
            <IconFileText className="size-4 text-primary" />
            Verification Documents ({documents.length})
          </span>
        }
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEditDocs}
            className="text-primary hover:bg-primary/10"
          >
            <IconEdit data-icon="inline-start" />
            Edit
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          {documents.map((doc) => {
            const hasFile = doc.file instanceof File;
            return (
              <div
                key={doc.type}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-foreground">{doc.type}</span>
                  {hasFile ? (
                    <span className="text-xs text-muted-foreground">({(doc.file as File).name})</span>
                  ) : (
                    <span className="text-xs italic text-muted-foreground">(No file attached)</span>
                  )}
                </div>
                {hasFile ? (
                  <Badge variant="secondary">Attached</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Pending
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </FormSection>
    </>
  );
}
