"use client";

import { useEffect } from "react";

const CLASS = "ds-snap-proximity";

/**
 * Opt-in document scroll snap for showcase / pilots.
 * Must live on the scrolling root (`html`), not an inner non-scrolling wrapper.
 */
export function DocumentProximitySnap() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const root = document.documentElement;
    root.classList.add(CLASS);
    return () => {
      root.classList.remove(CLASS);
    };
  }, []);

  return null;
}
