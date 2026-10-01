"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@orgatick/ui/components/dialog";
import { useForm } from "react-hook-form";
import type { AddressDialogProps, AddressFormValues } from "@orgatick/address/types";
import { AddressForm } from "@orgatick/address/components/address-form";

const ADDRESS_FIELD_NAME = "address";

export function AddressDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "generic",
  initialValues,
  dataLoader,
  onSubmit,
  showDistrict = false,
}: AddressDialogProps) {
  const form = useForm<AddressFormValues>({
    defaultValues: { [ADDRESS_FIELD_NAME]: initialValues ?? {} },
  });

  const defaultTitle =
    title ||
    (variant === "event_venue"
      ? "Set Venue Address"
      : variant === "organization"
        ? "Add Organization Address"
        : "Add Address");

  const defaultDescription =
    description ||
    (variant === "event_venue"
      ? "Specify the location and coordinates for this venue."
      : variant === "organization"
        ? "Enter the registered office or facility address."
        : "Enter your delivery or billing address details.");

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit((values[ADDRESS_FIELD_NAME] ?? {}) as AddressFormValues);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{defaultTitle}</DialogTitle>
          <DialogDescription>{defaultDescription}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit(event);
          }}
        >
          <div className="py-2">
            <AddressForm
              form={form}
              name={ADDRESS_FIELD_NAME}
              variant={variant}
              dataLoader={dataLoader}
              showCity={!showDistrict}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
