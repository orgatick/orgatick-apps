import z from "zod";

const verifyEmailSchema = z.object({
  email: z.email("Need to be a valid email"),
  token: z.string().min(1, "Verification token is required"),
});

export default verifyEmailSchema;
