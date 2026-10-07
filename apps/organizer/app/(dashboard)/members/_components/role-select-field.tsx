"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { AddOrganizationMember, OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { Field, FieldError, FieldLabel } from "@orgatick/ui/components/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";

interface RoleSelectFieldProps {
  control: Control<AddOrganizationMember>;
  roles: OrganizationRoleOptionResponse[];
}

export function RoleSelectField({ control, roles }: RoleSelectFieldProps) {
  const roleItems = Object.fromEntries(roles.map((r) => [r.key, r.name]));

  return (
    <Controller
      name="role"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="member-role">Assign Role</FieldLabel>
          <Select items={roleItems} value={field.value} onValueChange={(next) => field.onChange(next ?? "")}>
            <SelectTrigger id="member-role" size="sm" className="w-full" aria-invalid={fieldState.invalid}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.key}>
                  <span className="font-medium">{role.name}</span>
                  {role.description && <span className="ml-1 text-xs text-muted-foreground">({role.description})</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
