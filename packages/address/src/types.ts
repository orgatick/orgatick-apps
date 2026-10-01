import type {
  AddressCityRef,
  AddressCountryRef,
  AddressDivisionRef,
  AddressResponse,
  CreateAddressDto,
} from "@orgatick/contracts";
import type * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export type {
  AddressCityRef,
  AddressCountryRef,
  AddressDivisionRef,
  AddressResponse,
  CreateAddressDto,
} from "@orgatick/contracts";

export type AddressVariant = "user" | "organization" | "event_venue" | "generic";

/**
 * react-hook-form value shape for an address, derived from the shared
 * `CreateAddressDto` contract. Every field is optional because the form is
 * filled in progressively, and an index signature keeps arbitrary field paths
 * (including nested ones) assignable to `keyof AddressFormValues`.
 */
export type AddressFormValues = Partial<CreateAddressDto> & {
  uuid?: string;
  [key: string]: unknown;
};

export interface DivisionQueryOptions {
  level?: number;
  parentUuid?: string;
}

export interface CityQueryOptions {
  countryUuid?: string;
}

export interface AddressDataLoader {
  loadCountries: (search?: string) => Promise<AddressCountryRef[]>;
  loadDivisions: (
    countryUuid: string,
    search?: string,
    options?: DivisionQueryOptions,
  ) => Promise<AddressDivisionRef[]>;
  loadCities: (
    divisionUuid?: string,
    search?: string,
    countryUuidOrOptions?: string | CityQueryOptions,
  ) => Promise<AddressCityRef[]>;
}

export interface AddressOption {
  value: string;
  label: string;
  subLabel?: string;
  prefix?: React.ReactNode;
}

export interface AddressFormProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: keyof TFieldValues | string;
  dataLoader?: AddressDataLoader;
  variant?: AddressVariant;
  showCity?: boolean;
  showCoordinates?: boolean;
  showMoreOptions?: boolean;
  className?: string;
}

export interface AddressCardProps {
  address: AddressResponse | CreateAddressDto | AddressFormValues;
  variant?: AddressVariant;
  selected?: boolean;
  onSelect?: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  onEdit?: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  onDelete?: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  onSetDefault?: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  className?: string;
}

export interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  variant?: AddressVariant;
  initialValues?: Partial<CreateAddressDto> | Partial<AddressResponse>;
  dataLoader: AddressDataLoader;
  onSubmit: (values: AddressFormValues) => Promise<void> | void;
  showDistrict?: boolean;
}

export interface AddressPickerProps {
  addresses: (AddressResponse | CreateAddressDto | AddressFormValues)[];
  selectedUuid?: string | null;
  onSelectAddress: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  onAddNewAddress?: () => void;
  onEditAddress?: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  onDeleteAddress?: (address: AddressResponse | CreateAddressDto | AddressFormValues) => void;
  variant?: AddressVariant;
  className?: string;
}
