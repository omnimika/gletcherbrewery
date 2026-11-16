/**
 * Geolocate camera: zoom in only while ≥ minMarkers stay in the viewport.
 * Counts unique point features already filtered by layer visibility/filter.
 */

export const GEOLOCATE_MIN_MARKERS = 2;
export const GEOLOCATE_MAX_ZOOM = 15;
export const GEOLOCATE_MIN_ZOOM = 4;
export const GEOLOCATE_ZOOM_STEP = 0.5;

type PointFeatureLike = {
  geometry?: { type?: string; coordinates?: unknown } | null;
  properties?: Record<string, unknown> | null;
};

export function featurePointKey(feature: PointFeatureLike): string | null {
  const geom = feature.geometry;
  if (!geom || geom.type !== "Point" || !Array.isArray(geom.coordinates)) {
    return null;
  }
  const lon = Number(geom.coordinates[0]);
  const lat = Number(geom.coordinates[1]);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return null;
  const props = feature.properties ?? {};
  const title = String(props.Title ?? "");
  const adress = String(props.Adress ?? props.Address ?? "");
  return `${lon.toFixed(5)},${lat.toFixed(5)}|${title}|${adress}`;
}

export function countUniquePointFeatures(
  features: ReadonlyArray<PointFeatureLike>,
): number {
  const keys = new Set<string>();
  for (const f of features) {
    const key = featurePointKey(f);
    if (key) keys.add(key);
  }
  return keys.size;
}

/**
 * Highest zoom in [minZoom, maxZoom] where countAtZoom(z) >= minMarkers.
 * If no zoom reaches the minimum, returns minZoom (widest useful view).
 */
export function pickGeolocateZoom(input: {
  countAtZoom: (zoom: number) => number;
  minMarkers?: number;
  maxZoom?: number;
  minZoom?: number;
  step?: number;
}): number {
  const minMarkers = input.minMarkers ?? GEOLOCATE_MIN_MARKERS;
  const maxZoom = input.maxZoom ?? GEOLOCATE_MAX_ZOOM;
  const minZoom = input.minZoom ?? GEOLOCATE_MIN_ZOOM;
  const step = input.step ?? GEOLOCATE_ZOOM_STEP;

  let chosen = minZoom;
  for (let z = maxZoom; z >= minZoom - 1e-9; z -= step) {
    const zoom = Math.round(z * 100) / 100;
    if (input.countAtZoom(zoom) >= minMarkers) {
      chosen = zoom;
      break;
    }
  }
  return chosen;
}
