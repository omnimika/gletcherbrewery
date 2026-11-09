/**
 * Versioned form / consent contracts for B1.
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

import {
  CONTACTS_CONSENT_POLICY_URL,
  CONTACTS_CONSENT_POLICY_VERSION,
  CONTACTS_FORM_ID,
  CONTACTS_LEGAL_BASIS,
  CONTACTS_PURPOSE,
  CONTACTS_SCHEMA_VERSION,
} from "@/content/forms/contacts-contract";

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
  fieldLimits: Record<string, { max: number; required?: boolean }>;
};

/** Only Contacts RU is enabled in B1. Other forms stay unavailable. */
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
    fieldLimits: {
      name: { max: 120, required: true },
      email: { max: 254, required: true },
      phone: { max: 40, required: true },
      city: { max: 120 },
      company: { max: 200 },
      comment: { max: 4000 },
    },
  },
};

export const DELIVERY_DESTINATIONS = ["telegram", "sheets"] as const;
export type DeliveryDestination = (typeof DELIVERY_DESTINATIONS)[number];

export type ConsentEvidence = {
  channel: "form_submit";
  uiNotice: string;
  policyUrl: string;
  policyVersion: string;
  accepted: true;
};
