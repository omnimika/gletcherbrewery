export const AGE_GATE_COOKIE = "gletcher_age_ok";
export const AGE_GATE_STORAGE_KEY = "gletcher_age_ok";
export const AGE_GATE_EVENT = "gletcher:age-ok";

export function readAgeGatePassed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(AGE_GATE_STORAGE_KEY) === "1") return true;
  } catch {
    /* private mode */
  }
  return document.cookie
    .split(";")
    .some((part) => part.trim().startsWith(`${AGE_GATE_COOKIE}=1`));
}

export function persistAgeGatePassed(): void {
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${AGE_GATE_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax`;
  try {
    window.localStorage.setItem(AGE_GATE_STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(AGE_GATE_EVENT));
}

export function subscribeAgeGate(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AGE_GATE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AGE_GATE_EVENT, onStoreChange);
  };
}
