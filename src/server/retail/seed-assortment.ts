import type { AppDb } from "@/server/db/client";
import { retailChainProducts, retailChains } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  ASSORTMENT_COLUMNS,
  EXTRA_CATALOG_SKU,
  parseSheetBool,
  SHEET_BEER_COLUMNS,
} from "./sku-map";
import { slugifyTitle } from "./assortment";

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

/**
 * Seed/replace assortment from Sheet CSV. Idempotent by chain slug.
 * Does not publish Mapbox.
 */
export async function seedAssortmentFromCsv(
  db: AppDb,
  csvText: string,
  actor = "seed",
): Promise<{ chains: number; cells: number }> {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { chains: 0, cells: 0 };

  const headers = parseCsvLine(lines[0]!).map((h) => h.trim());
  const titleIdx = headers.indexOf("Название торговой сети");
  const legalIdx = headers.indexOf("Юридическое лицо");
  const mapIdx = headers.indexOf("Ссылка на карту");
  if (titleIdx < 0) {
    throw new Error('CSV missing column "Название торговой сети"');
  }

  const colIndex = new Map<string, number>();
  for (const col of SHEET_BEER_COLUMNS) {
    const i = headers.indexOf(col.sheetHeader);
    if (i >= 0) colIndex.set(col.productSlug, i);
  }

  let chainCount = 0;
  let cellCount = 0;
  const now = new Date();

  await db.transaction(async (tx) => {
    for (let r = 1; r < lines.length; r++) {
      const cells = parseCsvLine(lines[r]!);
      const title = (cells[titleIdx] ?? "").trim();
      if (!title) continue;

      const slug = slugifyTitle(title);
      const legalName = legalIdx >= 0 ? (cells[legalIdx] ?? "").trim() || null : null;
      let mapUrl = mapIdx >= 0 ? (cells[mapIdx] ?? "").trim() || null : null;
      if (mapUrl === "🚫") mapUrl = null;

      const existing = await tx
        .select()
        .from(retailChains)
        .where(eq(retailChains.slug, slug))
        .limit(1);

      let chainId: string;
      if (existing[0]) {
        chainId = existing[0].id;
        await tx
          .update(retailChains)
          .set({
            title,
            legalName,
            mapUrl,
            sortOrder: r,
            updatedAt: now,
            updatedBy: actor,
          })
          .where(eq(retailChains.id, chainId));
      } else {
        const [inserted] = await tx
          .insert(retailChains)
          .values({
            slug,
            title,
            legalName,
            mapUrl,
            sortOrder: r,
            active: true,
            updatedAt: now,
            updatedBy: actor,
          })
          .returning({ id: retailChains.id });
        chainId = inserted!.id;
      }
      chainCount += 1;

      for (const col of ASSORTMENT_COLUMNS) {
        let available = false;
        if (col.productSlug === EXTRA_CATALOG_SKU.productSlug) {
          available = false;
        } else {
          const idx = colIndex.get(col.productSlug);
          available =
            idx === undefined ? false : parseSheetBool(cells[idx]);
        }

        await tx
          .insert(retailChainProducts)
          .values({
            chainId,
            productSlug: col.productSlug,
            available,
            updatedAt: now,
            updatedBy: actor,
          })
          .onConflictDoUpdate({
            target: [
              retailChainProducts.chainId,
              retailChainProducts.productSlug,
            ],
            set: {
              available,
              updatedAt: now,
              updatedBy: actor,
            },
          });
        cellCount += 1;
      }
    }
  });

  return { chains: chainCount, cells: cellCount };
}
