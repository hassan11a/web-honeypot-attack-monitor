const SENSITIVE_KEY_PATTERN =
  /(pass|pwd|secret|token|auth|cookie|session|api[-_]?key|credential|ssn|card|cvv|private)/i;

export const REDACTED = "[REDACTED]";

/** Redacts sensitive key/value pairs from a flat record. Values are never executed. */
export function redactRecord(record: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined || value === null) continue;
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = truncate(safeString(value), 512);
  }
  return out;
}

export function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value) ?? "";
  } catch {
    return "";
  }
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max) + "…";
}

/**
 * Builds a non-reversible indicator that a password field was present,
 * without storing the password itself. Only the length bucket is kept.
 */
export function passwordIndicator(password: string | undefined | null): string | null {
  if (!password) return null;
  const len = password.length;
  if (len < 8) return "len:<8";
  if (len < 12) return "len:8-11";
  if (len < 16) return "len:12-15";
  return "len:>=16";
}

/** Keeps only allow-listed security-relevant headers. */
export function sanitizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string> {
  const allow = new Set([
    "user-agent",
    "referer",
    "origin",
    "content-type",
    "content-length",
    "accept",
    "accept-language",
    "accept-encoding",
    "x-requested-with",
    "x-forwarded-for",
    "x-real-ip",
    "forwarded",
    "host",
    "connection",
    "upgrade-insecure-requests",
    "cache-control",
    "pragma",
    "authorization",
    "cookie",
  ]);
  const out: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(headers)) {
    const key = rawKey.toLowerCase();
    if (!allow.has(key) || rawValue === undefined) continue;
    const value = Array.isArray(rawValue) ? rawValue.join(", ") : rawValue;
    if (key === "authorization" || key === "cookie") {
      out[key] = REDACTED;
    } else {
      out[key] = truncate(value, 512);
    }
  }
  return out;
}

export function jsonSafe(value: unknown, max = 8192): string {
  const text = safeString(value);
  return truncate(text, max);
}
