const ADMIN_EMAILS_ENV_VAR = "ADMIN_EMAILS";

let cachedAllowlist: string[] | null = null;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Reads and parses the comma-separated `ADMIN_EMAILS` allowlist.
 * Entries are trimmed and lowercased; empty entries are dropped.
 * The parsed result is cached for the process lifetime because the
 * env var cannot change at runtime.
 */
export function getAdminEmailAllowlist(): string[] {
  if (cachedAllowlist) {
    return cachedAllowlist;
  }

  const raw = process.env[ADMIN_EMAILS_ENV_VAR]?.trim();

  if (!raw) {
    cachedAllowlist = [];
    return cachedAllowlist;
  }

  cachedAllowlist = raw
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email) => email.length > 0);

  return cachedAllowlist;
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
