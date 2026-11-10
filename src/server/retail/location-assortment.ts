/**
 * Per-store SKU overrides on top of chain-level assortment.
 * inherit → Product from chain; override → Product from retail_location_products.
 */

import { and, eq } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  retailAssortmentEvents,
  retailChainProducts,
  retailLocationProducts,
  retailLocations,
} from "@/server/db/schema";
import { buildProductProperty } from "@/server/retail/product-tokens";
import { ASSORTMENT_COLUMNS, isAssortmentSkuOutOfStock } from "@/server/retail/sku-map";

export type LocationAssortmentDetail = {
  id: string;
  chainId: string | null;
  sourceTitle: string;
  city: string | null;
  adress: string | null;
  mapLayerId: string | null;
  sourceKey: string;
  assortmentMode: "inherit" | "override";
  columns: Array<{
    productSlug: string;
    catalogName: string;
    outOfStock: boolean;
  }>;
  /** Effective checkboxes shown in UI */
  products: Record<string, boolean>;
  /** Chain baseline (for comparison when override) */
  chainProducts: Record<string, boolean>;
  effectiveProduct: string;
  availableCount: number;
};

function emptyProductMap(): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const c of ASSORTMENT_COLUMNS) out[c.productSlug] = false;
  return out;
}

async function loadChainProducts(
  db: AppDb,
  chainId: string | null,
): Promise<Record<string, boolean>> {
  const products = emptyProductMap();
  if (!chainId) return products;
  const rows = await db
    .select()
    .from(retailChainProducts)
    .where(eq(retailChainProducts.chainId, chainId));
  for (const row of rows) {
    if (row.productSlug in products) products[row.productSlug] = row.available;
  }
  return products;
}

export async function getLocationAssortment(
  db: AppDb,
  locationId: string,
): Promise<LocationAssortmentDetail | null> {
  const [loc] = await db
    .select()
    .from(retailLocations)
    .where(eq(retailLocations.id, locationId))
    .limit(1);
  if (!loc) return null;

  const chainProducts = await loadChainProducts(db, loc.chainId);
  const mode = loc.assortmentMode === "override" ? "override" : "inherit";
  let products = { ...chainProducts };

  if (mode === "override") {
    products = emptyProductMap();
    const rows = await db
      .select()
      .from(retailLocationProducts)
      .where(eq(retailLocationProducts.locationId, locationId));
    for (const row of rows) {
      if (row.productSlug in products) products[row.productSlug] = row.available;
    }
  }

  const availableSlugs = Object.entries(products)
    .filter(([slug, on]) => on && !isAssortmentSkuOutOfStock(slug))
    .map(([slug]) => slug);

  return {
    id: loc.id,
    chainId: loc.chainId,
    sourceTitle: loc.sourceTitle,
    city: loc.city,
    adress: loc.adress,
    mapLayerId: loc.mapLayerId,
    sourceKey: loc.sourceKey,
    assortmentMode: mode,
    columns: ASSORTMENT_COLUMNS.map((c) => ({
      productSlug: c.productSlug,
      catalogName: c.catalogName,
      outOfStock: isAssortmentSkuOutOfStock(c.productSlug),
    })),
    products,
    chainProducts,
    effectiveProduct: buildProductProperty(availableSlugs),
    availableCount: availableSlugs.length,
  };
}

export async function setLocationAssortmentMode(
  db: AppDb,
  input: {
    locationId: string;
    mode: "inherit" | "override";
    actor: string;
  },
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const [loc] = await db
    .select()
    .from(retailLocations)
    .where(eq(retailLocations.id, input.locationId))
    .limit(1);
  if (!loc) {
    return { ok: false, code: "not_found", message: "Location not found" };
  }
  if (!loc.chainId && input.mode === "override") {
    return {
      ok: false,
      code: "no_chain",
      message: "Нельзя задать override без привязки к сети",
    };
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    if (input.mode === "override") {
      const chainRows = await tx
        .select()
        .from(retailChainProducts)
        .where(eq(retailChainProducts.chainId, loc.chainId!));

      await tx
        .delete(retailLocationProducts)
        .where(eq(retailLocationProducts.locationId, input.locationId));

      if (chainRows.length > 0) {
        await tx.insert(retailLocationProducts).values(
          chainRows.map((r) => ({
            locationId: input.locationId,
            productSlug: r.productSlug,
            available: r.available,
            updatedAt: now,
            updatedBy: input.actor,
          })),
        );
      } else {
        // Seed all catalog SKUs as false so toggles have rows
        await tx.insert(retailLocationProducts).values(
          ASSORTMENT_COLUMNS.map((c) => ({
            locationId: input.locationId,
            productSlug: c.productSlug,
            available: false,
            updatedAt: now,
            updatedBy: input.actor,
          })),
        );
      }
    } else {
      await tx
        .delete(retailLocationProducts)
        .where(eq(retailLocationProducts.locationId, input.locationId));
    }

    await tx
      .update(retailLocations)
      .set({
        assortmentMode: input.mode,
        updatedAt: now,
        productSnapshot:
          input.mode === "inherit" ? loc.productSnapshot : loc.productSnapshot,
      })
      .where(eq(retailLocations.id, input.locationId));

    if (loc.chainId) {
      await tx.insert(retailAssortmentEvents).values({
        chainId: loc.chainId,
        productSlug: "*",
        action:
          input.mode === "override"
            ? "location_override_enable"
            : "location_override_disable",
        actor: input.actor,
        payload: { locationId: input.locationId, mode: input.mode },
        createdAt: now,
      });
    }
  });

  return { ok: true };
}

