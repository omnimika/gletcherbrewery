/**
 * Import store points from local Mapbox source GeoJSON/CSV into app.retail_locations.
 * Upserts by source_key; does not auto-delete missing points (stale mark is Open).
 */

import fs from "node:fs";
import path from "node:path";
import type { AppDb } from "@/server/db/client";
import { retailChains, retailLocations } from "@/server/db/schema";
import {
  bindingForChainTitle,
  crmTitleForSourceTitle,
} from "@/server/retail/chain-layer-registry";
import { buildLocationSourceKey } from "@/server/retail/location-key";
import {
  LAYER_SOURCE_FILES,
  resolveSourcePath,
  type SourceFileRef,
} from "@/server/retail/source-manifest";

type FeatureLike = {
  properties?: Record<string, unknown>;
  geometry?: { type?: string; coordinates?: unknown } | null;
};

export type LocationImportReport = {
  layerId: string;
  sourceFile: string;
  read: number;
  upserted: number;
  skipped: number;
  matched: number;
  unmatched: number;
  unmatchedTitles: string[];
};

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const delim = lines[0]!.includes(";") ? ";" : ",";
  const headers = lines[0]!.split(delim).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(delim);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? "").trim();
    });
    return row;
  });
}

function loadFeatures(
  ref: SourceFileRef,
  repoRoot: string,
): Array<{
  title: string;
  type: string;
  city: string;
  adress: string;
  packing: string;
  product: string;
  lon: number;
  lat: number;
  externalId: string | null;
}> {
  const abs = resolveSourcePath(ref, repoRoot);
  if (!fs.existsSync(abs)) return [];
  const raw = fs.readFileSync(abs, "utf8");

  if (ref.format === "geojson") {
    const fc = JSON.parse(raw) as { features?: FeatureLike[] };
    const out = [];
    for (const f of fc.features ?? []) {
      const coords = f.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      const lon = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      const p = f.properties ?? {};
      out.push({
        title: String(p.Title ?? p.title ?? "").trim(),
        type: String(p.Type ?? p.type ?? "").trim(),
        city: String(p.City ?? p.city ?? "").trim(),
        adress: String(p.Adress ?? p.Address ?? p.address ?? "").trim(),
        packing: String(p.Packing ?? p.packing ?? "").trim(),
        product: String(p.Product ?? p.product ?? "").trim(),
        lon,
        lat,
        externalId: p.SourceId != null ? String(p.SourceId) : null,
      });
    }
    return out;
  }

  return parseCsv(raw)
    .map((row) => {
      const lon = Number(String(row.Longitude ?? row.longitude ?? "").replace(",", "."));
      const lat = Number(String(row.Latitude ?? row.latitude ?? "").replace(",", "."));
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
      return {
        title: (row.Title ?? row.title ?? "").trim(),
        type: (row.Type ?? row.type ?? "").trim(),
        city: (row.City ?? row.city ?? "").trim(),
        adress: (row.Adress ?? row.Address ?? row.address ?? "").trim(),
        packing: (row.Packing ?? row.packing ?? "").trim(),
        product: (row.Product ?? row.product ?? "").trim(),
        lon,
        lat,
        externalId: null as string | null,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);
}

export async function importLocationsFromSources(
  db: AppDb,
  input: { repoRoot?: string; actor?: string } = {},
): Promise<{ reports: LocationImportReport[]; totals: Record<string, number> }> {
  const repoRoot = input.repoRoot ?? process.cwd();
  const chains = await db.select().from(retailChains);
  const chainIdByTitle = new Map(chains.map((c) => [c.title, c.id] as const));

  const reports: LocationImportReport[] = [];
  let upsertedTotal = 0;
  let matchedTotal = 0;
  let unmatchedTotal = 0;
  let skippedTotal = 0;

  for (const ref of LAYER_SOURCE_FILES) {
    const abs = resolveSourcePath(ref, repoRoot);
    const relative = path.relative(repoRoot, abs);
    const unmatchedTitles = new Set<string>();
    let read = 0;
    let upserted = 0;
    let skipped = 0;
    let matched = 0;
    let unmatched = 0;

    if (!fs.existsSync(abs)) {
      reports.push({
        layerId: ref.layerId,
        sourceFile: relative,
        read: 0,
        upserted: 0,
        skipped: 0,
        matched: 0,
        unmatched: 0,
        unmatchedTitles: [],
      });
      continue;
    }

    const features = loadFeatures(ref, repoRoot);
    read = features.length;

    for (const f of features) {
      if (!f.title) {
        skipped += 1;
        continue;
      }
      const crmTitle = crmTitleForSourceTitle(f.title);
      const chainId = crmTitle ? (chainIdByTitle.get(crmTitle) ?? null) : null;
      const binding = crmTitle ? bindingForChainTitle(crmTitle) : undefined;
      const status = chainId ? "active" : "unmatched";
      if (chainId) matched += 1;
      else {
        unmatched += 1;
        unmatchedTitles.add(f.title);
      }

      const sourceKey = buildLocationSourceKey({
        layerId: ref.layerId,
        longitude: f.lon,
        latitude: f.lat,
        adress: f.adress || f.title,
        title: f.title,
      });

      const now = new Date();
      await db
        .insert(retailLocations)
        .values({
          chainId,
          mapLayerId: binding?.layerId ?? ref.layerId,
          sourceKey,
          sourceTitle: f.title,
          type: f.type || null,
          city: f.city || null,
          adress: f.adress || null,
          packing: f.packing || null,
          productSnapshot: f.product || null,
          longitude: f.lon,
          latitude: f.lat,
          status,
          sourceFile: relative,
          externalId: f.externalId,
          importedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: retailLocations.sourceKey,
          set: {
            chainId,
            mapLayerId: binding?.layerId ?? ref.layerId,
            sourceTitle: f.title,
            type: f.type || null,
            city: f.city || null,
            adress: f.adress || null,
            packing: f.packing || null,
            productSnapshot: f.product || null,
            longitude: f.lon,
            latitude: f.lat,
            status,
            sourceFile: relative,
            externalId: f.externalId,
            importedAt: now,
            updatedAt: now,
          },
        });
      upserted += 1;
    }

    reports.push({
      layerId: ref.layerId,
      sourceFile: relative,
      read,
      upserted,
      skipped,
      matched,
      unmatched,
      unmatchedTitles: [...unmatchedTitles].sort(),
    });
    upsertedTotal += upserted;
    matchedTotal += matched;
    unmatchedTotal += unmatched;
    skippedTotal += skipped;
  }

  return {
    reports,
    totals: {
      upserted: upsertedTotal,
      matched: matchedTotal,
      unmatched: unmatchedTotal,
      skipped: skippedTotal,
    },
  };
}
