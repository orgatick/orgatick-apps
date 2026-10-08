import type { CreateOrganizationOutput } from "@orgatick/contracts";
import api from "@/lib/apis/auth.api";

const ORGANIZATION_CREATE_TIMEOUT_MS = 120_000;

export async function submitOrganizationApplication(data: CreateOrganizationOutput): Promise<void> {
  const formData = new FormData();
  formData.append(
    "organizationData",
    JSON.stringify(data, (_key, value) => {
      if (typeof value === "bigint") return value.toString();
      if (value instanceof File) return undefined;
      return value;
    }),
  );

  if (data.basicInfo.logo instanceof File) {
    formData.append("basicInfo.logo", data.basicInfo.logo);
  }

  data.document.forEach((doc, idx) => {
    if (doc.file instanceof File) {
      formData.append(`document_${idx}`, doc.file);
    }
  });

  await api.post("/organizations", formData, {
    timeout: ORGANIZATION_CREATE_TIMEOUT_MS,
  });
}
