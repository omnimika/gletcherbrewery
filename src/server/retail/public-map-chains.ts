/**
 * Public `/map` chain filter: only networks that are on the style AND have
 * CRM assortment (availableCount > 0). Empty-SKU on-map chains (SELGROS,
 * МИРАТОРГ, …) stay off the filter until staff marks SKUs again.
 */

import fs from "node:fs";
import path from "node:path";
import type { AppDb } from "@/server/db/client";
import { getAssortmentMatrix } from "@/server/retail/assortment";
import { bindingForChainTitle } from "@/server/retail/chain-layer-registry";
import {
  ASSORTMENT_COLUMNS,
  isAssortmentSkuOutOfStock,
  parseSheetBool,
} from "@/server/retail/sku-map";

/** CRM titles with at least one available non-OOS SKU and a map layer. */
export async function loadPublicMapChainTitles(
  db: AppDb | null,
): Promise<readonly string[]> {
  if (db) {
    try {
      const matrix = await getAssortmentMatrix(db);
      return matrix.chains
        .filter((c) => c.availableCount > 0 && c.mapLayerId != null)
        .map((c) => c.title);
    } catch {
      // fall through to fixture
    }
  }
  return loadPublicMapChainTitlesFromFixture();
}

/** Fixture fallback when PostgreSQL is unavailable. */
export function loadPublicMapChainTitlesFromFixture(
  repoRoot = process.cwd(),
): readonly string[] {
  const csvPath = path.join(
    repoRoot,
    "fixtures/retail/chain-assortment.csv",
  );
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  const beerIndexes = ASSORTMENT_COLUMNS.map((c) =>
    headers.indexOf(c.sheetHeader),
  );
  const titles: string[] = [];

  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const title = (cols[0] ?? "").trim();
    if (!title) continue;
    if (!bindingForChainTitle(title)?.layerId) continue;

    let available = 0;
    for (let i = 0; i < ASSORTMENT_COLUMNS.length; i += 1) {
      const idx = beerIndexes[i];
      if (idx < 0) continue;
      if (!parseSheetBool(cols[idx])) continue;
      const slug = ASSORTMENT_COLUMNS[i].productSlug;
      if (isAssortmentSkuOutOfStock(slug)) continue;
      available += 1;
    }
    if (available > 0) titles.push(title);
  }
  return titles;
}
