import { NotFoundException } from "@nestjs/common";
import type { Request } from "express";

export const REDIRECT_ALLOWLIST = /^(https?:\/\/)/i;

export function recipientIdParam(value: string): bigint {
  let id: bigint;
  try {
    id = BigInt(value);
  } catch {
    throw new NotFoundException("Unknown recipient");
  }
  if (id <= 0n) {
    throw new NotFoundException("Unknown recipient");
  }
  return id;
}

export function readRawBody(request: Request): string {
  const candidate = (request as Request & { rawBody?: Buffer | string }).rawBody;

  if (Buffer.isBuffer(candidate)) return candidate.toString("utf8");
  if (typeof candidate === "string") return candidate;

  return JSON.stringify(request.body ?? {});
}

export function isAllowedRedirect(url: string | undefined): boolean {
  if (!url) return false;
  return REDIRECT_ALLOWLIST.test(url.trim());
}
