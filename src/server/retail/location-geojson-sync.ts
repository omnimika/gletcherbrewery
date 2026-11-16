/**
 * Keep local Mapbox source GeoJSON in sync when staff creates/deletes points.
 * Live /map still needs Product publish after these edits.
 */

import fs from "node:fs";
import path from "node:path";
import { buildLocationSourceKey } from "@/server/retail/location-key";
import {
  LAYER_SOURCE_FILES,
  resolveSourcePath,
} from "@/server/retail/source-manifest";
import type { RetailMapLayerId } from "@/server/retail/mapbox-tilesets";

type Feature = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: { type: "Point"; coordinates: [number, number] } | null;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

function featureSourceKey(
  layerId: string,
  feature: Feature,
): string | null {
  const coords = feature.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const lon = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  const title = String(feature.properties.Title ?? "").trim();
  const adress = String(
    feature.properties.Adress ?? feature.properties.Address ?? "",
  ).trim();
  if (!title) return null;
  return buildLocationSourceKey({
    layerId,
    longitude: lon,
    latitude: lat,
    adress: adress || title,
    title,
  });
}

function loadLayerFc(
  layerId: string,
  repoRoot: string,
): { abs: string; fc: FeatureCollection } | null {
  const ref = LAYER_SOURCE_FILES.find((r) => r.layerId === layerId);
  if (!ref || ref.format !== "geojson") return null;
  const abs = resolveSourcePath(ref, repoRoot);
  if (!fs.existsSync(abs)) {
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    const empty: FeatureCollection = { type: "FeatureCollection", features: [] };
    fs.writeFileSync(abs, JSON.stringify(empty));
    return { abs, fc: empty };
  }
  const parsed = JSON.parse(fs.readFileSync(abs, "utf8")) as FeatureCollection;
  if (!parsed || !Array.isArray(parsed.features)) {
    return {
      abs,
      fc: { type: "FeatureCollection", features: [] },
    };
  }
  return { abs, fc: parsed };
}

export function appendLocationToLayerGeoJson(input: {
  layerId: string;
  repoRoot?: string;
  title: string;
  type?: string | null;
  city?: string | null;
  adress?: string | null;
  packing?: string | null;
  product?: string | null;
  longitude: number;
  latitude: number;
}): { ok: true; path: string } | { ok: false; reason: string } {
  const repoRoot = input.repoRoot ?? process.cwd();
  const loaded = loadLayerFc(input.layerId, repoRoot);
  if (!loaded) {
    return {
      ok: false,
      reason: `Слой ${input.layerId} не имеет локального GeoJSON (только CSV/нет файла)`,
    };
  }

  const sourceKey = buildLocationSourceKey({
    layerId: input.layerId,
    longitude: input.longitude,
    latitude: input.latitude,
    adress: (input.adress || input.title).trim(),
    title: input.title,
  });

  for (const f of loaded.fc.features) {
    if (featureSourceKey(input.layerId, f) === sourceKey) {
      return { ok: false, reason: "Такая точка уже есть в GeoJSON слоя" };
    }
  }

  loaded.fc.features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [input.longitude, input.latitude],
    },
    properties: {
      Type: input.type ?? "",
      Title: input.title,
      City: input.city ?? "",
      Adress: input.adress ?? "",
      Product: input.product ?? "",
      Packing: input.packing ?? "",
    },
  });
  fs.writeFileSync(loaded.abs, JSON.stringify(loaded.fc));
  return { ok: true, path: path.relative(repoRoot, loaded.abs) };
}

export function removeLocationFromLayerGeoJson(input: {
  layerId: string;
  sourceKey: string;
  repoRoot?: string;
}): { ok: true; removed: number; path: string } | { ok: false; reason: string } {
  const repoRoot = input.repoRoot ?? process.cwd();
  const loaded = loadLayerFc(input.layerId, repoRoot);
  if (!loaded) {
    return {
      ok: false,
      reason: `Слой ${input.layerId} не имеет локального GeoJSON`,
    };
  }
  const before = loaded.fc.features.length;
  loaded.fc.features = loaded.fc.features.filter(
    (f) => featureSourceKey(input.layerId, f) !== input.sourceKey,
  );
  const removed = before - loaded.fc.features.length;
  fs.writeFileSync(loaded.abs, JSON.stringify(loaded.fc));
  return {
    ok: true,
    removed,
    path: path.relative(repoRoot, loaded.abs),
  };
}

/** Patch City (and optional Title) on a feature matched by current sourceKey. */
export function patchLocationInLayerGeoJson(input: {
  layerId: string;
  sourceKey: string;
  repoRoot?: string;
  city?: string | null;
  title?: string | null;
}):
  | { ok: true; patched: number; path: string }
  | { ok: false; reason: string } {
  const repoRoot = input.repoRoot ?? process.cwd();
  const loaded = loadLayerFc(input.layerId, repoRoot);
  if (!loaded) {
    return {
      ok: false,
      reason: `Слой ${input.layerId} не имеет локального GeoJSON`,
    };
  }
  let patched = 0;
  for (const f of loaded.fc.features) {
    if (featureSourceKey(input.layerId, f) !== input.sourceKey) continue;
    if (input.city !== undefined) {
      f.properties.City = input.city ?? "";
    }
    if (input.title !== undefined && input.title !== null) {
      f.properties.Title = input.title;
    }
    patched += 1;
  }
  if (patched === 0) {
    return { ok: false, reason: "Точка не найдена в GeoJSON слоя" };
  }
  fs.writeFileSync(loaded.abs, JSON.stringify(loaded.fc));
  return {
    ok: true,
    patched,
    path: path.relative(repoRoot, loaded.abs),
  };
}

export function isGeoJsonLayer(layerId: string): layerId is RetailMapLayerId {
  return LAYER_SOURCE_FILES.some(
    (r) => r.layerId === layerId && r.format === "geojson",
  );
}
