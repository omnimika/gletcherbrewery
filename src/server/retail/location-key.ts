/**
 * Stable upsert key for a store point from Mapbox/source geometry.
 * Duplicate coordinates with different addresses stay distinct.
 */

export function buildLocationSourceKey(input: {
  layerId: string;
  longitude: number;
  latitude: number;
  adress: string;
  title: string;
}): string {
  const lon = input.longitude.toFixed(6);
  const lat = input.latitude.toFixed(6);
  const adress = input.adress.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
  const title = input.title.trim().replace(/\s+/g, " ").toLocaleLowerCase("ru-RU");
  return `${input.layerId}|${lon}|${lat}|${adress}|${title}`;
}
