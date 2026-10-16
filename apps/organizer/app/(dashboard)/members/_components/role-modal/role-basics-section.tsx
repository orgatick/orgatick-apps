"use client";

import { Field, FieldError, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { useRoleModalStore } from "./role-modal.store";

export function RoleBasicsSection() {
  const name = useRoleModalStore((s) => s.name);
  const description = useRoleModalStore((s) => s.description);
  const errors = useRoleModalStore((s) => s.errors);
  const setName = useRoleModalStore((s) => s.setName);
  const setDescription = useRoleModalStore((s) => s.setDescription);

  return (
    <div className="border-b border-border/50 bg-muted/20 px-4 sm:px-6 py-2.5 sm:py-3 shrink-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3.5 items-start">
        <div className="md:col-span-5">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="role-name" className="text-xs font-semibold text-foreground">
              Role Name <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance Officer, Speaker Liaison"
              maxLength={100}
              autoComplete="off"
              className="h-8 text-xs mt-1 bg-background"
            />
            {errors.name && <FieldError errors={[{ message: errors.name }]} className="text-[11px] mt-1" />}
          </Field>
        </div>

        <div className="md:col-span-7">
          <Field>
            <FieldLabel htmlFor="role-description" className="text-xs font-semibold text-foreground">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </FieldLabel>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly state intended duties or access boundaries…"
              maxLength={500}
              className="h-8 text-xs mt-1 bg-background"
            />
          </Field>
        </div>
      </div>
    </div>
  );
}
