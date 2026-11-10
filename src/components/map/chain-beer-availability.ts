/**
 * Which beer panel keys stay clickable given selected retail chains.
 * Empty chain selection → all beers enabled (null).
 * Non-empty → union of CRM-available Product tokens across selected chains.
 */

export function enabledBeerKeysForChains(
  selectedChains: ReadonlySet<string>,
  beersByChain: Readonly<Record<string, readonly string[]>>,
): ReadonlySet<string> | null {
  if (selectedChains.size === 0) return null;
  const enabled = new Set<string>();
  for (const chain of selectedChains) {
    const beers = beersByChain[chain];
    if (!beers) continue;
    for (const key of beers) enabled.add(key);
  }
  return enabled;
}

export function pruneBeerSelection(
  selectedBeers: ReadonlySet<string>,
  enabled: ReadonlySet<string> | null,
): Set<string> {
  if (!enabled) return new Set(selectedBeers);
  const next = new Set<string>();
  for (const key of selectedBeers) {
    if (enabled.has(key)) next.add(key);
  }
  return next;
}
