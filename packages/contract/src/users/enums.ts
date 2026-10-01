import { z } from "zod";

export const GenderSchema = z.enum(["male", "female", "notToSay"]);
export type Gender = z.infer<typeof GenderSchema>;

export const UserRoleSchema = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;
