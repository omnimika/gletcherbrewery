import { normalizeGtinDigits } from "@/content/product-gtins";
import { matchGletcherLines, type ReceiptLine } from "./match-lines";
import { checkEarnBircoins } from "./earn";
import type { AliasRow } from "./match-lines";

/**
 * OCR provider interface — Tesseract/Paddle plug-in later.
 * Spike: heuristic parse of plain text (as if OCR already ran).
 */
export type OcrProvider = {
  id: string;
  extractText(image: Buffer, contentType?: string): Promise<string | null>;
};

/** Stub until self-host Tesseract is wired — always null (forces manual/QR path). */
export const stubOcrProvider: OcrProvider = {
  id: "stub",
  async extractText() {
    return null;
  },
};

/** Pull EAN-8/13/GTIN-14 from a receipt line fragment. */
export function extractGtinFromText(text: string): string | null {
  const candidates = text.match(/\d{8,14}/g) ?? [];
  for (const c of candidates) {
    const gtin = normalizeGtinDigits(c);
    if (gtin) return gtin;
  }
  return null;
}

/**
 * Parse OCR-ish receipt text into candidate lines with trailing sums.
 * Examples:
 *   "Пиво Friday Avenue APA 0.5    199.90"
 *   "GLETCHER BLANCHE 2 x 99.90 = 199.80"
 *   "4601234567890 Пиво Friday 199.90"
 */
export function parseReceiptTextLines(text: string): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.length < 3) continue;
    // Prefer kopeck-style money at EOL; avoid matching volume like "0.5".
    const money = line.match(/(\d+[.,]\d{2})\s*(?:₽|руб\.?)?\s*$/i);
    if (!money) continue;
    const sum = Number(money[1]!.replace(",", "."));
    if (!Number.isFinite(sum) || sum <= 0) continue;
    let name = line.slice(0, money.index).replace(/[=x×]\s*$/i, "").trim();
    if (name.length < 2) continue;
    // skip obvious totals
    // Avoid \\b — unreliable with Cyrillic in JS.
    if (
      /^(итого|всего|сумма|итог|total)(\s|$|[.:])/i.test(name) ||
      /^(итого|всего|сумма|итог|total)$/i.test(name)
    ) {
      continue;
    }
    const gtin = extractGtinFromText(name);
    if (gtin) {
      name = name.replace(gtin, " ").replace(/\s+/g, " ").trim() || name;
    }
    lines.push({ name, sum, gtin: gtin ?? undefined });
  }
  return lines;
}

export function proposeEarnFromOcrText(
  text: string,
  aliases: AliasRow[],
): {
  lines: ReceiptLine[];
  eligibleSum: number;
  proposedEarn: number;
  matchedCount: number;
} {
  const lines = parseReceiptTextLines(text);
  const { matched, eligibleSum } = matchGletcherLines(lines, aliases);
  return {
    lines,
    eligibleSum,
    proposedEarn: checkEarnBircoins(eligibleSum),
    matchedCount: matched.filter((m) => m.matched).length,
  };
}
