/**
 * Production Mapbox retail tilesets (style omnicoremaps/cknj3azmg0w2t17qqmylsfz8x).
 * Confirmed 10.11.2026 via style layers + Tilesets API metadata (username omnicoremaps).
 */

export const MAPBOX_STYLE_OWNER = "omnicoremaps" as const;
export const MAPBOX_STYLE_ID =
  "omnicoremaps/cknj3azmg0w2t17qqmylsfz8x" as const;

export type RetailMapLayerId =
  | "auchan-atak"
  | "twoaxes-drinx-beruvykhodnoy"
  | "selgros-miratorg-yabloko-5m7m"
  | "winelab"
  | "eurospar"
  | "dixie"
  | "metro-globus-okey"
  | "azbuka"
  | "perekrestok"
  | "magnit"
  | "lenta"
  | "aromatny-mir"
  | "maksi";

export type RetailTilesetKind = "mts" | "studio";

export type RetailTilesetRef = {
  layerId: RetailMapLayerId;
  /** mapbox:// style source id (may be tileset url or "composite") */
  styleSource: string;
  tilesetId: string;
  sourceLayer: string;
  kind: RetailTilesetKind;
  /**
   * MTS tileset-source id (`mapbox://tileset-source/{user}/{id}`).
   * Studio tilesets: recipe API 404 — source GeoJSON must be exported manually.
   */
  tilesetSourceId: string | null;
};

/** One tileset per retail layer — Confirmed 10.11.2026. */
export const RETAIL_TILESETS: readonly RetailTilesetRef[] = [
  {
    layerId: "twoaxes-drinx-beruvykhodnoy",
    styleSource: "mapbox://omnicoremaps.nuh59o864gqo",
    tilesetId: "omnicoremaps.nuh59o864gqo",
    sourceLayer: "mtb4usiv4hg1njqxqach",
    kind: "mts",
    tilesetSourceId: "2bc7a67815",
  },
  {
    layerId: "metro-globus-okey",
    styleSource: "mapbox://omnicoremaps.0ngj0fslo4vy",
    tilesetId: "omnicoremaps.0ngj0fslo4vy",
    sourceLayer: "uzxj31k2hl17jev597a0",
    kind: "mts",
    tilesetSourceId: "0d554ade07",
  },
  {
    layerId: "azbuka",
    styleSource: "mapbox://omnicoremaps.of8rykmw2o49",
    tilesetId: "omnicoremaps.of8rykmw2o49",
    sourceLayer: "gf4ih7pn1ot54xbcnd0g",
    kind: "mts",
    tilesetSourceId: "bac240233e",
  },
  {
    layerId: "auchan-atak",
    styleSource: "mapbox://omnicoremaps.r5ovf197ye76",
    tilesetId: "omnicoremaps.r5ovf197ye76",
    sourceLayer: "hekdibj8awblsjgsogw2",
    kind: "mts",
    tilesetSourceId: "eb6183f170",
  },
  {
    layerId: "winelab",
    styleSource: "mapbox://omnicoremaps.mhkfit1zhi2u",
    tilesetId: "omnicoremaps.mhkfit1zhi2u",
    sourceLayer: "l17kcbgpec9uapwwlefy",
    kind: "mts",
    tilesetSourceId: "51e711e537",
  },
  {
    layerId: "eurospar",
    styleSource: "mapbox://omnicoremaps.b6kjchqw4mw4",
    tilesetId: "omnicoremaps.b6kjchqw4mw4",
    sourceLayer: "opo99gf01drx9we4l0j0",
    kind: "mts",
    tilesetSourceId: "888dacb24f",
  },
  {
    layerId: "perekrestok",
    styleSource: "composite",
    tilesetId: "omnicoremaps.clq1auidj1pmq1mqrlq1ki1il-82fsi",
    sourceLayer: "perekrestok",
    kind: "studio",
    tilesetSourceId: null,
  },
  {
    layerId: "lenta",
    styleSource: "composite",
    tilesetId: "omnicoremaps.cls39yv2725qt1tqkw21u2ae6-2owoi",
    sourceLayer: "lenta",
    kind: "studio",
    tilesetSourceId: null,
  },
  {
    layerId: "selgros-miratorg-yabloko-5m7m",
    styleSource: "composite",
    tilesetId: "omnicoremaps.clsiwq9p40ofb1sp7g551rk16-827sg",
    sourceLayer: "selgros-miratorg-yabloko-5m7m",
    kind: "studio",
    tilesetSourceId: null,
  },
  {
    layerId: "magnit",
    styleSource: "composite",
    tilesetId: "omnicoremaps.clst0fcpu0g4e1mnxhplmtdsm-816v0",
    sourceLayer: "magnit",
    kind: "studio",
    tilesetSourceId: null,
  },
  {
    layerId: "dixie",
    styleSource: "composite",
    tilesetId: "omnicoremaps.cm7hj7m1t27db1mmtoito2nm1-71qmv",
    sourceLayer: "dixie",
    kind: "studio",
    tilesetSourceId: null,
  },
  {
    layerId: "aromatny-mir",
    styleSource: "mapbox://omnicoremaps.anvfhv5yjx32",
    tilesetId: "omnicoremaps.anvfhv5yjx32",
    sourceLayer: "lnuvqlbzpm6p33qh2h7y",
    kind: "mts",
    tilesetSourceId: "702a7b27d2",
  },
  {
    layerId: "maksi",
    // Studio published into composite; tileset id kept for MTS republish path.
    styleSource: "composite",
    tilesetId: "omnicoremaps.gletcher-maksi",
    sourceLayer: "maksi",
    kind: "mts",
    tilesetSourceId: "gletcher-maksi-mwa0qbxp",
  },
] as const;

export const RETAIL_TILESET_IDS: readonly string[] = RETAIL_TILESETS.map(
  (t) => t.tilesetId,
);

/** Comma-separated list for MAPBOX_TILESET_IDS. */
export function retailTilesetIdsEnvValue(): string {
  return RETAIL_TILESET_IDS.join(",");
}
