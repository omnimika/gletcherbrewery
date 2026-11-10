/**
 * Local Mapbox point sources under `tmp/mapbox-sources/` (gitignored).
 * Prefer GeoJSON when present; CSV is accepted (semicolon sheets).
 *
 * Owner note 10.11: current dumps are working baseline; a future script will
 * scrape retail-chain sites for fresher store geometries (Proposed).
 */

import path from "node:path";
import { crmTitleToSourceTitles } from "@/server/retail/chain-layer-registry";
import type { RetailMapLayerId } from "@/server/retail/mapbox-tilesets";

export type SourceFileRef = {
  layerId: RetailMapLayerId;
  /** Relative to repo root */
  relativePath: string;
  format: "geojson" | "csv";
  /** Quality note for staging reports */
  quality: "ok" | "provisional";
  note?: string;
};

/**
 * Preferred source file per retail layer.
 * Paths are relative to repo root; resolved at runtime.
 */
export const LAYER_SOURCE_FILES: readonly SourceFileRef[] = [
  {
    layerId: "auchan-atak",
    relativePath: "tmp/mapbox-sources/auchan-atak.geojson",
    format: "geojson",
    quality: "ok",
  },
  {
    layerId: "twoaxes-drinx-beruvykhodnoy",
    relativePath: "tmp/mapbox-sources/twoaxes-drinx-beruvykhodnoy.geojson",
    format: "geojson",
    quality: "ok",
  },
  {
    layerId: "winelab",
    relativePath: "tmp/mapbox-sources/winelab.geojson",
    format: "geojson",
    quality: "ok",
  },
  {
    layerId: "eurospar",
    relativePath: "tmp/mapbox-sources/eurospar.geojson",
    format: "geojson",
    quality: "ok",
  },
  {
    layerId: "azbuka",
    relativePath: "tmp/mapbox-sources/azbuka.geojson",
    format: "geojson",
    quality: "ok",
  },
  {
    layerId: "metro-globus-okey",
    relativePath: "tmp/mapbox-sources/metro-globus-okey.geojson",
    format: "geojson",
    quality: "ok",
  },
  {
    layerId: "selgros-miratorg-yabloko-5m7m",
    relativePath: "tmp/mapbox-sources/selgros-miratorg-yabloko-5m7m.csv",
    format: "csv",
    quality: "ok",
  },
  {
    layerId: "dixie",
    relativePath: "tmp/mapbox-sources/DIXIE.csv",
    format: "csv",
    quality: "ok",
  },
  {
    layerId: "magnit",
    relativePath: "tmp/mapbox-sources/magnit (final).csv",
    format: "csv",
    quality: "ok",
  },
  {
    layerId: "lenta",
    relativePath: "tmp/mapbox-sources/lenta.csv",
    format: "csv",
    quality: "ok",
  },
  {
    layerId: "perekrestok",
    relativePath: "tmp/mapbox-sources/perekrestok(notgood).csv",
    format: "csv",
    quality: "provisional",
    note: "Filename marked notgood — usable schema, replace when better export exists",
  },
] as const;

/** Prefer chain-layer-registry; re-export for patch import path. */
export const CRM_TITLE_TO_SOURCE_TITLES: Readonly<
  Record<string, readonly string[]>
> = crmTitleToSourceTitles();

export function normalizeChainTitle(title: string): string {
  return title
    .trim()
    .toLocaleUpperCase("ru-RU")
    .replace(/ё/g, "Е")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ");
}

export function resolveSourcePath(ref: SourceFileRef, repoRoot: string): string {
  return path.join(repoRoot, ref.relativePath);
}
