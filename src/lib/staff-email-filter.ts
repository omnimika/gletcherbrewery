import { normalizeMemberEmail } from "@/server/loyalty/normalize-alias";

const MAX_LEN = 254;

/** Staff list `?email=` — normalized lowercase, empty → null. */
export function parseStaffEmailFilter(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const normalized = normalizeMemberEmail(raw);
  if (!normalized || normalized.length > MAX_LEN) return null;
  return normalized;
}

/** Escape `%` / `_` for SQL LIKE. */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
