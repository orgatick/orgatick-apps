"use client";

import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { Field, FieldError, FieldLabel, FieldDescription } from "@orgatick/ui/components/field";
import { PhoneInput } from "@orgatick/ui/components/phone-input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@orgatick/ui/components/input-group";
import { IconMail } from "@tabler/icons-react";

export function ContactAndBioFields() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const basicErrors = errors.basicInfo;
  const description = watch("basicInfo.description") || "";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(basicErrors?.email)}>
          <FieldLabel htmlFor="basicInfo.email">
            Official Organization Email <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="basicInfo.email"
              type="email"
              placeholder="e.g. contact@acme.com"
              aria-invalid={Boolean(basicErrors?.email)}
              {...register("basicInfo.email")}
            />
            <InputGroupAddon>
              <IconMail />
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[basicErrors?.email]} />
        </Field>

        <Field data-invalid={Boolean(basicErrors?.phoneNumber)}>
          <FieldLabel htmlFor="basicInfo.phoneNumber">
            Official Phone Number <span className="text-destructive">*</span>
          </FieldLabel>
          <PhoneInput
            id="basicInfo.phoneNumber"
            aria-invalid={Boolean(basicErrors?.phoneNumber)}
            onChange={(e) => setValue("basicInfo.phoneNumber", e, { shouldValidate: true, shouldDirty: true })}
          />
          <FieldError errors={[basicErrors?.phoneNumber]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(basicErrors?.description)}>
        <FieldLabel htmlFor="basicInfo.description">Organization Overview / Bio</FieldLabel>
        <InputGroup>
          <InputGroupTextarea
            id="basicInfo.description"
            placeholder="Describe your organization, past events, mission, and the community you serve..."
            rows={4}
            aria-invalid={Boolean(basicErrors?.description)}
            {...register("basicInfo.description")}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText className="tabular-nums">{description.length} / 5000</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Tell attendees and ticketing partners about your organization.</FieldDescription>
        <FieldError errors={[basicErrors?.description]} />
      </Field>
    </>
  );
}
