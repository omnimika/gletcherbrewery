/**
 * Single registry: CRM chain title ↔ Mapbox layer ↔ source Title aliases.
 * Staff badges, Product patch, and docs should read this — not copy lists.
 *
 * Status: Confirmed layer IDs 10.11; CRM titles from Sheet fixture 10.11.
 * EuroSPAR (Калининград) keeps distinct sourceTitles so it no longer
 * overwrites mainland EuroSPAR Product on publish.
 */

import type { RetailMapLayerId } from "@/server/retail/mapbox-tilesets";

export type ChainMapBinding = {
  /** Exact `retail_chains.title` / Sheet name */
  title: string;
  /** Style layer id, or null when CRM-only (no geometry tileset yet) */
  layerId: RetailMapLayerId | null;
  /** `Title` values in local/source GeoJSON/CSV this row may patch */
  sourceTitles: string[];
  /**
   * Source dump may not yet contain these Titles — patch matches 0 features
   * until geometry export is fixed. UI: «слой есть, Title не в dump».
   */
  sourceTitlesUnverified?: boolean;
};

export type ChainMapStatus =
  | "on_map"
  | "on_map_empty"
  | "on_map_title_pending"
  | "crm_only"
  | "crm_only_empty";

export const CHAIN_MAP_BINDINGS: readonly ChainMapBinding[] = [
  {
    title: "АШАН",
    layerId: "auchan-atak",
    sourceTitles: ["АШАН", "Ашан"],
  },
  {
    title: "АТАК",
    layerId: "auchan-atak",
    sourceTitles: ["АТАК", "Атак"],
  },
  {
    title: "АЗБУКА ВКУСА",
    layerId: "azbuka",
    sourceTitles: ["Азбука Вкуса", "АЗБУКА ВКУСА"],
  },
  {
    title: "Беру Выходной!",
    layerId: "twoaxes-drinx-beruvykhodnoy",
    sourceTitles: ["Беру Выходной!"],
  },
  {
    title: "ВИНЛАБ",
    layerId: "winelab",
    sourceTitles: ["Винлаб", "ВИНЛАБ"],
  },
  {
    title: "ДВА ТОПОРА",
    layerId: "twoaxes-drinx-beruvykhodnoy",
    sourceTitles: ["Два Топора", "ДВА ТОПОРА"],
  },
  {
    title: "DRINX",
    layerId: "twoaxes-drinx-beruvykhodnoy",
    sourceTitles: ["DRINX"],
  },
  {
    title: "SELGROS",
    layerId: "selgros-miratorg-yabloko-5m7m",
    sourceTitles: ["Selgros", "SELGROS"],
  },
  {
    title: "ЛЕНТА",
    layerId: "lenta",
    sourceTitles: ["Лента", "ЛЕНТА"],
  },
  {
    title: "ДИКСИ",
    layerId: "dixie",
    sourceTitles: ["ДИКСИ", "Дикси"],
  },
  {
    title: "ГИПЕР МАГНИТ",
    layerId: "magnit",
    sourceTitles: ["Магнит", "МАГНИТ", "Гипер Магнит"],
  },
  {
    title: "METRO",
    layerId: "metro-globus-okey",
    sourceTitles: ["МЕТРО", "METRO", "Metro"],
  },
  {
    title: "GLOBUS",
    layerId: "metro-globus-okey",
    sourceTitles: ["ГЛОБУС", "GLOBUS", "Globus"],
  },
  {
    title: "ОКЕЙ",
    layerId: "metro-globus-okey",
    sourceTitles: ["О’КЕЙ", "О'КЕЙ", "ОКЕЙ", "OKEY"],
  },
  {
    title: "МИРАТОРГ",
    layerId: "selgros-miratorg-yabloko-5m7m",
    sourceTitles: ["Мираторг", "МИРАТОРГ"],
  },
  {
    title: "ПЕРЕКРЁСТОК",
    layerId: "perekrestok",
    sourceTitles: ["Перекрёсток", "ПЕРЕКРЁСТОК", "Перекресток"],
  },
  {
    title: "EuroSPAR",
    layerId: "eurospar",
    sourceTitles: ["EuroSPAR"],
  },
  {
    title: "EuroSPAR (Калининград)",
    layerId: "eurospar",
    // Distinct from mainland EuroSPAR — do not share "EuroSPAR" alias.
    sourceTitles: ["EuroSPAR (Калининград)", "EuroSPAR Калининград"],
    sourceTitlesUnverified: true,
  },
  {
    title: "Яблоко (Крым)",
    layerId: "selgros-miratorg-yabloko-5m7m",
    sourceTitles: ["Яблоко", "Яблоко (Крым)"],
  },
  {
    title: "АРОМАТНЫЙ МИР",
    layerId: "aromatny-mir",
    sourceTitles: ["Ароматный Мир"],
  },
  {
    title: "МАКСИ",
    layerId: "maksi",
    sourceTitles: ["Макси", "МАКСИ"],
  },
  {
    title: "Ярче!",
    layerId: "yarche",
    sourceTitles: ["Ярче!", "Ярче"],
  },
  {
    title: "ХМЕЛЬ И СОЛОД",
    layerId: "hmel-i-solod",
    sourceTitles: ["ХМЕЛЬ И СОЛОД", "Хмель и Солод"],
  },
  // CRM-only (no Mapbox layer yet)
  { title: "ВКУСВИЛЛ", layerId: null, sourceTitles: [] },
  { title: "ВЕРНЫЙ", layerId: null, sourceTitles: [] },
  { title: "ДА!", layerId: null, sourceTitles: [] },
  { title: "ПЯТЕРОЧКА", layerId: null, sourceTitles: [] },
  { title: "Алкосити", layerId: null, sourceTitles: [] },
  { title: "Высшая лига", layerId: null, sourceTitles: [] },
] as const;

