import type { Request } from "express";

/** Normalizes IP strings (e.g. strips IPv6 mapped IPv4 prefix `::ffff:`) */
export function normalizeIp(rawIp: string): string {
  const trimmed = rawIp.trim();
  if (trimmed.startsWith("::ffff:")) return trimmed.slice(7);
  return trimmed.toLowerCase();
}

/**
 * Securely extracts the client IP address from request headers with Cloudflare and reverse proxy support.
 *
 * Header resolution precedence:
 * 1. cf-connecting-ip (Cloudflare authoritative client IP)
 * 2. true-client-ip (Enterprise Cloudflare / Akamai)
 * 3. x-real-ip (Nginx / HAProxy client IP)
 * 4. x-forwarded-for (Standard multi-hop proxy header - leftmost IP)
 * 5. req.ip (Express resolved IP)
 * 6. req.socket.remoteAddress (Direct TCP connection IP)
 */
export function getClientIp(req: Request): string {
  const cfConnectingIp = req.headers["cf-connecting-ip"];
  if (typeof cfConnectingIp === "string" && cfConnectingIp.trim().length > 0) return normalizeIp(cfConnectingIp);

  const trueClientIp = req.headers["true-client-ip"];
  if (typeof trueClientIp === "string" && trueClientIp.trim().length > 0) return normalizeIp(trueClientIp);

  const xRealIp = req.headers["x-real-ip"];
  if (typeof xRealIp === "string" && xRealIp.trim().length > 0) return normalizeIp(xRealIp);

  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string" && xForwardedFor.trim().length > 0) {
    const firstIp = xForwardedFor.split(",")[0];
    if (firstIp) return normalizeIp(firstIp);
  } else if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    const firstIp = xForwardedFor[0];
    if (firstIp) return normalizeIp(firstIp);
  }

  if (req.ip) return normalizeIp(req.ip);

  if (req.socket?.remoteAddress) return normalizeIp(req.socket.remoteAddress);

  return "127.0.0.1";
}
