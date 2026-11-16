/**
 * Studio sometimes leaves retail layers as `symbol` with empty `icon-image`
 * (no sprite yet). Features exist in the tileset but render as 0 points.
 * Rebuild those layers as circles so `/map` filters stay usable.
 */

import type {
  Map as MapboxMap,
  AnyLayer,
  FilterSpecification,
} from "mapbox-gl";

const FALLBACK_CIRCLE_COLOR = "#e57373";

/** Mapbox expression keywords — not sprite icon names. */
const EXPR_KEYWORDS = new Set([
  "step",
  "zoom",
  "match",
  "get",
  "literal",
  "case",
  "interpolate",
  "exponential",
  "linear",
  "concat",
  "to-string",
  "coalesce",
]);

function expressionStringLiterals(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((v) => expressionStringLiterals(v));
  }
  return [];
}

function hasUsableIcon(map: MapboxMap, layerId: string): boolean {
  try {
    const icon = map.getLayoutProperty(layerId, "icon-image");
    if (icon == null || icon === "") return false;
    const names = expressionStringLiterals(icon).filter(
      (s) => s.length > 0 && !EXPR_KEYWORDS.has(s),
    );
    return names.length > 0;
  } catch {
    return false;
  }
}

export function ensureRetailPointLayersVisible(
  map: MapboxMap,
  layerIds: readonly string[],
): readonly string[] {
  const repaired: string[] = [];

  for (const layerId of layerIds) {
    const layer = map.getLayer(layerId) as
      | (AnyLayer & {
          source?: string;
          "source-layer"?: string;
          filter?: unknown;
        })
      | undefined;
    if (!layer) continue;

    if (layer.type === "circle") continue;
    if (layer.type === "symbol" && hasUsableIcon(map, layerId)) continue;

    const source = layer.source;
    const sourceLayer = layer["source-layer"];
    if (typeof source !== "string" || !source) continue;

    let filter: FilterSpecification | undefined;
    try {
      filter = map.getFilter(layerId) ?? undefined;
    } catch {
      filter = undefined;
    }

    const styleLayers = map.getStyle().layers ?? [];
    const idx = styleLayers.findIndex((l) => l.id === layerId);
    const beforeId =
      idx >= 0 && idx < styleLayers.length - 1
        ? styleLayers[idx + 1]?.id
        : undefined;

    map.removeLayer(layerId);
    map.addLayer(
      {
        id: layerId,
        type: "circle",
        source,
        ...(sourceLayer ? { "source-layer": sourceLayer } : {}),
        ...(filter ? { filter } : {}),
        layout: { visibility: "visible" },
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            3.5,
            10,
            5.5,
            14,
            7.5,
          ],
          "circle-color": FALLBACK_CIRCLE_COLOR,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "#ffffff",
          "circle-opacity": 0.95,
        },
      },
      beforeId,
    );
    repaired.push(layerId);
  }

  return repaired;
}
