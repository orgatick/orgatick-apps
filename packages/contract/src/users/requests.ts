import { z } from "zod";
import { GenderSchema, UserRoleSchema } from "./enums.js";

export const CreateUserRequestSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  gender: GenderSchema.optional(),
  phoneNumber: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  role: UserRoleSchema.optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UpdateUserRequestSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  email: z.string().email("Invalid email address").optional(),
  gender: GenderSchema.optional(),
  phoneNumber: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  role: UserRoleSchema.optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
