import { z } from "zod";
import { passwordRegex } from "../enums/password.regex";

export const loginSchema = z.object({
  email: z.email("Need a valid email"),
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      passwordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),
});
export default loginSchema;