const BY_TITLE = new Map(
  CHAIN_MAP_BINDINGS.map((b) => [b.title, b] as const),
);

export function bindingForChainTitle(
  title: string,
): ChainMapBinding | undefined {
  return BY_TITLE.get(title);
}

/** Resolve CRM chain title from a GeoJSON/CSV `Title` value (aliases). */
export function crmTitleForSourceTitle(sourceTitle: string): string | null {
  const key = sourceTitle
    .trim()
    .toLocaleUpperCase("ru-RU")
    .replace(/ё/g, "Е")
    .replace(/’/g, "'")
    .replace(/\s+/g, " ");
  if (!key) return null;
  for (const b of CHAIN_MAP_BINDINGS) {
    if (
      b.title.toLocaleUpperCase("ru-RU").replace(/ё/g, "Е").replace(/\s+/g, " ") ===
      key
    ) {
      return b.title;
    }
    for (const alias of b.sourceTitles) {
      const a = alias
        .toLocaleUpperCase("ru-RU")
        .replace(/ё/g, "Е")
        .replace(/’/g, "'")
        .replace(/\s+/g, " ");
      if (a === key) return b.title;
    }
  }
  return null;
}

/** Title → source Title aliases for Product patch. */
export function crmTitleToSourceTitles(): Readonly<
  Record<string, readonly string[]>
> {
  const out: Record<string, readonly string[]> = {};
  for (const b of CHAIN_MAP_BINDINGS) {
    if (b.sourceTitles.length === 0) continue;
    out[b.title] = b.sourceTitles;
  }
  return out;
}

export function resolveChainMapStatus(
  title: string,
  availableSkuCount: number,
): ChainMapStatus {
  const binding = bindingForChainTitle(title);
  const hasLayer = Boolean(binding?.layerId);
  const empty = availableSkuCount <= 0;

  if (!hasLayer) {
    return empty ? "crm_only_empty" : "crm_only";
  }
  if (binding?.sourceTitlesUnverified) {
    return empty ? "on_map_empty" : "on_map_title_pending";
  }
  return empty ? "on_map_empty" : "on_map";
}

export function chainMapStatusLabel(status: ChainMapStatus): string {
  switch (status) {
    case "on_map":
      return "на карте";
    case "on_map_empty":
      return "0 SKU · скрыть после publish";
    case "on_map_title_pending":
      return "слой есть · Title не в dump";
    case "crm_only":
      return "только CRM";
    case "crm_only_empty":
      return "только CRM · 0 SKU";
  }
}

/** Sort: on-map with SKUs → on-map empty/pending → CRM-only with SKUs → empty. */
export function chainMapStatusSortKey(status: ChainMapStatus): number {
  switch (status) {
    case "on_map":
      return 0;
    case "on_map_title_pending":
      return 1;
    case "on_map_empty":
      return 2;
    case "crm_only":
      return 3;
    case "crm_only_empty":
      return 4;
  }
}
