import z from "zod";

export const OrganizationSupportContactInputSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.email("Invalid email format"),
  phoneNumber: z.string().max(30),
  isPrimary: z.boolean().default(false),
});
