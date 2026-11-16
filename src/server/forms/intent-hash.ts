import { createHash } from "node:crypto";

/**
 * Canonical JSON: sorted object keys recursively; arrays keep order;
 * empty optional strings become null so "" and missing normalize the same
 * when callers pass null for absent optionals.
 */
export function canonicalize(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = canonicalize(obj[key]);
    }
    return out;
  }
  return null;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export type IntentPayload = {
  formId: string;
  locale: string;
  schemaVersion: string;
  fields: Record<string, unknown>;
  consent: {
    purpose: string;
    policyVersion: string;
  };
};

/** Hash of immutable intent — no server timestamps / routing / request IDs. */
export function computeIntentHash(intent: IntentPayload): string {
  const canonical = stableStringify(intent);
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}
