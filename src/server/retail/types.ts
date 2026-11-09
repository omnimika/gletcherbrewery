/** Canonical normalized retail source row (historical field names preserved). */

export type RetailSourceKind = "csv" | "geojson";

export type RetailNormalizedRow = {
  sourceFile: string;
  sourceRowNumber: number;
  raw: Record<string, unknown>;
  type: string | null;
  title: string | null;
  city: string | null;
  adress: string | null;
  product: string | null;
  packing: string | null;
  longitude: number | null;
  latitude: number | null;
};

export const ANOMALY_CODES = [
  "missing_title",
  "missing_adress",
  "missing_coords",
  "invalid_coords",
  "coords_outside_ru_bbox",
  "empty_product",
  "unknown_product_token",
  "duplicate_title_adress",
  "duplicate_coords",
] as const;

export type AnomalyCode = (typeof ANOMALY_CODES)[number];

export type AnnotatedRetailRow = RetailNormalizedRow & {
  anomalyCodes: AnomalyCode[];
  quarantineReason: string | null;
};

export type RetailAnomalyReport = {
  rowCount: number;
  anomalyCount: number;
  codeCounts: Partial<Record<AnomalyCode, number>>;
  uniqueTitles: string[];
  uniqueProductTokens: string[];
  duplicateTitleAdressGroups: number;
  duplicateCoordGroups: number;
};
