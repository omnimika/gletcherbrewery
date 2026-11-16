import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateEnvelope } from "./validate";
import {
  CONTACTS_CONSENT_POLICY_VERSION,
  CONTACTS_FORM_ID,
  CONTACTS_SCHEMA_VERSION,
} from "@/content/forms/contacts-contract";

function validBody(over: Record<string, unknown> = {}) {
  return {
    schemaVersion: CONTACTS_SCHEMA_VERSION,
    formId: CONTACTS_FORM_ID,
    locale: "ru",
    sourcePath: "/contacts",
    idempotencyKey: "11111111-1111-4111-8111-111111111111",
    fields: {
      name: "Тест",
      email: "test@example.com",
      phone: "+7 495 000-00-00",
      city: "Клин",
      company: "",
      comment: "synthetic",
    },
    consent: { accepted: true, policyVersion: CONTACTS_CONSENT_POLICY_VERSION },
    ...over,
  };
}

describe("validateEnvelope contacts", () => {
  it("accepts a valid RU contacts payload", () => {
    const r = validateEnvelope(validBody(), 200);
    assert.equal(r.ok, true);
  });

  it("rejects unknown form", () => {
    const r = validateEnvelope(validBody({ formId: "nope" }), 200);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, "unknown_form");
  });

  it("rejects EN locale for contacts", () => {
    const r = validateEnvelope(validBody({ locale: "en" }), 200);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, "locale_not_published");
  });

  it("rejects unknown fields", () => {
    const r = validateEnvelope(
      validBody({
        fields: {
          name: "A",
          email: "a@b.c",
          phone: "123456",
          honeypot: "x",
        },
      }),
      200,
    );
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, "field_invalid");
  });

  it("rejects oversized body", () => {
    const r = validateEnvelope(validBody(), 99_999);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, "payload_too_large");
  });
});
