/**
 * Public `/map` chain filter: only networks that are on the style AND have
 * CRM assortment (availableCount > 0). Empty-SKU on-map chains (SELGROS,
 * МИРАТОРГ, …) stay off the filter until staff marks SKUs again.
 *
 * Also exposes per-chain Product tokens so the beer panel can disable
 * SKUs that are not available in the currently selected chains.
 */

import fs from "node:fs";
import path from "node:path";
import type { AppDb } from "@/server/db/client";
import { getAssortmentMatrix } from "@/server/retail/assortment";
import { bindingForChainTitle } from "@/server/retail/chain-layer-registry";
import { productTokenForSlug } from "@/server/retail/product-tokens";
import {
  ASSORTMENT_COLUMNS,
  isAssortmentSkuOutOfStock,
  parseSheetBool,
} from "@/server/retail/sku-map";

export type PublicMapAssortment = {
  /** CRM titles with ≥1 available non-OOS SKU and a map layer. */
  chainTitles: readonly string[];
  /** chain title → Mapbox Product / beer panel keys available in CRM. */
  beersByChain: Readonly<Record<string, readonly string[]>>;
};

/** CRM titles with at least one available non-OOS SKU and a map layer. */
export async function loadPublicMapChainTitles(
  db: AppDb | null,
): Promise<readonly string[]> {
  const data = await loadPublicMapAssortment(db);
  return data.chainTitles;
}

export async function loadPublicMapAssortment(
  db: AppDb | null,
): Promise<PublicMapAssortment> {
  if (db) {
    try {
      const matrix = await getAssortmentMatrix(db);
      const beersByChain: Record<string, string[]> = {};
      const chainTitles: string[] = [];

      for (const c of matrix.chains) {
        if (c.availableCount <= 0 || c.mapLayerId == null) continue;
        const tokens: string[] = [];
        for (const [slug, on] of Object.entries(c.products)) {
          if (!on || isAssortmentSkuOutOfStock(slug)) continue;
          const token = productTokenForSlug(slug);
          if (token) tokens.push(token);
        }
        if (tokens.length === 0) continue;
        beersByChain[c.title] = tokens;
        chainTitles.push(c.title);
      }

      return { chainTitles, beersByChain };
    } catch {
      // fall through to fixture
    }
  }
  return loadPublicMapAssortmentFromFixture();
}

/** Fixture fallback when PostgreSQL is unavailable. */
export function loadPublicMapChainTitlesFromFixture(
  repoRoot = process.cwd(),
): readonly string[] {
  return loadPublicMapAssortmentFromFixture(repoRoot).chainTitles;
}

export function loadPublicMapAssortmentFromFixture(
  repoRoot = process.cwd(),
): PublicMapAssortment {
  const csvPath = path.join(
    repoRoot,
    "fixtures/retail/chain-assortment.csv",
  );
  if (!fs.existsSync(csvPath)) {
    return { chainTitles: [], beersByChain: {} };
  }
  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return { chainTitles: [], beersByChain: {} };
  }
  const headers = lines[0].split(",");
  const beerIndexes = ASSORTMENT_COLUMNS.map((c) =>
    headers.indexOf(c.sheetHeader),
  );
  const chainTitles: string[] = [];
  const beersByChain: Record<string, string[]> = {};

  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const title = (cols[0] ?? "").trim();
    if (!title) continue;
    if (!bindingForChainTitle(title)?.layerId) continue;

    const tokens: string[] = [];
    for (let i = 0; i < ASSORTMENT_COLUMNS.length; i += 1) {
      const idx = beerIndexes[i];
      if (idx < 0) continue;
      if (!parseSheetBool(cols[idx])) continue;
      const slug = ASSORTMENT_COLUMNS[i].productSlug;
      if (isAssortmentSkuOutOfStock(slug)) continue;
      const token = productTokenForSlug(slug);
      if (token) tokens.push(token);
    }
    if (tokens.length === 0) continue;
    beersByChain[title] = tokens;
    chainTitles.push(title);
  }
  return { chainTitles, beersByChain };
}
