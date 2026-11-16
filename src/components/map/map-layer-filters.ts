/**
 * Combined Mapbox filters for `/map`: beer Product tokens ∧ retail chain Title.
 * Empty selection = no constraint on that axis (show all with Product).
 */

import {
  buildMapProductFilter,
  type MapFilterSpec,
} from "@/components/map/product-filter";
import { MAP_LAYERS } from "@/content/map";
import {
  CHAIN_MAP_BINDINGS,
  type ChainMapBinding,
} from "@/server/retail/chain-layer-registry";
import type { RetailMapLayerId } from "@/server/retail/mapbox-tilesets";
import { chainLogoSrc } from "@/server/retail/matrix-media";

const MAP_LAYER_SET = new Set<string>(MAP_LAYERS);

export type MapChainOption = {
  /** CRM / registry title — selection key */
  id: string;
  label: string;
  layerId: RetailMapLayerId;
  sourceTitles: readonly string[];
  logoSrc: string | null;
};

function isOnPublicMap(
  binding: ChainMapBinding,
): binding is ChainMapBinding & { layerId: RetailMapLayerId } {
  return (
    binding.layerId != null &&
    MAP_LAYER_SET.has(binding.layerId) &&
    !binding.sourceTitlesUnverified &&
    binding.sourceTitles.length > 0
  );
}

/**
 * Chains on the public map filter panel.
 * Pass CRM titles that currently have assortment (availableCount > 0).
 * Layer-only empty chains (SELGROS / МИРАТОРГ with 0 SKU) are excluded.
 */
export function listMapChainOptions(
  chainsWithAssortment: ReadonlySet<string> | readonly string[],
): readonly MapChainOption[] {
  const allowed =
    chainsWithAssortment instanceof Set
      ? chainsWithAssortment
      : new Set(chainsWithAssortment);

  return CHAIN_MAP_BINDINGS.filter(isOnPublicMap)
    .filter((b) => allowed.has(b.title))
    .map((b) => ({
      id: b.title,
      label: b.title,
      layerId: b.layerId,
      sourceTitles: b.sourceTitles,
      logoSrc: chainLogoSrc(b.title),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ru"));
}

export type LayerFilterResult = {
  filter: MapFilterSpec;
  visible: boolean;
};

/**
 * Build per-layer filter + visibility from beer and chain selections.
 * Chain filter matches any `Title` alias of selected chains on that layer.
 */
export function buildMapLayerFilter(
  layerId: string,
  selectedBeers: ReadonlySet<string>,
  selectedChains: ReadonlySet<string>,
): LayerFilterResult {
  const product = buildMapProductFilter(selectedBeers);

  if (selectedChains.size === 0) {
    return { filter: product, visible: true };
  }

  const titles = new Set<string>();
  for (const binding of CHAIN_MAP_BINDINGS) {
    if (!isOnPublicMap(binding)) continue;
    if (binding.layerId !== layerId) continue;
    if (!selectedChains.has(binding.title)) continue;
    for (const t of binding.sourceTitles) titles.add(t);
  }

  if (titles.size === 0) {
    // No selected chain belongs to this layer — hide it.
    return { filter: product, visible: false };
  }

  const titleAny: MapFilterSpec = [
    "any",
    ...[...titles].map(
      (title) => ["==", ["get", "Title"], title] as MapFilterSpec,
    ),
  ];

  return {
    filter: ["all", product, titleAny],
    visible: true,
  };
}
