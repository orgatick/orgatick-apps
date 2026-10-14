import type { CreateOrganizationInput } from "@orgatick/contracts";
import { formDefaultValues } from "../_constents/defult-value";
import type { SerializedDraftData, SerializedLogoData } from "./draft-types";

export function dataUrlToFile(dataUrl: string, filename: string, mimeType: string): File | null {
  try {
    const arr = dataUrl.split(",");
    const bstr = atob(arr[1] ?? "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mimeType });
  } catch (err) {
    console.error("Failed to convert dataUrl to File", err);
    return null;
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function serializeFormValues(
  values: CreateOrganizationInput,
  step: number,
  cachedLogo: SerializedLogoData | null,
): Promise<{ draft: SerializedDraftData; logo: SerializedLogoData | null }> {
  let activeLogo = cachedLogo;

  if (values.basicInfo?.logo instanceof File) {
    if (values.basicInfo.logo.size <= 2 * 1024 * 1024) {
      try {
        const dataUrl = await fileToDataUrl(values.basicInfo.logo);
        activeLogo = {
          dataUrl,
          name: values.basicInfo.logo.name,
          type: values.basicInfo.logo.type,
        };
      } catch {
        activeLogo = null;
      }
    } else {
      activeLogo = null;
    }
  } else if (!values.basicInfo?.logo) {
    activeLogo = null;
  }

  const addressData = values.address as unknown as Record<string, unknown> | undefined;

  const draft: SerializedDraftData = {
    version: 1,
    savedAt: new Date().toISOString(),
    currentStep: step,
    formData: {
      basicInfo: {
        name: values.basicInfo?.name ?? "",
        slug: values.basicInfo?.slug ?? "",
        categoryId: (values.basicInfo?.categoryId as number | null) ?? null,
        subCategoryId: values.basicInfo?.subCategoryId as number | undefined,
        description: values.basicInfo?.description ?? "",
        email: values.basicInfo?.email ?? "",
        phoneNumber: values.basicInfo?.phoneNumber ?? "",
        logoDataUrl: activeLogo?.dataUrl ?? null,
        logoName: activeLogo?.name ?? null,
        logoType: activeLogo?.type ?? null,
      },
      address: {
        countryId: addressData?.countryId ? String(addressData.countryId) : "1",
        divisionId: addressData?.divisionId ? String(addressData.divisionId) : null,
        divisionId2: addressData?.divisionId2 ? String(addressData.divisionId2) : null,
        cityId: addressData?.cityId ? String(addressData.cityId) : null,
        countryUuid: typeof addressData?.countryUuid === "string" ? addressData.countryUuid : "1",
        divisionUuid: typeof addressData?.divisionUuid === "string" ? addressData.divisionUuid : null,
        divisionUuid2: typeof addressData?.divisionUuid2 === "string" ? addressData.divisionUuid2 : null,
        cityUuid: typeof addressData?.cityUuid === "string" ? addressData.cityUuid : null,
        addressLine1: typeof addressData?.addressLine1 === "string" ? addressData.addressLine1 : "",
        addressLine2: typeof addressData?.addressLine2 === "string" ? addressData.addressLine2 : null,
        landmark: typeof addressData?.landmark === "string" ? addressData.landmark : null,
        postalCode: typeof addressData?.postalCode === "string" ? addressData.postalCode : "",
        latitude: typeof addressData?.latitude === "number" ? addressData.latitude : null,
        longitude: typeof addressData?.longitude === "number" ? addressData.longitude : null,
        formattedAddress: typeof addressData?.formattedAddress === "string" ? addressData.formattedAddress : null,
      },
      document: (values.document ?? []).map((doc) => ({ type: doc.type })),
      socialLinks: (values.socialLinks ?? []).map((link) => ({ platform: link.platform, url: link.url })),
      supportContacts: (values.supportContacts ?? []).map((c) => ({
        name: c.name,
        email: c.email,
        phoneNumber: c.phoneNumber,
        isPrimary: Boolean(c.isPrimary),
      })),
    },
  };

  return { draft, logo: activeLogo };
}

export function deserializeDraftValues(draft: SerializedDraftData): {
  values: CreateOrganizationInput;
  step: number;
  logo: SerializedLogoData | null;
} {
  const { basicInfo, address, document: docs, socialLinks, supportContacts } = draft.formData;

  let restoredLogoFile: File | null = null;
  let activeLogo: SerializedLogoData | null = null;

  if (basicInfo?.logoDataUrl && basicInfo.logoName && basicInfo.logoType) {
    restoredLogoFile = dataUrlToFile(basicInfo.logoDataUrl, basicInfo.logoName, basicInfo.logoType);
    if (restoredLogoFile) {
      activeLogo = {
        dataUrl: basicInfo.logoDataUrl,
        name: basicInfo.logoName,
        type: basicInfo.logoType,
      };
    }
  }

  const values = {
    basicInfo: {
      name: basicInfo?.name ?? "",
      slug: basicInfo?.slug ?? "",
      categoryId: basicInfo?.categoryId ?? null,
      subCategoryId: basicInfo?.subCategoryId as unknown as number,
      description: basicInfo?.description ?? "",
      logo: restoredLogoFile,
      email: basicInfo?.email ?? "",
      phoneNumber: basicInfo?.phoneNumber ?? "",
    },
    address: {
      countryId: BigInt(address?.countryId || "1"),
      divisionId: address?.divisionId ? BigInt(address.divisionId) : null,
      divisionId2: address?.divisionId2 ? BigInt(address.divisionId2) : null,
      cityId: address?.cityId ? BigInt(address.cityId) : null,
      countryUuid: address?.countryUuid ?? "1",
      divisionUuid: address?.divisionUuid ?? null,
      divisionUuid2: address?.divisionUuid2 ?? null,
      cityUuid: address?.cityUuid ?? null,
      addressLine1: address?.addressLine1 ?? "",
      addressLine2: address?.addressLine2 ?? null,
      landmark: address?.landmark ?? null,
      postalCode: address?.postalCode ?? "",
      latitude: address?.latitude ?? null,
      longitude: address?.longitude ?? null,
      formattedAddress: address?.formattedAddress ?? null,
    },
    document: docs && docs.length > 0 ? docs.map((d) => ({ type: d.type, file: null })) : formDefaultValues.document,
    socialLinks:
      socialLinks && socialLinks.length > 0
        ? socialLinks.map((s) => ({ platform: s.platform, url: s.url }))
        : formDefaultValues.socialLinks,
    supportContacts:
      supportContacts && supportContacts.length > 0
        ? supportContacts.map((c) => ({
            name: c.name,
            email: c.email,
            phoneNumber: c.phoneNumber,
            isPrimary: c.isPrimary,
          }))
        : formDefaultValues.supportContacts,
  } as unknown as CreateOrganizationInput;

  return {
    values,
    step: draft.currentStep ?? 0,
    logo: activeLogo,
  };
}
