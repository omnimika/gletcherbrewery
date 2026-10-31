/**
 * Specs are stored as locale-invariant raw strings (often with comma decimals).
 * Display normalizes the numeric token via Intl when possible (F07 soft).
 */
export function formatSpecNumber(
  raw: string,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  const normalized = raw.replace(/\s/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) return raw;
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function splitPairingTags(foodPairing: string): string[] {
  return foodPairing
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
