/**
 * Shared scroll helper — respects prefers-reduced-motion for JS callers.
 */
export function preferredScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: preferredScrollBehavior(), block: "start" });
  if (typeof el.focus === "function") {
    el.focus({ preventScroll: true });
  }
}
