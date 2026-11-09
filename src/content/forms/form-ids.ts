/** Stable form_id values for intake (B1–B3). */

export const CONTACTS_FORM_ID = "contacts" as const;
export const PARTNERSHIP_FORM_ID = "partnership" as const;
export const HORECA_FORM_ID = "horeca" as const;
export const CATALOG_LEAD_FORM_ID = "catalog_lead" as const;
export const TOURS_REQUEST_FORM_ID = "tours_request" as const;
export const NEWSLETTER_FORM_ID = "newsletter" as const;

export type FormId =
  | typeof CONTACTS_FORM_ID
  | typeof PARTNERSHIP_FORM_ID
  | typeof HORECA_FORM_ID
  | typeof CATALOG_LEAD_FORM_ID
  | typeof TOURS_REQUEST_FORM_ID
  | typeof NEWSLETTER_FORM_ID;

export const POLICY_SITE_VERSION = "policy-site-v1" as const;
export const POLICY_SITE_URL = "/policy" as const;
