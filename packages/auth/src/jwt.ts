/**
 * Checks if a JWT string is expired or will expire within the buffer window (in seconds).
 * Works across both Node.js and Edge/Browser environments without external dependencies.
 */
export function isJwtExpired(token: string | undefined, bufferSeconds = 15): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    if (typeof payload.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}
