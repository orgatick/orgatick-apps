import { z } from "zod";

export const UserIdSchema = z
  .number({
    message: "User ID must be a number",
  })
  .int("User ID must be an integer")
  .positive("User ID must be a positive integer");

export type UserId = z.infer<typeof UserIdSchema>;
