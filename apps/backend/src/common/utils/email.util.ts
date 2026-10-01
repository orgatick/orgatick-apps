/**
 * Options for email normalization.
 */
export interface NormalizeEmailOptions {
  /**
   * When true, removes dots from the local part of Gmail addresses.
   * e.g., "john.doe@gmail.com" -> "johndoe@gmail.com"
   * Default: false (preserves standard dots while lowercasing)
   */
  removeGmailDots?: boolean;

  /**
   * When true, strips subaddressing (plus tags) from the local part.
   * e.g., "user+tag@example.com" -> "user@example.com"
   * Default: false
   */
  stripSubaddress?: boolean;
}

/**
 * Normalizes an email address for lookup, uniqueness checks, and authentication
 * while preserving historical registration snapshots in raw fields.
 *
 * Normalization process:
 * 1. Trims leading and trailing whitespace
 * 2. Normalizes Unicode characters via NFKC
 * 3. Lowercases both local and domain parts
 * 4. Normalizes known domain aliases (e.g. googlemail.com -> gmail.com)
 * 5. Optionally removes Gmail dots and/or plus subaddresses
 *
 * @param email - The email string to normalize
 * @param options - Additional normalization options
 * @returns Canonical normalized email address
 */
export function normalizeEmail(email: string, options: NormalizeEmailOptions = {}): string {
  if (!email || typeof email !== "string") {
    throw new Error("Invalid email input");
  }

  const trimmed = email.trim();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    throw new Error(`Invalid email address format: "${email}"`);
  }

  let localPart = trimmed.slice(0, atIndex).normalize("NFKC").toLowerCase();
  let domainPart = trimmed
    .slice(atIndex + 1)
    .normalize("NFKC")
    .toLowerCase();

  // Canonical domain aliases
  if (domainPart === "googlemail.com") {
    domainPart = "gmail.com";
  }

  if (options.stripSubaddress) {
    localPart = localPart.split("+")[0];
  }

  if (options.removeGmailDots && domainPart === "gmail.com") {
    localPart = localPart.replace(/\./g, "");
  }

  return `${localPart}@${domainPart}`;
}
