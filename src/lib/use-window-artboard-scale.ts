"use client";

import { useSyncExternalStore } from "react";
import { windowArtboardScale } from "@/lib/tilda-artboard-scale";

export type WindowArtboardScale = {
  screen: number;
  scale: number;
};

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

let cached: WindowArtboardScale | null = null;
let cachedWidth = -1;

function getClientSnapshot(): WindowArtboardScale {
  const width = window.innerWidth;
  if (cached && cachedWidth === width) return cached;
  cachedWidth = width;
  cached = windowArtboardScale(width);
  return cached;
}

/** SSR / first paint — 1400 design at scale 1 (matches header server chrome). */
const SERVER: WindowArtboardScale = { screen: 1400, scale: 1 };

function getServerSnapshot(): WindowArtboardScale {
  return SERVER;
}

/**
 * Tilda Zero Block `ab_upscale: window`:
 * matched screen (320…1400) + scale = windowWidth / screen.
 * Same math as header chrome (`getHeaderDesign`).
 */
export function useWindowArtboardScale(): WindowArtboardScale {
  return useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
}
