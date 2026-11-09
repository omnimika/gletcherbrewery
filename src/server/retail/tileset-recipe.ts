/**
 * Build a controlled Mapbox `Product` update recipe from PG chain assortment.
 * Does not talk to Mapbox — only prepares intended Title→Product patches.
 */

import { asc, eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  retailChainProducts,
  retailChains,
} from "@/server/db/schema";
import { buildProductProperty } from "@/server/retail/product-tokens";
import { isAssortmentSkuOutOfStock } from "@/server/retail/sku-map";

export type ChainProductPatch = {
  chainId: string;
  chainSlug: string;
  chainTitle: string;
  /** Intended tileset `Product` property (comma-separated filter tokens). */
  product: string;
  availableSlugs: string[];
  skippedOutOfStockSlugs: string[];
};

export type TilesetPublishRecipe = {
  generatedAt: string;
  mode: "dry_run" | "live";
  patches: ChainProductPatch[];
  /** Live publish stays blocked until tileset IDs + allow flag Confirmed. */
  livePublishReady: boolean;
  blockers: string[];
};

export async function buildTilesetPublishRecipe(
  db: AppDb,
  opts: { mode?: "dry_run" | "live" } = {},
): Promise<TilesetPublishRecipe> {
  const mode = opts.mode ?? "dry_run";
  const chains = await db
    .select()
    .from(retailChains)
    .where(eq(retailChains.active, true))
    .orderBy(asc(retailChains.sortOrder), asc(retailChains.title));

  const rows = await db.select().from(retailChainProducts);
  const byChain = new Map<string, string[]>();
  const skippedByChain = new Map<string, string[]>();

  for (const row of rows) {
    if (!row.available) continue;
    if (isAssortmentSkuOutOfStock(row.productSlug)) {
      const bag = skippedByChain.get(row.chainId) ?? [];
      bag.push(row.productSlug);
      skippedByChain.set(row.chainId, bag);
      continue;
    }
    const bag = byChain.get(row.chainId) ?? [];
    bag.push(row.productSlug);
    byChain.set(row.chainId, bag);
  }

  const patches: ChainProductPatch[] = chains.map((chain) => {
    const availableSlugs = byChain.get(chain.id) ?? [];
    return {
      chainId: chain.id,
      chainSlug: chain.slug,
      chainTitle: chain.title,
      product: buildProductProperty(availableSlugs),
      availableSlugs,
      skippedOutOfStockSlugs: skippedByChain.get(chain.id) ?? [],
    };
  });

  const blockers: string[] = [];
  if (!process.env.MAPBOX_SECRET_TOKEN && !process.env.MAPBOX_TOKEN) {
    blockers.push("MAPBOX_SECRET_TOKEN (or MAPBOX_TOKEN) missing");
  }
  if (!process.env.MAPBOX_USERNAME) {
    blockers.push("MAPBOX_USERNAME missing (Open — owner of style tilesets)");
  }
  if (!process.env.MAPBOX_TILESET_IDS?.trim()) {
    blockers.push(
      "MAPBOX_TILESET_IDS missing (Open — comma-separated tileset ids)",
    );
  }
  if (process.env.MAPBOX_ALLOW_TILESET_PUBLISH !== "true") {
    blockers.push(
      "MAPBOX_ALLOW_TILESET_PUBLISH is not true (live publish gated)",
    );
  }

  return {
    generatedAt: new Date().toISOString(),
    mode,
    patches,
    livePublishReady: blockers.length === 0,
    blockers,
  };
}
