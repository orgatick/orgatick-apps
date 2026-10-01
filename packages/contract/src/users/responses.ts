import { z } from "zod";
import { GenderSchema, UserRoleSchema } from "./enums.js";
import { UserIdSchema } from "./schemas.js";

export const UserResponseSchema = z.object({
  id: UserIdSchema,
  name: z.string(),
  email: z.string().email("Invalid email address"),
  gender: GenderSchema,
  phoneNumber: z.string().nullable(),
  avatar: z.string().nullable(),
  address: z.string().nullable(),
  bio: z.string().nullable(),
  role: UserRoleSchema,
  createdAt: z.string().datetime("createdAt must be a valid ISO 8601 datetime string"),
  updatedAt: z.string().datetime("updatedAt must be a valid ISO 8601 datetime string"),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
