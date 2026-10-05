"use client";

import {
  NewsletterSubscriberStatus,
  SubscribeNewsletterSchema,
  type NewsletterListResponse,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { IconPlus } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { addNewsletterSubscriber } from "@/lib/newsletter.api";

/**
 * Client-side slice of the public subscribe contract. `source` is forced to admin server side, and
 * the optional fields become plain strings here so empty inputs stay valid.
 */
const AddSubscriberFormSchema = SubscribeNewsletterSchema.pick({ email: true, name: true, list: true });

type AddSubscriberFormValues = z.infer<typeof AddSubscriberFormSchema>;

/** Sentinel for "let the backend pick the platform default list". */
const DEFAULT_LIST = "__default__";

interface AddSubscriberDialogProps {
  lists: NewsletterListResponse[];
  /** Slug preselected when the dialog opens, used when adding to one specific list. */
  defaultListSlug?: string;
  /** Leave uncontrolled to let the component own its open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Trigger rendered inside the dialog, for example a toolbar button. */
  trigger?: React.ReactElement;
}

/**
 * Adds a subscriber to a mailing list.
 *
 * The add goes through the same double opt-in as the public signup form, so the address has to
 * click the confirmation link before any campaign reaches them. The status switch on the
 * subscribers table is the deliberate override when consent is already on file.
 */
export function AddSubscriberDialog({ lists, defaultListSlug, open, onOpenChange, trigger }: AddSubscriberDialogProps) {
  const router = useRouter();
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlled ? open : internalOpen;

  const activeLists = lists.filter((list) => list.isActive);

  const form = useForm<AddSubscriberFormValues>({
    resolver: zodResolver(AddSubscriberFormSchema),
    mode: "onSubmit",
    defaultValues: { email: "", name: "", list: DEFAULT_LIST },
  });

  const setOpen = (next: boolean) => {
    if (!controlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  // Re-seed the target list each time the dialog opens, so a row scoped to one list wins.
  useEffect(() => {
    if (isOpen) {
      form.setValue("list", defaultListSlug ?? DEFAULT_LIST);
    }
    // Intentionally keyed on the dialog, not on every form instance change.
  }, [isOpen, defaultListSlug, form]);

  const onSubmit = async (values: AddSubscriberFormValues) => {
    try {
      const result = await addNewsletterSubscriber({
        email: values.email.trim(),
        name: values.name?.trim() || undefined,
        list: values.list === DEFAULT_LIST ? undefined : values.list,
      });

      form.reset();
      setOpen(false);
      router.refresh();

      if (result.alreadySubscribed) {
        toast.info(result.message);
      } else if (result.status === NewsletterSubscriberStatus.SUBSCRIBED) {
        toast.success(`${result.email} is subscribed`);
      } else {
        toast.success(`Confirmation email sent to ${result.email}`);
      }
    } catch (error) {
      handleApiError(error, "Failed to add subscriber");
    }
  };

  const selectedList = form.watch("list");
  const targetName = activeLists.find((list) => list.slug === selectedList)?.name ?? "the platform default list";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        // Base UI fires this when the submit button is pressed, so only sync real dismissals.
        if (!next) {
          form.clearErrors();
        }
        setOpen(next);
      }}
    >
      {trigger ? <DialogTrigger render={trigger} /> : null}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add subscriber</DialogTitle>
          <DialogDescription>
            The address receives a confirmation link and only counts as subscribed once it is clicked.
          </DialogDescription>
        </DialogHeader>

        {activeLists.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create an active mailing list first.</p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="subscriber-email">Email</FieldLabel>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      placeholder="person@example.com"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="subscriber-name">Name</FieldLabel>
                    <Input {...field} aria-invalid={fieldState.invalid} placeholder="Optional" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="list"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="subscriber-list">Mailing list</FieldLabel>
                    <Select value={field.value} onValueChange={(next) => field.onChange(next ?? DEFAULT_LIST)}>
                      <SelectTrigger id="subscriber-list" size="sm" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={DEFAULT_LIST}>Platform default list</SelectItem>
                        {activeLists.map((list) => (
                          <SelectItem key={list.id} value={list.slug}>
                            {list.name}
                            {list.isDefault ? " (default)" : ""}
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
                {form.formState.isSubmitting ? "Adding..." : `Add to ${targetName}`}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface AddSubscriberButtonProps {
  lists: NewsletterListResponse[];
  /** Slug to preselect, used when the surrounding page is already scoped to one list. */
  defaultListSlug?: string;
}

/** Toolbar trigger for {@link AddSubscriberDialog}, owning its own open state. */
export function AddSubscriberButton({ lists, defaultListSlug }: AddSubscriberButtonProps) {
  return (
    <AddSubscriberDialog
      lists={lists}
      defaultListSlug={defaultListSlug}
      trigger={
        <Button size="sm">
          <IconPlus className="size-4" />
          Add subscriber
        </Button>
      }
    />
  );
}
