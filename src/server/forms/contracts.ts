/**
 * Versioned form / consent contracts for B1–B3.
 * Server allowlist — client schema is convenience only.
 */

export {
  CONTACTS_CONSENT_POLICY_URL,
  CONTACTS_CONSENT_POLICY_VERSION,
  CONTACTS_FORM_ID,
  CONTACTS_LEGAL_BASIS,
  CONTACTS_PURPOSE,
  CONTACTS_SCHEMA_VERSION,
} from "@/content/forms/contacts-contract";

export {
  CATALOG_LEAD_FORM_ID,
  HORECA_FORM_ID,
  NEWSLETTER_FORM_ID,
  PARTNERSHIP_FORM_ID,
  POLICY_SITE_URL,
  POLICY_SITE_VERSION,
  TOURS_REQUEST_FORM_ID,
} from "@/content/forms/form-ids";

import {
  CONTACTS_CONSENT_POLICY_URL,
  CONTACTS_CONSENT_POLICY_VERSION,
  CONTACTS_FORM_ID,
  CONTACTS_LEGAL_BASIS,
  CONTACTS_PURPOSE,
  CONTACTS_SCHEMA_VERSION,
} from "@/content/forms/contacts-contract";
import {
  CATALOG_LEAD_FORM_ID,
  HORECA_FORM_ID,
  NEWSLETTER_FORM_ID,
  PARTNERSHIP_FORM_ID,
  POLICY_SITE_URL,
  POLICY_SITE_VERSION,
  TOURS_REQUEST_FORM_ID,
} from "@/content/forms/form-ids";

export type PublishedFormLocale = "ru" | "en";

export type FormDefinition = {
  formId: string;
  locales: readonly PublishedFormLocale[];
  schemaVersion: string;
  enabled: boolean;
  purpose: string;
  legalBasis: string;
  policyVersion: string;
  policyUrl: string;
  maxBodyBytes: number;
  /** Short RU label for Telegram / staff. */
  titleRu: string;
  fieldLimits: Record<string, { max: number; required?: boolean }>;
};

const sitePolicy = {
  legalBasis: "consent",
  policyVersion: POLICY_SITE_VERSION,
  policyUrl: POLICY_SITE_URL,
} as const;

/** B3: all public lead/newsletter forms enabled. */
export const FORM_DEFINITIONS: Record<string, FormDefinition> = {
  [CONTACTS_FORM_ID]: {
    formId: CONTACTS_FORM_ID,
    locales: ["ru"],
    schemaVersion: CONTACTS_SCHEMA_VERSION,
    enabled: true,
    purpose: CONTACTS_PURPOSE,
    legalBasis: CONTACTS_LEGAL_BASIS,
    policyVersion: CONTACTS_CONSENT_POLICY_VERSION,
    policyUrl: CONTACTS_CONSENT_POLICY_URL,
    maxBodyBytes: 16_384,
    titleRu: "Contacts",
    fieldLimits: {
      name: { max: 120, required: true },
      email: { max: 254, required: true },
      phone: { max: 40, required: true },
      city: { max: 120 },
      company: { max: 200 },
      comment: { max: 4000 },
    },
  },
  [PARTNERSHIP_FORM_ID]: {
    formId: PARTNERSHIP_FORM_ID,
    locales: ["ru", "en"],
    schemaVersion: "partnership-v1",
    enabled: true,
    purpose: "b2b_partnership",
    ...sitePolicy,
    maxBodyBytes: 16_384,
    titleRu: "Партнёрство / опт",
    fieldLimits: {
      type: { max: 80, required: true },
      company: { max: 200, required: true },
      city: { max: 120, required: true },
      name: { max: 120, required: true },
      email: { max: 254, required: true },
      phone: { max: 40, required: true },
      comment: { max: 4000 },
    },
  },
  [HORECA_FORM_ID]: {
    formId: HORECA_FORM_ID,
    locales: ["ru"],
    schemaVersion: "horeca-ru-v1",
    enabled: true,
    purpose: "b2b_horeca",
    ...sitePolicy,
    maxBodyBytes: 16_384,
    titleRu: "HoReCa",
    fieldLimits: {
      city: { max: 120, required: true },
      company: { max: 200, required: true },
      name: { max: 120, required: true },
      inn: { max: 20, required: true },
      email: { max: 254, required: true },
      phone: { max: 40, required: true },
      comment: { max: 4000, required: true },
    },
  },
  [CATALOG_LEAD_FORM_ID]: {
    formId: CATALOG_LEAD_FORM_ID,
    locales: ["ru", "en"],
    schemaVersion: "catalog-lead-v1",
    enabled: true,
    purpose: "catalog_inquiry",
    ...sitePolicy,
    maxBodyBytes: 12_288,
    titleRu: "Каталог / beer",
    fieldLimits: {
      name: { max: 120, required: true },
      email: { max: 254, required: true },
      comment: { max: 4000 },
    },
  },
  [TOURS_REQUEST_FORM_ID]: {
    formId: TOURS_REQUEST_FORM_ID,
    locales: ["ru", "en"],
    schemaVersion: "tours-request-v1",
    enabled: true,
    purpose: "tours_request",
    ...sitePolicy,
    maxBodyBytes: 12_288,
    titleRu: "Экскурсия (заявка, не бронь)",
    fieldLimits: {
      name: { max: 120, required: true },
      phone: { max: 40, required: true },
      date: { max: 32, required: true },
      guests: { max: 10, required: true },
      email: { max: 254, required: true },
      wishes: { max: 4000 },
    },
  },
  [NEWSLETTER_FORM_ID]: {
    formId: NEWSLETTER_FORM_ID,
    locales: ["ru", "en"],
    schemaVersion: "newsletter-v1",
    enabled: true,
    purpose: "newsletter_subscribe",
    ...sitePolicy,
    maxBodyBytes: 4_096,
    titleRu: "Newsletter",
    fieldLimits: {
      email: { max: 254, required: true },
    },
  },
};

/**
 * Active outbox destinations for new submissions.
 * Google Sheets lead export cancelled by owner 09.11.2026 (152-FZ / PII).
 */
export const DELIVERY_DESTINATIONS = ["telegram"] as const;
export type ActiveDeliveryDestination = (typeof DELIVERY_DESTINATIONS)[number];
export type DeliveryDestination = ActiveDeliveryDestination | "sheets";

export type ConsentEvidence = {
  channel: "form_submit";
  uiNotice: string;
  policyUrl: string;
  policyVersion: string;
  accepted: true;
};
