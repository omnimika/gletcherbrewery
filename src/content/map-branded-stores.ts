/**
 * Own retail points on `/map` (layer `locals-abroad`).
 * Filter UI is always Gletcher + SVAM; points come from CRM when available.
 * Hosted Mapbox style does not include this layer yet — client GeoJSON overlay.
 */

export const MAP_BRANDED_SOURCE_ID = "gletcher-branded-stores" as const;
export const MAP_BRANDED_LAYER_ID = "gletcher-branded-stores-layer" as const;
export const MAP_BRANDED_MAPBOX_LAYER_ID = "locals-abroad" as const;

export type MapBrandedStoreOption = {
  /** Chain slug — filter selection key */
  id: string;
  label: string;
  filterLabel: string;
  logoSrc: string | null;
};

/** Left-panel branded filters (order Confirmed). */
export const MAP_BRANDED_STORE_OPTIONS: readonly MapBrandedStoreOption[] = [
  {
    id: "gletcher-brewery",
    label: "Gletcher Brewery",
    filterLabel: "Gletcher Brewery",
    logoSrc: "/staff/gletcher-logo-simple.svg",
  },
  {
    id: "svam-group",
    label: "SVAM Group",
    filterLabel: "SVAM Group",
    logoSrc: null,
  },
] as const;

export type MapBrandedStorePoint = {
  /** Location id (unique per pin) */
  locationId: string;
  /** Matches MapBrandedStoreOption.id */
  brandId: string;
  title: string;
  address: string;
  product: string;
  /** [lng, lat] — Mapbox order */
  coordinates: [number, number];
};

/**
 * Fallback pins when CRM is empty/unavailable.
 * Coords: shop page (Klin) + published SVAM store links.
 */
export const MAP_BRANDED_FALLBACK_POINTS: readonly MapBrandedStorePoint[] = [
  {
    locationId: "fallback-gletcher-brewery",
    brandId: "gletcher-brewery",
    title: "Gletcher Brewery",
    address: "МО, г. Клин, ул. Терешковой, 1 стр.4И",
    product: "Фирменный магазин",
    coordinates: [36.694416, 56.348616],
  },
  {
    locationId: "fallback-svam-group",
    brandId: "svam-group",
    title: "SVAM Group",
    address: "г. Москва, Новомещерский проезд, 9/1",
    product: "Фирменный магазин",
    coordinates: [37.370751, 55.657121],
  },
] as const;

/** @deprecated use MAP_BRANDED_STORE_OPTIONS */
export const MAP_BRANDED_STORES = MAP_BRANDED_STORE_OPTIONS;

export function brandedStoresGeoJson(
  points: readonly MapBrandedStorePoint[] = MAP_BRANDED_FALLBACK_POINTS,
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: points.map((store) => ({
      type: "Feature",
      id: store.locationId,
      properties: {
        id: store.brandId,
        locationId: store.locationId,
        Title: store.title,
        Adress: store.address,
        Product: store.product,
      },
      geometry: {
        type: "Point",
        coordinates: store.coordinates,
      },
    })),
  };
}
