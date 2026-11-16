import { normalizeReceiptAlias } from "./normalize-alias";

export type ReceiptLine = {
  name: string;
  sum: number;
  gtin?: string;
};

export type AliasRow = {
  aliasNormalized: string;
  productSlug?: string | null;
  gtin?: string | null;
};

export type MatchedLine = ReceiptLine & {
  matched: boolean;
  productSlug?: string;
  via: "gtin" | "alias" | "none";
};

/**
 * Match receipt lines to Gletcher catalog aliases.
 * Priority: GTIN → substring/equality on normalized name aliases.
 */
export function matchGletcherLines(
  lines: ReceiptLine[],
  aliases: AliasRow[],
): { matched: MatchedLine[]; eligibleSum: number } {
  const byGtin = new Map<string, AliasRow>();
  const aliasList = aliases.filter((a) => a.aliasNormalized.length > 0);
  for (const a of aliases) {
    if (a.gtin) byGtin.set(a.gtin.trim(), a);
  }

  const matched: MatchedLine[] = lines.map((line) => {
    if (line.gtin && byGtin.has(line.gtin.trim())) {
      const hit = byGtin.get(line.gtin.trim())!;
      return {
        ...line,
        matched: true,
        productSlug: hit.productSlug ?? undefined,
        via: "gtin" as const,
      };
    }
    const norm = normalizeReceiptAlias(line.name);
    const hit = aliasList.find(
      (a) =>
        norm === a.aliasNormalized ||
        norm.includes(a.aliasNormalized) ||
        a.aliasNormalized.includes(norm),
    );
    if (hit && hit.aliasNormalized.length >= 4) {
      return {
        ...line,
        matched: true,
        productSlug: hit.productSlug ?? undefined,
        via: "alias" as const,
      };
    }
    return { ...line, matched: false, via: "none" as const };
  });

  const eligibleSum = matched
    .filter((m) => m.matched)
    .reduce((acc, m) => acc + m.sum, 0);

  return { matched, eligibleSum };
}