export async function setLocationProductAvailability(
  db: AppDb,
  input: {
    locationId: string;
    productSlug: string;
    available: boolean;
    actor: string;
  },
): Promise<{ ok: true } | { ok: false; code: string; message: string }> {
  const known = ASSORTMENT_COLUMNS.some(
    (c) => c.productSlug === input.productSlug,
  );
  if (!known) {
    return { ok: false, code: "unknown_sku", message: "Unknown product slug" };
  }
  if (isAssortmentSkuOutOfStock(input.productSlug)) {
    return {
      ok: false,
      code: "out_of_stock",
      message: "Сорт OUT OF STOCK — чекбокс недоступен",
    };
  }

  const [loc] = await db
    .select()
    .from(retailLocations)
    .where(eq(retailLocations.id, input.locationId))
    .limit(1);
  if (!loc) {
    return { ok: false, code: "not_found", message: "Location not found" };
  }
  if (loc.assortmentMode !== "override") {
    return {
      ok: false,
      code: "inherit_mode",
      message: "Сначала включите персональный ассортимент точки",
    };
  }
  if (!loc.chainId) {
    return { ok: false, code: "no_chain", message: "Точка без сети" };
  }

  const now = new Date();
  await db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(retailLocationProducts)
      .where(
        and(
          eq(retailLocationProducts.locationId, input.locationId),
          eq(retailLocationProducts.productSlug, input.productSlug),
        ),
      )
      .limit(1);
    const prev = existing[0]?.available ?? false;

    if (existing[0]) {
      await tx
        .update(retailLocationProducts)
        .set({
          available: input.available,
          updatedAt: now,
          updatedBy: input.actor,
        })
        .where(
          and(
            eq(retailLocationProducts.locationId, input.locationId),
            eq(retailLocationProducts.productSlug, input.productSlug),
          ),
        );
    } else {
      await tx.insert(retailLocationProducts).values({
        locationId: input.locationId,
        productSlug: input.productSlug,
        available: input.available,
        updatedAt: now,
        updatedBy: input.actor,
      });
    }

    const locRows = await tx
      .select()
      .from(retailLocationProducts)
      .where(eq(retailLocationProducts.locationId, input.locationId));
    const availableSlugs = locRows
      .filter((r) => r.available && !isAssortmentSkuOutOfStock(r.productSlug))
      .map((r) => r.productSlug);

    await tx
      .update(retailLocations)
      .set({
        updatedAt: now,
        productSnapshot: buildProductProperty(availableSlugs),
      })
      .where(eq(retailLocations.id, input.locationId));

    await tx.insert(retailAssortmentEvents).values({
      chainId: loc.chainId!,
      productSlug: input.productSlug,
      action: "location_set_available",
      actor: input.actor,
      payload: {
        locationId: input.locationId,
        from: prev,
        to: input.available,
      },
      createdAt: now,
    });
  });

  return { ok: true };
}

/**
 * source_key → Product string for locations in override mode.
 * Used by Mapbox Product patch so individual stores can differ from the chain.
 */
export async function loadLocationProductOverrides(
  db: AppDb,
): Promise<Map<string, string>> {
  const locs = await db
    .select({
      sourceKey: retailLocations.sourceKey,
      locationId: retailLocations.id,
    })
    .from(retailLocations)
    .where(eq(retailLocations.assortmentMode, "override"));

  if (locs.length === 0) return new Map();

  const rows = await db.select().from(retailLocationProducts);
  const byLoc = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.available || isAssortmentSkuOutOfStock(row.productSlug)) continue;
    const bag = byLoc.get(row.locationId) ?? [];
    bag.push(row.productSlug);
    byLoc.set(row.locationId, bag);
  }

  const out = new Map<string, string>();
  for (const loc of locs) {
    out.set(
      loc.sourceKey,
      buildProductProperty(byLoc.get(loc.locationId) ?? []),
    );
  }
  return out;
}
