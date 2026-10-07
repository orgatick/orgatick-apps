import { OrganizationDocumentType } from "@orgatick/contracts";

export const DOCUMENT_TYPE_LABELS: Record<OrganizationDocumentType, { label: string; desc: string }> = {
  [OrganizationDocumentType.PAN]: {
    label: "Company / Entity PAN Card",
    desc: "Permanent Account Number card of the organization or proprietor",
  },
  [OrganizationDocumentType.GST]: {
    label: "GST Registration Certificate",
    desc: "Goods and Services Tax registration document (GSTIN)",
  },
  [OrganizationDocumentType.BANK_ACCOUNT]: {
    label: "Bank Account Proof / Cancelled Cheque",
    desc: "Bank passbook, statement, or cancelled cheque showing company bank details",
  },
  [OrganizationDocumentType.MSME]: {
    label: "MSME / Udyam Certificate",
    desc: "Micro, Small & Medium Enterprises registration certificate",
  },
  [OrganizationDocumentType.AADHAR]: {
    label: "Authorized Signatory Aadhar / ID",
    desc: "Government-issued identity proof of the primary organizer or director",
  },
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
