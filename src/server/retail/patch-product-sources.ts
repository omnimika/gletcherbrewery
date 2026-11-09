/**
 * Patch local Mapbox source GeoJSON/CSV: set `Product` from CRM chain assortment.
 * Writes staged GeoJSON under tmp/mapbox-sources/staged/ — does not call Mapbox.
 */

import fs from "node:fs";
import path from "node:path";
import type { ChainProductPatch } from "@/server/retail/tileset-recipe";
import {
  CRM_TITLE_TO_SOURCE_TITLES,
  LAYER_SOURCE_FILES,
  normalizeChainTitle,
  resolveSourcePath,
  type SourceFileRef,
} from "@/server/retail/source-manifest";
import type { RetailMapLayerId } from "@/server/retail/mapbox-tilesets";

type FeatureLike = {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: string;
    coordinates: unknown;
  } | null;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: FeatureLike[];
};

export type LayerPatchReport = {
  layerId: RetailMapLayerId;
  sourceFile: string;
  quality: SourceFileRef["quality"];
  featureCount: number;
  updated: number;
  unchanged: number;
  unmatchedTitles: string[];
  stagedPath: string | null;
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

function csvRowsToFeatureCollection(
  rows: Record<string, string>[],
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: rows.map((row) => {
      const lon = Number(String(row.Longitude ?? row.longitude ?? "").replace(",", "."));
      const lat = Number(String(row.Latitude ?? row.latitude ?? "").replace(",", "."));
      const geometry =
        Number.isFinite(lon) && Number.isFinite(lat)
          ? { type: "Point" as const, coordinates: [lon, lat] }
          : null;
      return {
        type: "Feature" as const,
        properties: {
          Type: row.Type ?? row.type ?? "",
          Title: row.Title ?? row.title ?? "",
          City: row.City ?? row.city ?? "",
          Adress: row.Adress ?? row.Address ?? row.address ?? "",
          Product: row.Product ?? row.product ?? "",
          Packing: row.Packing ?? row.packing ?? "",
        },
        geometry,
      };
    }),
  };
}

function loadSource(ref: SourceFileRef, repoRoot: string): FeatureCollection {
  const abs = resolveSourcePath(ref, repoRoot);
  const raw = fs.readFileSync(abs, "utf8");
  if (ref.format === "geojson") {
    const parsed = JSON.parse(raw) as FeatureCollection;
    if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
      throw new Error(`Invalid FeatureCollection: ${ref.relativePath}`);
    }
    return parsed;
  }
  return csvRowsToFeatureCollection(parseCsv(raw));
}

/** Build lookup: normalized source Title → CRM product string. */
function productBySourceTitle(
  patches: ChainProductPatch[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const patch of patches) {
    const aliases =
      CRM_TITLE_TO_SOURCE_TITLES[patch.chainTitle] ?? [patch.chainTitle];
    for (const alias of aliases) {
      map.set(normalizeChainTitle(alias), patch.product);
    }
    map.set(normalizeChainTitle(patch.chainTitle), patch.product);
  }
  return map;
}

export function patchLocalProductSources(input: {
  patches: ChainProductPatch[];
  repoRoot: string;
  outDir?: string;
}): { reports: LayerPatchReport[]; outDir: string } {
  const outDir =
    input.outDir ??
    path.join(input.repoRoot, "tmp/mapbox-sources/staged");
  fs.mkdirSync(outDir, { recursive: true });

  const byTitle = productBySourceTitle(input.patches);
  const reports: LayerPatchReport[] = [];

  for (const ref of LAYER_SOURCE_FILES) {
    const fc = loadSource(ref, input.repoRoot);
    let updated = 0;
    let unchanged = 0;
    const seenUnmatched = new Set<string>();

    for (const feature of fc.features) {
      const title = String(feature.properties.Title ?? "").trim();
      const key = normalizeChainTitle(title);
      if (!key) {
        unchanged += 1;
        continue;
      }
      if (!byTitle.has(key)) {
        seenUnmatched.add(title);
        unchanged += 1;
        continue;
      }
      const next = byTitle.get(key) ?? "";
      const prev = String(feature.properties.Product ?? "");
      if (prev === next) {
        unchanged += 1;
        continue;
      }
      feature.properties.Product = next;
      updated += 1;
    }

    const stagedName = `${ref.layerId}.geojson`;
    const stagedPath = path.join(outDir, stagedName);
    fs.writeFileSync(stagedPath, JSON.stringify(fc));

    reports.push({
      layerId: ref.layerId,
      sourceFile: ref.relativePath,
      quality: ref.quality,
      featureCount: fc.features.length,
      updated,
      unchanged,
      unmatchedTitles: [...seenUnmatched].sort(),
      stagedPath,
    });
  }

  return { reports, outDir };
}
