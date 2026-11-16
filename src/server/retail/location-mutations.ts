/**
 * Staff create/delete/bulk-update for retail_locations (+ optional local GeoJSON sync).
 */

import { asc, eq, inArray } from "drizzle-orm";
import type { AppDb } from "@/server/db/client";
import {
  retailChainProducts,
  retailChains,
  retailLocations,
} from "@/server/db/schema";
import { slugifyTitle } from "@/server/retail/assortment";
import { bindingForChainTitle } from "@/server/retail/chain-layer-registry";
import { buildLocationSourceKey } from "@/server/retail/location-key";
import { buildProductProperty } from "@/server/retail/product-tokens";
import { ASSORTMENT_COLUMNS, isAssortmentSkuOutOfStock } from "@/server/retail/sku-map";
import { normalizeChainTitle } from "@/server/retail/source-manifest";
import {
  appendLocationToLayerGeoJson,
  isGeoJsonLayer,
  patchLocationInLayerGeoJson,
  removeLocationFromLayerGeoJson,
} from "@/server/retail/location-geojson-sync";

const UUID_RE = /^[0-9a-f-]{36}$/i;
const BULK_MAX = 250;

export type CreateLocationInput = {
  /** Existing chain id — mutually preferred over chainTitle when both set */
  chainId?: string | null;
  /** New or existing chain title (creates CRM-only chain if missing) */
  chainTitle?: string | null;
  city?: string | null;
  adress: string;
  type?: string | null;
  packing?: string | null;
  longitude: number;
  latitude: number;
  /** Also write into local layer GeoJSON (default true when layer is geojson) */
  syncGeoJson?: boolean;
  actor: string;
  repoRoot?: string;
};

export type MutationResult =
  | {
      ok: true;
      locationId: string;
      sourceKey: string;
      geoJson?: { synced: boolean; path?: string; warning?: string };
    }
  | { ok: false; code: string; message: string };

