/**
 * Beer SKU ↔ GTIN/EAN for receipt matching.
 *
 * Status:
 * - Confirmed: owner-supplied barcode (pack-specific)
 * - Proposed: candidate pending owner check
 * - Open: slot awaiting data (do not invent digits)
 *
 * Airtable «Товары» is the reward shop catalog — not beer GTINs.
 * Fill this list from packaging / 1C / marking, then `npm run loyalty:seed-aliases`.
 */

export type ProductGtinStatus = "confirmed" | "proposed" | "open";

export type ProductGtinRow = {
  /** Digits only (EAN-8 / EAN-13 / GTIN-14). */
  gtin: string;
  productSlug: string;
  /** Human packing hint, e.g. "0.5 л стекло". */
  packing?: string;
  status: ProductGtinStatus;
  note?: string;
};

/** Confirmed/proposed barcodes only — empty until owner provides. */
export const PRODUCT_GTINS: ProductGtinRow[] = [
  // Example shape (do not invent real codes):
  // {
  //   gtin: "4600000000000",
  //   productSlug: "friday-avenue-apa",
  //   packing: "0.5 л",
  //   status: "confirmed",
  // },
];

export function normalizeGtinDigits(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 8 || digits.length === 12 || digits.length === 13 || digits.length === 14) {
    return digits;
  }
  return null;
}

/** Active matcher rows (confirmed + proposed). */
export function activeProductGtins(): ProductGtinRow[] {
  return PRODUCT_GTINS.filter(
    (r) =>
      (r.status === "confirmed" || r.status === "proposed") &&
      normalizeGtinDigits(r.gtin),
  ).map((r) => ({
    ...r,
    gtin: normalizeGtinDigits(r.gtin)!,
  }));
}
