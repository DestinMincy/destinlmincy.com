const ADMIN_EMAILS_ENV_VAR = "ADMIN_EMAILS";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Reads and parses the comma-separated `ADMIN_EMAILS` allowlist.
 * Entries are trimmed and lowercased; empty entries are dropped.
 */
export function getAdminEmailAllowlist(): string[] {
  const raw = process.env[ADMIN_EMAILS_ENV_VAR]?.trim();

  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email) => email.length > 0);
}

/**
 * Checks whether the given email is on the `ADMIN_EMAILS` allowlist.
 * Comparison is case-insensitive and ignores surrounding whitespace.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  return getAdminEmailAllowlist().includes(normalizeEmail(email));
}
