"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconUserPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { OrganizationRoleOptionResponse } from "@orgatick/contracts";
import { CreateOrganizationInvitationSchema, type CreateOrganizationInvitation } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@orgatick/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@orgatick/ui/components/field";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { handleApiError } from "@/lib/apis/api-error";
import { createTeamInvitation } from "@/lib/apis/organization.api";

interface InviteMemberDialogProps {
  roles: OrganizationRoleOptionResponse[];
}

export function InviteMemberDialog({ roles }: InviteMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const form = useForm<CreateOrganizationInvitation>({
    resolver: zodResolver(CreateOrganizationInvitationSchema),
    defaultValues: { email: "", role: "" },
  });

  const onSubmit = async (values: CreateOrganizationInvitation) => {
    try {
      await createTeamInvitation(values);
      toast.success("Invitation sent", {
        description: `${values.email} will receive an email with a link to join the organization.`,
      });
      form.reset({ email: "", role: "" });
      setOpen(false);
      router.refresh();
    } catch (error) {
      handleApiError(error, "Couldn't send the invitation. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          form.clearErrors();
        }
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" className="gap-2">
            <IconUserPlus className="size-4" />
            Invite member
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            They will get an email with a link to join. The invitation expires after 7 days.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    placeholder="teammate@example.com"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-role">Role</FieldLabel>
                  <Select
                    items={Object.fromEntries(roles.map((role) => [role.key, role.name]))}
                    value={field.value}
                    onValueChange={(next) => field.onChange(next ?? "")}
                  >
                    <SelectTrigger id="invite-role" size="sm" className="w-full" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.key}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending…" : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
