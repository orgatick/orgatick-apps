import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.email("Need to be a valid email"),
});

export default forgotPasswordSchema;
