/**
 * Cabinet «Сеть / место»: same chains as public `/map` filter
 * + branded stores + «Другой».
 */
import { listMapChainOptions } from "@/components/map/map-layer-filters";
import {
  CABINET_BRANDED_BUY_PLACES,
  CABINET_BUY_PLACE_OTHER,
} from "@/content/cabinet";
import type { AppDb } from "@/server/db/client";
import { loadPublicMapChainTitles } from "@/server/retail/public-map-chains";

export { CABINET_BRANDED_BUY_PLACES, CABINET_BUY_PLACE_OTHER };

export function buildCabinetBuyPlaces(
  mapChainTitles: readonly string[],
): readonly string[] {
  const fromMap = listMapChainOptions(mapChainTitles).map((o) => o.label);
  const seen = new Set(fromMap);
  const branded = CABINET_BRANDED_BUY_PLACES.filter((b) => !seen.has(b));
  return [...fromMap, ...branded, CABINET_BUY_PLACE_OTHER];
}

export async function loadCabinetBuyPlaces(
  db: AppDb | null,
): Promise<readonly string[]> {
  const titles = await loadPublicMapChainTitles(db);
  return buildCabinetBuyPlaces(titles);
}
