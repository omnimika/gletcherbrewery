import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeIntentHash, stableStringify } from "./intent-hash";

describe("intent-hash", () => {
  it("is stable under key reordering", () => {
    const a = stableStringify({ b: 1, a: { z: 2, y: 3 } });
    const b = stableStringify({ a: { y: 3, z: 2 }, b: 1 });
    assert.equal(a, b);
  });

  it("normalizes empty optional strings to null", () => {
    const h1 = computeIntentHash({
      formId: "contacts",
      locale: "ru",
      schemaVersion: "contacts-ru-v1",
      fields: { name: "A", email: "a@b.c", phone: "1", city: "", company: null, comment: "  " },
      consent: { purpose: "contact", policyVersion: "policy-ru-v1" },
    });
    const h2 = computeIntentHash({
      formId: "contacts",
      locale: "ru",
      schemaVersion: "contacts-ru-v1",
      fields: { company: null, comment: null, email: "a@b.c", name: "A", phone: "1", city: null },
      consent: { purpose: "contact", policyVersion: "policy-ru-v1" },
    });
    assert.equal(h1, h2);
  });

  it("changes when a field changes", () => {
    const base = {
      formId: "contacts",
      locale: "ru",
      schemaVersion: "contacts-ru-v1",
      fields: { name: "A", email: "a@b.c", phone: "1" },
      consent: { purpose: "contact", policyVersion: "policy-ru-v1" },
    };
    const h1 = computeIntentHash(base);
    const h2 = computeIntentHash({
      ...base,
      fields: { ...base.fields, name: "B" },
    });
    assert.notEqual(h1, h2);
  });
});
