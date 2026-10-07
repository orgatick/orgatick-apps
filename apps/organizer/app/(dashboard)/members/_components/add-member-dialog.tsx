"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconMail, IconUserCheck, IconUserPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  AddOrganizationMemberSchema,
  type AddOrganizationMember,
  type OrganizationRoleOptionResponse,
} from "@orgatick/contracts";
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
import { handleApiError } from "@/lib/apis/api-error";
import { addDirectMember, createTeamInvitation } from "@/lib/apis/organization.api";
import { RoleSelectField } from "./role-select-field";

type AddMethod = "direct" | "invite";

interface AddMemberDialogProps {
  roles: OrganizationRoleOptionResponse[];
  trigger?: React.ReactNode;
  defaultMethod?: AddMethod;
}

export function AddMemberDialog({ roles, trigger, defaultMethod = "direct" }: AddMemberDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<AddMethod>(defaultMethod);

  const form = useForm<AddOrganizationMember>({
    resolver: zodResolver(AddOrganizationMemberSchema),
    defaultValues: { email: "", role: roles[0]?.key ?? "admin" },
  });

  const onSubmit = async (values: AddOrganizationMember) => {
    try {
      if (method === "direct") {
        await addDirectMember(values);
        toast.success("Member added successfully", {
          description: `${values.email} is now an active member of the organization.`,
        });
      } else {
        await createTeamInvitation(values);
        toast.success("Invitation sent", {
          description: `${values.email} will receive an email with a link to join.`,
        });
      }
      form.reset({ email: "", role: roles[0]?.key ?? "admin" });
      setOpen(false);
      router.refresh();
    } catch (error) {
      const fallback =
        method === "direct"
          ? "Couldn't add member. Make sure the user exists on Orgatick or use email invite instead."
          : "Couldn't send the invitation. Please try again.";
      toast.error(handleApiError(error, fallback));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.clearErrors();
        setOpen(next);
      }}
    >
      <DialogTrigger
        render={
          trigger ? (
            (trigger as React.ReactElement)
          ) : (
            <Button size="sm" className="gap-2">
              <IconUserPlus className="size-4" />
              Add member
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{method === "direct" ? "Add member directly" : "Invite member via email"}</DialogTitle>
          <DialogDescription>
            {method === "direct"
              ? "Directly adds a registered user to your organization roster with immediate access."
              : "Sends an email invitation link valid for 7 days so the recipient can join."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/60 p-1">
          <Button
            type="button"
            variant={method === "direct" ? "default" : "ghost"}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => setMethod("direct")}
          >
            <IconUserCheck className="size-3.5" />
            Direct Add
          </Button>
          <Button
            type="button"
            variant={method === "invite" ? "default" : "ghost"}
            size="sm"
            className="gap-1.5 text-xs font-semibold"
            onClick={() => setMethod("invite")}
          >
            <IconMail className="size-3.5" />
            Email Invite
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="member-email">Email address</FieldLabel>
                  <Input
                    {...field}
                    id="member-email"
                    type="email"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                    placeholder="teammate@example.com"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <RoleSelectField control={form.control} roles={roles} />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? method === "direct"
                  ? "Adding…"
                  : "Sending…"
                : method === "direct"
                  ? "Add member"
                  : "Send invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
