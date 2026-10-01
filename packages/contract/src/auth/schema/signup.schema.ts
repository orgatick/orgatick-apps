import { z } from "zod";
import { passwordRegex } from "../enums/password.regex";

export const signupSchema = z
  .object({
    name: z
      .string("Name is required")
      .min(3, "Name must be at least 3 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z.email("Need a valid email"),
    password: z
      .string("Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      ),
    confirmPassword: z.string("Confirm password is required").min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default signupSchema;
