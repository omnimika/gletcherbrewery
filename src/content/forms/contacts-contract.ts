/** Client+server shared Contacts RU contract constants (B1). */

export {
  CONTACTS_FORM_ID,
  POLICY_SITE_URL as CONTACTS_CONSENT_POLICY_URL,
} from "./form-ids";

export const CONTACTS_SCHEMA_VERSION = "contacts-ru-v1" as const;
/** Kept for existing Contacts UI; new forms use policy-site-v1. */
export const CONTACTS_CONSENT_POLICY_VERSION = "policy-ru-v1" as const;
export const CONTACTS_PURPOSE = "contact" as const;
export const CONTACTS_LEGAL_BASIS = "consent" as const;
