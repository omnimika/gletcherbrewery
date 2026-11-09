import { FORM_DEFINITIONS, type FormDefinition } from "./contracts";

export type IntakeEnvelope = {
  schemaVersion: string;
  formId: string;
  locale: string;
  sourcePath: string;
  placement?: string;
  idempotencyKey: string;
  fields: Record<string, unknown>;
  consent: {
    accepted: boolean;
    policyVersion: string;
  };
};

export type ValidationOk = {
  ok: true;
  def: FormDefinition;
  fields: Record<string, string | null>;
};

export type ValidationErr = {
  ok: false;
  code:
    | "unknown_form"
    | "form_disabled"
    | "locale_not_published"
    | "schema_mismatch"
    | "invalid_payload"
    | "field_invalid"
    | "consent_required"
    | "payload_too_large";
  message: string;
  details?: Record<string, string>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9()\-\s]{6,40}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asString(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export function validateEnvelope(
  raw: unknown,
  bodyBytes: number,
): ValidationOk | ValidationErr {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, code: "invalid_payload", message: "Body must be an object" };
  }
  const body = raw as Record<string, unknown>;
  const formId = asString(body.formId);
  if (!formId || !(formId in FORM_DEFINITIONS)) {
    return { ok: false, code: "unknown_form", message: "Unknown form_id" };
  }
  const def = FORM_DEFINITIONS[formId]!;
  if (bodyBytes > def.maxBodyBytes) {
    return {
      ok: false,
      code: "payload_too_large",
      message: `Payload exceeds ${def.maxBodyBytes} bytes`,
    };
  }
  if (!def.enabled) {
    return { ok: false, code: "form_disabled", message: "Form is not enabled" };
  }

  const locale = asString(body.locale);
  if (!locale || !(def.locales as readonly string[]).includes(locale)) {
    return {
      ok: false,
      code: "locale_not_published",
      message: "Locale is not published for this form",
    };
  }

  const schemaVersion = asString(body.schemaVersion);
  if (schemaVersion !== def.schemaVersion) {
    return {
      ok: false,
      code: "schema_mismatch",
      message: "Unsupported schema_version",
    };
  }

  const idempotencyKey = asString(body.idempotencyKey);
  if (!idempotencyKey || !UUID_RE.test(idempotencyKey)) {
    return {
      ok: false,
      code: "invalid_payload",
      message: "idempotencyKey must be a UUID",
    };
  }

  const sourcePath = asString(body.sourcePath);
  if (!sourcePath || sourcePath.length > 500 || !sourcePath.startsWith("/")) {
    return {
      ok: false,
      code: "invalid_payload",
      message: "sourcePath must be a site-relative path",
    };
  }

  const placement = asString(body.placement);

  const consentRaw = body.consent;
  if (!consentRaw || typeof consentRaw !== "object" || Array.isArray(consentRaw)) {
    return { ok: false, code: "consent_required", message: "Consent evidence required" };
  }
  const consent = consentRaw as Record<string, unknown>;
  if (consent.accepted !== true) {
    return { ok: false, code: "consent_required", message: "Consent must be accepted" };
  }
  if (asString(consent.policyVersion) !== def.policyVersion) {
    return {
      ok: false,
      code: "consent_required",
      message: "Unknown or outdated policy version",
    };
  }

  const fieldsRaw = body.fields;
  if (!fieldsRaw || typeof fieldsRaw !== "object" || Array.isArray(fieldsRaw)) {
    return { ok: false, code: "invalid_payload", message: "fields object required" };
  }
  const fieldsIn = fieldsRaw as Record<string, unknown>;
  const unknown = Object.keys(fieldsIn).filter((k) => !(k in def.fieldLimits));
  if (unknown.length > 0) {
    return {
      ok: false,
      code: "field_invalid",
      message: "Unknown fields",
      details: Object.fromEntries(unknown.map((k) => [k, "unknown"])),
    };
  }

  const fields: Record<string, string | null> = {};
  const details: Record<string, string> = {};

  for (const [name, limit] of Object.entries(def.fieldLimits)) {
    const value = asString(fieldsIn[name]);
    if (limit.required && !value) {
      details[name] = "required";
      continue;
    }
    if (value && value.length > limit.max) {
      details[name] = "too_long";
      continue;
    }
    if (name === "email" && value && !EMAIL_RE.test(value)) {
      details[name] = "invalid_email";
      continue;
    }
    if (name === "phone" && value && !PHONE_RE.test(value)) {
      details[name] = "invalid_phone";
      continue;
    }
    fields[name] = value;
  }

  if (Object.keys(details).length > 0) {
    return {
      ok: false,
      code: "field_invalid",
      message: "Field validation failed",
      details,
    };
  }

  // Attach validated envelope pieces onto def via return
  void placement;
  return { ok: true, def, fields };
}

export function parseEnvelopeMeta(raw: unknown): {
  idempotencyKey: string;
  sourcePath: string;
  placement: string | null;
  locale: string;
  formId: string;
  schemaVersion: string;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as Record<string, unknown>;
  const idempotencyKey = asString(body.idempotencyKey);
  const sourcePath = asString(body.sourcePath);
  const locale = asString(body.locale);
  const formId = asString(body.formId);
  const schemaVersion = asString(body.schemaVersion);
  if (!idempotencyKey || !sourcePath || !locale || !formId || !schemaVersion) {
    return null;
  }
  return {
    idempotencyKey,
    sourcePath,
    placement: asString(body.placement),
    locale,
    formId,
    schemaVersion,
  };
}
