"use client";

import { useFormContext } from "react-hook-form";
import type { CreateOrganizationInput } from "@orgatick/contracts";
import { Field, FieldError, FieldLabel } from "@orgatick/ui/components/field";
import { Button } from "@orgatick/ui/components/button";
import { Badge } from "@orgatick/ui/components/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orgatick/ui/components/input-group";
import { PhoneInput } from "@orgatick/ui/components/phone-input";
import { IconCrown, IconMail, IconTrash, IconUser } from "@tabler/icons-react";

interface SupportContactItemProps {
  index: number;
  isPrimary: boolean;
  canRemove: boolean;
  onSetPrimary: () => void;
  onRemove: () => void;
}

export function SupportContactItem({ index, isPrimary, canRemove, onSetPrimary, onRemove }: SupportContactItemProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const contactError = Array.isArray(errors.supportContacts) ? errors.supportContacts[index] : undefined;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-foreground">Contact Person {index + 1}</span>
          {isPrimary && (
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
              <IconCrown className="size-3" />
              Primary Contact
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isPrimary && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSetPrimary}
              className="text-muted-foreground hover:text-primary"
            >
              Make Primary
            </Button>
          )}
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-destructive hover:bg-destructive/10"
            >
              <IconTrash className="size-4" />
              Remove
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field data-invalid={Boolean(contactError?.name)}>
          <FieldLabel>
            Full Name <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              placeholder="e.g. Sarah Connor"
              aria-invalid={Boolean(contactError?.name)}
              {...register(`supportContacts.${index}.name`)}
            />
            <InputGroupAddon>
              <IconUser className="size-4" />
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[contactError?.name]} />
        </Field>

        <Field data-invalid={Boolean(contactError?.email)}>
          <FieldLabel>
            Support Email <span className="text-destructive">*</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupInput
              type="email"
              placeholder="e.g. support@acme.com"
              aria-invalid={Boolean(contactError?.email)}
              {...register(`supportContacts.${index}.email`)}
            />
            <InputGroupAddon>
              <IconMail className="size-4" />
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[contactError?.email]} />
        </Field>

        <Field data-invalid={Boolean(contactError?.phoneNumber)}>
          <FieldLabel>
            Direct Phone <span className="text-destructive">*</span>
          </FieldLabel>
          <PhoneInput
            placeholder="e.g. +1 555-0123"
            aria-invalid={Boolean(contactError?.phoneNumber)}
            onChange={(input) => setValue(`supportContacts.${index}.phoneNumber`, input)}
          />
        </Field>
      </div>
    </div>
  );
}
