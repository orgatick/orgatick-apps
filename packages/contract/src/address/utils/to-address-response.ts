import type { AddressCityRef, AddressCountryRef, AddressDivisionRef, AddressResponse } from "../responses/index.js";

export interface AddressEntityLike {
  uuid: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  postalCode?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  formattedAddress?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toAddressResponse(
  address: AddressEntityLike,
  country: AddressCountryRef,
  division?: AddressDivisionRef | null,
  city?: AddressCityRef | null,
): AddressResponse {
  return {
    uuid: address.uuid,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2 ?? null,
    landmark: address.landmark ?? null,
    postalCode: address.postalCode ?? null,
    latitude: address.latitude ? Number(address.latitude) : null,
    longitude: address.longitude ? Number(address.longitude) : null,
    formattedAddress: address.formattedAddress ?? null,
    isActive: address.isActive,
    country: {
      id: country.id,
      code: country.code,
      code3: country.code3,
      name: country.name,
    },
    division: division
      ? {
          id: division.id,
          code: division.code,
          name: division.name,
          level: division.level,
        }
      : null,
    city: city
      ? {
          id: city.id,
          name: city.name,
          slug: city.slug ?? null,
        }
      : null,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}
