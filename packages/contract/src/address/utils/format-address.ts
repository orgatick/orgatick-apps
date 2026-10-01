export interface FormatAddressInput {
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  postalCode?: string | null;
}

export function formatAddressString(
  dto: FormatAddressInput,
  countryName: string,
  divisionName?: string | null,
  cityName?: string | null,
): string {
  return [dto.addressLine1, dto.addressLine2, dto.landmark, cityName, divisionName, dto.postalCode, countryName]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");
}
