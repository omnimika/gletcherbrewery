import { MAP_BEERS_RU } from "@/content/map";
import { splitProductTokens } from "./parse";
import type {
  AnnotatedRetailRow,
  AnomalyCode,
  RetailAnomalyReport,
  RetailNormalizedRow,
} from "./types";

/** Loose RU/CIS bbox — warnings only (known misgeocodes outside). */
const RU_BBOX = {
  minLon: 19,
  maxLon: 191,
  minLat: 41,
  maxLat: 82,
};

const KNOWN_PRODUCT_KEYS = new Set(MAP_BEERS_RU.map((b) => b.key));

function coordValid(lon: number | null, lat: number | null): boolean {
  if (lon === null || lat === null) return false;
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
}

function outsideRuBbox(lon: number, lat: number): boolean {
  return (
    lon < RU_BBOX.minLon ||
    lon > RU_BBOX.maxLon ||
    lat < RU_BBOX.minLat ||
    lat > RU_BBOX.maxLat
  );
}

function rowAnomalies(row: RetailNormalizedRow): AnomalyCode[] {
  const codes: AnomalyCode[] = [];
  if (!row.title) codes.push("missing_title");
  if (!row.adress) codes.push("missing_adress");

  if (row.longitude === null || row.latitude === null) {
    codes.push("missing_coords");
  } else if (!coordValid(row.longitude, row.latitude)) {
    codes.push("invalid_coords");
  } else if (outsideRuBbox(row.longitude, row.latitude)) {
    codes.push("coords_outside_ru_bbox");
  }

  if (!row.product) {
    codes.push("empty_product");
  } else {
    // Exact token match only — do not fuzzy-merge "Friday Avenue" vs "Friday Avenue APA".
    const tokens = splitProductTokens(row.product);
    if (tokens.some((t) => !KNOWN_PRODUCT_KEYS.has(t))) {
      codes.push("unknown_product_token");
    }
  }

  return codes;
}

function quarantineReason(codes: AnomalyCode[]): string | null {
  const hard = codes.filter((c) =>
    ["missing_coords", "invalid_coords", "missing_title"].includes(c),
  );
  return hard.length ? hard.join(",") : null;
}

export function annotateRetailRows(
  rows: RetailNormalizedRow[],
): AnnotatedRetailRow[] {
  const titleAdressCounts = new Map<string, number>();
  const coordCounts = new Map<string, number>();

  for (const row of rows) {
    const ta = `${row.title ?? ""}\u0000${row.adress ?? ""}`;
    titleAdressCounts.set(ta, (titleAdressCounts.get(ta) ?? 0) + 1);
    if (
      row.longitude !== null &&
      row.latitude !== null &&
      coordValid(row.longitude, row.latitude)
    ) {
      const key = `${row.longitude.toFixed(6)},${row.latitude.toFixed(6)}`;
      coordCounts.set(key, (coordCounts.get(key) ?? 0) + 1);
    }
  }

  return rows.map((row) => {
    const codes = rowAnomalies(row);
    const ta = `${row.title ?? ""}\u0000${row.adress ?? ""}`;
    if ((titleAdressCounts.get(ta) ?? 0) > 1) {
      codes.push("duplicate_title_adress");
    }
    if (
      row.longitude !== null &&
      row.latitude !== null &&
      coordValid(row.longitude, row.latitude)
    ) {
      const key = `${row.longitude.toFixed(6)},${row.latitude.toFixed(6)}`;
      if ((coordCounts.get(key) ?? 0) > 1) {
        codes.push("duplicate_coords");
      }
    }
    const unique = [...new Set(codes)];
    return {
      ...row,
      anomalyCodes: unique,
      quarantineReason: quarantineReason(unique),
    };
  });
}

export function buildAnomalyReport(
  rows: AnnotatedRetailRow[],
): RetailAnomalyReport {
  const codeCounts: Partial<Record<AnomalyCode, number>> = {};
  const titles = new Set<string>();
  const tokens = new Set<string>();
  let anomalyCount = 0;
  const taGroups = new Set<string>();
  const coordGroups = new Set<string>();

  for (const row of rows) {
    if (row.anomalyCodes.length) anomalyCount += 1;
    for (const code of row.anomalyCodes) {
      codeCounts[code] = (codeCounts[code] ?? 0) + 1;
      if (code === "duplicate_title_adress" && row.title && row.adress) {
        taGroups.add(`${row.title}\u0000${row.adress}`);
      }
      if (
        code === "duplicate_coords" &&
        row.longitude !== null &&
        row.latitude !== null
      ) {
        coordGroups.add(
          `${row.longitude.toFixed(6)},${row.latitude.toFixed(6)}`,
        );
      }
    }
    if (row.title) titles.add(row.title);
    for (const t of splitProductTokens(row.product)) tokens.add(t);
  }

  return {
    rowCount: rows.length,
    anomalyCount,
    codeCounts,
    uniqueTitles: [...titles].sort(),
    uniqueProductTokens: [...tokens].sort(),
    duplicateTitleAdressGroups: taGroups.size,
    duplicateCoordGroups: coordGroups.size,
  };
}
