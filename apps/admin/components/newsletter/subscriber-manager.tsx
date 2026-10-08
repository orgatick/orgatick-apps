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
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useRouter } from "next/navigation";
import type * as React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { handleApiError } from "@/lib/apis/api-error";
import { addNewsletterSubscriber } from "@/lib/newsletter.api";
import { SubscriberAutocomplete } from "./subscriber-autocomplete";

export { AddSubscriberButton } from "./add-subscriber-button";

const AddSubscriberFormSchema = SubscribeNewsletterSchema.pick({ email: true, name: true, list: true });
type AddSubscriberFormValues = z.infer<typeof AddSubscriberFormSchema>;

const DEFAULT_LIST = "__default__";

interface AddSubscriberDialogProps {
  lists: NewsletterListResponse[];
  defaultListSlug?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

export function AddSubscriberDialog({ lists, defaultListSlug, open, onOpenChange, trigger }: AddSubscriberDialogProps) {
  const router = useRouter();
  const controlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedFromDb, setSelectedFromDb] = useState(false);
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
    if (!next) {
      setSelectedFromDb(false);
      form.clearErrors();
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.setValue("list", defaultListSlug ?? DEFAULT_LIST);
    }
  }, [isOpen, defaultListSlug, form]);

  const currentEmail = form.watch("email");
  const currentName = form.watch("name");

  const onSubmit = async (values: AddSubscriberFormValues) => {
    try {
      const result = await addNewsletterSubscriber({
        email: values.email.trim(),
        name: values.name?.trim() || undefined,
        list: values.list === DEFAULT_LIST ? undefined : values.list,
      });

      form.reset();
      setSelectedFromDb(false);
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
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger render={trigger} /> : null}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Subscriber</DialogTitle>
          <DialogDescription>
            Search an existing registered user from your database, pick a subscriber, or enter a new address.
          </DialogDescription>
        </DialogHeader>

        {activeLists.length === 0 ? (
          <p className="text-sm text-muted-foreground">Create an active mailing list first.</p>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FieldGroup className="space-y-3">
              <div className="space-y-1.5">
                <FieldLabel>Lookup Database or Subscribers</FieldLabel>
                <SubscriberAutocomplete
                  selectedEmail={selectedFromDb ? currentEmail : undefined}
                  selectedName={selectedFromDb ? currentName : undefined}
                  onSelect={(candidate) => {
                    form.setValue("email", candidate.email, { shouldValidate: true });
                    form.setValue("name", candidate.name || "", { shouldValidate: true });
                    setSelectedFromDb(true);
                  }}
                  onClear={() => {
                    form.setValue("email", "", { shouldValidate: true });
                    form.setValue("name", "");
                    setSelectedFromDb(false);
                  }}
                />
              </div>

              {!selectedFromDb && (
                <>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="subscriber-email">Email Address</FieldLabel>
                        <Input
                          {...field}
                          id="subscriber-email"
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
                        <FieldLabel htmlFor="subscriber-name">Full Name</FieldLabel>
                        <Input
                          {...field}
                          id="subscriber-name"
                          aria-invalid={fieldState.invalid}
                          placeholder="Optional"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </>
              )}

              <Controller
                name="list"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="subscriber-list">Target Mailing List</FieldLabel>
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

            <DialogFooter className="pt-2">
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
