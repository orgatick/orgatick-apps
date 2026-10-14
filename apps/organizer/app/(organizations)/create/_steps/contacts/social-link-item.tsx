"use client";

import { useFormContext, Controller } from "react-hook-form";
import { type CreateOrganizationInput, OrganizationSocialPlatform } from "@orgatick/contracts";
import { Field, FieldError } from "@orgatick/ui/components/field";
import { Button } from "@orgatick/ui/components/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orgatick/ui/components/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@orgatick/ui/components/input-group";
import { IconTrash } from "@tabler/icons-react";
import { getSocialIcon } from "./social-links-section";

interface SocialLinkItemProps {
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}

export function SocialLinkItem({ index, canRemove, onRemove }: SocialLinkItemProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateOrganizationInput>();

  const currentPlatform = watch(`socialLinks.${index}.platform`) || OrganizationSocialPlatform.WEBSITE;
  const linkError = Array.isArray(errors.socialLinks) ? errors.socialLinks[index] : undefined;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs sm:flex-row sm:items-start">
      <div className="w-full shrink-0 sm:w-56">
        <Field data-invalid={Boolean(linkError?.platform)}>
          <Controller
            control={control}
            name={`socialLinks.${index}.platform`}
            render={({ field: controllerField, fieldState }) => (
              <Select
                name={controllerField.name}
                value={controllerField.value}
                onValueChange={controllerField.onChange}
              >
                <SelectTrigger className="w-full" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(OrganizationSocialPlatform).map((plat) => (
                      <SelectItem key={plat} value={plat}>
                        <div className="flex items-center gap-2">
                          {getSocialIcon(plat)}
                          <span className="capitalize">{plat.toLowerCase()}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[linkError?.platform]} />
        </Field>
      </div>

      <div className="min-w-0 flex-1">
        <Field data-invalid={Boolean(linkError?.url)}>
          <InputGroup>
            <InputGroupInput
              placeholder={`https://${currentPlatform.toLowerCase()}.com/yourhandle`}
              aria-invalid={Boolean(linkError?.url)}
              {...register(`socialLinks.${index}.url`)}
            />
            <InputGroupAddon>{getSocialIcon(currentPlatform)}</InputGroupAddon>
          </InputGroup>
          <FieldError errors={[linkError?.url]} />
        </Field>
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="size-9 shrink-0 p-0 text-muted-foreground hover:text-destructive"
          aria-label={`Remove link`}
        >
          <IconTrash className="size-4" />
        </Button>
      )}
    </div>
  );
}
