import z from "zod";
import { OrganizationDocumentType } from "../enums";

export const OrganizationDocumentUploadSchema = z.object({
  type: z.enum(Object.values(OrganizationDocumentType), { message: `Invalid document type` }),
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, "File must not exceed 2MB")
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type),
      "Invalid file type. Only PDF, Word, and Excel files are allowed.",
    )
    .optional()
    .nullable(),
});
