import type { OrganizationDocumentType, OrganizationSocialPlatform } from "@orgatick/contracts";

export type DraftStatus = "idle" | "saving" | "saved" | "unsaved";

export interface SerializedLogoData {
  dataUrl: string;
  name: string;
  type: string;
}

export interface SerializedBasicInfo {
  name: string;
  slug: string;
  categoryId: number | null;
  subCategoryId?: number;
  description: string;
  email: string;
  phoneNumber: string;
  logoDataUrl?: string | null;
  logoName?: string | null;
  logoType?: string | null;
}

export interface SerializedAddress {
  countryId: string;
  divisionId: string | null;
  divisionId2: string | null;
  cityId: string | null;
  countryUuid: string;
  divisionUuid: string | null;
  divisionUuid2: string | null;
  cityUuid: string | null;
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  postalCode: string;
  latitude: number | null;
  longitude: number | null;
  formattedAddress: string | null;
}

export interface SerializedDraftData {
  version: 1;
  savedAt: string;
  currentStep: number;
  formData: {
    basicInfo: SerializedBasicInfo;
    address: SerializedAddress;
    document: Array<{ type: OrganizationDocumentType }>;
    socialLinks: Array<{ platform: OrganizationSocialPlatform; url: string }>;
    supportContacts: Array<{
      name: string;
      email: string;
      phoneNumber: string;
      isPrimary: boolean;
    }>;
  };
}

export interface DraftInfo {
  savedAt: Date;
  step: number;
  name: string;
}
