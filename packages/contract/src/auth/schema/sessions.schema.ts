import z from "zod";

export const SessionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  isCurrent: z.boolean(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  browser: z.string().nullable(),
  platform: z.string().nullable(),
  deviceId: z.string().nullable(),
  lastActivityAt: z.date().nullable(),
  createdAt: z.date(),
  expiresAt: z.date().nullable(),
});

export const RevokeSessionsResponseSchema = z.object({
  message: z.string(),
  revokedCount: z.number().optional(),
});

export interface SessionResponse extends z.infer<typeof SessionResponseSchema> {}
export interface RevokeSessionsResponse extends z.infer<typeof RevokeSessionsResponseSchema> {}
