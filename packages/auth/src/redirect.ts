/**
 * Checks if an error is a Next.js redirect error (thrown by redirect()).
 * Useful for try/catch blocks where redirect errors must be rethrown.
 */
export function isRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: unknown }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