function validCoord(lon: number, lat: number): boolean {
  return (
    Number.isFinite(lon) &&
    Number.isFinite(lat) &&
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

async function chainProductString(
  db: AppDb,
  chainId: string,
): Promise<string> {
  const rows = await db
    .select()
    .from(retailChainProducts)
    .where(eq(retailChainProducts.chainId, chainId));
  const slugs = rows
    .filter((r) => r.available && !isAssortmentSkuOutOfStock(r.productSlug))
    .map((r) => r.productSlug);
  return buildProductProperty(slugs);
}

async function resolveOrCreateChain(
  db: AppDb,
  input: CreateLocationInput,
): Promise<
  | { ok: true; chain: typeof retailChains.$inferSelect }
  | { ok: false; code: string; message: string }
> {
  if (input.chainId?.trim()) {
    const [chain] = await db
      .select()
      .from(retailChains)
      .where(eq(retailChains.id, input.chainId.trim()))
      .limit(1);
    if (!chain) {
      return { ok: false, code: "not_found", message: "Сеть не найдена" };
    }
    return { ok: true, chain };
  }

  const title = (input.chainTitle ?? "").trim();
  if (!title) {
    return {
      ok: false,
      code: "invalid_chain",
      message: "Выберите сеть или введите своё название",
    };
  }

  const want = normalizeChainTitle(title);
  const all = await db
    .select()
    .from(retailChains)
    .orderBy(asc(retailChains.sortOrder), asc(retailChains.title));
  const existing = all.find((c) => normalizeChainTitle(c.title) === want);
  if (existing) return { ok: true, chain: existing };

  const now = new Date();
  let slug = slugifyTitle(title) || `chain-${Date.now().toString(36)}`;
  const slugTaken = await db
    .select({ id: retailChains.id })
    .from(retailChains)
    .where(eq(retailChains.slug, slug))
    .limit(1);
  if (slugTaken[0]) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const [inserted] = await db
    .insert(retailChains)
    .values({
      slug,
      title,
      sortOrder: 9000 + all.length,
      active: true,
      updatedAt: now,
      updatedBy: input.actor,
    })
    .returning();

  if (!inserted) {
    return { ok: false, code: "insert_failed", message: "Не удалось создать сеть" };
  }

  await db.insert(retailChainProducts).values(
    ASSORTMENT_COLUMNS.map((c) => ({
      chainId: inserted.id,
      productSlug: c.productSlug,
      available: false,
      updatedAt: now,
      updatedBy: input.actor,
    })),
  );

  return { ok: true, chain: inserted };
}

export async function createLocation(
  db: AppDb,
  input: CreateLocationInput,
): Promise<MutationResult> {
  const adress = input.adress.trim();
  if (!adress) {
    return { ok: false, code: "invalid_adress", message: "Укажите адрес" };
  }
  if (!validCoord(input.longitude, input.latitude)) {
    return {
      ok: false,
      code: "invalid_coords",
      message: "Некорректные координаты",
    };
  }

  const resolved = await resolveOrCreateChain(db, input);
  if (!resolved.ok) return resolved;
  const chain = resolved.chain;

  const binding = bindingForChainTitle(chain.title);
  const sourceTitle = binding?.sourceTitles[0] ?? chain.title;
  const mapLayerId = binding?.layerId ?? null;
  const layerKey = mapLayerId ?? `crm:${chain.slug}`;
  const sourceKey = buildLocationSourceKey({
    layerId: layerKey,
    longitude: input.longitude,
    latitude: input.latitude,
    adress,
    title: sourceTitle,
  });

  const existing = await db
    .select({ id: retailLocations.id })
    .from(retailLocations)
    .where(eq(retailLocations.sourceKey, sourceKey))
    .limit(1);
  if (existing[0]) {
    return {
      ok: false,
      code: "duplicate",
      message: "Такая точка уже есть в CRM",
    };
  }

  const product = await chainProductString(db, chain.id);
  const now = new Date();
  const relativeSource = mapLayerId
    ? `tmp/mapbox-sources/${mapLayerId}.geojson`
    : "staff:manual";

  const [row] = await db
    .insert(retailLocations)
    .values({
      chainId: chain.id,
      mapLayerId,
      sourceKey,
      sourceTitle,
      type: input.type?.trim() || null,
      city: input.city?.trim() || null,
      adress,
      packing: input.packing?.trim() || null,
      productSnapshot: product,
      longitude: input.longitude,
      latitude: input.latitude,
      status: "active",
      assortmentMode: "inherit",
      sourceFile: relativeSource,
      importedAt: now,
      updatedAt: now,
    })
    .returning({ id: retailLocations.id });

  if (!row) {
    return { ok: false, code: "insert_failed", message: "Не удалось создать" };
  }

  let geoJson: { synced: boolean; path?: string; warning?: string } = {
    synced: false,
  };

  const shouldSync = input.syncGeoJson !== false;
  if (shouldSync && mapLayerId && isGeoJsonLayer(mapLayerId)) {
    const sync = appendLocationToLayerGeoJson({
      layerId: mapLayerId,
      repoRoot: input.repoRoot,
      title: sourceTitle,
      type: input.type,
      city: input.city,
      adress,
      packing: input.packing,
      product,
      longitude: input.longitude,
      latitude: input.latitude,
    });
    if (sync.ok) {
      geoJson = { synced: true, path: sync.path };
    } else {
      geoJson = { synced: false, warning: sync.reason };
    }
  } else if (shouldSync && mapLayerId && !isGeoJsonLayer(mapLayerId)) {
    geoJson = {
      synced: false,
      warning:
        "Слой на CSV — точка только в CRM; для карты нужен GeoJSON/ручной tileset",
    };
  } else if (!mapLayerId) {
    geoJson = {
      synced: false,
      warning: "У сети нет Mapbox-слоя — точка только в CRM",
    };
  }

  return {
    ok: true,
    locationId: row.id,
    sourceKey,
    geoJson,
  };
}

export async function deleteLocation(
  db: AppDb,
  input: {
    locationId: string;
    syncGeoJson?: boolean;
    actor: string;
    repoRoot?: string;
  },
): Promise<MutationResult> {
  const [loc] = await db
    .select()
    .from(retailLocations)
    .where(eq(retailLocations.id, input.locationId))
    .limit(1);
  if (!loc) {
    return { ok: false, code: "not_found", message: "Точка не найдена" };
  }

  await db
    .delete(retailLocations)
    .where(eq(retailLocations.id, input.locationId));

  let geoJson: { synced: boolean; path?: string; warning?: string } = {
    synced: false,
  };
  const shouldSync = input.syncGeoJson !== false;
  if (shouldSync && loc.mapLayerId && isGeoJsonLayer(loc.mapLayerId)) {
    const sync = removeLocationFromLayerGeoJson({
      layerId: loc.mapLayerId,
      sourceKey: loc.sourceKey,
      repoRoot: input.repoRoot,
    });
    if (sync.ok) {
      geoJson = {
        synced: sync.removed > 0,
        path: sync.path,
        warning:
          sync.removed === 0
            ? "В GeoJSON точка не найдена (уже удалена или другой ключ)"
            : undefined,
      };
    } else {
      geoJson = { synced: false, warning: sync.reason };
    }
  }

  return {
    ok: true,
    locationId: input.locationId,
    sourceKey: loc.sourceKey,
    geoJson,
  };
}

export type BulkItemResult = {
  locationId: string;
  ok: boolean;
  code?: string;
  message?: string;
  geoJsonWarning?: string;
};

export type BulkResult =
  | {
      ok: true;
      action: "delete" | "set_chain" | "set_city";
      processed: number;
      failed: number;
      results: BulkItemResult[];
    }
  | { ok: false; code: string; message: string };

function normalizeIds(ids: string[]): string[] | { error: string } {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { error: "Выберите хотя бы одну точку" };
  }
  if (unique.length > BULK_MAX) {
    return { error: `Не больше ${BULK_MAX} точек за раз` };
  }
  if (unique.some((id) => !UUID_RE.test(id))) {
    return { error: "Некорректный id точки" };
  }
  return unique;
}

export async function bulkDeleteLocations(
  db: AppDb,
  input: {
    locationIds: string[];
    syncGeoJson?: boolean;
    actor: string;
    repoRoot?: string;
  },
): Promise<BulkResult> {
  const ids = normalizeIds(input.locationIds);
  if ("error" in ids) {
    return { ok: false, code: "invalid_ids", message: ids.error };
  }

  const results: BulkItemResult[] = [];
  for (const locationId of ids) {
    const result = await deleteLocation(db, {
      locationId,
      syncGeoJson: input.syncGeoJson,
      actor: input.actor,
      repoRoot: input.repoRoot,
    });
    if (result.ok) {
      results.push({
        locationId,
        ok: true,
        geoJsonWarning: result.geoJson?.warning,
      });
    } else {
      results.push({
        locationId,
        ok: false,
        code: result.code,
        message: result.message,
      });
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  return {
    ok: true,
    action: "delete",
    processed: results.length - failed,
    failed,
    results,
  };
}

export async function bulkUpdateLocations(
  db: AppDb,
  input: {
    locationIds: string[];
    /** set_chain: require chainId and/or chainTitle; set_city: city string (empty clears) */
    action: "set_chain" | "set_city";
    chainId?: string | null;
    chainTitle?: string | null;
    city?: string | null;
    syncGeoJson?: boolean;
    actor: string;
    repoRoot?: string;
  },
): Promise<BulkResult> {
  const ids = normalizeIds(input.locationIds);
  if ("error" in ids) {
    return { ok: false, code: "invalid_ids", message: ids.error };
  }

  let chain: typeof retailChains.$inferSelect | null = null;
  let product = "";
  let bindingSourceTitle: string | null = null;
  let mapLayerId: string | null = null;

  if (input.action === "set_chain") {
    const resolved = await resolveOrCreateChain(db, {
      chainId: input.chainId,
      chainTitle: input.chainTitle,
      adress: ".", // unused for resolve
      longitude: 0,
      latitude: 0,
      actor: input.actor,
    });
    if (!resolved.ok) {
      return { ok: false, code: resolved.code, message: resolved.message };
    }
    chain = resolved.chain;
    product = await chainProductString(db, chain.id);
    const binding = bindingForChainTitle(chain.title);
    bindingSourceTitle = binding?.sourceTitles[0] ?? chain.title;
    mapLayerId = binding?.layerId ?? null;
  }

  if (input.action === "set_city" && input.city === undefined) {
    return {
      ok: false,
      code: "invalid_city",
      message: "Укажите город (пустая строка — очистить)",
    };
  }

  const rows = await db
    .select()
    .from(retailLocations)
    .where(inArray(retailLocations.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r]));

  const results: BulkItemResult[] = [];
  const shouldSync = input.syncGeoJson !== false;
  const now = new Date();
  const cityValue =
    input.action === "set_city"
      ? (input.city ?? "").trim() || null
      : undefined;

  for (const locationId of ids) {
    const loc = byId.get(locationId);
    if (!loc) {
      results.push({
        locationId,
        ok: false,
        code: "not_found",
        message: "Точка не найдена",
      });
      continue;
    }

    try {
      if (input.action === "set_city") {
        await db
          .update(retailLocations)
          .set({ city: cityValue ?? null, updatedAt: now })
          .where(eq(retailLocations.id, locationId));

        let geoJsonWarning: string | undefined;
        if (shouldSync && loc.mapLayerId && isGeoJsonLayer(loc.mapLayerId)) {
          const sync = patchLocationInLayerGeoJson({
            layerId: loc.mapLayerId,
            sourceKey: loc.sourceKey,
            repoRoot: input.repoRoot,
            city: cityValue ?? null,
          });
          if (!sync.ok) geoJsonWarning = sync.reason;
        }
        results.push({ locationId, ok: true, geoJsonWarning });
        continue;
      }

      // set_chain
      if (!chain || !bindingSourceTitle) {
        results.push({
          locationId,
          ok: false,
          code: "invalid_chain",
          message: "Сеть не определена",
        });
        continue;
      }

      const layerKey = mapLayerId ?? `crm:${chain.slug}`;
      const newSourceKey = buildLocationSourceKey({
        layerId: layerKey,
        longitude: loc.longitude,
        latitude: loc.latitude,
        adress: loc.adress || bindingSourceTitle,
        title: bindingSourceTitle,
      });

      if (newSourceKey !== loc.sourceKey) {
        const [dup] = await db
          .select({ id: retailLocations.id })
          .from(retailLocations)
          .where(eq(retailLocations.sourceKey, newSourceKey))
          .limit(1);
        if (dup && dup.id !== locationId) {
          results.push({
            locationId,
            ok: false,
            code: "duplicate",
            message: "Конфликт ключа с другой точкой",
          });
          continue;
        }
      }

      const oldLayerId = loc.mapLayerId;
      const oldSourceKey = loc.sourceKey;
      const relativeSource = mapLayerId
        ? `tmp/mapbox-sources/${mapLayerId}.geojson`
        : loc.sourceFile;

      await db
        .update(retailLocations)
        .set({
          chainId: chain.id,
          mapLayerId,
          sourceKey: newSourceKey,
          sourceTitle: bindingSourceTitle,
          productSnapshot: product,
          status: loc.status === "unmatched" ? "active" : loc.status,
          sourceFile: relativeSource,
          updatedAt: now,
        })
        .where(eq(retailLocations.id, locationId));

      let geoJsonWarning: string | undefined;
      if (shouldSync) {
        const layerChanged = oldLayerId !== mapLayerId;
        const titleChanged = loc.sourceTitle !== bindingSourceTitle;

        if (oldLayerId && isGeoJsonLayer(oldLayerId) && (layerChanged || titleChanged)) {
          const rem = removeLocationFromLayerGeoJson({
            layerId: oldLayerId,
            sourceKey: oldSourceKey,
            repoRoot: input.repoRoot,
          });
          if (!rem.ok) geoJsonWarning = rem.reason;
        }

        if (mapLayerId && isGeoJsonLayer(mapLayerId)) {
          if (layerChanged || titleChanged) {
            const add = appendLocationToLayerGeoJson({
              layerId: mapLayerId,
              repoRoot: input.repoRoot,
              title: bindingSourceTitle,
              type: loc.type,
              city: loc.city,
              adress: loc.adress,
              packing: loc.packing,
              product,
              longitude: loc.longitude,
              latitude: loc.latitude,
            });
            if (!add.ok) {
              geoJsonWarning = [geoJsonWarning, add.reason]
                .filter(Boolean)
                .join("; ");
            }
          } else if (oldLayerId && isGeoJsonLayer(oldLayerId)) {
            // same layer & title — nothing to move; product may have changed
            const patch = patchLocationInLayerGeoJson({
              layerId: mapLayerId,
              sourceKey: newSourceKey,
              repoRoot: input.repoRoot,
              title: bindingSourceTitle,
            });
            if (!patch.ok) geoJsonWarning = patch.reason;
          }
        } else if (mapLayerId && !isGeoJsonLayer(mapLayerId)) {
          geoJsonWarning =
            "Слой на CSV — точка только в CRM; для карты нужен GeoJSON/ручной tileset";
        } else if (!mapLayerId) {
          geoJsonWarning = "У сети нет Mapbox-слоя — точка только в CRM";
        }
      }

      results.push({ locationId, ok: true, geoJsonWarning });
    } catch (err) {
      results.push({
        locationId,
        ok: false,
        code: "update_failed",
        message: err instanceof Error ? err.message : "Ошибка обновления",
      });
    }
  }

  const failed = results.filter((r) => !r.ok).length;
  return {
    ok: true,
    action: input.action,
    processed: results.length - failed,
    failed,
    results,
  };
}
