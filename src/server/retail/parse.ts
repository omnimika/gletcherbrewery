import type { RetailNormalizedRow, RetailSourceKind } from "./types";

const FIELD_ALIASES: Record<keyof Omit<
  RetailNormalizedRow,
  "sourceFile" | "sourceRowNumber" | "raw" | "longitude" | "latitude"
>, string[]> = {
  type: ["type"],
  title: ["title"],
  city: ["city"],
  adress: ["adress", "address"],
  product: ["product"],
  packing: ["packing"],
};

const LON_ALIASES = ["longitude", "lon", "lng", "x"];
const LAT_ALIASES = ["latitude", "lat", "y"];

function normKey(key: string): string {
  return key.trim().toLowerCase();
}

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const s = String(value).trim().replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pick(
  props: Record<string, unknown>,
  aliases: string[],
): unknown {
  const map = new Map<string, unknown>();
  for (const [k, v] of Object.entries(props)) {
    map.set(normKey(k), v);
  }
  for (const alias of aliases) {
    if (map.has(alias)) return map.get(alias);
  }
  return undefined;
}

export function normalizeProps(
  props: Record<string, unknown>,
  sourceFile: string,
  sourceRowNumber: number,
  lonLat?: { longitude: number | null; latitude: number | null },
): RetailNormalizedRow {
  const longitude =
    lonLat?.longitude ?? asNullableNumber(pick(props, LON_ALIASES));
  const latitude =
    lonLat?.latitude ?? asNullableNumber(pick(props, LAT_ALIASES));

  return {
    sourceFile,
    sourceRowNumber,
    raw: props,
    type: asNullableString(pick(props, FIELD_ALIASES.type)),
    title: asNullableString(pick(props, FIELD_ALIASES.title)),
    city: asNullableString(pick(props, FIELD_ALIASES.city)),
    adress: asNullableString(pick(props, FIELD_ALIASES.adress)),
    product: asNullableString(pick(props, FIELD_ALIASES.product)),
    packing: asNullableString(pick(props, FIELD_ALIASES.packing)),
    longitude,
    latitude,
  };
}

/** Split Product field into tokens for filter compatibility checks. */
export function splitProductTokens(product: string | null): string[] {
  if (!product) return [];
  return product
    .split(/[,;|]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function detectDelimiter(headerLine: string): "," | ";" {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function parseCsvLine(line: string, delimiter: "," | ";"): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseRetailCsv(
  text: string,
  sourceFile: string,
): RetailNormalizedRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = detectDelimiter(lines[0]!);
  const headers = parseCsvLine(lines[0]!, delimiter).map((h) => h.trim());
  const rows: RetailNormalizedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]!, delimiter);
    const props: Record<string, unknown> = {};
    for (let c = 0; c < headers.length; c++) {
      props[headers[c]!] = cells[c] ?? "";
    }
    rows.push(normalizeProps(props, sourceFile, i + 1));
  }
  return rows;
}

export function parseRetailGeoJson(
  text: string,
  sourceFile: string,
): RetailNormalizedRow[] {
  const parsed = JSON.parse(text) as {
    type?: string;
    features?: Array<{
      type?: string;
      properties?: Record<string, unknown> | null;
      geometry?: {
        type?: string;
        coordinates?: unknown;
      } | null;
    }>;
  };

  if (parsed.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error("Expected GeoJSON FeatureCollection");
  }

  return parsed.features.map((feature, index) => {
    const props = { ...(feature.properties ?? {}) };
    let longitude: number | null = null;
    let latitude: number | null = null;
    const coords = feature.geometry?.coordinates;
    if (
      feature.geometry?.type === "Point" &&
      Array.isArray(coords) &&
      coords.length >= 2
    ) {
      longitude = asNullableNumber(coords[0]);
      latitude = asNullableNumber(coords[1]);
    }
    return normalizeProps(props, sourceFile, index + 1, {
      longitude,
      latitude,
    });
  });
}

export function detectSourceKind(
  fileName: string,
  text: string,
): RetailSourceKind {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".geojson") || lower.endsWith(".json")) {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "geojson";
  }
  if (lower.endsWith(".csv")) return "csv";
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return "geojson";
  return "csv";
}

export function parseRetailFile(
  text: string,
  sourceFile: string,
): { kind: RetailSourceKind; rows: RetailNormalizedRow[] } {
  const kind = detectSourceKind(sourceFile, text);
  if (kind === "geojson") {
    return { kind, rows: parseRetailGeoJson(text, sourceFile) };
  }
  return { kind, rows: parseRetailCsv(text, sourceFile) };
}
