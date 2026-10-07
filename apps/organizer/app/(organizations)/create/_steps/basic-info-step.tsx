"use client";

import { FieldGroup } from "@orgatick/ui/components/field";
import { FormSection } from "../_components/form-section";
import { LogoUploadField } from "./basic-info/logo-upload-field";
import { NameAndSlugFields } from "./basic-info/name-and-slug-fields";
import { CategoryFields } from "./basic-info/category-fields";
import { ContactAndBioFields } from "./basic-info/contact-and-bio-fields";

export function BasicInfoStep() {
  return (
    <div className="flex flex-col gap-8">
      <LogoUploadField />

      <FormSection
        title="Organization Profile Details"
        description="Provide the legal name, official contact email, phone, and industry category for your organizer entity."
      >
        <FieldGroup className="gap-5">
          <NameAndSlugFields />
          <CategoryFields />
          <ContactAndBioFields />
        </FieldGroup>
      </FormSection>
    </div>
  );
}
