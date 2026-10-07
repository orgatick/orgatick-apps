"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { FormSection } from "../../_components/form-section";
import { Badge } from "@orgatick/ui/components/badge";
import { IconPlus, IconUser } from "@tabler/icons-react";
import { SupportContactItem } from "./support-contact-item";

export function SupportContactsSection() {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control,
    name: "supportContacts",
  });

  const supportContacts = watch("supportContacts") || [];
  const contactErrors = errors.supportContacts;

  const handleAddContact = () => {
    if (contactFields.length >= 6) return;
    appendContact({
      name: "",
      email: "",
      phoneNumber: "",
      isPrimary: contactFields.length === 0,
    });
  };

  const handleSetPrimaryContact = (index: number) => {
    supportContacts.forEach((_, i) => {
      setValue(`supportContacts.${i}.isPrimary`, i === index, { shouldValidate: true, shouldDirty: true });
    });
  };

  return (
    <FormSection
      title="Support & Representative Contacts"
      description="Point of contact for customer support, ticket disputes, and event inquiries (min 1, max 6)."
      action={
        <Badge variant="outline" className="w-fit gap-1 text-xs">
          <IconUser className="text-primary size-3.5" />
          <span>{contactFields.length} / 6 Contacts</span>
        </Badge>
      }
    >
      <div className="flex flex-col gap-4">
        {contactErrors && !Array.isArray(contactErrors) && contactErrors.message && (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{contactErrors.message}</div>
        )}

        <div className="flex flex-col gap-4">
          {contactFields.map((field, index) => {
            const currentContact = supportContacts[index];
            const isPrimary = Boolean(currentContact?.isPrimary);

            return (
              <SupportContactItem
                key={field.id}
                index={index}
                isPrimary={isPrimary}
                canRemove={contactFields.length > 1}
                onSetPrimary={() => handleSetPrimaryContact(index)}
                onRemove={() => removeContact(index)}
              />
            );
          })}
        </div>

        {contactFields.length < 6 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddContact}
            className="w-full gap-2 border-dashed text-muted-foreground hover:text-foreground"
          >
            <IconPlus data-icon="inline-start" />
            Add Another Contact ({contactFields.length}/6)
          </Button>
        )}
      </div>
    </FormSection>
  );
}
