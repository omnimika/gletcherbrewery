/**
 * Public `/map` branded stores from CRM (`locals-abroad`).
 * Until Studio style includes the tileset, SalesMap paints a GeoJSON overlay.
 */

import { and, eq, inArray } from "drizzle-orm";
import {
  MAP_BRANDED_FALLBACK_POINTS,
  MAP_BRANDED_MAPBOX_LAYER_ID,
  MAP_BRANDED_STORE_OPTIONS,
  type MapBrandedStorePoint,
} from "@/content/map-branded-stores";
import type { AppDb } from "@/server/db/client";
import { retailChains, retailLocations } from "@/server/db/schema";
import { bindingForChainTitle } from "@/server/retail/chain-layer-registry";

const BRANDED_TITLES = MAP_BRANDED_STORE_OPTIONS.map((o) => o.label);

function brandIdForTitle(title: string): string | null {
  const opt = MAP_BRANDED_STORE_OPTIONS.find((o) => o.label === title);
  return opt?.id ?? null;
}

export async function loadBrandedMapStorePoints(
  db: AppDb | null,
): Promise<readonly MapBrandedStorePoint[]> {
  if (!db) return MAP_BRANDED_FALLBACK_POINTS;

  try {
    const rows = await db
      .select({
        locationId: retailLocations.id,
        title: retailLocations.sourceTitle,
        address: retailLocations.adress,
        product: retailLocations.productSnapshot,
        longitude: retailLocations.longitude,
        latitude: retailLocations.latitude,
        chainTitle: retailChains.title,
        chainSlug: retailChains.slug,
        mapLayerId: retailLocations.mapLayerId,
      })
      .from(retailLocations)
      .innerJoin(retailChains, eq(retailLocations.chainId, retailChains.id))
      .where(
        and(
          eq(retailLocations.status, "active"),
          inArray(retailChains.title, [...BRANDED_TITLES]),
        ),
      );

    const points: MapBrandedStorePoint[] = [];
    for (const row of rows) {
      const binding = bindingForChainTitle(row.chainTitle);
      if (binding?.layerId !== MAP_BRANDED_MAPBOX_LAYER_ID) continue;
      const brandId =
        brandIdForTitle(row.chainTitle) ??
        row.chainSlug ??
        null;
      if (!brandId) continue;
      if (!Number.isFinite(row.longitude) || !Number.isFinite(row.latitude)) {
        continue;
      }
      points.push({
        locationId: row.locationId,
        brandId,
        title: row.title || row.chainTitle,
        address: row.address?.trim() || "",
        product: row.product?.trim() || "Фирменный магазин",
        coordinates: [row.longitude, row.latitude],
      });
    }

    if (points.length === 0) return MAP_BRANDED_FALLBACK_POINTS;

    // Keep panel order: Gletcher then SVAM; stable within brand.
    const order = new Map(
      MAP_BRANDED_STORE_OPTIONS.map((o, i) => [o.id, i] as const),
    );
    points.sort((a, b) => {
      const ao = order.get(a.brandId) ?? 99;
      const bo = order.get(b.brandId) ?? 99;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title, "ru");
    });
    return points;
  } catch {
    return MAP_BRANDED_FALLBACK_POINTS;
  }
}
