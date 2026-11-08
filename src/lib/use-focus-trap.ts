"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type FocusTrapOptions = {
  /**
   * When false, caller must restore focus after unlocking the background
   * (e.g. after removing `inert` from `#site-root`).
   */
  restoreFocus?: boolean;
  /** Extra containers included in the Tab cycle (e.g. live header chrome). */
  additionalRefs?: RefObject<HTMLElement | null>[];
  /**
   * Optional selector scoped to the trap container; initial focus prefers the
   * first focusable inside the match (e.g. `"nav"` under a dialog that also
   * includes chrome controls).
   */
  initialFocusWithin?: string;
};

function collectFocusables(
  containers: (HTMLElement | null | undefined)[],
): HTMLElement[] {
  const seen = new Set<HTMLElement>();
  const out: HTMLElement[] = [];
  for (const container of containers) {
    if (!container) continue;
    for (const el of container.querySelectorAll<HTMLElement>(FOCUSABLE)) {
      if (el.hasAttribute("disabled") || el.tabIndex === -1) continue;
      if (seen.has(el)) continue;
      seen.add(el);
      out.push(el);
    }
  }
  // Match natural Tab order across split containers (header + portal dialog).
  out.sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  return out;
}

export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  options: FocusTrapOptions = {},
) {
  const restoreFocus = options.restoreFocus !== false;
  const initialFocusWithin = options.initialFocusWithin;
  // Keep latest additionalRefs without re-running the trap effect (A03).
  const additionalRefsRef = useRef(options.additionalRefs);
  useEffect(() => {
    additionalRefsRef.current = options.additionalRefs;
  });

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const focusables = () =>
      collectFocusables([
        container,
        ...(additionalRefsRef.current?.map((r) => r.current) ?? []),
      ]);

    // Prefer first item in initialFocusWithin (e.g. nav); else container.
    // Runs once per active session — deps omit additionalRefs (see A03).
    const seed =
      initialFocusWithin != null
        ? container.querySelector(initialFocusWithin)
        : null;
    const preferredRoot =
      seed instanceof HTMLElement ? seed : container;
    const dialogFirst = collectFocusables([preferredRoot])[0];
    (dialogFirst ?? focusables()[0])?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const activeEl = document.activeElement;
      if (event.shiftKey && activeEl === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && activeEl === lastItem) {
        event.preventDefault();
        firstItem.focus();
      } else if (
        activeEl instanceof HTMLElement &&
        !items.includes(activeEl)
      ) {
        // Focus escaped (e.g. browser quirk) — pull back into the trap.
        event.preventDefault();
        (event.shiftKey ? lastItem : firstItem).focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (restoreFocus) {
        previouslyFocused?.focus();
      }
    };
  }, [active, containerRef, restoreFocus, initialFocusWithin]);
}
