import type { Request } from "express";
import { normalizeEmail } from "../../../common/utils/email.util";
import type { KeyExtractor } from "../types/rate-limit.types";
import { getClientIp } from "./ip.util";

export const RateLimitExtractors = {
  /** Extracts client IP. */
  ip: (): KeyExtractor => (req: Request) => {
    return `ip:${getClientIp(req)}`;
  },

  /** Extracts authenticated user ID (or session ID), falling back to IP if unauthenticated. */
  userOrIp: (): KeyExtractor => (req: Request) => {
    const reqWithAuth = req as Request & { user?: { id?: string }; session?: { id?: string } };
    if (reqWithAuth.user?.id) return `user:${reqWithAuth.user.id}`;
    if (reqWithAuth.session?.id) return `session:${reqWithAuth.session.id}`;
    return `ip:${getClientIp(req)}`;
  },

  /** Extracts normalized email address from request body. */
  emailFromBody:
    (field = "email"): KeyExtractor =>
    (req: Request) => {
      const body = req.body as Record<string, unknown> | undefined;
      const rawEmail = body?.[field];
      if (typeof rawEmail === "string" && rawEmail.trim().length > 0) {
        const normalized = normalizeEmail(rawEmail);
        return `account:${normalized}`;
      }
      return null;
    },

  /** Extracts normalized email address from query string. */
  emailFromQuery:
    (field = "email"): KeyExtractor =>
    (req: Request) => {
      const query = req.query as Record<string, unknown> | undefined;
      const rawEmail = query?.[field];
      if (typeof rawEmail === "string" && rawEmail.trim().length > 0) {
        const normalized = normalizeEmail(rawEmail);
        return `account:${normalized}`;
      }
      return null;
    },

  /** Extracts a custom header value. */
  header:
    (headerName: string): KeyExtractor =>
    (req: Request) => {
      const val = req.headers[headerName.toLowerCase()];
      if (typeof val === "string" && val.trim().length > 0) return `header:${headerName}:${val.trim()}`;

      return null;
    },

  /** Custom key extractor function. */
  custom: (fn: KeyExtractor): KeyExtractor => fn,
};
