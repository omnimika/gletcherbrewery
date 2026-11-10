const YO = /ё/g;
const NON_ALNUM = /[^a-zа-я0-9]+/gi;

/** Normalize receipt / catalog strings for alias matching (кир+лат). */
export function normalizeReceiptAlias(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(YO, "е")
    .replace(NON_ALNUM, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMemberEmail(email: string): string {
  return email.trim().toLowerCase();
}
