import z from "zod";

const resendVerifyEmailSchema = z.object({
  email: z.email("Need to be a valid email"),
});

export default resendVerifyEmailSchema;
